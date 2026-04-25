import React, { useState, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { ExtensionAuth } from '../utils/supabase';

const BRAND = {
  primary: '#2563eb',
  primaryHover: '#1d4ed8',
  primaryLight: '#dbeafe',
  primaryText: '#1d4ed8',
  bg: '#ffffff',
  bgSurface: '#f8fafc',
  bgMuted: '#f1f5f9',
  text: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#64748b',
  textFaint: '#94a3b8',
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  success: '#10b981',
  successBg: '#ecfdf5',
  successBorder: '#a7f3d0',
  error: '#ef4444',
  errorBg: '#fef2f2',
  errorBorder: '#fecaca',
  warning: '#f59e0b',
  warningBg: '#fffbeb',
  critical: '#dc2626',
  radius: '8px',
  radiusLg: '12px',
  shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  shadowMd: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  font: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
} as const;

const UNSCRIPTABLE_RE = [
  /^chrome:/i, /^chrome-extension:/i, /^about:/i, /^edge:/i, /^brave:/i,
  /^moz-extension:/i, /^view-source:/i, /^devtools:/i,
  /^chrome\.google\.com\/webstore/i, /^chromewebstore\.google\.com/i,
  /^addons\.mozilla\.org/i, /^microsoftedge\.microsoft\.com\/addons/i,
];

function isPageCapturable(url?: string): { ok: boolean; reason?: string } {
  if (!url) return { ok: false, reason: 'No page URL detected.' };
  if (UNSCRIPTABLE_RE.some(p => p.test(url)))
    return { ok: false, reason: 'This is a browser-protected page and cannot be captured. Navigate to a regular website.' };
  if (url === 'about:blank' || url === 'chrome://newtab/' || url === 'about:newtab')
    return { ok: false, reason: 'Open a webpage first, then capture it.' };
  return { ok: true };
}

const LogoSVG = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 6C9 4.89543 9.89543 4 11 4H35C36.1046 4 37 4.89543 37 6V40C37 41.1046 36.1046 42 35 42H11C9.89543 42 9 41.1046 9 40V6Z" fill="#f8fafc" stroke="#2563eb" strokeWidth="2"/>
    <path d="M37 6V18L42 13V8C42 6.89543 41.1046 6 40 6H37Z" fill="#2563eb" stroke="#2563eb" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M38.5 9.5V15.5M38.5 9.5H40C40.5523 9.5 41 9.94772 41 10.5V11.5C41 12.0523 40.5523 12.5 40 12.5H38.5M38.5 9.5V12.5" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="15" y="14" width="14" height="1.5" rx="0.75" fill="#64748b" opacity="0.3"/>
    <rect x="15" y="18" width="10" height="1.5" rx="0.75" fill="#64748b" opacity="0.3"/>
    <rect x="15" y="22" width="12" height="1.5" rx="0.75" fill="#64748b" opacity="0.3"/>
  </svg>
);

interface LimitInfo {
  clips_limit: number;
  clips_this_month: number;
  subscription_tier: string;
  days_until_reset: number;
  reset_date: string;
}

interface PopupState {
  isCapturing: boolean;
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  currentTab?: chrome.tabs.Tab;
  showAuth: boolean;
  userEmail?: string;
  captureProgress?: { status: string; message: string; progress?: number };
  folders: Array<{ id: string; name: string; is_default?: boolean }>;
  selectedFolderId: string | null;
  loadingFolders: boolean;
  clipsRemaining: number;
  clipsLimit: number;
  subscriptionTier: 'free' | 'pro';
  warningLevel: 'safe' | 'warning' | 'critical' | 'exceeded';
  usageLoading: boolean;
  limitInfo?: LimitInfo;
}

interface AuthFormState {
  email: string;
  password: string;
  isSignUp: boolean;
  isLoading: boolean;
  error?: string;
}

