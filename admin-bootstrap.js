(function () {
  'use strict';
  var form = document.getElementById('loginForm');
  var button = form && form.querySelector('button[type="submit"]');
  var error = document.getElementById('loginError');
  var label = button && button.querySelector('.button-label');
  function show(message) { if (error) error.textContent = message || ''; }
  function busy(on) { if (!button) return; button.disabled=on; button.classList.toggle('loading',on); if(label) label.textContent=on?'Opening':'Open JVO Desk'; }
  function friendly(e) {
    var c=e&&e.code||''; var m={
      'auth/invalid-credential':'Invalid email or password.','auth/invalid-email':'Enter a valid email address.',
      'auth/user-disabled':'This Firebase user has been disabled.','auth/user-not-found':'No Firebase user exists with this email.',
      'auth/wrong-password':'The Firebase password is incorrect.','auth/operation-not-allowed':'Email/password sign-in is disabled in Firebase Authentication.',
      'auth/too-many-requests':'Too many attempts. Wait a little and try again.','auth/unauthorized-domain':'This website is not authorized in Firebase Authentication.',
      'auth/network-request-failed':'Firebase could not be reached. Check your connection.','auth/internal-error':'Firebase returned an internal error.'
    }; return m[c] || (e&&e.message) || 'Login failed. Please try again.';
  }
  if(!form) return;
  form.addEventListener('submit',function(e){e.preventDefault();e.stopPropagation();});
  Promise.all([
    import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js')
  ]).then(function(mods){
    var appMod=mods[0],authMod=mods[1],cfg=window.JVO_FIREBASE_CONFIG;
    if(!cfg||!cfg.apiKey||!cfg.authDomain||!cfg.projectId) throw new Error('Firebase configuration is missing or incomplete.');
    var app=appMod.initializeApp(cfg,'JVOLogin'),auth=authMod.getAuth(app);
    form.addEventListener('submit',function(e){
      e.preventDefault();e.stopPropagation();show('');
      var email=(document.getElementById('loginEmail').value||'').trim(),password=document.getElementById('loginPassword').value||'';
      if(!email||!password){show('Enter your email and password.');return;}
      busy(true); authMod.signInWithEmailAndPassword(auth,email,password).then(function(){window.__JVO_LOGIN_HANDLER_READY__=true;window.location.reload();}).catch(function(e){console.error(e);show(friendly(e));}).finally(function(){busy(false);});
    });
    window.__JVO_LOGIN_HANDLER_READY__=true;
    var s=document.createElement('script');s.type='module';s.src='admin.js';document.body.appendChild(s);
  }).catch(function(e){console.error('Firebase login module failed to load:',e);show('Firebase login could not load: '+(e&&e.message?e.message:String(e)));});
})();
