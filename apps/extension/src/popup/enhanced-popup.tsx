// Enhanced PageStash Extension Popup
// Modern, beautiful UI with new logo and improved UX

import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { ExtensionAuth, supabase } from '../utils/supabase';

// Beautiful PageStash Logo component
const Logo = ({ size = 32 }: { size?: number }) => (
  <div style={{ position: 'relative' }}>
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: 'drop-shadow(0 4px 12px rgba(59, 130, 246, 0.3))' }}
    >
      <defs>
        <filter id={`emboss-${size}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0.5" dy="0.5" stdDeviation="0.3" floodColor="#1d4ed8" floodOpacity="0.3"/>
        </filter>
      </defs>
      {/* Main document */}
      <path 
        d="M9 6C9 4.89543 9.89543 4 11 4H35C36.1046 4 37 4.89543 37 6V40C37 41.1046 36.1046 42 35 42H11C9.89543 42 9 41.1046 9 40V6Z" 
        fill="#f8fafc" 
        stroke="#2563eb" 
        strokeWidth="2"
      />
      {/* Paperclip */}
      <path 
        d="M37 6V18L42 13V8C42 6.89543 41.1046 6 40 6H37Z" 
        fill="#2563eb" 
        stroke="#2563eb" 
        strokeWidth="2" 
        strokeLinejoin="round"
      />
      {/* Paperclip detail */}
      <path 
        d="M38.5 9.5V15.5M38.5 9.5H40C40.5523 9.5 41 9.94772 41 10.5V11.5C41 12.0523 40.5523 12.5 40 12.5H38.5M38.5 9.5V12.5" 
        stroke="#ffffff" 
        strokeWidth="1" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        filter={`url(#emboss-${size})`}
      />
      {/* Document lines */}
      <rect x="15" y="14" width="14" height="1.5" rx="0.75" fill="#64748b" opacity="0.3"/>
      <rect x="15" y="18" width="10" height="1.5" rx="0.75" fill="#64748b" opacity="0.3"/>
      <rect x="15" y="22" width="12" height="1.5" rx="0.75" fill="#64748b" opacity="0.3"/>
    </svg>
  </div>
);

interface PopupState {
  isCapturing: boolean;
  isAuthenticated: boolean;
  currentTab?: chrome.tabs.Tab;
  showAuth: boolean;
  userEmail?: string;
  captureProgress?: {
    status: string;
    message: string;
  };
  folders: Array<{
    id: string;
    name: string;
    is_default?: boolean;
  }>;
  selectedFolderId: string | null;
  loadingFolders: boolean;
  // Usage tracking
  clipsRemaining: number;
  clipsLimit: number;
  subscriptionTier: 'free' | 'pro';
  warningLevel: 'safe' | 'warning' | 'critical' | 'exceeded';
  usageLoading: boolean;
}

interface AuthFormState {
  email: string;
  password: string;
  isSignUp: boolean;
  isLoading: boolean;
  error?: string;
}

// Inline styles for the extension popup
const styles = {
  container: {
    width: '380px',
    minHeight: '520px',
    maxHeight: '600px',
    height: 'auto',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    backgroundColor: '#ffffff',
    color: '#1f2937',
    fontSize: '14px',
    lineHeight: '1.5',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
  },
  header: {
    padding: '16px 20px 12px 20px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    textAlign: 'center' as const,
    borderBottom: '1px solid #f1f5f9',
  },
  logoSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '6px',
    marginBottom: '8px',
  },
  brandName: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0,
    letterSpacing: '-0.025em',
    textAlign: 'center' as const,
  },
  content: {
    padding: '20px 24px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '16px',
    overflowY: 'auto' as const,
    overflowX: 'hidden' as const,
  },
  button: {
    padding: '14px 24px',
    borderRadius: '12px',
    border: 'none',
    fontWeight: '500',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    maxWidth: '320px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    color: 'white',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    color: '#475569',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  dangerButton: {
    backgroundColor: '#dc2626',
    color: 'white',
  },
  input: {
    width: '100%',
    maxWidth: '320px',
    padding: '14px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '14px',
    marginBottom: '16px',
    boxSizing: 'border-box' as const,
    backgroundColor: '#ffffff',
    transition: 'all 0.2s ease',
    outline: 'none',
  },
  card: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px',
    width: '100%',
    maxWidth: '320px',
    textAlign: 'center' as const,
    boxSizing: 'border-box' as const,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  progressBar: {
    width: '100%',
    height: '4px',
    backgroundColor: '#e5e7eb',
    borderRadius: '2px',
    overflow: 'hidden',
    marginBottom: '8px',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: '2px',
    transition: 'width 0.3s ease',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 8px',
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
  },
  errorText: {
    color: '#dc2626',
    fontSize: '12px',
    marginTop: '4px',
  },
  successText: {
    color: '#059669',
    fontSize: '12px',
    marginTop: '4px',
  },
  tabInfo: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    width: '100%',
    maxWidth: '320px',
    boxSizing: 'border-box' as const,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  tabIcon: {
    width: '16px',
    height: '16px',
    borderRadius: '2px',
  },
  tabTitle: {
    fontWeight: '500',
    fontSize: '13px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    flex: 1,
  },
  tabUrl: {
    fontSize: '11px',
    color: '#6b7280',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
};

