const admin = require('firebase-admin');
const crypto = require('crypto');
const PDFDocument = require('pdfkit');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
    })
  });
}

const db = admin.firestore();
const SITE = process.env.SITE_URL || 'https://jvo.me';
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'senujames23@gmail.com').toLowerCase();
const TERMS_VERSION = '2026-09-v2';
const AGREEMENT_VERSION = '2.0';
const ALLOWED_CURRENCIES = ['GHS', 'USD', 'GBP', 'EUR'];
const STATUSES = ['Draft', 'Agreement Sent', 'Agreement Signed', 'Awaiting Deposit', 'Deposit Received', 'Development', 'Client Review', 'Approved', 'Awaiting Final Payment', 'Fully Paid', 'Launched', 'Completed', 'On Hold', 'Cancelled'];

const now = () => new Date().toISOString();
const json = (statusCode, body, extra = {}) => ({
  statusCode,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    ...extra
  },
  body: JSON.stringify(body)
});
const text = value => String(value == null ? '' : value).trim();
const safeUrl = value => {
  const v = text(value);
  if (!v) return '';
  try {
    const u = new URL(v);
    return u.protocol === 'https:' ? u.toString() : '';
  } catch { return ''; }
};
const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cleanProject = (id, d) => ({ id, ...d });
const currency = value => ALLOWED_CURRENCIES.includes(value) ? value : 'GHS';
const amount = value => Math.round(Number(value || 0) * 100) / 100;
const money = (value, code = 'GHS') => {
  try { return new Intl.NumberFormat('en-GH', { style: 'currency', currency: code, maximumFractionDigits: 2 }).format(Number(value || 0)); }
  catch { return `${code} ${Number(value || 0).toFixed(2)}`; }
};
const formatDate = value => value ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) : '';
const shortDate = value => value ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }) : '';

async function authUser(event) {
  const h = event.headers.authorization || event.headers.Authorization || '';
  if (!h.startsWith('Bearer ')) throw new Error('AUTH');
  return admin.auth().verifyIdToken(h.slice(7));
}
async function adminOnly(event) {
  const u = await authUser(event);
  if ((u.email || '').toLowerCase() !== ADMIN_EMAIL) throw new Error('FORBIDDEN');
  return u;
}
async function activity(projectId, textValue, kind = 'note', meta = {}) {
  await db.collection('activities').add({ projectId, text: textValue, kind, meta, createdAt: now() });
}
async function nextNumber(key) {
  const ref = db.collection('meta').doc('counter');
  return db.runTransaction(async t => {
    const d = await t.get(ref);
    const n = (d.exists ? Number(d.data()[key] || 0) : 0) + 1;
    t.set(ref, { [key]: n }, { merge: true });
    return n;
  });
}
async function getSettings() {
  const d = await db.collection('settings').doc('business').get();
  return {
    businessName: 'JVO', ownerName: 'James Senu', email: 'senujames23@gmail.com', phone: '0594121246', whatsapp: '0594121246', snapchat: 'jvo_james', address: 'Accra, Ghana', defaultCurrency: 'GHS', supportDays: 30, paymentInstructions: '', paymentLink: '', logoUrl: '', emailSenderName: 'JVO',
    ...(d.exists ? d.data() : {})
  };
}
function agreementTerms(supportDays) {
  const days = Number(supportDays || 30);
  return [
    { id: 'payment', title: 'Payment', body: 'The agreed upfront payment must be received before work starts. Any remaining balance is due after the client approves the finished website.' },
    { id: 'start', title: 'When work starts', body: 'Work officially starts only after this agreement is signed and the required upfront payment is received.' },
    { id: 'deposit', title: 'Upfront payment', body: 'The upfront payment is not refundable once development has officially started.' },
    { id: 'scope', title: 'Extra work', body: 'The price covers the scope written in this agreement. New pages, features, integrations or other additions may be priced separately before they are added.' },
    { id: 'support', title: 'Bug support', body: `For ${days} days after launch, JVO will fix broken layouts or broken code caused by the original setup at no extra cost.` },
    { id: 'thirdparty', title: 'Third-party issues', body: 'Free support does not cover hosting problems, external APIs, payment gateway changes, plugin updates or expired domains.' },
    { id: 'handover', title: 'Final payment and handover', body: 'The site will only be launched, transferred or handed over after all agreed payments have been received.' },
    { id: 'ownership', title: 'Ownership', body: 'Ownership of the finished work moves to the client after full payment. JVO may show the finished website in its portfolio and promotional work.' },
    { id: 'content', title: 'Client content', body: 'The client is responsible for the text, images, logos and other content they provide and confirms that they have permission to use it.' },
    { id: 'delays', title: 'Delays', body: 'If content, access details, feedback or approvals are delayed, delivery dates may also move.' },
    { id: 'late', title: 'Late final payment', body: 'A final payment that remains unpaid for more than 7 days may cause JVO-managed access or services to be paused until payment is made.' },
    { id: 'cancel', title: 'Cancellation', body: 'If the client cancels after work starts, the upfront payment is kept. Any completed work above that value must also be paid before files are handed over. If JVO cancels, unearned fees are refunded.' }
  ];
}
function paymentPlanFromBody(body, totalValue) {
  const type = ['50-50', '60-40', '100', 'custom'].includes(body.paymentPlanType) ? body.paymentPlanType : '50-50';
  let milestones = [];
  if (type === 'custom' && Array.isArray(body.milestones)) {
    milestones = body.milestones.map((m, i) => ({ id: `m${i + 1}`, label: text(m.label) || `Milestone ${i + 1}`, percent: Number(m.percent || 0) })).filter(m => m.percent > 0);
  } else {
    const map = { '50-50': [50, 50], '60-40': [60, 40], '100': [100] };
    milestones = map[type].map((p, i, arr) => ({ id: `m${i + 1}`, label: i === 0 ? 'Upfront payment' : (i === arr.length - 1 ? 'Final payment' : `Milestone ${i + 1}`), percent: p }));
  }
  const percentTotal = milestones.reduce((s, m) => s + Number(m.percent || 0), 0);
  if (!milestones.length || Math.abs(percentTotal - 100) > 0.01) throw new Error('Payment milestones must add up to 100%.');
  milestones = milestones.map(m => ({ ...m, amount: amount(totalValue * m.percent / 100) }));
  const diff = amount(totalValue - milestones.reduce((s, m) => s + m.amount, 0));
  if (diff) milestones[milestones.length - 1].amount = amount(milestones[milestones.length - 1].amount + diff);
  return { type, milestones };
}
async function projectPayments(projectId) {
  const q = await db.collection('payments').where('projectId', '==', projectId).get();
  return q.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
}
async function projectChanges(projectId) {
  const q = await db.collection('changeRequests').where('projectId', '==', projectId).get();
  return q.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
}
function ledgerTotals(project, payments, changes = []) {
  const contract = amount(project.total || 0);
  const extras = amount(changes.filter(x => ['Approved', 'Paid', 'Done'].includes(x.status)).reduce((s, x) => s + Number(x.amount || 0), 0));
  const paid = amount(payments.filter(x => x.status !== 'Voided').reduce((s, x) => s + (x.direction === 'out' ? -Number(x.amount || 0) : Number(x.amount || 0)), 0));
  const totalDue = amount(contract + extras);
  return { contract, extras, totalDue, paid, outstanding: Math.max(0, amount(totalDue - paid)), credit: Math.max(0, amount(paid - totalDue)) };
}
function publicSettings(settings) {
  return { businessName: settings.businessName, ownerName: settings.ownerName, email: settings.email, phone: settings.phone, whatsapp: settings.whatsapp, address: settings.address, logoUrl: settings.logoUrl || '' };
}
function clientLink(project) { return `${SITE}/form.html?id=${project.publicToken}`; }

