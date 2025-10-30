// Firefox-specific popup (Vanilla JavaScript)
// This version doesn't use React to avoid CSP issues

console.log('🦊 Firefox popup script loaded');

// Firefox compatibility layer
const extensionAPI = typeof browser !== 'undefined' ? browser : chrome;
console.log('🦊 Using extension API:', typeof browser !== 'undefined' ? 'browser' : 'chrome');

// State management
let appState = {
  isCapturing: false,
  isAuthenticated: false,
  showAuth: false,
  currentTab: null,
  userEmail: null,
  captureProgress: null,
  folders: [],
  selectedFolderId: null,
  loadingFolders: false,
  // Usage tracking
  clipsRemaining: 50, // Default for free tier
  clipsLimit: 50,
  subscriptionTier: 'free',
  warningLevel: 'safe',
  usageLoading: false
};

let authState = {
  email: '',
  password: '',
  isSignUp: false,
  isLoading: false,
  error: null
};

// Styles
const styles = {
  container: 'width: 380px; min-height: 520px; max-height: 600px; height: auto; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background-color: #ffffff; color: #1f2937; font-size: 14px; line-height: 1.5; display: flex; flex-direction: column; overflow: hidden;',
  header: 'padding: 16px 20px 12px 20px; display: flex; flex-direction: column; align-items: center; text-align: center; border-bottom: 1px solid #f1f5f9;',
  logoSection: 'display: flex; flex-direction: column; align-items: center; gap: 6px; margin-bottom: 8px;',
  brandName: 'font-size: 20px; font-weight: 600; color: #1e293b; margin: 0; letter-spacing: -0.025em; text-align: center;',
  content: 'padding: 20px 24px; flex: 1; display: flex; flex-direction: column; align-items: center; gap: 16px; overflow-y: auto; overflow-x: hidden;',
  button: 'padding: 14px 24px; border-radius: 12px; border: none; font-weight: 500; font-size: 14px; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; max-width: 320px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);',
  primaryButton: 'background-color: #3b82f6; color: white; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);',
  secondaryButton: 'background-color: #ffffff; color: #475569; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);',
  input: 'width: 100%; max-width: 320px; padding: 14px 16px; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 14px; margin-bottom: 16px; box-sizing: border-box; background-color: #ffffff; transition: all 0.2s ease; outline: none; text-align: center;',
  card: 'background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; width: 100%; max-width: 320px; text-align: center; box-sizing: border-box; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);',
  badge: 'display: inline-flex; align-items: center; padding: 4px 8px; background-color: #dbeafe; color: #1d4ed8; border-radius: 12px; font-size: 12px; font-weight: 500;',
  tabInfo: 'display: flex; align-items: flex-start; gap: 12px; padding: 16px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; width: 100%; max-width: 320px; box-sizing: border-box; flex-direction: column; text-align: center; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);'
};

