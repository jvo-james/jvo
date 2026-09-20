# JVO

JVO is James Senu's portfolio and private project desk.

The public site stays at `index.html`. The project system adds a private admin area at `admin.html` and a private client project page at `form.html?id=...`.

## What is included

- JVO portfolio
- Firebase email and password admin login
- Draft project creation
- Project agreement sending
- Client details filled by the client
- Immutable signed agreement snapshots
- Versioned agreement terms stored on the server
- Signed agreement PDF downloads
- Client project portal
- Project dates and next actions
- Additional work quotes with client approve or decline controls
- Payment ledger with partial payments, refunds and voided mistakes
- Branded PDF payment receipts
- Multi-currency totals kept separate
- Automatic agreement and payment emails
- Branded HTML email templates through Resend
- Client website approval and change requests
- Client project updates
- Privacy note
- Manual JSON desk backup
- Security headers and server-side validation
- Rate limiting on public project actions
- Idempotency protection for payments and emails

There are no revision limits in the agreement. Client change requests are recorded without setting a fixed number of rounds.

## Folder structure

Only two folders are used:

- `images/`
- `netlify/`

Everything else is in the repo root.

## 1. Firebase web config

Create a Firebase web app and copy the web config into `firebase-config.js`.

```js
window.JVO_FIREBASE_CONFIG = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

This browser config is not the Firebase Admin private key.

## Running the admin page locally

Do not double-click `admin.html`. That opens it as a `file://` URL, and modern browsers can block the Firebase ES modules used by the login screen. The browser then falls back to a normal HTML form submit, which looks like the page is just reloading.

Serve the repo over HTTP instead:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/admin.html
```

For a deployed site, use the HTTPS `admin.html` URL and make sure that host is listed under Firebase Authentication > Settings > Authorized domains.

## 2. Firebase Authentication

In Firebase:

1. Open Authentication
2. Enable Email/Password
3. Create the admin user `senujames23@gmail.com`
4. Use that account to log into `admin.html`
5. Add `jvo.me` and your Netlify site domain to Authorized domains

For extra security, enable MFA for the admin account if your Firebase plan and Identity Platform setup support it.

## 3. Firestore

Create a Firestore database in Production mode.

Publish the included `firestore.rules` file. It blocks all browser reads and writes. JVO Desk talks to Firestore through the Netlify server function instead.

You do not need to create the collections yourself.

The app can create collections such as:

- `projects`
- `agreements`
- `payments`
- `changeRequests`
- `reviews`
- `activities`
- `emails`
- `clientUpdates`
- `settings`
- `meta`

## 4. Firebase Admin credentials in Netlify

From Firebase Project Settings > Service accounts, generate a private key.

Add these environment variables in Netlify:

```text
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
ADMIN_EMAIL=senujames23@gmail.com
```

Never put the service account JSON file or private key in GitHub.

## 5. Resend

Verify `jvo.me` in Resend, create a sending API key and add these Netlify environment variables:

```text
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=JVO <projects@jvo.me>
RESEND_REPLY_TO=senujames23@gmail.com
```

The code also supports the older names `RESEND_FROM` and `REPLY_TO` if they already exist.

## 6. Netlify

Add:

```text
SITE_URL=https://jvo.me
```

The full Netlify environment variable list is:

```text
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
ADMIN_EMAIL
RESEND_API_KEY
RESEND_FROM_EMAIL
RESEND_REPLY_TO
SITE_URL
```

Then redeploy the site.

## 7. First setup inside JVO Desk

Open:

```text
https://jvo.me/admin.html
```

Go to Settings and check:

- Business name
- Your name
- Email
- Phone
- WhatsApp
- Address
- Default currency
- Default bug support days
- Payment instructions
- Payment link
- Email sender name

These settings are used across the client portal, emails and PDF receipts.

## Project workflow

A normal project can follow this flow:

```text
Draft
Agreement Sent
Awaiting Deposit
Deposit Received
Development
Client Review
Approved
Awaiting Final Payment
Fully Paid
Launched
Completed
```

The project page shows the next action so you do not have to remember what should happen next.

## Signed agreements

When the client signs, JVO creates a separate agreement document that contains the exact:

- project name
- price
- currency
- payment plan
- timeline
- scope
- features
- support period
- agreement terms
- client details
- signature
- accepted confirmations
- signing time
- agreement version
- terms version

That agreement record is not edited when the live project changes later.

Use additional work records for changes after signing.

## Payment records

Payments are treated as a ledger. The payment documents are the source of truth.

Supported use includes:

- deposits
- partial payments
- final payments
- additional work payments
- refunds
- mistaken entries marked as void

Each posted incoming payment gets a JVO receipt number and can produce a branded PDF receipt.

## Client portal

The same private project link keeps working after signing.

The client can see:

- signed project details
- agreement PDF
- payment totals
- payment receipts
- project status
- additional work quotes
- project updates
- client review controls
- live website link after launch

Treat the private client link like a password. Do not post it publicly.

## Email design

Transactional email HTML is generated in `netlify/api.js` so it is not exposed as a browser secret. Emails use a responsive table layout that works well in Gmail, Apple Mail and most Outlook versions.

Automatic emails are sent when:

- an agreement is signed
- a payment is recorded
- a project is moved to Client Review
- a project is moved to Launched
- an additional work quote is sent to the client

You can also send reminders and custom messages from a project.

## Backups

Settings contains a `Download desk backup` button that exports the currently loaded JVO Desk records as JSON.

For stronger production backups, also enable scheduled Firestore exports or another backup process in Google Cloud. The JSON download is a convenient extra copy, not a replacement for managed database backups.

## Privacy

`privacy.html` contains a short client privacy note. Review it before production use and update it if your data handling changes.

## Legal note

The project agreement is a practical plain-language business agreement. It is still worth having a Ghanaian lawyer review the final terms once, especially for larger projects or if you change your cancellation, liability or dispute process.

## Admin login architecture

The login is intentionally isolated in `admin-auth.js`. Firebase authentication starts before the larger dashboard script is imported. This keeps a dashboard JavaScript regression from breaking the login button itself. After Firebase signs the admin in, `admin.js` is loaded and the dashboard takes over.

The login button has a visible loading state while authentication is in progress. Errors show the Firebase error code under the form instead of falling back to a normal browser form submission.