function emailFrame({ preheader = '', eyebrow = 'JVO', title, intro = '', content = '', buttonLabel = '', buttonUrl = '', settings }) {
  const brand = esc(settings.businessName || 'JVO');
  const owner = esc(settings.ownerName || 'James Senu');
  const email = esc(settings.email || 'senujames23@gmail.com');
  const phone = esc(settings.phone || '');
  const button = buttonLabel && buttonUrl ? `<tr><td style="padding:10px 0 28px"><a href="${esc(buttonUrl)}" style="display:inline-block;background:#171512;color:#fff;text-decoration:none;padding:14px 20px;font:600 13px Arial,sans-serif">${esc(buttonLabel)}</a></td></tr>` : '';
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(title)}</title></head><body style="margin:0;background:#ebe5dc;color:#171512"><div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ebe5dc;padding:26px 12px"><tr><td align="center"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#fffdf8;border:1px solid #d8d0c4"><tr><td style="padding:22px 26px;border-bottom:1px solid #d8d0c4"><table width="100%" role="presentation"><tr><td style="font:700 25px Georgia,serif">${brand}</td><td align="right" style="font:500 10px monospace;letter-spacing:.12em;text-transform:uppercase;color:#756f65">PROJECT DESK</td></tr></table></td></tr><tr><td style="padding:42px 26px 10px"><div style="font:600 10px monospace;letter-spacing:.14em;text-transform:uppercase;color:#c74e34;margin-bottom:14px">${esc(eyebrow)}</div><h1 style="margin:0;font:600 42px/1.02 Georgia,serif;letter-spacing:-1px">${esc(title)}</h1>${intro ? `<p style="margin:18px 0 0;font:400 15px/1.7 Arial,sans-serif;color:#5f594f">${esc(intro)}</p>` : ''}</td></tr><tr><td style="padding:12px 26px 4px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${content}${button}</table></td></tr><tr><td style="padding:25px 26px 34px"><p style="margin:0;font:400 14px/1.7 Arial,sans-serif">Thanks,<br><strong>${owner}</strong><br>${brand}</p></td></tr><tr><td style="background:#171512;color:#e8e0d5;padding:20px 26px"><table width="100%" role="presentation"><tr><td style="font:600 11px Arial,sans-serif">jvo.me</td><td align="right" style="font:400 10px Arial,sans-serif;color:#aaa196">${email}${phone ? ` &nbsp; ${phone}` : ''}</td></tr></table></td></tr></table></td></tr></table></body></html>`;
}
const infoRow = (label, value, strong = false) => `<tr><td style="padding:13px 0;border-bottom:1px solid #e6dfd5;font:500 10px monospace;text-transform:uppercase;color:#756f65">${esc(label)}</td><td align="right" style="padding:13px 0;border-bottom:1px solid #e6dfd5;font:${strong ? '700 18px Georgia,serif' : '600 13px Arial,sans-serif'}">${esc(value)}</td></tr>`;
async function sendMail({ to, subject, textMessage, html, projectId = '', projectName = '', template = 'custom', idempotencyKey = '' }) {
  if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is missing.');
  if (idempotencyKey) {
    const seen = await db.collection('emailKeys').doc(idempotencyKey).get();
    if (seen.exists) return { id: seen.data().resendId || '', duplicate: true };
  }
  const settings = await getSettings();
  const from = process.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM || `${settings.emailSenderName || settings.businessName || 'JVO'} <projects@jvo.me>`;
  const replyTo = process.env.RESEND_REPLY_TO || process.env.REPLY_TO || settings.email || 'senujames23@gmail.com';
  const payload = { from, to: [to], subject, html, text: textMessage, reply_to: replyTo };
  const r = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'content-type': 'application/json' }, body: JSON.stringify(payload) });
  const d = await r.json();
  if (!r.ok) throw new Error(d.message || 'Email could not be sent.');
  const emailRecord = { to, subject, message: textMessage, html, template, projectId, projectName, resendId: d.id || '', createdAt: now() };
  await db.collection('emails').add(emailRecord);
  if (idempotencyKey) await db.collection('emailKeys').doc(idempotencyKey).set({ resendId: d.id || '', createdAt: now() });
  return d;
}
async function sendTemplate(template, project, data = {}) {
  const settings = await getSettings();
  const to = data.to || project.clientEmail;
  if (!to) return null;
  const link = clientLink(project);
  const c = project.currency || 'GHS';
  let title = '', subject = '', intro = '', rows = '', buttonLabel = 'View project', buttonUrl = link, textMessage = '';
  if (template === 'agreement_ready') {
    title = 'Your project agreement is ready'; subject = `${project.projectName}: agreement ready`; intro = 'Please check the project details and sign when everything looks right.';
    rows = infoRow('Project', project.projectName) + infoRow('Project value', money(project.total, c), true) + infoRow('Reference', project.ref);
  } else if (template === 'agreement_signed') {
    title = 'Agreement signed'; subject = `${project.projectName}: agreement signed`; intro = 'Your agreement has been saved. The next step is the upfront payment.';
    rows = infoRow('Project', project.projectName) + infoRow('Upfront payment', money(data.depositDue || 0, c), true) + infoRow('Reference', project.ref);
  } else if (template === 'payment_received') {
    title = data.fullyPaid ? 'Payment received in full' : 'Payment received'; subject = `${project.projectName}: payment received`; intro = data.fullyPaid ? 'Your project is fully paid. Thank you.' : 'Your payment has been recorded successfully.';
    rows = infoRow('Payment received', money(data.paymentAmount, c), true) + infoRow('Receipt', data.receiptNo || '') + infoRow('Total paid', money(data.paid, c)) + infoRow('Outstanding', money(data.outstanding, c), true);
  } else if (template === 'deposit_reminder') {
    title = 'Your upfront payment is due'; subject = `${project.projectName}: payment reminder`; intro = 'Development starts after the upfront payment is received.';
    rows = infoRow('Amount due', money(data.amountDue || 0, c), true) + infoRow('Reference', project.ref);
  } else if (template === 'review_ready') {
    title = 'Your website is ready to review'; subject = `${project.projectName}: ready for review`; intro = 'Have a look and tell me if you approve it or if you want changes.';
    rows = infoRow('Project', project.projectName) + infoRow('Reference', project.ref);
  } else if (template === 'payment_reminder') {
    title = 'There is a balance on your project'; subject = `${project.projectName}: payment reminder`; intro = 'The amount below is still outstanding.';
    rows = infoRow('Outstanding', money(data.outstanding || 0, c), true) + infoRow('Reference', project.ref);
  } else if (template === 'launched') {
    title = 'Your website is live'; subject = `${project.projectName}: website launched`; intro = 'Your website has been launched successfully.';
    rows = infoRow('Project', project.projectName) + (project.liveUrl ? infoRow('Website', project.liveUrl) : '') + infoRow('Reference', project.ref);
    if (project.liveUrl) { buttonLabel = 'Open website'; buttonUrl = project.liveUrl; }
  } else if (template === 'change_order') {
    title = 'Additional work to approve'; subject = `${project.projectName}: additional work`; intro = 'I have added the extra work we discussed. Please review it before I start.';
    rows = infoRow('Additional work', data.description || '') + infoRow('Price', money(data.amount, c), true) + infoRow('Reference', project.ref);
  } else {
    title = data.title || subject || 'Message from JVO'; subject = data.subject || `${project.projectName}: message`; intro = data.intro || data.message || '';
  }
  textMessage = `${title}\n\n${intro}\n\nProject: ${project.projectName}\nReference: ${project.ref}\n\n${link}`;
  const html = emailFrame({ preheader: intro, eyebrow: project.ref, title, intro, content: rows, buttonLabel, buttonUrl, settings });
  return sendMail({ to, subject, textMessage, html, projectId: project.id, projectName: project.projectName, template, idempotencyKey: data.idempotencyKey || '' });
}
async function rateLimit(event, token, action, limit = 20) {
  const ip = event.headers['x-nf-client-connection-ip'] || event.headers['x-forwarded-for'] || 'unknown';
  const bucket = Math.floor(Date.now() / 60000);
  const key = crypto.createHash('sha256').update(`${ip}|${token}|${action}|${bucket}`).digest('hex');
  const ref = db.collection('rateLimits').doc(key);
  await db.runTransaction(async t => {
    const d = await t.get(ref); const count = d.exists ? Number(d.data().count || 0) : 0;
    if (count >= limit) throw new Error('RATE');
    t.set(ref, { count: count + 1, createdAt: now() }, { merge: true });
  });
}
async function getProjectByToken(token) {
  const q = await db.collection('projects').where('publicToken', '==', token).limit(1).get();
  if (q.empty) return null;
  return cleanProject(q.docs[0].id, q.docs[0].data());
}
async function pdfBuffer(builder) {
  const doc = new PDFDocument({ size: 'A4', margin: 54, info: { Creator: 'JVO Desk' } });
  const chunks = [];
  doc.on('data', c => chunks.push(c));
  const done = new Promise((resolve, reject) => { doc.on('end', () => resolve(Buffer.concat(chunks))); doc.on('error', reject); });
  builder(doc); doc.end(); return done;
}
function pdfHeader(doc, settings, label) {
  doc.font('Helvetica-Bold').fontSize(20).text(settings.businessName || 'JVO');
  doc.font('Helvetica').fontSize(8).fillColor('#77716a').text(label.toUpperCase(), { align: 'right' });
  doc.moveDown(1.2).strokeColor('#d6cec1').moveTo(54, doc.y).lineTo(541, doc.y).stroke().fillColor('#171512').moveDown(1.2);
}
function pdfSection(doc, heading, body) {
  doc.font('Helvetica-Bold').fontSize(11).fillColor('#171512').text(heading);
  doc.moveDown(.35).font('Helvetica').fontSize(9.5).fillColor('#4f4a43').text(body, { lineGap: 3 }); doc.moveDown(.9);
}
async function agreementPdf(project, agreement, settings) {
  return pdfBuffer(doc => {
    pdfHeader(doc, settings, 'Signed project agreement');
    doc.font('Helvetica-Bold').fontSize(28).fillColor('#171512').text(agreement.projectName || project.projectName);
    doc.moveDown(.35).font('Helvetica').fontSize(9).fillColor('#77716a').text(`Reference: ${agreement.ref || project.ref}`);
    doc.moveDown(1.3);
    const facts = [
      ['Client', agreement.clientName], ['Email', agreement.clientEmail], ['Phone', agreement.clientPhone], ['Company', agreement.clientCompany || 'Not provided'],
      ['Project value', money(agreement.total, agreement.currency)], ['Signed', `${formatDate(agreement.serverSignedAt)} UTC`], ['Terms version', agreement.termsVersion]
    ];
    facts.forEach(([k,v]) => { doc.font('Helvetica-Bold').fontSize(8).fillColor('#77716a').text(k.toUpperCase()); doc.font('Helvetica').fontSize(10).fillColor('#171512').text(String(v || '')); doc.moveDown(.5); });
    doc.moveDown(.5); pdfSection(doc, 'Project scope', agreement.scope || '');
    if (agreement.features?.length) pdfSection(doc, 'Included features', agreement.features.join(' • '));
    pdfSection(doc, 'Payment plan', (agreement.paymentPlan?.milestones || []).map(m => `${m.label}: ${m.percent}% (${money(m.amount, agreement.currency)})`).join('\n'));
    doc.addPage(); pdfHeader(doc, settings, 'Terms');
    (agreement.terms || []).forEach(t => pdfSection(doc, t.title, t.body));
    doc.moveDown(.7).strokeColor('#d6cec1').moveTo(54, doc.y).lineTo(541, doc.y).stroke().moveDown(1);
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#171512').text('Accepted by');
    doc.font('Helvetica').fontSize(11).text(agreement.signature || agreement.clientName || '');
    doc.fontSize(8.5).fillColor('#77716a').text(`Signed ${agreement.serverSignedAt || ''}`);
  });
}
async function receiptPdf(project, payment, totals, settings) {
  return pdfBuffer(doc => {
    pdfHeader(doc, settings, 'Payment receipt');
    doc.font('Helvetica-Bold').fontSize(30).fillColor('#171512').text('Payment received');
    doc.moveDown(.3).font('Helvetica').fontSize(9).fillColor('#77716a').text(`Receipt ${payment.receiptNo || payment.id}`);
    doc.moveDown(1.5);
    pdfSection(doc, 'Client', `${project.clientName || ''}\n${project.clientEmail || ''}\n${project.clientCompany || ''}`);
    pdfSection(doc, 'Project', `${project.projectName}\n${project.ref}`);
    pdfSection(doc, 'Payment', `${money(payment.amount, payment.currency)}\n${payment.type || 'Payment'}\n${payment.method || 'Method not recorded'}\n${shortDate(payment.date || payment.createdAt)}`);
    if (payment.reference) pdfSection(doc, 'Transaction reference', payment.reference);
    doc.moveDown(.4).strokeColor('#d6cec1').moveTo(54, doc.y).lineTo(541, doc.y).stroke().moveDown(1);
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#171512').text(`Total paid: ${money(totals.paid, project.currency)}`);
    doc.moveDown(.4).text(`Outstanding: ${money(totals.outstanding, project.currency)}`);
    doc.moveDown(2).font('Helvetica').fontSize(8.5).fillColor('#77716a').text(`Issued by ${settings.businessName || 'JVO'} • ${settings.email || ''} • ${settings.phone || ''}`);
  });
}