function EnhancedPopupApp() {
  const [state, setState] = useState<PopupState>({
    isCapturing: false,
    isAuthenticated: false,
    showAuth: false,
    folders: [],
    selectedFolderId: null,
    loadingFolders: false,
    // Usage tracking defaults
    clipsRemaining: 50, // Default for free tier
    clipsLimit: 50,
    subscriptionTier: 'free',
    warningLevel: 'safe',
    usageLoading: false,
  });

  const [authForm, setAuthForm] = useState<AuthFormState>({
    email: '',
    password: '',
    isSignUp: false,
    isLoading: false,
  });

  useEffect(() => {
    // Get current tab info
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        setState(prev => ({ ...prev, currentTab: tabs[0] }));
      }
    });

    // Check authentication status
    checkAuthStatus();

    // Listen for capture progress updates
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'CAPTURE_PROGRESS') {
        setState(prev => ({
          ...prev,
          captureProgress: {
            status: message.payload.status,
            message: message.payload.message,
          },
        }));

        if (message.payload.status === 'complete') {
          // Update usage data if provided in the response
          if (message.payload.usage) {
            setState(prev => ({
              ...prev,
              clipsRemaining: message.payload.usage.clips_remaining,
              clipsLimit: message.payload.usage.clips_limit,
              subscriptionTier: message.payload.usage.subscription_tier,
              warningLevel: message.payload.usage.warning_level,
            }));
          }
          
          setTimeout(() => {
            setState(prev => ({ ...prev, captureProgress: undefined, isCapturing: false }));
          }, 2000);
        }
      }
    });
  }, []);

  const loadUsage = async () => {
    setState(prev => ({ ...prev, usageLoading: true }));
    
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GET_USAGE'
      });
      
      if (response && !response.error) {
        setState(prev => ({
          ...prev,
          clipsRemaining: response.clips_remaining,
          clipsLimit: response.clips_limit,
          subscriptionTier: response.subscription_tier,
          warningLevel: response.warning_level,
          usageLoading: false,
        }));
      } else {
        console.error('Failed to load usage:', response?.error);
        setState(prev => ({ ...prev, usageLoading: false }));
      }
    } catch (error) {
      console.error('Error loading usage:', error);
      setState(prev => ({ ...prev, usageLoading: false }));
    }
  };

  const checkAuthStatus = async () => {
    try {
      console.log('🔐 Checking authentication status...')
      
      // CRITICAL: Restore session first
      const isAuthenticated = await ExtensionAuth.restoreSession()
      
      console.log('🔐 Session restoration result:', isAuthenticated)
      
      if (isAuthenticated) {
        const { data } = await supabase.auth.getUser()
        console.log('🔐 Current user:', data.user?.email)
        
        // Get stored folder preference
        const result = await chrome.storage.local.get(['selectedFolderId']);
        
        setState(prev => ({
          ...prev,
          isAuthenticated: true,
          userEmail: data.user?.email,
          showAuth: false,
          selectedFolderId: result.selectedFolderId || null,
        }))
        
        // Load folders and usage
        await Promise.all([loadFolders(), loadUsage()]);
      } else {
        console.log('🔐 No valid session, showing auth')
        setState(prev => ({
          ...prev,
          isAuthenticated: false,
          showAuth: true
        }))
      }
    } catch (error) {
      console.error('🔐 Auth check error:', error)
      setState(prev => ({
        ...prev,
        isAuthenticated: false,
        showAuth: true
      }))
    }
  };

  const handleCapture = async (captureType: 'visible' | 'fullPage') => {
    if (!state.currentTab?.id) return;

    // Check if user is authenticated before capturing
    if (!state.isAuthenticated) {
      setState(prev => ({ ...prev, showAuth: true }));
      return;
    }

    setState(prev => ({ 
      ...prev, 
      isCapturing: true, 
      captureProgress: {
        status: 'starting',
        message: captureType === 'fullPage' ? 'Preparing full page capture...' : 'Preparing visible area capture...'
      }
    }));

    try {
      // Show immediate feedback
      setTimeout(() => {
        setState(prev => ({ 
          ...prev, 
          captureProgress: {
            status: 'capturing',
            message: captureType === 'fullPage' ? 'Capturing full page...' : 'Capturing visible area...'
          }
        }));
      }, 100);

      await chrome.runtime.sendMessage({
        type: 'CAPTURE_PAGE',
        payload: { 
          tabId: state.currentTab.id,
          captureType,
          url: state.currentTab.url,
          // Only include folderId if it's a valid UUID (not a fallback string)
          ...(state.selectedFolderId && state.selectedFolderId !== 'inbox' ? { folderId: state.selectedFolderId } : {}),
          title: state.currentTab.title
        },
      });

      // Show success feedback
      setState(prev => ({ 
        ...prev, 
        captureProgress: {
          status: 'complete',
          message: 'Capture successful! 🎉'
        }
      }));

      // Auto-hide after 2 seconds
      setTimeout(() => {
        setState(prev => ({ ...prev, isCapturing: false, captureProgress: undefined }));
      }, 2000);

    } catch (error) {
      console.error('Capture failed:', error);
      setState(prev => ({ 
        ...prev, 
        isCapturing: false,
        captureProgress: { 
          status: 'error', 
          message: 'Capture failed. Please refresh the page and try again.' 
        }
      }));

      // Auto-hide error after 3 seconds
      setTimeout(() => {
        setState(prev => ({ ...prev, captureProgress: undefined }));
      }, 3000);
    }
  };

  const handleAuth = async () => {
    setAuthForm(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      // Import auth utilities dynamically
      const { ExtensionAuth } = await import('../utils/supabase');
      
      let result;
      if (authForm.isSignUp) {
        result = await ExtensionAuth.signUp(authForm.email, authForm.password);
      } else {
        result = await ExtensionAuth.signIn(authForm.email, authForm.password);
      }

      if (result.error) {
        setAuthForm(prev => ({ 
          ...prev, 
          error: result.error?.message || 'Authentication failed',
          isLoading: false 
        }));
      } else {
        setState(prev => ({ 
          ...prev, 
          isAuthenticated: true, 
          userEmail: result.data?.user?.email,
          showAuth: false 
        }));
        setAuthForm({ email: '', password: '', isSignUp: false, isLoading: false });
        
        // Load folders and usage after successful authentication
        await Promise.all([loadFolders(), loadUsage()]);
      }
    } catch (error) {
      setAuthForm(prev => ({ 
        ...prev, 
        error: 'Authentication failed. Please try again.',
        isLoading: false 
      }));
    }
  };

  // Load user folders
  const loadFolders = async () => {
    setState(prev => ({ ...prev, loadingFolders: true }));
    
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GET_FOLDERS'
      });
      
      if (response && response.folders) {
        setState(prev => {
          let selectedFolderId = prev.selectedFolderId;
          
          // Set default folder if none selected
          if (!selectedFolderId && response.folders.length > 0) {
            // Try to find "Inbox" folder first
            const inboxFolder = response.folders.find((f: any) => f.name.toLowerCase() === 'inbox');
            selectedFolderId = inboxFolder ? inboxFolder.id : response.folders[0].id;
            
            // Save selection to storage
            chrome.storage.local.set({ selectedFolderId });
          }
          
          return {
            ...prev,
            folders: response.folders,
            selectedFolderId,
            loadingFolders: false,
          };
        });
      } else {
        setState(prev => ({ 
          ...prev, 
          folders: [], 
          selectedFolderId: null, 
          loadingFolders: false 
        }));
      }
    } catch (error) {
      console.error('Failed to load folders:', error);
      setState(prev => ({ 
        ...prev, 
        folders: [], 
        selectedFolderId: null, 
        loadingFolders: false 
      }));
    }
  };

  // Handle folder selection change
  const handleFolderChange = async (folderId: string) => {
    setState(prev => ({ ...prev, selectedFolderId: folderId }));
    await chrome.storage.local.set({ selectedFolderId: folderId });
  };

  const getUsageBadgeStyle = () => {
    const baseStyle = { ...styles.badge };
    
    switch (state.warningLevel) {
      case 'critical':
        return { ...baseStyle, backgroundColor: '#dc2626', color: 'white' };
      case 'warning':
        return { ...baseStyle, backgroundColor: '#f59e0b', color: 'white' };
      case 'exceeded':
        return { ...baseStyle, backgroundColor: '#7f1d1d', color: 'white' };
      default:
        return baseStyle;
    }
  };

  const getUsageBadgeText = () => {
    if (state.usageLoading) return 'Loading...';
    if (state.warningLevel === 'exceeded') return 'Limit reached';
    return `${state.clipsRemaining} clips left`;
  };

  const handleSignOut = async () => {
    try {
      const { ExtensionAuth } = await import('../utils/supabase');
      await ExtensionAuth.signOut();
      setState(prev => ({ 
        ...prev, 
        isAuthenticated: false, 
        userEmail: undefined,
        showAuth: false 
      }));
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const openWebApp = () => {
    // Use production URL in production, localhost in development
    const webAppUrl = process.env.NODE_ENV === 'production' 
      ? 'https://pagestash-web.vercel.app/dashboard'
      : 'http://localhost:3000/dashboard';
    chrome.tabs.create({ url: webAppUrl });
  };

  // Render authentication form
  if (state.showAuth) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.logoSection}>
            <Logo size={32} />
            <h1 style={styles.brandName}>PageStash</h1>
          </div>
          <button
            onClick={() => setState(prev => ({ ...prev, showAuth: false }))}
            style={{
              position: 'absolute' as const,
              top: '16px',
              right: '16px',
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#64748b',
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>
        
        <div style={styles.content}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>
              {authForm.isSignUp ? 'Create Account' : 'Sign In'}
            </h2>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '13px' }}>
              {authForm.isSignUp 
                ? 'Start capturing and organizing web content' 
                : 'Access your PageStash library'
              }
            </p>
          </div>

          <input
            type="email"
            placeholder="Email"
            value={authForm.email}
            onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
            style={{
              ...styles.input,
              textAlign: 'center' as const,
            }}
          />

          <input
            type="password"
            placeholder="Password"
            value={authForm.password}
            onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
            style={{
              ...styles.input,
              textAlign: 'center' as const,
            }}
          />

          {authForm.error && (
            <div style={styles.errorText}>{authForm.error}</div>
          )}

          <button
            onClick={handleAuth}
            disabled={authForm.isLoading || !authForm.email || !authForm.password}
            style={{
              ...styles.button,
              ...styles.primaryButton,
              opacity: authForm.isLoading || !authForm.email || !authForm.password ? 0.6 : 1,
            }}
          >
            {authForm.isLoading ? '⏳ Processing...' : (authForm.isSignUp ? 'Create Account' : 'Sign In')}
          </button>

          <button
            onClick={() => setAuthForm(prev => ({ ...prev, isSignUp: !prev.isSignUp, error: undefined }))}
            style={{
              ...styles.button,
              ...styles.secondaryButton,
            }}
          >
            {authForm.isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.logoSection}>
          <Logo size={40} />
          <h1 style={styles.brandName}>PageStash</h1>
          {state.isAuthenticated && (
            <div style={getUsageBadgeStyle()}>
              {getUsageBadgeText()}
            </div>
          )}
        </div>
      </div>

      <div style={styles.content}>
        {/* Current Tab Info */}
        {state.currentTab && (
          <div style={{
            ...styles.tabInfo,
            flexDirection: 'column' as const,
            alignItems: 'center',
            textAlign: 'center' as const,
            gap: '8px'
          }}>
            {state.currentTab.favIconUrl && (
              <img 
                src={state.currentTab.favIconUrl} 
                alt="Site icon" 
                style={{
                  ...styles.tabIcon,
                  marginBottom: '4px'
                }}
              />
            )}
            <div style={{ textAlign: 'center', width: '100%' }}>
              <div style={{
                ...styles.tabTitle,
                textAlign: 'center',
                marginBottom: '4px'
              }}>
                {state.currentTab.title || 'Untitled'}
              </div>
              <div style={{
                ...styles.tabUrl,
                textAlign: 'center'
              }}>
                {state.currentTab.url}
              </div>
            </div>
          </div>
        )}

        {/* Capture Progress */}
        {state.captureProgress && (
          <div style={{
            ...styles.card,
            backgroundColor: state.captureProgress.status === 'error' ? '#fef2f2' : 
                           state.captureProgress.status === 'complete' ? '#f0fdf4' : '#f0f9ff',
            border: state.captureProgress.status === 'error' ? '1px solid #fecaca' : 
                   state.captureProgress.status === 'complete' ? '1px solid #bbf7d0' : '1px solid #bfdbfe'
          }}>
            <div style={{ 
              marginBottom: '12px', 
              fontWeight: '600',
              color: state.captureProgress.status === 'error' ? '#dc2626' : 
                     state.captureProgress.status === 'complete' ? '#16a34a' : '#2563eb'
            }}>
              {state.captureProgress.status === 'complete' ? '✅ Capture Complete!' : 
               state.captureProgress.status === 'error' ? '❌ Capture Failed' : '📸 Capturing...'}
            </div>
            
            {state.captureProgress.status !== 'error' && (
              <div style={styles.progressBar}>
                <div 
                  style={{
                    ...styles.progressFill,
                    width: state.captureProgress.status === 'complete' ? '100%' : 
                           state.captureProgress.status === 'capturing' ? '75%' : '25%',
                    backgroundColor: state.captureProgress.status === 'complete' ? '#16a34a' : '#2563eb'
                  }}
                />
              </div>
            )}
            
            <div style={{ 
              fontSize: '13px', 
              color: state.captureProgress.status === 'error' ? '#dc2626' : '#6b7280',
              marginTop: '8px'
            }}>
              {state.captureProgress.message}
            </div>
          </div>
        )}

        {/* Folder Selector */}
        {state.isAuthenticated && state.folders && state.folders.length > 0 && !state.isCapturing && (
          <div style={{ width: '100%', maxWidth: '280px', marginBottom: '12px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '12px', 
              fontWeight: '500', 
              color: '#6b7280', 
              marginBottom: '6px' 
            }}>
              Save to folder:
            </label>
            {state.loadingFolders ? (
              <div style={{ 
                padding: '12px', 
                textAlign: 'center', 
                color: '#6b7280', 
                fontSize: '13px' 
              }}>
                Loading folders...
              </div>
            ) : (
              <select
                value={state.selectedFolderId || ''}
                onChange={(e) => handleFolderChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '14px',
                  backgroundColor: '#ffffff',
                  color: '#1f2937',
                  cursor: 'pointer',
                  outline: 'none',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'><path fill='%23666' d='M2 0L0 2h4zm0 5L0 3h4z'/></svg>")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  backgroundSize: '12px',
                  paddingRight: '40px',
                }}
              >
                {state.folders.map(folder => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}{folder.is_default ? ' (Default)' : ''}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Capture Buttons */}
        {!state.isCapturing && !state.captureProgress && (
          <>
            {state.warningLevel === 'exceeded' ? (
              <div style={{
                padding: '16px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '12px',
                textAlign: 'center' as const,
                marginBottom: '12px'
              }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#dc2626', marginBottom: '8px' }}>
                  Monthly limit reached
                </div>
                <div style={{ fontSize: '12px', color: '#7f1d1d', marginBottom: '12px' }}>
                  You've used all {state.clipsLimit} clips this month. Upgrade to Pro for unlimited clips!
                </div>
                <button
                  onClick={() => window.open('https://pagestash-web.vercel.app/pricing', '_blank')}
                  style={{
                    ...styles.button,
                    ...styles.primaryButton,
                    backgroundColor: '#dc2626',
                  }}
                >
                  🚀 Upgrade to Pro
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => handleCapture('fullPage')}
                  style={{
                    ...styles.button,
                    ...styles.primaryButton,
                  }}
                >
                  📄 Capture Full Page
                </button>

                <button
                  onClick={() => handleCapture('visible')}
                  style={{
                    ...styles.button,
                    ...styles.secondaryButton,
                  }}
                >
                  📱 Capture Visible Area
                </button>
              </>
            )}
          </>
        )}

        {/* Authentication Section */}
        {!state.isAuthenticated ? (
          <div style={styles.card}>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                🔒 Sign in for cloud sync
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                Access your clips anywhere and never lose them
              </div>
            </div>
            <button
              onClick={() => setState(prev => ({ ...prev, showAuth: true }))}
              style={{
                ...styles.button,
                ...styles.secondaryButton,
              }}
            >
              Sign In / Sign Up
            </button>
          </div>
        ) : (
          <div style={styles.card}>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                👋 Welcome back!
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                {state.userEmail}
              </div>
            </div>
            
            <button
              onClick={openWebApp}
              style={{
                ...styles.button,
                ...styles.primaryButton,
              }}
            >
              🌐 Open Web App
            </button>

            <button
              onClick={handleSignOut}
              style={{
                ...styles.button,
                ...styles.secondaryButton,
              }}
            >
              Sign Out
            </button>
          </div>
        )}

        {/* Footer */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: 'auto',
          paddingTop: '16px',
          paddingBottom: '16px',
          borderTop: '1px solid #f1f5f9',
          fontSize: '12px',
          color: '#64748b',
        }}>
          <div style={{ fontWeight: '500', marginBottom: '4px', color: '#64748b' }}>PageStash v1.1.0</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Capture • Organize • Retrieve</div>
        </div>
      </div>
    </div>
  );
}

// Initialize the popup
const container = document.getElementById('popup-root');
if (container) {
  const root = createRoot(container);
  root.render(<EnhancedPopupApp />);
}
