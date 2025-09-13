// Enhanced PagePouch Extension Popup
// Modern, beautiful UI with new logo and improved UX

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
    width: '380px',
    minHeight: '500px',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    backgroundColor: '#ffffff',
    color: '#1f2937',
    fontSize: '14px',
    lineHeight: '1.5',
  },
  header: {
    padding: '16px 20px',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    padding: '20px',
  },
  button: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: '500',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    marginBottom: '8px',
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
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    marginBottom: '12px',
    boxSizing: 'border-box' as const,
  },
  card: {
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
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
    padding: '12px',
    backgroundColor: '#f3f4f6',
    borderRadius: '6px',
    marginBottom: '16px',
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
          setTimeout(() => {
            setState(prev => ({ ...prev, captureProgress: undefined, isCapturing: false }));
          }, 2000);
        }
      }
    });
  }, []);

  const checkAuthStatus = async () => {
    try {
      const result = await chrome.storage.local.get(['isAuthenticated', 'userEmail', 'captureCount']);
      setState(prev => ({
        ...prev,
        isAuthenticated: result.isAuthenticated || false,
        userEmail: result.userEmail,
        captureCount: result.captureCount || 0,
      }));
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  const handleCapture = async (captureType: 'visible' | 'fullPage') => {
    if (!state.currentTab?.id) return;

    setState(prev => ({ ...prev, isCapturing: true, captureProgress: undefined }));

    try {
      await chrome.runtime.sendMessage({
        type: 'CAPTURE_PAGE',
        payload: { 
          tabId: state.currentTab.id,
          captureType 
        },
      });
    } catch (error) {
      console.error('Capture failed:', error);
      setState(prev => ({ 
        ...prev, 
        isCapturing: false,
        captureProgress: { status: 'error', message: 'Capture failed. Please try again.' }
      }));
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
      }
    } catch (error) {
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
    chrome.tabs.create({ url: 'http://localhost:3000/dashboard' });
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
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>
              {authForm.isSignUp ? 'Create Account' : 'Sign In'}
            </h2>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '13px' }}>
              {authForm.isSignUp 
                ? 'Start capturing and organizing web content' 
                : 'Access your PagePouch library'
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
                {state.currentTab.url}
              </div>
            </div>
          </div>
        )}

        {/* Capture Progress */}
        {state.captureProgress && (
          <div style={styles.card}>
            <div style={{ marginBottom: '8px', fontWeight: '500' }}>
              {state.captureProgress.status === 'complete' ? '✅ Capture Complete!' : '📸 Capturing...'}
            </div>
            <div style={styles.progressBar}>
              <div 
                style={{
                  ...styles.progressFill,
                  width: state.captureProgress.status === 'complete' ? '100%' : '60%',
                }}
              />
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              {state.captureProgress.message}
            </div>
          </div>
        )}

        {/* Capture Buttons */}
        {!state.isCapturing && !state.captureProgress && (
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
          marginTop: '20px', 
          paddingTop: '16px', 
          borderTop: '1px solid #e5e7eb',
          fontSize: '12px',
          color: '#6b7280',
        }}>
          <div>PagePouch v1.0.0</div>
          <div style={{ marginTop: '4px' }}>
            Capture • Organize • Retrieve
          </div>
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