function EnhancedPopupApp() {
  const [state, setState] = useState<PopupState>({
    isCapturing: false,
    isAuthenticated: false,
    isCheckingAuth: true,
    showAuth: false,
    folders: [],
    selectedFolderId: null,
    loadingFolders: false,
    clipsRemaining: 10,
    clipsLimit: 10,
    subscriptionTier: 'free',
    warningLevel: 'safe',
    usageLoading: false,
  });

  const [authForm, setAuthForm] = useState<AuthFormState>({
    email: '', password: '', isSignUp: false, isLoading: false,
  });

  const loadUsage = useCallback(async () => {
    setState(p => ({ ...p, usageLoading: true }));
    try {
      const r = await chrome.runtime.sendMessage({ type: 'GET_USAGE' });
      if (r && !r.error) {
        setState(p => ({
          ...p,
          clipsRemaining: r.clips_remaining,
          clipsLimit: r.clips_limit,
          subscriptionTier: r.subscription_tier,
          warningLevel: r.warning_level,
          usageLoading: false,
        }));
      } else {
        setState(p => ({ ...p, usageLoading: false }));
      }
    } catch { setState(p => ({ ...p, usageLoading: false })); }
  }, []);

  const loadFolders = useCallback(async () => {
    setState(p => ({ ...p, loadingFolders: true }));
    try {
      const r = await chrome.runtime.sendMessage({ type: 'GET_FOLDERS' });
      if (r?.folders) {
        setState(p => {
          let folderId = p.selectedFolderId;
          if (!folderId && r.folders.length > 0) {
            const inbox = r.folders.find((f: any) => f.name.toLowerCase() === 'inbox');
            folderId = inbox ? inbox.id : r.folders[0].id;
            chrome.storage.local.set({ selectedFolderId: folderId });
          }
          return { ...p, folders: r.folders, selectedFolderId: folderId, loadingFolders: false };
        });
      } else {
        setState(p => ({ ...p, folders: [], loadingFolders: false }));
      }
    } catch { setState(p => ({ ...p, folders: [], loadingFolders: false })); }
  }, []);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) setState(p => ({ ...p, currentTab: tabs[0] }));
    });

    (async () => {
      try {
        const ok = await ExtensionAuth.restoreSession();
        if (ok) {
          const result = await chrome.storage.local.get(['selectedFolderId', 'userEmail']);
          setState(p => ({
            ...p, isAuthenticated: true, isCheckingAuth: false,
            userEmail: result.userEmail || '', showAuth: false,
            selectedFolderId: result.selectedFolderId || null,
          }));
          await Promise.all([loadFolders(), loadUsage()]);
        } else {
          setState(p => ({ ...p, isAuthenticated: false, isCheckingAuth: false, showAuth: true }));
        }
      } catch {
        setState(p => ({ ...p, isAuthenticated: false, isCheckingAuth: false, showAuth: true }));
      }
    })();

    const listener = (message: any) => {
      if (message.type !== 'CAPTURE_PROGRESS') return;
      const { status, usage, limitInfo } = message.payload;
      setState(p => ({
        ...p,
        captureProgress: { status, message: message.payload.message, progress: message.payload.progress },
      }));
      if (status === 'limit_reached') {
        setState(p => ({
          ...p,
          limitInfo: limitInfo || undefined,
          warningLevel: 'exceeded',
          clipsRemaining: 0,
          isCapturing: false,
          captureProgress: undefined,
        }));
      } else if (status === 'complete') {
        if (usage) {
          setState(p => ({
            ...p,
            clipsRemaining: usage.clips_remaining,
            clipsLimit: usage.clips_limit,
            subscriptionTier: usage.subscription_tier,
            warningLevel: usage.warning_level,
          }));
        }
        setTimeout(() => setState(p => ({ ...p, captureProgress: undefined, isCapturing: false })), 2500);
      } else if (status === 'error' || status === 'cancelled') {
        setTimeout(() => setState(p => ({ ...p, captureProgress: undefined, isCapturing: false })), 4500);
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, [loadFolders, loadUsage]);

  const handleCapture = async (captureType: 'visible' | 'fullPage') => {
    if (!state.currentTab?.id) return;
    if (!state.isAuthenticated) { setState(p => ({ ...p, showAuth: true })); return; }

    const check = isPageCapturable(state.currentTab.url);
    if (!check.ok) {
      setState(p => ({ ...p, captureProgress: { status: 'error', message: check.reason! } }));
      setTimeout(() => setState(p => ({ ...p, captureProgress: undefined })), 4000);
      return;
    }

    setState(p => ({
      ...p, isCapturing: true,
      captureProgress: { status: 'starting', message: captureType === 'fullPage' ? 'Preparing full page capture...' : 'Preparing screenshot...' },
    }));

    try {
      await chrome.runtime.sendMessage({
        type: 'CAPTURE_PAGE',
        payload: {
          tabId: state.currentTab.id, captureType,
          url: state.currentTab.url, title: state.currentTab.title,
          ...(state.selectedFolderId && state.selectedFolderId !== 'inbox' ? { folderId: state.selectedFolderId } : {}),
        },
      });
    } catch {
      setState(p => ({
        ...p, isCapturing: false,
        captureProgress: { status: 'error', message: 'Capture failed. Refresh the page and try again.' },
      }));
      setTimeout(() => setState(p => ({ ...p, captureProgress: undefined })), 4000);
    }
  };

  const handleAuth = async () => {
    // Read directly from DOM to catch password manager autofill that bypasses React onChange
    const emailEl = document.getElementById('email') as HTMLInputElement | null;
    const passEl = document.getElementById('password') as HTMLInputElement | null;
    const email = emailEl?.value || authForm.email;
    const password = passEl?.value || authForm.password;

    if (!email || !password) {
      setAuthForm(p => ({ ...p, error: 'Please enter your email and password' }));
      return;
    }

    setAuthForm(p => ({ ...p, email, password, isLoading: true, error: undefined }));
    try {
      const result = authForm.isSignUp
        ? await ExtensionAuth.signUp(email, password)
        : await ExtensionAuth.signIn(email, password);

      if (result.error) {
        setAuthForm(p => ({ ...p, error: result.error?.message || 'Authentication failed', isLoading: false }));
      } else if (authForm.isSignUp && !result.data?.session) {
        setAuthForm(p => ({ ...p, error: 'Check your email for a confirmation link, then sign in.', isLoading: false, isSignUp: false }));
      } else {
        setState(p => ({ ...p, isAuthenticated: true, userEmail: result.data?.user?.email, showAuth: false }));
        setAuthForm({ email: '', password: '', isSignUp: false, isLoading: false });
        await Promise.all([loadFolders(), loadUsage()]);
      }
    } catch {
      setAuthForm(p => ({ ...p, error: 'Authentication failed. Please try again.', isLoading: false }));
    }
  };

  const handleSignOut = async () => {
    try { await ExtensionAuth.signOut(); } catch { /* force local cleanup below */ }
    setState(p => ({ ...p, isAuthenticated: false, userEmail: undefined, showAuth: false }));
  };

  const openWebApp = () => {
    const url = process.env.NODE_ENV === 'production' ? 'https://www.pagestash.app/dashboard' : 'http://localhost:3000/dashboard';
    chrome.tabs.create({ url });
  };

  const usageBadge = () => {
    if (state.usageLoading) return { text: '...', bg: BRAND.primaryLight, color: BRAND.primaryText };
    if (state.warningLevel === 'exceeded') return { text: 'Limit reached', bg: '#fef2f2', color: BRAND.error };
    if (state.warningLevel === 'critical') return { text: `${state.clipsRemaining} left`, bg: '#fef2f2', color: BRAND.critical };
    if (state.warningLevel === 'warning') return { text: `${state.clipsRemaining} left`, bg: BRAND.warningBg, color: '#92400e' };
    return { text: `${state.clipsRemaining} clips left`, bg: BRAND.primaryLight, color: BRAND.primaryText };
  };

  // --- Loading ---
  if (state.isCheckingAuth) {
    return (
      <div style={css.root}>
        <div style={{ ...css.centeredFill, gap: '12px' }}>
          <LogoSVG size={40} />
          <span style={{ color: BRAND.textMuted, fontSize: '13px' }}>Loading...</span>
        </div>
      </div>
    );
  }

  // --- Auth ---
  if (state.showAuth) {
    return (
      <div style={css.root}>
        <header style={css.header}>
          <div style={css.headerLeft}><LogoSVG size={24} /><span style={css.brandName}>PageStash</span></div>
          <button onClick={() => setState(p => ({ ...p, showAuth: false }))} style={css.closeBtn} aria-label="Close">&times;</button>
        </header>
        <div style={css.body}>
          <div style={{ textAlign: 'center', marginBottom: '4px' }}>
            <h2 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: 600, color: BRAND.text }}>{authForm.isSignUp ? 'Create account' : 'Welcome back'}</h2>
            <p style={{ margin: 0, color: BRAND.textMuted, fontSize: '13px' }}>{authForm.isSignUp ? 'Start archiving web pages' : 'Sign in to your library'}</p>
          </div>
          <form
            id="pagestash-auth-form"
            onSubmit={e => {
              e.preventDefault();
              const form = e.currentTarget;
              const emailInput = form.querySelector('input[name="email"]') as HTMLInputElement;
              const passInput = form.querySelector('input[name="password"]') as HTMLInputElement;
              if (emailInput && passInput) {
                setAuthForm(p => ({ ...p, email: emailInput.value, password: passInput.value }));
              }
              setTimeout(() => handleAuth(), 0);
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}
          >
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Email"
              defaultValue={authForm.email}
              onChange={e => setAuthForm(p => ({ ...p, email: e.target.value }))}
              autoComplete={authForm.isSignUp ? 'email' : 'username'}
              required
              style={css.input}
            />
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Password"
              defaultValue={authForm.password}
              onChange={e => setAuthForm(p => ({ ...p, password: e.target.value }))}
              autoComplete={authForm.isSignUp ? 'new-password' : 'current-password'}
              required
              style={css.input}
            />
            {authForm.error && <div style={css.errorBanner}>{authForm.error}</div>}
            <button type="submit" disabled={authForm.isLoading}
              style={{ ...css.btnPrimary, opacity: authForm.isLoading ? 0.55 : 1 }}>
              {authForm.isLoading ? 'Processing...' : authForm.isSignUp ? 'Create account' : 'Sign in'}
            </button>
          </form>
          <button onClick={() => setAuthForm(p => ({ ...p, isSignUp: !p.isSignUp, error: undefined }))} style={css.linkBtn}>
            {authForm.isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
          </button>
        </div>
      </div>
    );
  }

  // --- Main ---
  const badge = usageBadge();
  return (
    <div style={css.root}>
      <header style={css.header}>
        <div style={css.headerLeft}><LogoSVG size={24} /><span style={css.brandName}>PageStash</span></div>
        {state.isAuthenticated && (
          <span style={{ ...css.badge, backgroundColor: badge.bg, color: badge.color }}>{badge.text}</span>
        )}
      </header>

      <div style={css.body}>
        {/* Tab info */}
        {state.currentTab && (
          <div style={css.tabCard}>
            {state.currentTab.favIconUrl && <img src={state.currentTab.favIconUrl} alt="" style={{ width: 16, height: 16, borderRadius: 3 }} />}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={css.tabTitle}>{state.currentTab.title || 'Untitled'}</div>
              <div style={css.tabUrl}>{(() => { try { return new URL(state.currentTab.url || '').hostname; } catch { return state.currentTab.url; } })()}</div>
            </div>
          </div>
        )}

        {/* Progress */}
        {state.captureProgress && (() => {
          const s = state.captureProgress.status;
          const isErr = s === 'error';
          const isDone = s === 'complete';
          const isCancelled = s === 'cancelled';
          const bg = isErr || isCancelled ? BRAND.errorBg : isDone ? BRAND.successBg : BRAND.bgSurface;
          const border = isErr || isCancelled ? BRAND.errorBorder : isDone ? BRAND.successBorder : BRAND.border;
          const titleColor = isErr || isCancelled ? BRAND.error : isDone ? BRAND.success : BRAND.primary;
          const title = isDone ? '✓ Saved!' : isErr ? 'Capture failed' : isCancelled ? 'Cancelled' : 'Capturing...';
          const progressPct = s === 'saving' ? '90%' : s === 'capturing' ? '60%' : s === 'extracting' ? '30%' : state.captureProgress.progress ? `${state.captureProgress.progress}%` : '15%';
          return (
            <div style={{
              ...css.card, backgroundColor: bg, borderColor: border,
              animation: isDone ? 'popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)' : undefined,
            }}>
              <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '6px', color: titleColor }}>{title}</div>
              {!isErr && !isDone && !isCancelled && (
                <div style={{ width: '100%', height: 3, backgroundColor: BRAND.bgMuted, borderRadius: 2, overflow: 'hidden', marginBottom: 6 }}>
                  <div style={{ height: '100%', backgroundColor: BRAND.primary, borderRadius: 2, transition: 'width 0.5s ease', width: progressPct }} />
                </div>
              )}
              <div style={{ fontSize: '12px', color: isErr || isCancelled ? BRAND.error : BRAND.textMuted, lineHeight: '1.4' }}>{state.captureProgress.message}</div>
            </div>
          );
        })()}

        {/* Folder selector */}
        {state.isAuthenticated && state.folders.length > 0 && !state.isCapturing && (
          <div style={{ width: '100%' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: BRAND.textMuted, marginBottom: 4, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Save to</label>
            <select value={state.selectedFolderId || ''} onChange={e => { setState(p => ({ ...p, selectedFolderId: e.target.value })); chrome.storage.local.set({ selectedFolderId: e.target.value }); }}
              style={css.select}>
              {state.folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
        )}

        {/* Capture buttons */}
        {!state.isCapturing && !state.captureProgress && (
          state.warningLevel === 'exceeded' ? (
            <div style={{ ...css.card, backgroundColor: BRAND.errorBg, borderColor: BRAND.errorBorder, textAlign: 'center' as const, padding: '16px' }}>
              <div style={{ fontSize: '24px', marginBottom: 6 }}>⏳</div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: BRAND.error, marginBottom: 4 }}>Monthly Limit Reached</div>
              <div style={{ fontSize: '12px', color: BRAND.textMuted, marginBottom: 8 }}>
                You&apos;ve used all {state.limitInfo?.clips_limit ?? state.clipsLimit} clips this month
              </div>
              {state.limitInfo?.days_until_reset != null && (
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: 10, padding: '6px 10px', backgroundColor: '#f3f4f6', borderRadius: 8, display: 'inline-block' }}>
                  Resets in {state.limitInfo.days_until_reset} day{state.limitInfo.days_until_reset !== 1 ? 's' : ''}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6, marginTop: 4 }}>
                {state.subscriptionTier === 'pro' ? (
                  <button onClick={() => chrome.tabs.create({ url: 'mailto:support@pagestash.app?subject=Pro%20Plan%20-%20Clip%20Limit%20Inquiry' })} style={{ ...css.btnPrimary, backgroundColor: '#d97706' }}>
                    Contact Support
                  </button>
                ) : (
                  <button onClick={() => chrome.tabs.create({ url: 'https://www.pagestash.app/dashboard?upgrade=true' })} style={{ ...css.btnPrimary, background: 'linear-gradient(135deg, #2563eb, #4f46e5)' }}>
                    Upgrade to Pro — 1,000 clips/mo
                  </button>
                )}
                <button onClick={() => setState(p => ({ ...p, limitInfo: undefined }))} style={{ ...css.btnSecondary, fontSize: '11px', padding: '6px 12px' }}>Dismiss</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px', width: '100%' }}>
              <button onClick={() => handleCapture('fullPage')} style={css.btnPrimary}>Capture full page</button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => handleCapture('visible')} style={{ ...css.btnSecondary, flex: 1 }}>Visible area</button>
                <button onClick={() => {
                const check = isPageCapturable(state.currentTab?.url);
                if (!check.ok) {
                  setState(p => ({ ...p, captureProgress: { status: 'error', message: check.reason! } }));
                  setTimeout(() => setState(p => ({ ...p, captureProgress: undefined })), 4000);
                  return;
                }
                chrome.runtime.sendMessage({ type: 'AREA_SELECT' }); window.close();
              }} style={{ ...css.btnSecondary, flex: 1 }}>Select area</button>
              </div>
            </div>
          )
        )}

        {/* Account card */}
        {!state.isAuthenticated ? (
          <div style={css.card}>
            <div style={{ fontWeight: 500, fontSize: '13px', marginBottom: 2, color: BRAND.text }}>Sign in for cloud sync</div>
            <div style={{ fontSize: '12px', color: BRAND.textMuted, marginBottom: 10 }}>Access your clips anywhere</div>
            <button onClick={() => setState(p => ({ ...p, showAuth: true }))} style={css.btnSecondary}>Sign in</button>
          </div>
        ) : (
          <div style={css.card}>
            <div style={{ fontSize: '12px', color: BRAND.textMuted, marginBottom: 8 }}>{state.userEmail}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={openWebApp} style={{ ...css.btnPrimary, flex: 1, padding: '8px 12px', fontSize: '12px' }}>Open library</button>
              <button onClick={handleSignOut} style={{ ...css.btnSecondary, flex: 1, padding: '8px 12px', fontSize: '12px' }}>Sign out</button>
            </div>
          </div>
        )}
      </div>

      <footer style={css.footer}>PageStash v3.0.0</footer>
    </div>
  );
}

