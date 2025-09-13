// PagePouch Extension Popup
// React-based popup interface with authentication

import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

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

function PopupApp() {
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

    // Get capture count and auth status
    chrome.storage.local.get(['captureCount', 'authToken', 'userEmail'], (result) => {
      setState(prev => ({ 
        ...prev, 
        captureCount: result.captureCount || 0,
        isAuthenticated: !!result.authToken,
        userEmail: result.userEmail
      }));
    });

    // Listen for capture progress messages
    const handleMessage = (message: any) => {
      if (message.type === 'CAPTURE_PROGRESS') {
        setState(prev => ({ 
          ...prev, 
          captureProgress: message.payload 
        }));
      } else if (message.type === 'CAPTURE_SUCCESS') {
        setState(prev => ({ 
          ...prev, 
          isCapturing: false,
          captureProgress: undefined
        }));
      } else if (message.type === 'CAPTURE_ERROR') {
        setState(prev => ({ 
          ...prev, 
          isCapturing: false,
          captureProgress: undefined
        }));
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  const handleCapture = async (captureType: 'visible' | 'fullPage' = 'fullPage') => {
    if (!state.currentTab) return;

    setState(prev => ({ ...prev, isCapturing: true, captureProgress: undefined }));

    try {
      // Send message to background script to capture page
      chrome.runtime.sendMessage({
        type: 'CAPTURE_PAGE',
        payload: {
          url: state.currentTab.url,
          title: state.currentTab.title,
          captureType: captureType,
        }
      });

      // Don't close popup immediately - wait for capture to complete
      // The message listener will handle state updates

    } catch (error) {
      console.error('Capture failed:', error);
      setState(prev => ({ ...prev, isCapturing: false, captureProgress: undefined }));
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthForm(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      // Import auth functions dynamically
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
          isLoading: false,
          error: result.error?.message || 'Authentication failed'
        }));
        return;
      }

      // Success - update UI state
      setState(prev => ({ 
        ...prev, 
        isAuthenticated: true,
        userEmail: authForm.email,
        showAuth: false
      }));
      
      setAuthForm({
        email: '',
        password: '',
        isSignUp: false,
        isLoading: false,
      });

    } catch (error) {
      setAuthForm(prev => ({ 
        ...prev, 
        isLoading: false,
        error: error instanceof Error ? error.message : 'Authentication failed. Please try again.'
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
        userEmail: undefined
      }));
    } catch (error) {
      console.error('Sign out error:', error);
      // Force local cleanup even if remote signout fails
      chrome.storage.local.remove(['authToken', 'userEmail', 'userId', 'refreshToken']);
      setState(prev => ({ 
        ...prev, 
        isAuthenticated: false,
        userEmail: undefined
      }));
    }
  };

  const openWebApp = () => {
    chrome.tabs.create({ url: 'http://localhost:3001' });
  };

  const startFreeTrial = () => {
    setState(prev => ({ ...prev, showAuth: true }));
    setAuthForm(prev => ({ ...prev, isSignUp: true }));
  };

  if (state.showAuth) {
    return (
      <div style={{ padding: '20px', width: '320px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ 
            fontSize: '20px', 
            fontWeight: 'bold', 
            color: '#2563eb',
            marginBottom: '4px'
          }}>
            📎 PagePouch
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            {authForm.isSignUp ? 'Create your free account' : 'Sign in to sync your clips'}
          </div>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleAuth}>
          <div style={{ marginBottom: '12px' }}>
            <input
              type="email"
              placeholder="Email address"
              value={authForm.email}
              onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <input
              type="password"
              placeholder="Password"
              value={authForm.password}
              onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
              required
            />
          </div>

          {authForm.error && (
            <div style={{ 
              marginBottom: '12px',
              padding: '8px',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              borderRadius: '6px',
              fontSize: '12px'
            }}>
              {authForm.error}
            </div>
          )}

          <button
            type="submit"
            disabled={authForm.isLoading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: authForm.isLoading ? '#9ca3af' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: authForm.isLoading ? 'not-allowed' : 'pointer',
              marginBottom: '12px'
            }}
          >
            {authForm.isLoading ? 'Please wait...' : (authForm.isSignUp ? 'Start Free Trial' : 'Sign In')}
          </button>
        </form>

        {/* Toggle Sign Up/In */}
        <div style={{ textAlign: 'center', fontSize: '12px', color: '#6b7280' }}>
          {authForm.isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setAuthForm(prev => ({ ...prev, isSignUp: !prev.isSignUp }))}
            style={{
              background: 'none',
              border: 'none',
              color: '#2563eb',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {authForm.isSignUp ? 'Sign In' : 'Start Free Trial'}
          </button>
        </div>

        {/* Back Button */}
        <button
          onClick={() => setState(prev => ({ ...prev, showAuth: false }))}
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: 'transparent',
            color: '#6b7280',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer',
            marginTop: '12px'
          }}
        >
          ← Back to Capture
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', width: '320px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div style={{ 
          fontSize: '20px', 
          fontWeight: 'bold', 
          color: '#2563eb',
          marginBottom: '4px'
        }}>
          📎 PagePouch
        </div>
        <div style={{ fontSize: '12px', color: '#6b7280' }}>
          {state.isAuthenticated ? `Welcome back, ${state.userEmail?.split('@')[0]}!` : 'Capture • Organize • Retrieve'}
        </div>
      </div>

      {/* Current Page Info */}
      {state.currentTab && (
        <div style={{ 
          marginBottom: '20px', 
          padding: '12px',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: '500',
            marginBottom: '4px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {state.currentTab.title}
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: '#6b7280',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {state.currentTab.url}
          </div>
        </div>
      )}

      {/* Capture Options */}
      {!state.isCapturing ? (
        <div style={{ marginBottom: '16px' }}>
          {/* Full Page Capture (Primary) */}
          <button
            onClick={() => handleCapture('fullPage')}
            disabled={!state.currentTab}
            style={{
              width: '100%',
              padding: '12px 24px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              marginBottom: '8px',
              transition: 'background-color 0.2s'
            }}
          >
            📸 Capture Full Page
          </button>
          
          {/* Visible Area Capture (Secondary) */}
          <button
            onClick={() => handleCapture('visible')}
            disabled={!state.currentTab}
            style={{
              width: '100%',
              padding: '8px 16px',
              backgroundColor: 'transparent',
              color: '#2563eb',
              border: '1px solid #2563eb',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '400',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            📷 Capture Visible Area Only
          </button>
        </div>
      ) : (
        /* Capture Progress */
        <div style={{ 
          marginBottom: '16px',
          padding: '16px',
          backgroundColor: '#f0f9ff',
          border: '1px solid #0ea5e9',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: '500',
            color: '#0369a1',
            marginBottom: '8px'
          }}>
            📸 Capturing Page...
          </div>
          {state.captureProgress && (
            <div style={{ 
              fontSize: '12px', 
              color: '#0369a1',
              marginBottom: '8px'
            }}>
              {state.captureProgress.message}
            </div>
          )}
          <div style={{ 
            width: '100%',
            height: '4px',
            backgroundColor: '#bae6fd',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#0ea5e9',
              animation: 'pulse 1.5s ease-in-out infinite'
            }} />
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ 
        fontSize: '12px', 
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: '16px'
      }}>
        {state.captureCount} pages captured {state.isAuthenticated ? '• Synced' : '• Local only'}
      </div>

      {/* Actions */}
      <div style={{ 
        display: 'flex', 
        gap: '8px',
        fontSize: '12px',
        marginBottom: '12px'
      }}>
        <button
          onClick={openWebApp}
          style={{
            flex: 1,
            padding: '8px 12px',
            backgroundColor: 'transparent',
            color: '#2563eb',
            border: '1px solid #2563eb',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Open Library
        </button>
        {state.isAuthenticated ? (
          <button
            onClick={handleSignOut}
            style={{
              flex: 1,
              padding: '8px 12px',
              backgroundColor: 'transparent',
              color: '#6b7280',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Sign Out
          </button>
        ) : (
          <button
            onClick={() => setState(prev => ({ ...prev, showAuth: true }))}
            style={{
              flex: 1,
              padding: '8px 12px',
              backgroundColor: 'transparent',
              color: '#6b7280',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Sign In
          </button>
        )}
      </div>

      {/* Auth CTA */}
      {!state.isAuthenticated && (
        <div style={{ 
          padding: '12px',
          backgroundColor: '#fef3c7',
          borderRadius: '8px',
          fontSize: '12px',
          textAlign: 'center'
        }}>
          <div style={{ color: '#92400e', marginBottom: '8px' }}>
            🚀 Unlock unlimited clips and sync across devices
          </div>
          <button
            onClick={startFreeTrial}
            style={{
              width: '100%',
              padding: '8px 16px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Start Free Trial
          </button>
        </div>
      )}
    </div>
  );
}

// Initialize popup
const container = document.getElementById('popup-root');
if (container) {
  const root = createRoot(container);
  root.render(<PopupApp />);
}
