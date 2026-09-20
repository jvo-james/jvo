import { getApp, getApps, initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';

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
  'auth/network-request-failed': 'Firebase could not be reached. Check your connection or deployment.'
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
    await import('./admin.js?v=20260920-2');
    window.__JVO_ADMIN_CODE_LOADED__ = true;
  } catch (err) {
    console.error('JVO Desk admin dashboard failed to load:', err);
    window.__JVO_ADMIN_CODE_ERROR__ = err;
    showLogin();
    setError(`The login succeeded, but the admin dashboard failed to start: ${err?.message || err}`);
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

    showApp();
    setError('');
    setBusy(false);
    await loadAdminCode();
  });
}

boot().catch(err => {
  console.error('JVO Desk login bootstrap failed:', err);
  window.__JVO_AUTH_BOOT_ERROR__ = err;
  showLogin();
  setBusy(false);
  setError(`JVO Desk could not start: ${err?.message || err}`);
});
