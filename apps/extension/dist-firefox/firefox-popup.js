const extensionAPI = typeof browser !== 'undefined' ? browser : chrome;

let appState = {
  isCapturing: false,
  isAuthenticated: false,
  isCheckingAuth: true,
  showAuth: false,
  currentTab: null,
  userEmail: null,
  captureProgress: null,
  folders: [],
  selectedFolderId: null,
  loadingFolders: false,
  clipsRemaining: 10,
  clipsLimit: 10,
  subscriptionTier: 'free',
  warningLevel: 'safe',
  usageLoading: false
};

let authState = { email: '', password: '', isSignUp: false, isLoading: false, error: null };

const B = {
  primary: '#2563eb', primaryHover: '#1d4ed8', primaryLight: '#dbeafe', primaryText: '#1d4ed8',
  bg: '#ffffff', bgSurface: '#f8fafc', bgMuted: '#f1f5f9',
  text: '#0f172a', textSecondary: '#475569', textMuted: '#64748b', textFaint: '#94a3b8',
  border: '#e2e8f0', borderLight: '#f1f5f9',
  success: '#10b981', successBg: '#ecfdf5', successBorder: '#a7f3d0',
  error: '#ef4444', errorBg: '#fef2f2', errorBorder: '#fecaca',
  warning: '#f59e0b', warningBg: '#fffbeb', critical: '#dc2626',
  radius: '8px', radiusLg: '12px',
  font: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

function logoSVG(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 6C9 4.89543 9.89543 4 11 4H35C36.1046 4 37 4.89543 37 6V40C37 41.1046 36.1046 42 35 42H11C9.89543 42 9 41.1046 9 40V6Z" fill="#f8fafc" stroke="#2563eb" stroke-width="2"/>
      <path d="M37 6V18L42 13V8C42 6.89543 41.1046 6 40 6H37Z" fill="#2563eb" stroke="#2563eb" stroke-width="2" stroke-linejoin="round"/>
    <path d="M38.5 9.5V15.5M38.5 9.5H40C40.5523 9.5 41 9.94772 41 10.5V11.5C41 12.0523 40.5523 12.5 40 12.5H38.5M38.5 9.5V12.5" stroke="#ffffff" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="15" y="14" width="14" height="1.5" rx="0.75" fill="#64748b" opacity="0.3"/>
      <rect x="15" y="18" width="10" height="1.5" rx="0.75" fill="#64748b" opacity="0.3"/>
      <rect x="15" y="22" width="12" height="1.5" rx="0.75" fill="#64748b" opacity="0.3"/>
  </svg>`;
}

function esc(str) {
  const el = document.createElement('span');
  el.textContent = str || '';
  return el.innerHTML;
}

function usageBadge() {
  if (appState.usageLoading) return { text: '...', bg: B.primaryLight, color: B.primaryText };
  if (appState.warningLevel === 'exceeded') return { text: 'Limit reached', bg: B.errorBg, color: B.error };
  if (appState.warningLevel === 'critical') return { text: `${appState.clipsRemaining} left`, bg: B.errorBg, color: B.critical };
  if (appState.warningLevel === 'warning') return { text: `${appState.clipsRemaining} left`, bg: B.warningBg, color: '#92400e' };
  return { text: `${appState.clipsRemaining} clips left`, bg: B.primaryLight, color: B.primaryText };
}

async function loadFolders() {
  appState.loadingFolders = true;
  render();
  await new Promise(r => setTimeout(r, 100));
  try {
    const r = await extensionAPI.runtime.sendMessage({ type: 'GET_FOLDERS' });
    if (r?.folders?.length) {
      appState.folders = r.folders;
        if (!appState.selectedFolderId) {
        const inbox = r.folders.find(f => f.name.toLowerCase() === 'inbox');
        appState.selectedFolderId = inbox ? inbox.id : r.folders[0].id;
          await extensionAPI.storage.local.set({ selectedFolderId: appState.selectedFolderId });
      }
    } else { appState.folders = []; appState.selectedFolderId = null; }
  } catch { appState.folders = []; appState.selectedFolderId = null; }
  appState.loadingFolders = false;
  render();
}

async function loadUsage() {
  appState.usageLoading = true;
  render();
  try {
    const r = await extensionAPI.runtime.sendMessage({ type: 'GET_USAGE' });
    if (r && !r.error) {
      appState.clipsRemaining = r.clips_remaining;
      appState.clipsLimit = r.clips_limit;
      appState.subscriptionTier = r.subscription_tier;
      appState.warningLevel = r.warning_level;
    }
  } catch {}
  appState.usageLoading = false;
  render();
}

async function checkAuthStatus() {
  try {
    const result = await extensionAPI.storage.local.get(['authToken', 'userEmail', 'selectedFolderId']);
    if (result) {
      appState.isAuthenticated = !!result.authToken;
      appState.userEmail = result.userEmail;
      appState.selectedFolderId = result.selectedFolderId;
      if (appState.isAuthenticated) await Promise.all([loadFolders(), loadUsage()]);
    }
  } catch {
    appState.isAuthenticated = false;
  } finally {
    appState.isCheckingAuth = false;
    render();
  }
}

async function getCurrentTab() {
  try {
    const tabs = await extensionAPI.tabs.query({ active: true, currentWindow: true });
    appState.currentTab = tabs?.[0] || null;
  } catch { appState.currentTab = null; }
}

async function capturePage(captureType) {
  if (!appState.currentTab?.id) return;
  if (!appState.isAuthenticated) { appState.showAuth = true; render(); return; }
  appState.isCapturing = true;
  appState.captureProgress = { status: 'starting', message: captureType === 'fullPage' ? 'Preparing full page capture...' : 'Preparing screenshot...' };
  render();
  try {
    await extensionAPI.runtime.sendMessage({
      type: 'CAPTURE_PAGE',
      payload: {
        tabId: appState.currentTab.id, captureType,
        url: appState.currentTab.url, title: appState.currentTab.title,
        ...(appState.selectedFolderId && appState.selectedFolderId !== 'inbox' ? { folderId: appState.selectedFolderId } : {})
      }
    });
  } catch {
    appState.isCapturing = false;
    appState.captureProgress = { status: 'error', message: 'Capture failed. Please refresh the page and try again.' };
    render();
    setTimeout(() => { appState.captureProgress = null; render(); }, 3000);
  }
}

async function handleAuth() {
  authState.isLoading = true; authState.error = null; render();
  try {
    const r = await extensionAPI.runtime.sendMessage({
      type: 'AUTHENTICATE', payload: { email: authState.email, password: authState.password, isSignUp: authState.isSignUp }
    });
    if (r?.error) { authState.error = r.error.message || 'Authentication failed'; authState.isLoading = false; render(); return; }
    if (!r?.data) { authState.error = 'Invalid response from server'; authState.isLoading = false; render(); return; }
    if (authState.isSignUp && !r.data.session) { authState.error = 'Check your email for a confirmation link, then sign in.'; authState.isSignUp = false; authState.isLoading = false; render(); return; }
    appState.isAuthenticated = true; appState.userEmail = authState.email; appState.showAuth = false;
    authState = { email: '', password: '', isSignUp: false, isLoading: false, error: null };
    await Promise.all([loadFolders(), loadUsage()]);
    render();
  } catch { authState.error = 'Authentication failed. Please try again.'; authState.isLoading = false; render(); }
}

async function signOut() {
  try { await extensionAPI.runtime.sendMessage({ type: 'SIGN_OUT' }); } catch {}
    await extensionAPI.storage.local.remove(['authToken', 'userEmail', 'userId', 'refreshToken', 'isAuthenticated']);
  appState.isAuthenticated = false; appState.userEmail = null; appState.showAuth = false; render();
}

function header(rightHTML) {
  return `<header style="padding:12px 16px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid ${B.border}">
    <div style="display:flex;align-items:center;gap:8px">${logoSVG(24)}<span style="font-size:15px;font-weight:700;color:${B.text};letter-spacing:-0.02em">PageStash</span></div>
    ${rightHTML || ''}
  </header>`;
}

function renderLoading() {
  return `<div style="width:360px;min-height:440px;font-family:${B.font};background:${B.bg};display:flex;flex-direction:column">
    ${header('')}
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px">
      ${logoSVG(40)}<span style="color:${B.textMuted};font-size:13px">Loading...</span>
    </div>
  </div>`;
}

function renderAuth() {
  const canSubmit = !authState.isLoading && authState.email && authState.password;
  return `<div style="width:360px;min-height:440px;font-family:${B.font};background:${B.bg};display:flex;flex-direction:column">
    ${header(`<button id="close-auth" style="background:none;border:none;font-size:20px;cursor:pointer;color:${B.textMuted};width:28px;height:28px;border-radius:${B.radius};display:flex;align-items:center;justify-content:center;padding:0">&times;</button>`)}
    <div style="padding:14px 16px;flex:1;display:flex;flex-direction:column;gap:12px;overflow-y:auto">
      <div style="text-align:center;margin-bottom:4px">
        <h2 style="margin:0 0 4px;font-size:17px;font-weight:600;color:${B.text}">${authState.isSignUp ? 'Create account' : 'Welcome back'}</h2>
        <p style="margin:0;color:${B.textMuted};font-size:13px">${authState.isSignUp ? 'Start archiving web pages' : 'Sign in to your library'}</p>
      </div>
      <form id="auth-form" style="display:flex;flex-direction:column;gap:10px;width:100%">
        <input id="email-input" type="email" placeholder="Email" value="${esc(authState.email)}" autocomplete="${authState.isSignUp ? 'email' : 'username'}" required
          style="width:100%;padding:10px 12px;border:1.5px solid ${B.border};border-radius:${B.radius};font-size:13px;box-sizing:border-box;background:${B.bg};outline:none;color:${B.text};font-family:inherit;transition:border-color 0.15s ease">
        <input id="password-input" type="password" placeholder="Password" value="${esc(authState.password)}" autocomplete="${authState.isSignUp ? 'new-password' : 'current-password'}" required
          style="width:100%;padding:10px 12px;border:1.5px solid ${B.border};border-radius:${B.radius};font-size:13px;box-sizing:border-box;background:${B.bg};outline:none;color:${B.text};font-family:inherit;transition:border-color 0.15s ease">
        ${authState.error ? `<div style="text-align:center;padding:8px 12px;background:${B.errorBg};border-radius:${B.radius};border:1px solid ${B.errorBorder};color:${B.error};font-size:12px">${esc(authState.error)}</div>` : ''}
        <button id="auth-submit" type="submit" ${canSubmit ? '' : 'disabled'}
          style="width:100%;padding:10px 16px;border-radius:${B.radius};border:none;font-weight:500;font-size:13px;cursor:pointer;background:${B.primary};color:#fff;font-family:inherit;transition:background-color 0.15s ease,transform 0.1s ease;box-shadow:0 1px 2px 0 rgb(37 99 235/0.2);opacity:${canSubmit ? '1' : '0.55'}">
          ${authState.isLoading ? 'Processing...' : authState.isSignUp ? 'Create account' : 'Sign in'}
        </button>
        </form>
      <button id="auth-toggle" style="background:none;border:none;color:${B.primary};font-size:13px;font-weight:500;cursor:pointer;padding:4px 0;font-family:inherit">
            ${authState.isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
        </button>
    </div>
  </div>`;
}

function renderMain() {
  const badge = usageBadge();
  let tabHost = '';
  try { tabHost = new URL(appState.currentTab?.url || '').hostname; } catch { tabHost = appState.currentTab?.url || ''; }

  let progressHTML = '';
  if (appState.captureProgress) {
    const cp = appState.captureProgress;
    const isErr = cp.status === 'error';
    const isDone = cp.status === 'complete';
    const cardBg = isErr ? B.errorBg : isDone ? B.successBg : B.bgSurface;
    const cardBorder = isErr ? B.errorBorder : isDone ? B.successBorder : B.border;
    const titleColor = isErr ? B.error : isDone ? B.success : B.primary;
    const title = isDone ? 'Saved!' : isErr ? 'Capture failed' : 'Capturing...';
    const barWidth = isDone ? '100%' : cp.status === 'capturing' ? '75%' : '30%';
    progressHTML = `<div style="background:${cardBg};border:1px solid ${cardBorder};border-radius:${B.radiusLg};padding:14px;width:100%;box-sizing:border-box${isDone ? ';animation:popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)' : ''}">
      <div style="font-weight:600;font-size:14px;margin-bottom:6px;color:${titleColor}">${title}</div>
      ${!isErr && !isDone ? `<div style="width:100%;height:3px;background:${B.bgMuted};border-radius:2px;overflow:hidden;margin-bottom:6px"><div style="height:100%;background:${B.primary};border-radius:2px;transition:width 0.4s ease;width:${barWidth}"></div></div>` : ''}
      <div style="font-size:12px;color:${isErr ? B.error : B.textMuted}">${esc(cp.message)}</div>
    </div>`;
  }

  let folderHTML = '';
  if (appState.isAuthenticated && appState.folders.length > 0 && !appState.isCapturing) {
    const opts = appState.folders.map(f => `<option value="${f.id}" ${f.id === appState.selectedFolderId ? 'selected' : ''}>${esc(f.name)}</option>`).join('');
    folderHTML = `<div style="width:100%">
      <label style="display:block;font-size:11px;font-weight:500;color:${B.textMuted};margin-bottom:4px;text-transform:uppercase;letter-spacing:0.05em">Save to</label>
      <select id="folder-select" style="width:100%;padding:9px 12px;border:1px solid ${B.border};border-radius:${B.radius};font-size:13px;background:${B.bg};color:${B.text};cursor:pointer;outline:none;font-family:inherit">${opts}</select>
    </div>`;
  }

  let captureHTML = '';
  if (!appState.isCapturing && !appState.captureProgress) {
    if (appState.warningLevel === 'exceeded') {
      captureHTML = `<div style="background:${B.errorBg};border:1px solid ${B.errorBorder};border-radius:${B.radiusLg};padding:14px;width:100%;box-sizing:border-box;text-align:center">
        <div style="font-weight:600;font-size:14px;color:${B.error};margin-bottom:4px">Monthly limit reached</div>
        <div style="font-size:12px;color:${B.textMuted};margin-bottom:10px">Upgrade to Pro for more clips.</div>
        <button id="upgrade-pro" style="width:100%;padding:10px 16px;border-radius:${B.radius};border:none;font-weight:500;font-size:13px;cursor:pointer;background:${B.error};color:#fff;font-family:inherit">Upgrade to Pro</button>
      </div>`;
    } else {
      captureHTML = `<div style="display:flex;flex-direction:column;gap:8px;width:100%">
        <button id="capture-full" style="width:100%;padding:10px 16px;border-radius:${B.radius};border:none;font-weight:500;font-size:13px;cursor:pointer;background:${B.primary};color:#fff;font-family:inherit;transition:background-color 0.15s ease,transform 0.1s ease;box-shadow:0 1px 2px 0 rgb(37 99 235/0.2)">Capture full page</button>
        <div style="display:flex;gap:8px">
          <button id="capture-visible" style="flex:1;padding:10px 12px;border-radius:${B.radius};border:1px solid ${B.border};font-weight:500;font-size:13px;cursor:pointer;background:${B.bg};color:${B.textSecondary};font-family:inherit;transition:background-color 0.15s ease">Visible area</button>
          <button id="capture-area" style="flex:1;padding:10px 12px;border-radius:${B.radius};border:1px solid ${B.border};font-weight:500;font-size:13px;cursor:pointer;background:${B.bg};color:${B.textSecondary};font-family:inherit;transition:background-color 0.15s ease">Select area</button>
        </div>
      </div>`;
    }
  }

  let accountHTML = '';
  if (appState.isAuthenticated) {
    accountHTML = `<div style="background:${B.bgSurface};border:1px solid ${B.border};border-radius:${B.radiusLg};padding:14px;width:100%;box-sizing:border-box">
      <div style="font-size:12px;color:${B.textMuted};margin-bottom:8px">${esc(appState.userEmail)}</div>
      <div style="display:flex;gap:8px">
        <button id="open-webapp" style="flex:1;padding:8px 12px;border-radius:${B.radius};border:none;font-weight:500;font-size:12px;cursor:pointer;background:${B.primary};color:#fff;font-family:inherit">Open library</button>
        <button id="sign-out" style="flex:1;padding:8px 12px;border-radius:${B.radius};border:1px solid ${B.border};font-weight:500;font-size:12px;cursor:pointer;background:${B.bg};color:${B.textSecondary};font-family:inherit">Sign out</button>
      </div>
    </div>`;
  } else {
    accountHTML = `<div style="background:${B.bgSurface};border:1px solid ${B.border};border-radius:${B.radiusLg};padding:14px;width:100%;box-sizing:border-box">
      <div style="font-weight:500;font-size:13px;margin-bottom:2px;color:${B.text}">Sign in for cloud sync</div>
      <div style="font-size:12px;color:${B.textMuted};margin-bottom:10px">Access your clips anywhere</div>
      <button id="show-auth" style="width:100%;padding:10px 16px;border-radius:${B.radius};border:1px solid ${B.border};font-weight:500;font-size:13px;cursor:pointer;background:${B.bg};color:${B.textSecondary};font-family:inherit">Sign in</button>
    </div>`;
  }

  const badgeHTML = appState.isAuthenticated ? `<span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;background:${badge.bg};color:${badge.color}">${badge.text}</span>` : '';

  return `<div style="width:360px;min-height:440px;max-height:580px;font-family:${B.font};background:${B.bg};color:${B.text};font-size:13px;line-height:1.5;display:flex;flex-direction:column;overflow:hidden">
    ${header(badgeHTML)}
    <div style="padding:14px 16px;flex:1;display:flex;flex-direction:column;gap:12px;overflow-y:auto;overflow-x:hidden">
      ${appState.currentTab ? `<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:${B.bgSurface};border-radius:${B.radius};border:1px solid ${B.border}">
        ${appState.currentTab.favIconUrl ? `<img src="${appState.currentTab.favIconUrl}" alt="" style="width:16px;height:16px;border-radius:3px">` : ''}
        <div style="flex:1;min-width:0">
          <div style="font-weight:500;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(appState.currentTab.title || 'Untitled')}</div>
          <div style="font-size:11px;color:${B.textFaint};overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(tabHost)}</div>
        </div>
      </div>` : ''}
      ${progressHTML}${folderHTML}${captureHTML}${accountHTML}
    </div>
    <footer style="padding:8px 16px;text-align:center;font-size:11px;color:${B.textFaint};border-top:1px solid ${B.borderLight}">PageStash v2.0.0</footer>
  </div>`;
}

function render() {
  const root = document.getElementById('popup-root');
  if (!root) return;
  const html = appState.isCheckingAuth ? renderLoading() : appState.showAuth ? renderAuth() : renderMain();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  root.textContent = '';
  Array.from(doc.body.childNodes).forEach(n => root.appendChild(n.cloneNode(true)));
  bindEvents();
}

function bindEvents() {
  const on = (id, ev, fn) => { const el = document.getElementById(id); if (el) el.addEventListener(ev, fn); };

  if (appState.showAuth) {
    on('close-auth', 'click', () => { appState.showAuth = false; render(); });
    on('email-input', 'input', e => { authState.email = e.target.value; updateSubmitBtn(); });
    on('password-input', 'input', e => { authState.password = e.target.value; updateSubmitBtn(); });
    on('auth-form', 'submit', e => { e.preventDefault(); handleAuth(); });
    on('auth-toggle', 'click', () => { authState.isSignUp = !authState.isSignUp; authState.error = null; render(); });
  } else {
    on('capture-full', 'click', () => capturePage('fullPage'));
    on('capture-visible', 'click', () => capturePage('visible'));
    on('capture-area', 'click', () => { extensionAPI.runtime.sendMessage({ type: 'AREA_SELECT' }); window.close(); });
    on('show-auth', 'click', () => { appState.showAuth = true; render(); });
    on('sign-out', 'click', signOut);
    on('open-webapp', 'click', () => extensionAPI.tabs.create({ url: 'https://pagestash.app/dashboard' }));
    on('upgrade-pro', 'click', () => extensionAPI.tabs.create({ url: 'https://pagestash.app/pricing' }));
    on('folder-select', 'change', e => {
      appState.selectedFolderId = e.target.value;
      extensionAPI.storage.local.set({ selectedFolderId: e.target.value });
    });
  }
}

function updateSubmitBtn() {
  const btn = document.getElementById('auth-submit');
  if (!btn) return;
  const ok = !authState.isLoading && authState.email && authState.password;
  btn.disabled = !ok;
  btn.style.opacity = ok ? '1' : '0.55';
}

async function init() {
  await checkAuthStatus();
  await getCurrentTab();
  
    extensionAPI.runtime.onMessage.addListener((message) => {
    if (message.type !== 'CAPTURE_PROGRESS') return;
    appState.captureProgress = { status: message.payload.status, message: message.payload.message };
      if (message.payload.status === 'complete' && message.payload.usage) {
        appState.clipsRemaining = message.payload.usage.clips_remaining;
        appState.clipsLimit = message.payload.usage.clips_limit;
        appState.subscriptionTier = message.payload.usage.subscription_tier;
        appState.warningLevel = message.payload.usage.warning_level;
      }
      render();
      if (message.payload.status === 'complete') {
      setTimeout(() => { appState.captureProgress = null; appState.isCapturing = false; render(); }, 2200);
    }
  });
  
  render();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