// Logo SVG
function createLogo(size = 32) {
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 12px rgba(59, 130, 246, 0.3));">
      <defs>
        <filter id="emboss-${size}" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0.5" dy="0.5" stdDeviation="0.3" floodColor="#1d4ed8" floodOpacity="0.3"/>
        </filter>
      </defs>
      <path d="M9 6C9 4.89543 9.89543 4 11 4H35C36.1046 4 37 4.89543 37 6V40C37 41.1046 36.1046 42 35 42H11C9.89543 42 9 41.1046 9 40V6Z" fill="#f8fafc" stroke="#2563eb" stroke-width="2"/>
      <path d="M37 6V18L42 13V8C42 6.89543 41.1046 6 40 6H37Z" fill="#2563eb" stroke="#2563eb" stroke-width="2" stroke-linejoin="round"/>
      <path d="M38.5 9.5V15.5M38.5 9.5H40C40.5523 9.5 41 9.94772 41 10.5V11.5C41 12.0523 40.5523 12.5 40 12.5H38.5M38.5 9.5V12.5" stroke="#ffffff" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" filter="url(#emboss-${size})"/>
      <rect x="15" y="14" width="14" height="1.5" rx="0.75" fill="#64748b" opacity="0.3"/>
      <rect x="15" y="18" width="10" height="1.5" rx="0.75" fill="#64748b" opacity="0.3"/>
      <rect x="15" y="22" width="12" height="1.5" rx="0.75" fill="#64748b" opacity="0.3"/>
    </svg>
  `;
}

// Utility functions
function createElement(tag, attributes = {}, children = []) {
  const element = document.createElement(tag);
  
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'style') {
      element.setAttribute('style', value);
    } else if (key === 'onClick') {
      element.addEventListener('click', value);
    } else {
      element.setAttribute(key, value);
    }
  });
  
  children.forEach(child => {
    if (typeof child === 'string') {
      element.innerHTML += child;
    } else {
      element.appendChild(child);
    }
  });
  
  return element;
}

// Load user folders
async function loadFolders() {
  console.log('🦊 Loading user folders...');
  appState.loadingFolders = true;
  render();
  
  // Add a small delay to ensure auth token is stored
  await new Promise(resolve => setTimeout(resolve, 100));
  
  try {
    const response = await extensionAPI.runtime.sendMessage({
      type: 'GET_FOLDERS'
    });
    
    console.log('🦊 Folders response:', response);
    
    if (response && response.folders && Array.isArray(response.folders)) {
      appState.folders = response.folders;
      console.log('🦊 Loaded folders:', appState.folders);
      
      // If no folders exist, create a default Inbox folder
      if (appState.folders.length === 0) {
        console.log('🦊 No folders found, creating default Inbox folder...');
        try {
          const createResponse = await extensionAPI.runtime.sendMessage({
            type: 'CREATE_FOLDER',
            payload: { name: 'Inbox', color: '#6B7280' }
          });
          
          if (createResponse && createResponse.folder) {
            appState.folders = [createResponse.folder];
            appState.selectedFolderId = createResponse.folder.id;
            console.log('🦊 Created default Inbox folder:', createResponse.folder);
          }
        } catch (createError) {
          console.error('🦊 Failed to create default folder:', createError);
        }
      } else {
        // Set default folder if none selected
        if (!appState.selectedFolderId) {
          // Try to find "Inbox" folder first
          const inboxFolder = appState.folders.find(f => f.name.toLowerCase() === 'inbox');
          appState.selectedFolderId = inboxFolder ? inboxFolder.id : appState.folders[0].id;
          
          console.log('🦊 Selected default folder:', appState.selectedFolderId, inboxFolder ? '(Inbox found)' : '(First folder)');
          
          // Save selection to storage
          await extensionAPI.storage.local.set({ selectedFolderId: appState.selectedFolderId });
        }
      }
    } else {
      console.log('🦊 No folders in response or invalid format, using empty folder list');
      console.log('🦊 Response structure:', response);
      // Don't set fallback folders - let clips save to default location
      appState.folders = [];
      appState.selectedFolderId = null;
    }
  } catch (error) {
    console.error('🦊 Failed to load folders:', error);
    // Don't set fallback folders - let clips save to default location
    appState.folders = [];
    appState.selectedFolderId = null;
  }
  
  appState.loadingFolders = false;
  render();
}

// Load usage data
async function loadUsage() {
  console.log('🦊 Loading user usage...');
  appState.usageLoading = true;
  render();
  
  try {
    const response = await extensionAPI.runtime.sendMessage({
      type: 'GET_USAGE'
    });
    
    console.log('🦊 Usage response:', response);
    
    if (response && !response.error) {
      appState.clipsRemaining = response.clips_remaining;
      appState.clipsLimit = response.clips_limit;
      appState.subscriptionTier = response.subscription_tier;
      appState.warningLevel = response.warning_level;
      console.log('🦊 Loaded usage:', {
        remaining: appState.clipsRemaining,
        limit: appState.clipsLimit,
        tier: appState.subscriptionTier,
        warning: appState.warningLevel
      });
    } else {
      console.error('🦊 Failed to load usage:', response?.error);
    }
  } catch (error) {
    console.error('🦊 Error loading usage:', error);
  }
  
  appState.usageLoading = false;
  render();
}

// Handle folder selection
async function handleFolderChange(folderId) {
  console.log('🦊 Folder selected:', folderId);
  appState.selectedFolderId = folderId;
  
  // Save selection to storage
  await extensionAPI.storage.local.set({ selectedFolderId: folderId });
  
  render();
}

// Get usage badge style based on warning level
function getUsageBadgeStyle() {
  const baseStyle = styles.badge;
  
  switch (appState.warningLevel) {
    case 'critical':
      return baseStyle + '; background-color: #dc2626; color: white;';
    case 'warning':
      return baseStyle + '; background-color: #f59e0b; color: white;';
    case 'exceeded':
      return baseStyle + '; background-color: #7f1d1d; color: white;';
    default:
      return baseStyle;
  }
}

// Get usage badge text
function getUsageBadgeText() {
  if (appState.usageLoading) return 'Loading...';
  if (appState.warningLevel === 'exceeded') return 'Limit reached';
  return `${appState.clipsRemaining} clips left`;
}

// Check authentication status
async function checkAuthStatus() {
  try {
    console.log('🦊 Checking auth status...');
    const result = await extensionAPI.storage.local.get(['authToken', 'userEmail', 'selectedFolderId']);
    console.log('🦊 Storage result:', result);
    
    if (result) {
      appState.isAuthenticated = !!result.authToken;
      appState.userEmail = result.userEmail;
      appState.selectedFolderId = result.selectedFolderId;
      console.log('🦊 Auth status:', appState.isAuthenticated, 'Email:', appState.userEmail);
      
      // Load folders and usage if authenticated
      if (appState.isAuthenticated) {
        await Promise.all([loadFolders(), loadUsage()]);
      }
    } else {
      console.log('🦊 No storage result, setting defaults');
      appState.isAuthenticated = false;
      appState.userEmail = null;
      appState.selectedFolderId = null;
    }
  } catch (error) {
    console.error('🦊 Error checking auth status:', error);
    // Set defaults on error
    appState.isAuthenticated = false;
    appState.userEmail = null;
  }
}

// Get current tab
async function getCurrentTab() {
  try {
    console.log('🦊 Getting current tab...');
    const tabs = await extensionAPI.tabs.query({ active: true, currentWindow: true });
    console.log('🦊 Tabs result:', tabs);
    
    if (tabs && tabs.length > 0 && tabs[0]) {
      appState.currentTab = tabs[0];
      console.log('🦊 Current tab:', appState.currentTab.title);
    } else {
      console.log('🦊 No active tab found');
      appState.currentTab = null;
    }
  } catch (error) {
    console.error('🦊 Error getting current tab:', error);
    appState.currentTab = null;
  }
}

// Capture page
async function capturePage(captureType) {
  if (!appState.currentTab?.id) return;
  
  if (!appState.isAuthenticated) {
    appState.showAuth = true;
    render();
    return;
  }
  
  appState.isCapturing = true;
  appState.captureProgress = {
    status: 'starting',
    message: captureType === 'fullPage' ? 'Preparing full page capture...' : 'Preparing visible area capture...'
  };
  render();
  
  try {
    setTimeout(() => {
      appState.captureProgress = {
        status: 'capturing',
        message: captureType === 'fullPage' ? 'Capturing full page...' : 'Capturing visible area...'
      };
      render();
    }, 100);
    
    await extensionAPI.runtime.sendMessage({
      type: 'CAPTURE_PAGE',
      payload: {
        tabId: appState.currentTab.id,
        captureType: captureType,
        url: appState.currentTab.url,
        title: appState.currentTab.title,
        // Only include folderId if it's a valid UUID (not the fallback 'inbox' string)
        ...(appState.selectedFolderId && appState.selectedFolderId !== 'inbox' ? { folderId: appState.selectedFolderId } : {})
      }
    });
    
    appState.captureProgress = {
      status: 'complete',
      message: 'Capture successful! 🎉'
    };
    render();
    
    setTimeout(() => {
      appState.isCapturing = false;
      appState.captureProgress = null;
      render();
    }, 2000);
    
  } catch (error) {
    console.error('Capture failed:', error);
    appState.isCapturing = false;
    appState.captureProgress = {
      status: 'error',
      message: 'Capture failed. Please refresh the page and try again.'
    };
    render();
    
    setTimeout(() => {
      appState.captureProgress = null;
      render();
    }, 3000);
  }
}

// Authentication functions
async function handleAuth() {
  authState.isLoading = true;
  authState.error = null;
  render();
  
  try {
    console.log('🦊 Sending auth request:', { email: authState.email, isSignUp: authState.isSignUp });
    
    // Use real Supabase authentication
    const response = await extensionAPI.runtime.sendMessage({
      type: 'AUTHENTICATE',
      payload: {
        email: authState.email,
        password: authState.password,
        isSignUp: authState.isSignUp
      }
    });
    
    console.log('🦊 Auth response received:', response);
    
    if (response && response.error) {
      console.error('🦊 Auth failed:', response.error);
      authState.error = response.error.message || 'Authentication failed';
      authState.isLoading = false;
      render();
      return;
    }
    
    if (!response || !response.data) {
      console.error('🦊 Invalid response:', response);
      authState.error = 'Invalid response from server';
      authState.isLoading = false;
      render();
      return;
    }
    
    console.log('🦊 Auth successful!');
    // Success - update state
    appState.isAuthenticated = true;
    appState.userEmail = authState.email;
    appState.showAuth = false;
    
    // Reset auth state
    authState = {
      email: '',
      password: '',
      isSignUp: false,
      isLoading: false,
      error: null
    };
    
    // Load folders and usage after successful authentication
    await Promise.all([loadFolders(), loadUsage()]);
    
    render();
    
  } catch (error) {
    console.error('🦊 Auth error:', error);
    authState.error = 'Authentication failed. Please try again.';
    authState.isLoading = false;
    render();
  }
}

async function signOut() {
  try {
    // Use background script for sign out
    await extensionAPI.runtime.sendMessage({
      type: 'SIGN_OUT'
    });
    
    appState.isAuthenticated = false;
    appState.userEmail = null;
    appState.showAuth = false;
    
    render();
  } catch (error) {
    console.error('Sign out failed:', error);
    // Force local cleanup even if remote signout fails
    await extensionAPI.storage.local.remove(['authToken', 'userEmail', 'userId', 'refreshToken', 'isAuthenticated']);
    appState.isAuthenticated = false;
    appState.userEmail = null;
    render();
  }
}

// Helper function to update auth button state
function updateAuthButtonState() {
  const authSubmit = document.getElementById('auth-submit');
  if (authSubmit) {
    const canSubmit = !authState.isLoading && authState.email && authState.password;
    authSubmit.disabled = !canSubmit;
    authSubmit.style.opacity = canSubmit ? '1' : '0.6';
  }
}

// Render functions
function renderAuthScreen() {
  return `
    <div style="${styles.container}">
      <div style="${styles.header}">
        <div style="${styles.logoSection}">
          ${createLogo(32)}
          <h1 style="${styles.brandName}">PagePouch</h1>
        </div>
        <button id="close-auth" style="position: absolute; top: 16px; right: 16px; background: none; border: none; font-size: 20px; cursor: pointer; color: #64748b; width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center;">×</button>
      </div>
      <div style="${styles.content}">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">${authState.isSignUp ? 'Create Account' : 'Sign In'}</h2>
          <p style="margin: 0; color: #6b7280; font-size: 13px;">${authState.isSignUp ? 'Start capturing and organizing web content' : 'Access your PagePouch library'}</p>
        </div>
        <input id="email-input" type="email" placeholder="Email" value="${authState.email}" style="${styles.input}">
        <input id="password-input" type="password" placeholder="Password" value="${authState.password}" style="${styles.input}">
        ${authState.error ? `<div style="color: #dc2626; font-size: 12px; margin-top: 4px;">${authState.error}</div>` : ''}
        <button id="auth-submit" ${authState.isLoading || !authState.email || !authState.password ? 'disabled' : ''} style="${styles.button}; ${styles.primaryButton}; opacity: ${!authState.isLoading && authState.email && authState.password ? '1' : '0.6'};">
          ${authState.isLoading ? '⏳ Processing...' : authState.isSignUp ? 'Create Account' : 'Sign In'}
        </button>
        <button id="auth-toggle" style="${styles.button}; ${styles.secondaryButton};">
          ${authState.isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
        </button>
      </div>
    </div>
  `;
}

function renderMainScreen() {
  return `
    <div style="${styles.container}">
      <div style="${styles.header}">
        <div style="${styles.logoSection}">
          ${createLogo(40)}
          <h1 style="${styles.brandName}">PagePouch</h1>
          ${appState.isAuthenticated ? `<div style="${getUsageBadgeStyle()}">${getUsageBadgeText()}</div>` : ''}
        </div>
      </div>
      <div style="${styles.content}">
        ${appState.currentTab ? `
          <div style="${styles.tabInfo}">
            ${appState.currentTab.favIconUrl ? `<img src="${appState.currentTab.favIconUrl}" alt="Site icon" style="width: 16px; height: 16px; border-radius: 2px; margin-bottom: 4px;">` : ''}
            <div style="text-align: center; width: 100%;">
              <div style="font-weight: 500; font-size: 13px; text-align: center; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${appState.currentTab.title || 'Untitled'}</div>
              <div style="font-size: 11px; color: #6b7280; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${appState.currentTab.url}</div>
            </div>
          </div>
        ` : ''}
        
        ${appState.captureProgress ? `
          <div style="${styles.card}; background-color: ${appState.captureProgress.status === 'error' ? '#fef2f2' : appState.captureProgress.status === 'complete' ? '#f0fdf4' : '#f0f9ff'}; border: ${appState.captureProgress.status === 'error' ? '1px solid #fecaca' : appState.captureProgress.status === 'complete' ? '1px solid #bbf7d0' : '1px solid #bfdbfe'};">
            <div style="margin-bottom: 12px; font-weight: 600; color: ${appState.captureProgress.status === 'error' ? '#dc2626' : appState.captureProgress.status === 'complete' ? '#16a34a' : '#2563eb'};">
              ${appState.captureProgress.status === 'complete' ? '✅ Capture Complete!' : appState.captureProgress.status === 'error' ? '❌ Capture Failed' : '📸 Capturing...'}
            </div>
            ${appState.captureProgress.status !== 'error' ? `
              <div style="width: 100%; height: 4px; background-color: #e5e7eb; border-radius: 2px; overflow: hidden; margin-bottom: 8px;">
                <div style="height: 100%; background-color: ${appState.captureProgress.status === 'complete' ? '#16a34a' : '#2563eb'}; border-radius: 2px; transition: width 0.3s ease; width: ${appState.captureProgress.status === 'complete' ? '100%' : appState.captureProgress.status === 'capturing' ? '75%' : '25%'};"></div>
              </div>
            ` : ''}
            <div style="font-size: 13px; color: ${appState.captureProgress.status === 'error' ? '#dc2626' : '#6b7280'}; margin-top: 8px;">${appState.captureProgress.message}</div>
          </div>
        ` : ''}
        
        ${/* Folder Selector - Always visible when authenticated and folders available */ ''}
        ${appState.isAuthenticated && appState.folders && appState.folders.length > 0 && !appState.isCapturing ? `
          <div style="width: 100%; max-width: 320px; margin-bottom: 12px;">
            <label style="display: block; font-size: 12px; font-weight: 500; color: #6b7280; margin-bottom: 6px;">Save to folder:</label>
            ${appState.loadingFolders ? `
              <div style="padding: 12px; text-align: center; color: #6b7280; font-size: 13px;">Loading folders...</div>
            ` : `
              <select id="folder-select" style="width: 100%; padding: 12px 16px; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 14px; background-color: #ffffff; color: #1f2937; cursor: pointer; outline: none; appearance: none; -webkit-appearance: none; -moz-appearance: none; background-image: url('data:image/svg+xml;charset=US-ASCII,<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; viewBox=&quot;0 0 4 5&quot;><path fill=&quot;%23666&quot; d=&quot;M2 0L0 2h4zm0 5L0 3h4z&quot;/></svg>'); background-repeat: no-repeat; background-position: right 12px center; background-size: 12px; padding-right: 40px;">
                ${appState.folders.map(folder => `
                  <option value="${folder.id}" ${folder.id === appState.selectedFolderId ? 'selected' : ''}>
                    ${folder.name}${folder.is_default ? ' (Default)' : ''}
                  </option>
                `).join('')}
              </select>
            `}
          </div>
        ` : ''}
        
        ${/* Capture Buttons */ ''}
        ${!appState.isCapturing && !appState.captureProgress ? (
          appState.warningLevel === 'exceeded' ? `
            <div style="padding: 16px; background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; text-align: center; margin-bottom: 12px;">
              <div style="font-size: 14px; font-weight: 500; color: #dc2626; margin-bottom: 8px;">
                Monthly limit reached
              </div>
              <div style="font-size: 12px; color: #7f1d1d; margin-bottom: 12px;">
                You've used all ${appState.clipsLimit} clips this month. Upgrade to Pro for unlimited clips!
              </div>
              <button id="upgrade-pro" style="${styles.button}; ${styles.primaryButton}; background-color: #dc2626;">🚀 Upgrade to Pro</button>
            </div>
          ` : `
            <button id="capture-full" style="${styles.button}; ${styles.primaryButton};">📄 Capture Full Page</button>
            <button id="capture-visible" style="${styles.button}; ${styles.secondaryButton};">📱 Capture Visible Area</button>
          `
        ) : ''}
        
        ${appState.isAuthenticated ? `
          <div style="${styles.card}">
            <div style="margin-bottom: 12px;">
              <div style="font-weight: 500; margin-bottom: 4px;">👋 Welcome back!</div>
              <div style="font-size: 12px; color: #6b7280;">${appState.userEmail}</div>
            </div>
            <button id="open-webapp" style="${styles.button}; ${styles.primaryButton};">🌐 Open Web App</button>
            <button id="sign-out" style="${styles.button}; ${styles.secondaryButton};">Sign Out</button>
          </div>
        ` : `
          <div style="${styles.card}">
            <div style="margin-bottom: 12px;">
              <div style="font-weight: 500; margin-bottom: 4px;">🔒 Sign in for cloud sync</div>
              <div style="font-size: 12px; color: #6b7280;">Access your clips anywhere and never lose them</div>
            </div>
            <button id="show-auth" style="${styles.button}; ${styles.secondaryButton};">Sign In / Sign Up</button>
          </div>
        `}
        
        <div style="text-align: center; margin-top: auto; padding-top: 16px; padding-bottom: 16px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #64748b;">
          <div style="font-weight: 500; margin-bottom: 4px; color: #64748b;">PagePouch v1.1.0</div>
          <div style="font-size: 11px; color: #94a3b8;">Capture • Organize • Retrieve</div>
        </div>
      </div>
    </div>
  `;
}

function render() {
  const container = document.getElementById('popup-root');
  if (!container) {
    console.error('popup-root not found');
    return;
  }
  
  container.innerHTML = appState.showAuth ? renderAuthScreen() : renderMainScreen();
  
  // Add event listeners
  if (appState.showAuth) {
    const closeAuth = document.getElementById('close-auth');
    const emailInput = document.getElementById('email-input');
    const passwordInput = document.getElementById('password-input');
    const authSubmit = document.getElementById('auth-submit');
    const authToggle = document.getElementById('auth-toggle');
    
    if (closeAuth) closeAuth.addEventListener('click', () => {
      appState.showAuth = false;
      render();
    });
    
    if (emailInput) emailInput.addEventListener('input', (e) => {
      authState.email = e.target.value;
      updateAuthButtonState();
    });
    
    if (passwordInput) passwordInput.addEventListener('input', (e) => {
      authState.password = e.target.value;
      updateAuthButtonState();
    });
    
    if (authSubmit) authSubmit.addEventListener('click', handleAuth);
    
    if (authToggle) authToggle.addEventListener('click', () => {
      authState.isSignUp = !authState.isSignUp;
      authState.error = null;
      render();
    });
    
  } else {
    const captureFullBtn = document.getElementById('capture-full');
    const captureVisibleBtn = document.getElementById('capture-visible');
    const showAuthBtn = document.getElementById('show-auth');
    const signOutBtn = document.getElementById('sign-out');
    const openWebappBtn = document.getElementById('open-webapp');
    const folderSelect = document.getElementById('folder-select');
    const upgradeProBtn = document.getElementById('upgrade-pro');
    
    if (captureFullBtn) captureFullBtn.addEventListener('click', () => capturePage('fullPage'));
    if (captureVisibleBtn) captureVisibleBtn.addEventListener('click', () => capturePage('visible'));
    if (showAuthBtn) showAuthBtn.addEventListener('click', () => {
      appState.showAuth = true;
      render();
    });
    if (signOutBtn) signOutBtn.addEventListener('click', signOut);
    if (openWebappBtn) openWebappBtn.addEventListener('click', () => {
      extensionAPI.tabs.create({ url: 'https://pagepouch-web.vercel.app/dashboard' });
    });
    if (upgradeProBtn) upgradeProBtn.addEventListener('click', () => {
      extensionAPI.tabs.create({ url: 'https://pagepouch-web.vercel.app/pricing' });
    });
    if (folderSelect) folderSelect.addEventListener('change', (e) => {
      handleFolderChange(e.target.value);
    });
  }
}

// Initialize
async function init() {
  console.log('🦊 Initializing Firefox popup');
  
  await checkAuthStatus();
  await getCurrentTab();
  
  // Listen for messages
    extensionAPI.runtime.onMessage.addListener((message) => {
    if (message.type === 'CAPTURE_PROGRESS') {
      appState.captureProgress = {
        status: message.payload.status,
        message: message.payload.message
      };
      
      // Update usage data if provided in the response
      if (message.payload.status === 'complete' && message.payload.usage) {
        appState.clipsRemaining = message.payload.usage.clips_remaining;
        appState.clipsLimit = message.payload.usage.clips_limit;
        appState.subscriptionTier = message.payload.usage.subscription_tier;
        appState.warningLevel = message.payload.usage.warning_level;
        console.log('🦊 Updated usage after capture:', {
          remaining: appState.clipsRemaining,
          limit: appState.clipsLimit,
          warning: appState.warningLevel
        });
      }
      
      render();
      
      if (message.payload.status === 'complete') {
        setTimeout(() => {
          appState.captureProgress = null;
          appState.isCapturing = false;
          render();
        }, 2000);
      }
    }
  });
  
  render();
  console.log('🦊 Firefox popup initialized');
}

// Start the app
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
