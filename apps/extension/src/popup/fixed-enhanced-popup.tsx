// Fixed Enhanced PageStash Extension Popup
// Removed problematic imports and made Chrome API calls safer

import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Logo, LogoIcon } from '../components/Logo';

interface PopupState {
  isCapturing: boolean;
  isAuthenticated: boolean;
  currentTab?: chrome.tabs.Tab;
  captureCount: number;
  showAuth: boolean;
  userEmail?: string;
  captureProgress?: {
    status: string;
    message: string;
  };
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
    width: '360px',
    minHeight: '480px',
    maxHeight: '600px',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    backgroundColor: '#ffffff',
    color: '#1f2937',
    fontSize: '14px',
    lineHeight: '1.5',
    overflow: 'hidden',
    boxSizing: 'border-box' as const,
  },
  header: {
    padding: '12px 16px',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxSizing: 'border-box' as const,
  },
  content: {
    padding: '16px',
    boxSizing: 'border-box' as const,
    maxHeight: '520px',
    overflowY: 'auto' as const,
  },
  button: {
    padding: '10px 14px',
    borderRadius: '6px',
    border: 'none',
    fontWeight: '500',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    width: '100%',
    marginBottom: '8px',
    boxSizing: 'border-box' as const,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    color: 'white',
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: '1px solid #d1d5db',
  },
  dangerButton: {
    backgroundColor: '#dc2626',
    color: 'white',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '13px',
    marginBottom: '10px',
    boxSizing: 'border-box' as const,
    outline: 'none',
  },
  card: {
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '12px',
    boxSizing: 'border-box' as const,
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
    alignItems: 'center',
    gap: '8px',
    padding: '10px',
    backgroundColor: '#f3f4f6',
    borderRadius: '6px',
    marginBottom: '12px',
    boxSizing: 'border-box' as const,
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

function FixedEnhancedPopupApp() {
  const [state, setState] = useState<PopupState>({
    isCapturing: false,
    isAuthenticated: false,
    captureCount: 0,
    showAuth: false,
  });

  const [authForm, setAuthForm] = useState<AuthFormState>({
    email: '',
    password: '',
    isSignUp: false,
    isLoading: false,
  });

  useEffect(() => {
    // Safely get current tab info
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          setState(prev => ({ ...prev, currentTab: tabs[0] }));
        }
      });
    }

    // Check authentication status from storage
    checkAuthStatus();

    // Listen for capture progress updates
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
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
            // Update capture count
            setState(prev => ({ 
              ...prev, 
              captureCount: prev.captureCount + 1,
              isCapturing: false 
            }));
            
            // Clear progress after showing success
            setTimeout(() => {
              setState(prev => ({ ...prev, captureProgress: undefined }));
            }, 2500);
          } else if (message.payload.status === 'error') {
            setState(prev => ({ ...prev, isCapturing: false }));
            
            // Clear error after 3 seconds
            setTimeout(() => {
              setState(prev => ({ ...prev, captureProgress: undefined }));
            }, 3000);
          }
        }
      });
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        const result = await chrome.storage.local.get(['authToken', 'userEmail', 'captureCount', 'userId']);
        
        console.log('Auth status check:', {
          hasToken: !!result.authToken,
          email: result.userEmail,
          userId: result.userId,
          captureCount: result.captureCount
        });

        setState(prev => ({
          ...prev,
          isAuthenticated: !!result.authToken,
          userEmail: result.userEmail || '',
          captureCount: result.captureCount || 0,
        }));
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  const handleCapture = async (captureType: 'visible' | 'fullPage') => {
    // Check authentication first
    if (!state.isAuthenticated) {
      // Show sign-in form instead of error
      setState(prev => ({ 
        ...prev, 
        showAuth: true
      }));
      return;
    }

    if (!state.currentTab?.id) {
      setState(prev => ({ 
        ...prev, 
        captureProgress: { status: 'error', message: 'No active tab found. Please try again.' }
      }));
      return;
    }

    setState(prev => ({ 
      ...prev, 
      isCapturing: true, 
      captureProgress: { 
        status: 'starting', 
        message: 'Gathering page information...' 
      }
    }));

    try {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        // First, get the page data from the current tab
        const tab = state.currentTab;
        
        setState(prev => ({ 
          ...prev, 
          captureProgress: { 
            status: 'preparing', 
            message: captureType === 'fullPage' ? 'Preparing full page capture...' : 'Preparing visible area capture...' 
          }
        }));

        // Send capture message with page data
        await chrome.runtime.sendMessage({
          type: 'CAPTURE_PAGE',
          payload: { 
            url: tab.url || '',
            title: tab.title || 'Untitled Page',
            captureType,
            html: '', // Will be gathered by content script if needed
            text: '', // Will be gathered by content script if needed
            // Only include favicon if it's a valid URL
            favicon: (tab.favIconUrl && tab.favIconUrl.startsWith('http')) ? tab.favIconUrl : undefined,
          },
        });
      } else {
        throw new Error('Chrome extension API not available');
      }
    } catch (error) {
      console.error('Capture failed:', error);
      setState(prev => ({ 
        ...prev, 
        isCapturing: false,
        captureProgress: { 
          status: 'error', 
          message: 'Capture failed. Please check permissions and try again.' 
        }
      }));
      
      // Clear error after 3 seconds
      setTimeout(() => {
        setState(prev => ({ ...prev, captureProgress: undefined }));
      }, 3000);
    }
  };

  const handleCancelCapture = () => {
    setState(prev => ({ 
      ...prev, 
      isCapturing: false,
      captureProgress: undefined
    }));
    
    // Send cancel message to background script
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({
        type: 'CANCEL_CAPTURE',
        payload: {}
      });
    }
  };

  const handleRetryCapture = () => {
    setState(prev => ({ 
      ...prev, 
      captureProgress: undefined
    }));
  };

  const handleAuth = async () => {
    setAuthForm(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      // Dynamically import auth utilities to avoid loading issues
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
        // Update chrome storage with auth state
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          await chrome.storage.local.set({
            isAuthenticated: true,
            userEmail: result.data?.user?.email || '',
          });
        }

        setState(prev => ({ 
          ...prev, 
          isAuthenticated: true, 
          userEmail: result.data?.user?.email,
          showAuth: false 
        }));
        setAuthForm({ email: '', password: '', isSignUp: false, isLoading: false });
      }
    } catch (error) {
      console.error('Auth error:', error);
      setAuthForm(prev => ({ 
        ...prev, 
        error: 'Authentication failed. Please try again.',
        isLoading: false 
      }));
    }
  };

  const handleSignOut = async () => {
    try {
      const { ExtensionAuth } = await import('../utils/supabase');
      await ExtensionAuth.signOut();
      // Update chrome storage
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        await chrome.storage.local.set({
          isAuthenticated: false,
          userEmail: '',
        });
      }

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
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
      // Use production URL in production, localhost in development
      const webAppUrl = process.env.NODE_ENV === 'production' 
        ? 'https://pagestash-web.vercel.app/dashboard'
        : 'http://localhost:3000/dashboard';
      chrome.tabs.create({ url: webAppUrl });
    }
  };

  // Render authentication form
  if (state.showAuth) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <Logo size={28} />
          <button
            onClick={() => setState(prev => ({ ...prev, showAuth: false }))}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              color: '#6b7280',
            }}
          >
            ×
          </button>
        </div>
        
        <div style={styles.content}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '600' }}>
              {authForm.isSignUp ? 'Create Account' : 'Sign In'}
            </h2>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '12px' }}>
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
            style={styles.input}
          />

          <input
            type="password"
            placeholder="Password"
            value={authForm.password}
            onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
            style={styles.input}
          />

          {authForm.error && (
            <div style={{...styles.errorText, textAlign: 'center', marginBottom: '12px'}}>
              {authForm.error}
            </div>
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
        <Logo size={28} />
        {state.isAuthenticated && (
          <div style={styles.badge}>
            {state.captureCount} clips
          </div>
        )}
      </div>

      <div style={styles.content}>
        {/* Current Tab Info */}
        {state.currentTab && (
          <div style={styles.tabInfo}>
            {state.currentTab.favIconUrl && (
              <img 
                src={state.currentTab.favIconUrl} 
                alt="Site icon" 
                style={styles.tabIcon}
              />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={styles.tabTitle}>
                {state.currentTab.title || 'Untitled'}
              </div>
              <div style={styles.tabUrl}>
                {(() => {
                  try {
                    return new URL(state.currentTab.url || '').hostname;
                  } catch {
                    return state.currentTab.url || '';
                  }
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Capture Progress */}
        {state.captureProgress && (
          <div style={{
            ...styles.card,
            backgroundColor: state.captureProgress.status === 'error' ? '#fef2f2' : 
                           state.captureProgress.status === 'complete' ? '#f0fdf4' : '#f9fafb',
            borderColor: state.captureProgress.status === 'error' ? '#fecaca' : 
                        state.captureProgress.status === 'complete' ? '#bbf7d0' : '#e5e7eb',
          }}>
            <div style={{ 
              marginBottom: '8px', 
              fontWeight: '500',
              color: state.captureProgress.status === 'error' ? '#dc2626' : 
                     state.captureProgress.status === 'complete' ? '#059669' : '#374151'
            }}>
              {state.captureProgress.status === 'complete' ? '✅ Capture Complete!' : 
               state.captureProgress.status === 'error' ? '❌ Capture Failed' : '📸 Capturing...'}
            </div>
            {state.captureProgress.status !== 'error' && state.captureProgress.status !== 'complete' && (
              <div style={styles.progressBar}>
                <div 
                  style={{
                    ...styles.progressFill,
                    width: '60%',
                    backgroundColor: '#2563eb',
                  }}
                />
              </div>
            )}
            <div style={{ 
              fontSize: '12px', 
              color: state.captureProgress.status === 'error' ? '#dc2626' : '#6b7280',
              marginTop: '4px',
              marginBottom: state.captureProgress.status === 'error' ? '12px' : '0px'
            }}>
              {state.captureProgress.message}
            </div>
            
            {/* Action buttons for progress states */}
            {state.captureProgress.status === 'error' && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleRetryCapture}
                  style={{
                    ...styles.button,
                    backgroundColor: '#2563eb',
                    color: 'white',
                    flex: 1,
                    fontSize: '12px',
                    padding: '8px 12px'
                  }}
                >
                  🔄 Retry
                </button>
                <button
                  onClick={() => setState(prev => ({ ...prev, captureProgress: undefined }))}
                  style={{
                    ...styles.button,
                    backgroundColor: '#6b7280',
                    color: 'white',
                    flex: 1,
                    fontSize: '12px',
                    padding: '8px 12px'
                  }}
                >
                  ✕ Close
                </button>
              </div>
            )}
            
            {state.isCapturing && state.captureProgress.status !== 'complete' && state.captureProgress.status !== 'error' && (
              <button
                onClick={handleCancelCapture}
                style={{
                  ...styles.button,
                  backgroundColor: '#dc2626',
                  color: 'white',
                  width: '100%',
                  fontSize: '12px',
                  padding: '8px 12px',
                  marginTop: '8px'
                }}
              >
                ⏹ Cancel Capture
              </button>
            )}
          </div>
        )}

        {/* Capture Buttons - Always show when not actively capturing */}
        {!state.isCapturing && (
          <div style={{ marginBottom: '16px' }}>
            <button
              onClick={() => handleCapture('fullPage')}
              disabled={state.isCapturing}
              style={{
                ...styles.button,
                ...styles.primaryButton,
                opacity: state.isCapturing ? 0.6 : 1,
              }}
            >
              📄 Capture Full Page
            </button>

            <button
              onClick={() => handleCapture('visible')}
              disabled={state.isCapturing}
              style={{
                ...styles.button,
                ...styles.secondaryButton,
                opacity: state.isCapturing ? 0.6 : 1,
              }}
            >
              📱 Capture Visible Area
            </button>
          </div>
        )}

        {/* Authentication Section */}
        {!state.isAuthenticated ? (
          <div style={styles.card}>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                🔒 Sign in to capture pages
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                Save your captures to the cloud and access them anywhere
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
          marginTop: '16px', 
          paddingTop: '12px', 
          borderTop: '1px solid #e5e7eb',
          fontSize: '11px',
          color: '#6b7280',
        }}>
          <div>PageStash v1.0.0</div>
          <div style={{ marginTop: '2px' }}>
            Capture • Organize • Retrieve
          </div>
        </div>
      </div>
    </div>
  );
}

// Initialize the popup
console.log('Fixed enhanced popup script loading...');
const container = document.getElementById('popup-root');
console.log('Container found:', container);

if (container) {
  console.log('Creating React root...');
  const root = createRoot(container);
  root.render(<FixedEnhancedPopupApp />);
  console.log('Fixed enhanced popup rendered!');
} else {
  console.error('Could not find popup-root element!');
}