const css: Record<string, React.CSSProperties> = {
  root: {
    width: 360, minHeight: 440, maxHeight: 580, fontFamily: BRAND.font,
    backgroundColor: BRAND.bg, color: BRAND.text, fontSize: 13, lineHeight: 1.5,
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
  },
  header: {
    padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    borderBottom: `1px solid ${BRAND.border}`,
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '8px' },
  brandName: { fontSize: '15px', fontWeight: 700, color: BRAND.text, letterSpacing: '-0.02em' },
  closeBtn: {
    background: 'none', border: 'none', fontSize: 20, cursor: 'pointer',
    color: BRAND.textMuted, width: 28, height: 28, borderRadius: BRAND.radius,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
  },
  body: {
    padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column',
    gap: '12px', overflowY: 'auto', overflowX: 'hidden',
  },
  centeredFill: {
    flex: 1, display: 'flex', flexDirection: 'column' as const,
    alignItems: 'center', justifyContent: 'center',
  },
  badge: {
    display: 'inline-flex', alignItems: 'center', padding: '2px 8px',
    borderRadius: '10px', fontSize: '11px', fontWeight: 600,
  },
  tabCard: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
    backgroundColor: BRAND.bgSurface, borderRadius: BRAND.radius, border: `1px solid ${BRAND.border}`,
  },
  tabTitle: { fontWeight: 500, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const },
  tabUrl: { fontSize: 11, color: BRAND.textFaint, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const },
  card: {
    backgroundColor: BRAND.bgSurface, border: `1px solid ${BRAND.border}`, borderRadius: BRAND.radiusLg,
    padding: '14px', width: '100%', boxSizing: 'border-box' as const,
  },
  input: {
    width: '100%', padding: '10px 12px', border: `1.5px solid ${BRAND.border}`, borderRadius: BRAND.radius,
    fontSize: 13, boxSizing: 'border-box' as const, backgroundColor: BRAND.bg, outline: 'none',
    color: BRAND.text, fontFamily: 'inherit', transition: 'border-color 0.15s ease',
  },
  select: {
    width: '100%', padding: '9px 12px', border: `1px solid ${BRAND.border}`, borderRadius: BRAND.radius,
    fontSize: 13, backgroundColor: BRAND.bg, color: BRAND.text, cursor: 'pointer', outline: 'none',
    fontFamily: 'inherit',
  },
  btnPrimary: {
    width: '100%', padding: '10px 16px', borderRadius: BRAND.radius, border: 'none',
    fontWeight: 500, fontSize: 13, cursor: 'pointer', backgroundColor: BRAND.primary, color: '#fff',
    fontFamily: 'inherit', transition: 'background-color 0.15s ease, transform 0.1s ease',
    boxShadow: '0 1px 2px 0 rgb(37 99 235 / 0.2)',
  },
  btnSecondary: {
    width: '100%', padding: '10px 16px', borderRadius: BRAND.radius,
    border: `1px solid ${BRAND.border}`, fontWeight: 500, fontSize: 13,
    cursor: 'pointer', backgroundColor: BRAND.bg, color: BRAND.textSecondary,
    fontFamily: 'inherit', transition: 'background-color 0.15s ease',
  },
  linkBtn: {
    background: 'none', border: 'none', color: BRAND.primary, fontSize: 13,
    fontWeight: 500, cursor: 'pointer', padding: '4px 0', fontFamily: 'inherit',
  },
  errorBanner: {
    textAlign: 'center' as const, padding: '8px 12px', backgroundColor: BRAND.errorBg,
    borderRadius: BRAND.radius, border: `1px solid ${BRAND.errorBorder}`, color: BRAND.error, fontSize: 12,
  },
  footer: {
    padding: '8px 16px', textAlign: 'center' as const, fontSize: 11,
    color: BRAND.textFaint, borderTop: `1px solid ${BRAND.borderLight}`,
  },
};

const container = document.getElementById('popup-root');
if (container) {
  const root = createRoot(container);
  root.render(<EnhancedPopupApp />);
}