exports.handler = async event => {
  try {
    const action = event.queryStringParameters?.action || '';
    const body = event.body ? JSON.parse(event.body) : {};

    if (['publicProject', 'sign', 'changeOrderDecision', 'clientDecision'].includes(action)) {
      const token = event.headers['x-project-token'] || event.queryStringParameters?.id || '';
      if (!token) return json(400, { error: 'Project ID is missing.' });
      await rateLimit(event, token, action, action === 'publicProject' ? 60 : 12);
      const project = await getProjectByToken(token);
      if (!project) return json(404, { error: 'This project link was not found.' });
      if (action === 'publicProject') {
        const [settings, agreementDoc, payments, changes, updatesQ] = await Promise.all([
          getSettings(), db.collection('agreements').doc(project.id).get(), projectPayments(project.id), projectChanges(project.id), db.collection('clientUpdates').where('projectId', '==', project.id).get()
        ]);
        const signed = agreementDoc.exists;
        const agreement = signed ? agreementDoc.data() : null;
        const totals = ledgerTotals(project, payments, changes);
        const firstMilestone = (project.paymentPlan?.milestones || [])[0];
        const publicProject = {
          id: project.id, ref: signed ? agreement.ref : project.ref, projectName: signed ? agreement.projectName : project.projectName, total: signed ? agreement.total : project.total, currency: signed ? agreement.currency : project.currency, timeline: signed ? agreement.timeline : project.timeline, supportDays: signed ? agreement.supportDays : project.supportDays,
          scope: signed ? agreement.scope : project.scope, features: signed ? agreement.features : (project.features || []), paymentPlan: signed ? agreement.paymentPlan : project.paymentPlan,
          status: project.status, signedAt: agreement?.serverSignedAt || null, liveUrl: project.liveUrl || '', dates: project.dates || {}, clientName: signed ? agreement.clientName : '', clientCompany: signed ? agreement.clientCompany : '',
          terms: signed ? agreement.terms : agreementTerms(project.supportDays), termsVersion: signed ? agreement.termsVersion : TERMS_VERSION,
          depositDue: firstMilestone?.amount || 0, financials: totals,
          payments: signed ? payments.filter(x => x.status !== 'Voided').map(x => ({ id: x.id, receiptNo: x.receiptNo, type: x.type, amount: x.amount, currency: x.currency, method: x.method, date: x.date, direction: x.direction })) : [],
          changeOrders: signed ? changes.map(x => ({ id: x.id, description: x.description, amount: x.amount, currency: x.currency, status: x.status, decidedAt: x.decidedAt || null })) : [],
          updates: signed ? updatesQ.docs.map(d => d.data()).sort((a,b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0,20) : [],
          paymentInstructions: signed ? (settings.paymentInstructions || '') : '', paymentLink: signed ? (safeUrl(settings.paymentLink) || '') : ''
        };
        return json(200, { project: publicProject, business: publicSettings(settings) });
      }
      if (action === 'sign') {
        const required = ['fullName', 'email', 'phone', 'signature'];
        for (const k of required) if (!text(body[k])) return json(400, { error: 'Please complete all required fields.' });
        if (text(body.fullName).toLowerCase() !== text(body.signature).toLowerCase()) return json(400, { error: 'Your signature must match your full name.' });
        const accepted = Array.isArray(body.acceptedCheckboxes) ? body.acceptedCheckboxes : [];
        if (accepted.length < 4) return json(400, { error: 'Please accept all agreement confirmations.' });
        const agreementRef = db.collection('agreements').doc(project.id);
        const signedAt = now();
        const snapshot = {
          agreementVersion: AGREEMENT_VERSION, termsVersion: TERMS_VERSION, ref: project.ref, projectId: project.id, projectName: project.projectName, total: project.total, currency: project.currency,
          paymentPlan: project.paymentPlan, timeline: project.timeline, supportDays: project.supportDays, scope: project.scope, features: project.features || [], terms: agreementTerms(project.supportDays),
          clientName: text(body.fullName), clientEmail: text(body.email).toLowerCase(), clientPhone: text(body.phone), clientCompany: text(body.company), signature: text(body.signature), acceptedCheckboxes: accepted,
          serverSignedAt: signedAt, createdAt: signedAt
        };
        await db.runTransaction(async t => {
          const existing = await t.get(agreementRef);
          if (existing.exists) throw new Error('ALREADY_SIGNED');
          const projectRef = db.collection('projects').doc(project.id);
          t.create(agreementRef, snapshot);
          t.update(projectRef, { clientName: snapshot.clientName, clientEmail: snapshot.clientEmail, clientPhone: snapshot.clientPhone, clientCompany: snapshot.clientCompany, signedAt, status: 'Awaiting Deposit', updatedAt: signedAt });
        });
        await activity(project.id, `Agreement signed by ${snapshot.clientName}`, 'agreement');
        const freshProject = { ...project, ...snapshot, clientEmail: snapshot.clientEmail, clientName: snapshot.clientName, signedAt, status: 'Awaiting Deposit' };
        const firstMilestone = project.paymentPlan?.milestones?.[0];
        await Promise.allSettled([
          sendTemplate('agreement_signed', freshProject, { depositDue: firstMilestone?.amount || 0, idempotencyKey: `signed-client-${project.id}` }),
          sendMail({ to: ADMIN_EMAIL, subject: `${project.projectName}: agreement signed`, textMessage: `${snapshot.clientName} signed ${project.projectName}.`, html: emailFrame({ eyebrow: project.ref, title: 'Agreement signed', intro: `${snapshot.clientName} signed the project agreement.`, content: infoRow('Project', project.projectName) + infoRow('Client', snapshot.clientName) + infoRow('Email', snapshot.clientEmail), buttonLabel: 'Open JVO Desk', buttonUrl: `${SITE}/admin.html#project/${project.id}`, settings: await getSettings() }), projectId: project.id, projectName: project.projectName, template: 'admin_signed', idempotencyKey: `signed-admin-${project.id}` })
        ]);
        return json(200, { ok: true, signedAt });
      }
      if (action === 'changeOrderDecision') {
        const id = text(body.changeId); const decision = body.decision === 'Approved' ? 'Approved' : body.decision === 'Declined' ? 'Declined' : '';
        if (!id || !decision) return json(400, { error: 'Choose approve or decline.' });
        const ref = db.collection('changeRequests').doc(id); const d = await ref.get();
        if (!d.exists || d.data().projectId !== project.id) return json(404, { error: 'Additional work item not found.' });
        if (d.data().status !== 'Quoted') return json(409, { error: 'This item has already been decided.' });
        await ref.update({ status: decision, decidedAt: now(), clientDecision: true });
        await activity(project.id, `Additional work ${decision.toLowerCase()}: ${d.data().description}`, 'change');
        return json(200, { ok: true });
      }
      if (action === 'clientDecision') {
        if (!project.signedAt) return json(403, { error: 'The agreement must be signed first.' });
        const decision = body.decision === 'approve' ? 'Approved' : body.decision === 'changes' ? 'Changes Requested' : '';
        if (!decision) return json(400, { error: 'Choose an option.' });
        const createdAt = now();
        await db.collection('reviews').add({ projectId: project.id, decision, message: text(body.message), createdAt });
        await db.collection('projects').doc(project.id).update({ status: decision === 'Approved' ? 'Approved' : 'Client Review', reviewDate: createdAt, approvedDate: decision === 'Approved' ? createdAt : (project.approvedDate || null), updatedAt: createdAt });
        await activity(project.id, decision === 'Approved' ? 'Client approved the website' : 'Client requested changes', 'review', { message: text(body.message) });
        return json(200, { ok: true });
      }
    }

    if (action === 'agreementPdf') {
      const token = event.queryStringParameters?.id || '';
      const project = await getProjectByToken(token);
      if (!project) return json(404, { error: 'Project not found.' });
      const agreement = await db.collection('agreements').doc(project.id).get();
      if (!agreement.exists) return json(404, { error: 'This agreement has not been signed yet.' });
      const buffer = await agreementPdf(project, agreement.data(), await getSettings());
      return { statusCode: 200, isBase64Encoded: true, headers: { 'content-type': 'application/pdf', 'content-disposition': `attachment; filename="${project.ref}-agreement.pdf"`, 'cache-control': 'private, no-store' }, body: buffer.toString('base64') };
    }
    if (action === 'receiptPdf') {
      const token = event.queryStringParameters?.id || ''; const paymentId = event.queryStringParameters?.payment || '';
      const project = await getProjectByToken(token); if (!project) return json(404, { error: 'Project not found.' });
      const paymentDoc = await db.collection('payments').doc(paymentId).get();
      if (!paymentDoc.exists || paymentDoc.data().projectId !== project.id) return json(404, { error: 'Receipt not found.' });
      const [payments, changes, settings] = await Promise.all([projectPayments(project.id), projectChanges(project.id), getSettings()]);
      const payment = { id: paymentDoc.id, ...paymentDoc.data() };
      const buffer = await receiptPdf(project, payment, ledgerTotals(project, payments, changes), settings);
      return { statusCode: 200, isBase64Encoded: true, headers: { 'content-type': 'application/pdf', 'content-disposition': `attachment; filename="${payment.receiptNo || 'JVO-receipt'}.pdf"`, 'cache-control': 'private, no-store' }, body: buffer.toString('base64') };
    }

    await adminOnly(event);

    if (action === 'adminData') {
      const [pq, payq, eq, aq, cq, rq, s] = await Promise.all([
        db.collection('projects').orderBy('createdAt', 'desc').limit(300).get(), db.collection('payments').orderBy('createdAt', 'desc').limit(500).get(), db.collection('emails').orderBy('createdAt', 'desc').limit(250).get(), db.collection('activities').orderBy('createdAt', 'desc').limit(800).get(), db.collection('changeRequests').orderBy('createdAt', 'desc').limit(500).get(), db.collection('reviews').orderBy('createdAt', 'desc').limit(300).get(), getSettings()
      ]);
      return json(200, { projects: pq.docs.map(d => cleanProject(d.id, d.data())), payments: payq.docs.map(d => cleanProject(d.id, d.data())), emails: eq.docs.map(d => cleanProject(d.id, d.data())), activities: aq.docs.map(d => cleanProject(d.id, d.data())), changeRequests: cq.docs.map(d => cleanProject(d.id, d.data())), reviews: rq.docs.map(d => cleanProject(d.id, d.data())), settings: s });
    }

    if (action === 'createProject') {
      if (!text(body.projectName) || !Number(body.total) || !text(body.scope)) return json(400, { error: 'Project name, price and scope are required.' });
      const total = amount(body.total); if (total <= 0 || total > 100000000) return json(400, { error: 'Enter a valid project price.' });
      const settings = await getSettings(); const n = await nextNumber('projects'); const createdAt = now(); const year = new Date().getFullYear(); const ref = `JVO-${year}-${String(n).padStart(4, '0')}`;
      const paymentPlan = paymentPlanFromBody(body, total); const token = crypto.randomBytes(18).toString('hex');
      const p = {
        ref, publicToken: token, projectName: text(body.projectName), total, currency: currency(body.currency || settings.defaultCurrency), paymentPlan,
        timeline: text(body.timeline) || 'To be agreed', supportDays: Math.min(365, Math.max(0, Number(body.supportDays ?? settings.supportDays ?? 30))), scope: text(body.scope), features: Array.isArray(body.features) ? body.features.map(text).filter(Boolean).slice(0, 30) : [], notes: text(body.notes), liveUrl: safeUrl(body.liveUrl), status: 'Draft',
        dates: { estimatedStartDate: text(body.estimatedStartDate), startDate: '', targetDeliveryDate: text(body.targetDeliveryDate), reviewDate: '', approvedDate: '', paymentDueDate: text(body.paymentDueDate), launchDate: '', completedDate: '' }, createdAt, updatedAt: createdAt
      };
      const doc = await db.collection('projects').add(p); await activity(doc.id, 'Project created as draft', 'project');
      return json(200, { project: cleanProject(doc.id, p), link: clientLink(p) });
    }

    if (action === 'editProject') {
      const ref = db.collection('projects').doc(text(body.projectId)); const d = await ref.get(); if (!d.exists) return json(404, { error: 'Project not found.' });
      const old = d.data(); const total = amount(body.total); if (!text(body.projectName) || total <= 0 || !text(body.scope)) return json(400, { error: 'Project name, price and scope are required.' });
      const paymentPlan = paymentPlanFromBody(body, total);
      const dates = { ...(old.dates || {}), estimatedStartDate: text(body.estimatedStartDate), targetDeliveryDate: text(body.targetDeliveryDate), paymentDueDate: text(body.paymentDueDate) };
      const patch = { projectName: text(body.projectName), total, currency: currency(body.currency || old.currency), paymentPlan, timeline: text(body.timeline) || 'To be agreed', supportDays: Math.min(365, Math.max(0, Number(body.supportDays || 30))), scope: text(body.scope), features: Array.isArray(body.features) ? body.features.map(text).filter(Boolean).slice(0, 30) : [], liveUrl: safeUrl(body.liveUrl), notes: text(body.notes), dates, updatedAt: now() };
      await ref.update(patch); await activity(d.id, old.signedAt ? 'Project details updated after signing. Signed agreement remains unchanged.' : 'Project details updated', 'project');
      return json(200, { project: cleanProject(d.id, { ...old, ...patch }) });
    }

    if (action === 'sendAgreement') {
      const ref = db.collection('projects').doc(text(body.projectId)); const d = await ref.get(); if (!d.exists) return json(404, { error: 'Project not found.' });
      const p = cleanProject(d.id, d.data());
      let to = text(body.email).toLowerCase();
      if (to) await ref.update({ prefillClientEmail: to, status: p.status === 'Draft' ? 'Agreement Sent' : p.status, agreementSentAt: now(), updatedAt: now() });
      else await ref.update({ status: p.status === 'Draft' ? 'Agreement Sent' : p.status, agreementSentAt: now(), updatedAt: now() });
      if (to) await sendTemplate('agreement_ready', { ...p, clientEmail: to }, { to, idempotencyKey: body.idempotencyKey || '' });
      await activity(p.id, to ? `Agreement sent to ${to}` : 'Agreement marked as sent', 'agreement');
      return json(200, { ok: true, link: clientLink(p) });
    }

    if (action === 'recordPayment') {
      const projectRef = db.collection('projects').doc(text(body.projectId)); const projectDoc = await projectRef.get(); if (!projectDoc.exists) return json(404, { error: 'Project not found.' });
      const p = cleanProject(projectDoc.id, projectDoc.data()); const paymentAmount = amount(body.amount); if (paymentAmount <= 0) return json(400, { error: 'Enter a valid amount.' });
      const direction = body.direction === 'out' ? 'out' : 'in'; const key = text(body.idempotencyKey);
      if (key) { const k = await db.collection('paymentKeys').doc(key).get(); if (k.exists) return json(200, { ok: true, duplicate: true, paymentId: k.data().paymentId }); }
      const receiptNo = `JVO-R-${String(await nextNumber('receipts')).padStart(5, '0')}`; const createdAt = now();
      const payment = { projectId: p.id, projectName: p.projectName, clientName: p.clientName || '', clientEmail: p.clientEmail || '', type: text(body.type) || 'Payment', amount: paymentAmount, currency: p.currency || 'GHS', direction, method: text(body.method), reference: text(body.reference), date: text(body.date) || createdAt.slice(0, 10), notes: text(body.notes), receiptNo, status: 'Posted', createdAt };
      const payRef = await db.collection('payments').add(payment); if (key) await db.collection('paymentKeys').doc(key).set({ paymentId: payRef.id, createdAt });
      const [payments, changes] = await Promise.all([projectPayments(p.id), projectChanges(p.id)]); const totals = ledgerTotals(p, payments, changes);
      let status = p.status;
      const first = p.paymentPlan?.milestones?.[0]?.amount || p.total * .5;
      if (totals.paid >= totals.totalDue && totals.totalDue > 0) status = 'Fully Paid'; else if (totals.paid >= first && ['Awaiting Deposit', 'Agreement Signed', 'Agreement Sent'].includes(status)) status = 'Deposit Received';
      await projectRef.update({ status, lastPaymentAt: createdAt, updatedAt: createdAt });
      await activity(p.id, `${direction === 'out' ? 'Refund' : payment.type} recorded: ${money(paymentAmount, p.currency)} (${receiptNo})`, 'payment');
      if (p.clientEmail && direction === 'in') await sendTemplate('payment_received', { ...p, status }, { paymentAmount, receiptNo, paid: totals.paid, outstanding: totals.outstanding, fullyPaid: totals.outstanding <= 0, idempotencyKey: `payment-email-${payRef.id}` });
      return json(200, { ok: true, paymentId: payRef.id, receiptNo, financials: totals, status });
    }

    if (action === 'voidPayment') {
      const d = await db.collection('payments').doc(text(body.paymentId)).get(); if (!d.exists) return json(404, { error: 'Payment not found.' });
      await d.ref.update({ status: 'Voided', voidReason: text(body.reason), voidedAt: now() }); await activity(d.data().projectId, `Payment ${d.data().receiptNo || d.id} voided`, 'payment'); return json(200, { ok: true });
    }

    if (action === 'updateProject') {
      if (!STATUSES.includes(body.status)) return json(400, { error: 'Invalid project status.' });
      const ref = db.collection('projects').doc(text(body.projectId)); const d = await ref.get(); if (!d.exists) return json(404, { error: 'Project not found.' });
      const p = cleanProject(d.id, d.data()); const stamp = now(); const patch = { status: body.status, updatedAt: stamp, dates: { ...(p.dates || {}) } };
      if (body.status === 'Development' && !patch.dates.startDate) patch.dates.startDate = stamp.slice(0, 10);
      if (body.status === 'Client Review') patch.dates.reviewDate = stamp.slice(0, 10);
      if (body.status === 'Approved') patch.dates.approvedDate = stamp.slice(0, 10);
      if (body.status === 'Launched') patch.dates.launchDate = stamp.slice(0, 10);
      if (body.status === 'Completed') patch.dates.completedDate = stamp.slice(0, 10);
      await ref.update(patch); await activity(p.id, `Project status changed to ${body.status}`, 'status');
      if (body.status === 'Client Review' && p.clientEmail) await sendTemplate('review_ready', p, { idempotencyKey: `review-${p.id}-${stamp.slice(0,13)}` });
      if (body.status === 'Launched' && p.clientEmail) await sendTemplate('launched', { ...p, ...patch }, { idempotencyKey: `launched-${p.id}` });
      return json(200, { ok: true });
    }

    if (action === 'changeRequest') {
      const pDoc = await db.collection('projects').doc(text(body.projectId)).get(); if (!pDoc.exists) return json(404, { error: 'Project not found.' });
      const p = cleanProject(pDoc.id, pDoc.data()); const a = amount(body.amount); if (!text(body.description) || a <= 0) return json(400, { error: 'Description and price are required.' });
      const item = { projectId: p.id, projectName: p.projectName, description: text(body.description), amount: a, currency: p.currency || 'GHS', status: 'Quoted', createdAt: now(), decisionToken: crypto.randomBytes(12).toString('hex') };
      const doc = await db.collection('changeRequests').add(item); await activity(p.id, `Additional work quoted: ${item.description} (${money(a, item.currency)})`, 'change');
      if (body.sendToClient && p.clientEmail) await sendTemplate('change_order', p, { description: item.description, amount: a, idempotencyKey: `change-${doc.id}` });
      return json(200, { ok: true, changeId: doc.id });
    }

    if (action === 'updateChangeRequest') {
      const status = ['Quoted', 'Approved', 'Declined', 'Paid', 'Done'].includes(body.status) ? body.status : '';
      const ref = db.collection('changeRequests').doc(text(body.changeId)); const d = await ref.get(); if (!d.exists || !status) return json(400, { error: 'Invalid additional work update.' });
      const current = d.data().status; const allowed = current === 'Quoted' ? ['Quoted','Approved','Declined'] : current === 'Approved' ? ['Approved','Paid','Done'] : current === 'Paid' ? ['Paid','Done'] : [current]; if (!allowed.includes(status)) return json(409, { error: 'That change order decision is already locked.' });
      await ref.update({ status, updatedAt: now() }); await activity(d.data().projectId, `Additional work marked ${status.toLowerCase()}: ${d.data().description}`, 'change'); return json(200, { ok: true });
    }

    if (action === 'addUpdate') {
      const p = await db.collection('projects').doc(text(body.projectId)).get(); if (!p.exists) return json(404, { error: 'Project not found.' });
      if (!text(body.message)) return json(400, { error: 'Write an update first.' });
      await db.collection('clientUpdates').add({ projectId: p.id, message: text(body.message), createdAt: now() }); await activity(p.id, `Client update posted: ${text(body.message)}`, 'update'); return json(200, { ok: true });
    }

    if (action === 'saveSettings') {
      const patch = { businessName: text(body.businessName) || 'JVO', ownerName: text(body.ownerName), email: text(body.email).toLowerCase(), phone: text(body.phone), whatsapp: text(body.whatsapp), snapchat: text(body.snapchat), address: text(body.address), defaultCurrency: currency(body.defaultCurrency), supportDays: Math.min(365, Math.max(0, Number(body.supportDays || 30))), paymentInstructions: text(body.paymentInstructions), paymentLink: safeUrl(body.paymentLink), logoUrl: safeUrl(body.logoUrl), emailSenderName: text(body.emailSenderName) || 'JVO', updatedAt: now() };
      await db.collection('settings').doc('business').set(patch, { merge: true }); return json(200, { ok: true });
    }

    if (action === 'sendEmail') {
      const to = text(body.to).toLowerCase(); const subject = text(body.subject); const message = text(body.message);
      if (!to || !subject || !message) return json(400, { error: 'Email, subject and message are required.' });
      let project = { id: '', projectName: 'JVO', ref: 'JVO', publicToken: '' };
      if (body.projectId) { const p = await db.collection('projects').doc(text(body.projectId)).get(); if (p.exists) project = cleanProject(p.id, p.data()); }
      const settings = await getSettings(); const link = project.publicToken ? clientLink(project) : SITE;
      const html = emailFrame({ eyebrow: project.ref || 'JVO', title: subject, intro: message, content: project.id ? infoRow('Project', project.projectName) + infoRow('Reference', project.ref) : '', buttonLabel: project.id ? 'View project' : 'Visit JVO', buttonUrl: link, settings });
      await sendMail({ to, subject, textMessage: `${message}\n\n${link}`, html, projectId: project.id, projectName: project.projectName, template: 'custom', idempotencyKey: text(body.idempotencyKey) });
      if (project.id) await activity(project.id, `Email sent: ${subject}`, 'email'); return json(200, { ok: true });
    }

    if (action === 'sendTemplate') {
      const p = await db.collection('projects').doc(text(body.projectId)).get(); if (!p.exists) return json(404, { error: 'Project not found.' });
      const project = cleanProject(p.id, p.data()); const [payments, changes] = await Promise.all([projectPayments(project.id), projectChanges(project.id)]); const totals = ledgerTotals(project, payments, changes);
      const first = project.paymentPlan?.milestones?.[0]?.amount || 0;
      await sendTemplate(body.template, project, { amountDue: first, outstanding: totals.outstanding, idempotencyKey: text(body.idempotencyKey) }); await activity(project.id, `Email sent: ${body.template}`, 'email'); return json(200, { ok: true });
    }

    if (action === 'adminReceiptPdf') {
      const p = await db.collection('payments').doc(text(body.paymentId)).get(); if (!p.exists) return json(404, { error: 'Payment not found.' });
      return json(200, { url: `${SITE}/.netlify/functions/api?action=receiptPdf&id=${body.publicToken}&payment=${p.id}` });
    }

    return json(404, { error: 'Unknown action.' });
  } catch (e) {
    console.error(e);
    if (e.message === 'AUTH' || e.message === 'FORBIDDEN') return json(401, { error: 'You are not allowed to do that.' });
    if (e.message === 'RATE') return json(429, { error: 'Too many requests. Please wait a minute and try again.' });
    if (e.message === 'ALREADY_SIGNED') return json(409, { error: 'This agreement has already been signed.' });
    return json(500, { error: e.message || 'Server error.' });
  }
};
