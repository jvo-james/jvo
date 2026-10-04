import { getApp, getApps, initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { browserLocalPersistence, getAuth, onAuthStateChanged, setPersistence, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';

const $ = selector => document.querySelector(selector);
const form = $('#loginForm');
const emailInput = $('#loginEmail');
const passwordInput = $('#loginPassword');
const button = form?.querySelector('button[type="submit"]');
const error = $('#loginError');

const messages = {
  'auth/invalid-credential': 'Invalid email or password.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/user-disabled': 'This Firebase user has been disabled.',
  'auth/user-not-found': 'No Firebase user exists with this email.',
  'auth/wrong-password': 'The Firebase password is incorrect.',
  'auth/operation-not-allowed': 'Email/password sign-in is disabled in Firebase Authentication.',
  'auth/too-many-requests': 'Too many attempts. Wait a little and try again.',
  'auth/unauthorized-domain': 'This website is not authorized in Firebase Authentication.',
  'auth/network-request-failed': 'Firebase could not be reached. Check your connection or deployment.',
  'auth/invalid-api-key': 'The Firebase API key in firebase-config.js is invalid.',
  'auth/app-not-authorized': 'This Firebase app is not authorized for this sign-in request.',
  'auth/requests-from-referer-blocked': 'Firebase blocked this domain. Check the API key restrictions and Firebase Authentication authorized domains.',
  'auth/operation-not-supported-in-this-environment': 'Firebase sign-in is not supported from this page. Open the HTTPS site instead of a local file.',
  'auth/internal-error': 'Firebase returned an internal sign-in error. Refresh the page and try again.',
  'auth/quota-exceeded': 'Firebase Authentication temporarily rejected the request because a quota was exceeded.',
  'auth/timeout': 'Firebase sign-in timed out. Check your connection and try again.',
  'auth/credential-already-in-use': 'This Firebase account is already linked to another credential.'
};

function setError(message = '') {
  if (error) error.textContent = message;
}

function setBusy(on) {
  if (!button) return;
  button.disabled = on;
  button.classList.toggle('loading', on);
  button.setAttribute('aria-busy', on ? 'true' : 'false');
  const label = button.querySelector('.button-label');
  if (label) {
    if (on) {
      button.dataset.oldLabel = label.textContent;
      label.textContent = 'Opening';
    } else {
      label.textContent = button.dataset.oldLabel || 'Open JVO Desk';
    }
  }
}

function showLogin() {
  $('#loginView')?.classList.remove('hidden');
  $('#adminApp')?.classList.add('hidden');
}

function showApp() {
  $('#loginView')?.classList.add('hidden');
  $('#adminApp')?.classList.remove('hidden');
}

async function loadAdminCode() {
  if (window.__JVO_ADMIN_CODE_LOADED__) return;
  window.__JVO_ADMIN_CODE_LOADING__ = true;
  try {
    await import('./admin.js?v=20261004-admin-safe-2');
    window.__JVO_ADMIN_CODE_LOADED__ = true;
  } catch (err) {
    console.error('JVO Desk admin dashboard failed to load:', err);
    window.__JVO_ADMIN_CODE_ERROR__ = err;
    showLogin();
    setError(`The login succeeded, but the admin dashboard failed to start: ${err?.message || err}`);
    throw err;
  } finally {
    window.__JVO_ADMIN_CODE_LOADING__ = false;
  }
}

async function boot() {
  window.__JVO_AUTH_BOOTED__ = false;
  if (!form || !emailInput || !passwordInput || !button) {
    throw new Error('JVO login form markup is incomplete.');
  }

  const config = window.JVO_FIREBASE_CONFIG;
  if (!config?.apiKey || !config?.authDomain || !config?.projectId) {
    throw new Error('Firebase configuration is missing or incomplete.');
  }

  const app = getApps().length ? getApp() : initializeApp(config);
  const auth = getAuth(app);
  window.__JVO_AUTH__ = auth;

  // Keep the signed-in admin session across refreshes. Firebase defaults to
  // local persistence in browsers, but setting it explicitly prevents a
  // browser/environment change from making the dashboard appear logged out.
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch (persistenceError) {
    console.warn('JVO Desk could not set browser auth persistence. Continuing with Firebase defaults.', persistenceError);
  }

  window.__JVO_AUTH_BOOTED__ = true;

  form.addEventListener('submit', async event => {
    event.preventDefault();
    event.stopPropagation();
    if (button.disabled) return;
    setError('');

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    if (!email || !password) {
      setError('Enter your email and password.');
      return;
    }

    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error('JVO Desk Firebase sign-in error:', err);
      const code = err?.code || 'auth/unknown-error';
      setError(`${messages[code] || 'Login failed.'} (${code})`);
      setBusy(false);
    }
  });

  onAuthStateChanged(auth, async user => {
    if (!user) {
      showLogin();
      setBusy(false);
      return;
    }

    setBusy(false);
    setError('');
    try {
      await loadAdminCode();
      showApp();
    } catch (err) {
      console.error('JVO Desk authenticated session could not start:', err);
      showLogin();
      setError(`Your Firebase login worked, but the desk could not finish loading: ${err?.message || err}`);
    }
  }, error => {
    console.error('JVO Desk Firebase auth state error:', error);
    showLogin();
    setBusy(false);
    const code = error?.code || 'auth/unknown-error';
    setError(`${messages[code] || 'Firebase authentication could not start.'} (${code})`);
  });
}

boot().catch(err => {
  console.error('JVO Desk login bootstrap failed:', err);
  window.__JVO_AUTH_BOOT_ERROR__ = err;
  showLogin();
  setBusy(false);
  setError(`JVO Desk could not start: ${err?.message || err}`);
});
