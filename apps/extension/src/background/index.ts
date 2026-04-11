// PageStash Extension Background Script
// Service Worker for Manifest V3

import { ExtensionMessage } from '@pagestash/shared';
import { ExtensionAuth, ExtensionAPI } from '../utils/supabase';
import { FullPageCapture } from '../utils/fullPageCapture';

const DEBUG = process.env.NODE_ENV !== 'production';
const log = (...args: any[]) => { if (DEBUG) console.log('[PageStash]', ...args); };

const extensionAPI = typeof browser !== 'undefined' ? browser : chrome;

const UNSCRIPTABLE_PATTERNS = [
  /^chrome:/i,
  /^chrome-extension:/i,
  /^about:/i,
  /^edge:/i,
  /^brave:/i,
  /^moz-extension:/i,
  /^view-source:/i,
  /^devtools:/i,
  /^chrome\.google\.com\/webstore/i,
  /^chromewebstore\.google\.com/i,
  /^addons\.mozilla\.org/i,
  /^microsoftedge\.microsoft\.com\/addons/i,
];

function isUnscriptablePage(url?: string): boolean {
  if (!url) return true;
  return UNSCRIPTABLE_PATTERNS.some(p => p.test(url));
}

function sendProgress(status: string, message: string, extra?: Record<string, any>) {
  extensionAPI.runtime.sendMessage({
    type: 'CAPTURE_PROGRESS',
    payload: { status, message, ...extra }
  } as ExtensionMessage).catch(() => {});
}

async function showPageToast(tabId: number, message: string, type: 'saving' | 'success' | 'error' = 'success') {
  try {
    await extensionAPI.scripting.executeScript({
      target: { tabId },
      func: (msg: string, toastType: string) => {
        const existing = document.getElementById('__pagestash-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.id = '__pagestash-toast';
        const isSuccess = toastType === 'success';
        const isSaving = toastType === 'saving';
        const bg = isSuccess ? '#059669' : isSaving ? '#2563eb' : '#dc2626';
        const icon = isSuccess ? '✓' : isSaving ? '⟳' : '✕';
        Object.assign(toast.style, {
          position: 'fixed', top: '20px', right: '20px', zIndex: '2147483647',
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '12px 20px', borderRadius: '12px',
          background: bg, color: '#fff', fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: '14px', fontWeight: '600', boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          transform: 'translateY(-10px)', opacity: '0',
          transition: 'transform 0.3s ease, opacity 0.3s ease',
        });
        const iconSpan = document.createElement('span');
        Object.assign(iconSpan.style, { fontSize: '16px', ...(isSaving ? { animation: 'pagestash-spin 1s linear infinite', display: 'inline-block' } : {}) });
        iconSpan.textContent = icon;
        toast.appendChild(iconSpan);
        const text = document.createElement('span');
        text.textContent = msg;
        toast.appendChild(text);

        if (isSaving) {
          const style = document.createElement('style');
          style.textContent = '@keyframes pagestash-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}';
          toast.appendChild(style);
        }

        document.body.appendChild(toast);
        requestAnimationFrame(() => {
          toast.style.transform = 'translateY(0)';
          toast.style.opacity = '1';
        });

        if (!isSaving) {
          setTimeout(() => {
            toast.style.transform = 'translateY(-10px)';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
          }, 3000);
        }
      },
      args: [message, type],
    });
  } catch {
    // Tab may have navigated away — ignore
  }
}

// Session monitor state
let sessionRefreshInterval: NodeJS.Timeout | null = null;

// Handle extension installation
extensionAPI.runtime.onInstalled.addListener((details) => {
  log('Extension installed:', details.reason);
  
  if (details.reason === 'install') {
    // Set up initial extension state
    extensionAPI.storage.local.set({
      isFirstRun: true,
      captureCount: 0,
    });
  }
  
  // Restore session on installation
  ExtensionAuth.restoreSession().then(() => {
    startSessionMonitor();
  });
});

// Restore session on browser startup
if (extensionAPI.runtime.onStartup) {
  extensionAPI.runtime.onStartup.addListener(async () => {
    log('Restoring session');
    await ExtensionAuth.restoreSession();
    startSessionMonitor();
  });
}

// Session monitor - checks if session exists
function startSessionMonitor() {
  // Clear existing interval
  if (sessionRefreshInterval) {
    clearInterval(sessionRefreshInterval);
  }

  // Check session every 5 minutes
  sessionRefreshInterval = setInterval(async () => {
    try {
      const { token } = await ExtensionAuth.getSession();
      
      if (token) {
        log('Session is active');
        // Token validation happens on API calls
        // If token is expired, API will return 401 and user will need to sign in again
      } else {
        log('No active session');
      }
    } catch (error) {
      console.error('Session monitor error:', error);
    }
  }, 5 * 60 * 1000); // Every 5 minutes
  
  log('Session monitor started');
}

// Stop monitor on shutdown
if (extensionAPI.runtime.onSuspend) {
  extensionAPI.runtime.onSuspend.addListener(() => {
    log('Stopping session monitor');
    if (sessionRefreshInterval) {
      clearInterval(sessionRefreshInterval);
    }
  });
}

// Handle extension icon click - open popup instead of direct capture
// Note: Firefox uses browserAction, Chrome uses action
const actionAPI = extensionAPI.action || extensionAPI.browserAction;
if (actionAPI && actionAPI.onClicked) {
  actionAPI.onClicked.addListener(async (tab) => {
    // The popup will handle the interaction
    log('Extension clicked on tab:', tab?.url);
  });
} else {
  log('Action API not available (popup will be used instead)');
}

// Global capture state
let currentCaptureController: AbortController | null = null;

// Handle messages from content script and popup
extensionAPI.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
  log('Background received message:', message);
  
  switch (message.type) {
    case 'CAPTURE_PAGE':
      handlePageCaptureWithActiveTab(message.payload);
      break;
    case 'CANCEL_CAPTURE':
      handleCancelCapture();
      break;
    case 'GET_AUTH_TOKEN':
      handleGetAuthToken(sendResponse);
      return true; // Keep message channel open for async response
    case 'AUTHENTICATE':
      handleAuthenticate(message.payload, sendResponse);
      return true; // Keep message channel open for async response
    case 'SIGN_OUT':
      handleSignOut(sendResponse);
      return true; // Keep message channel open for async response
    case 'GET_FOLDERS':
      handleGetFolders(sendResponse);
      return true; // Keep message channel open for async response
    case 'GET_USAGE':
      handleGetUsage(sendResponse);
      return true; // Keep message channel open for async response
    case 'CREATE_FOLDER':
      handleCreateFolder(message.payload, sendResponse);
      return true;
    case 'AREA_SELECT':
      handleAreaSelect();
      break;
    case 'AREA_SELECTED':
      handleAreaSelected(message.payload, sender);
      break;
    default:
      console.warn('Unknown message type:', message.type);
  }
});

async function handleAreaSelect() {
  try {
    const [tab] = await extensionAPI.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;
    if (isUnscriptablePage(tab.url)) {
      sendProgress('error', 'This page is protected by the browser and cannot be captured. Try a regular webpage.');
      return;
    }
    await extensionAPI.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['areaSelect.js'],
    });
  } catch (err) {
    console.error('Area select injection failed:', err);
    sendProgress('error', 'Could not open area selector on this page.');
  }
}

async function handleAreaSelected(rect: { x: number; y: number; width: number; height: number; devicePixelRatio: number }, sender: any) {
  try {
    sendProgress('capturing', 'Capturing selected area...');

    const tab = sender?.tab || (await extensionAPI.tabs.query({ active: true, currentWindow: true }))[0];
    if (!tab?.id) throw new Error('No active tab');

    const fullScreenshot = await extensionAPI.tabs.captureVisibleTab(tab.windowId, { format: 'png' });

    // Crop to selected area using offscreen canvas
    const dpr = rect.devicePixelRatio || 1;
    const cropResult = await extensionAPI.scripting.executeScript({
      target: { tabId: tab.id },
      func: (dataUrl: string, x: number, y: number, w: number, h: number, dpr: number) => {
        return new Promise<string>((resolve) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(img, x * dpr, y * dpr, w * dpr, h * dpr, 0, 0, w * dpr, h * dpr);
            resolve(canvas.toDataURL('image/png'));
          };
          img.src = dataUrl;
        });
      },
      args: [fullScreenshot, rect.x, rect.y, rect.width, rect.height, dpr],
    });

    const croppedDataUrl = cropResult?.[0]?.result;
    if (!croppedDataUrl) throw new Error('Failed to crop screenshot');

    // Extract page content (HTML + text)
    let pageContent: any = {};
    try {
      const result = await extensionAPI.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const rawHtml = document.documentElement.outerHTML;
          const cleaned = rawHtml
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '');
          const text = document.body.innerText?.substring(0, 50000) || '';
          const faviconEl = document.querySelector('link[rel*="icon"]') as HTMLLinkElement;
          return {
            html_content: cleaned,
            text_content: text,
            favicon_url: faviconEl?.href || `${location.protocol}//${location.host}/favicon.ico`,
          };
        },
      });
      pageContent = result?.[0]?.result || {};
    } catch (e) {
      console.warn('Area capture content extraction failed:', e);
    }

    sendProgress('saving', 'Saving capture...');
    showPageToast(tab.id!, 'Saving area capture...', 'saving');

    const clipData = {
      url: tab.url || '',
      title: tab.title || '',
      screenshot_data: croppedDataUrl,
      html_content: pageContent.html_content || '',
      text_content: pageContent.text_content || '',
      favicon_url: pageContent.favicon_url || '',
      notes: `Area capture (${rect.width}×${rect.height}px)`,
    };

    log('Area clip data:', {
      url: clipData.url,
      title: clipData.title,
      hasScreenshot: !!clipData.screenshot_data,
      htmlLength: clipData.html_content.length,
      textLength: clipData.text_content.length,
    });

    const isAuthenticated = await ExtensionAuth.restoreSession();
    if (isAuthenticated) {
      try {
        const saveResult = await ExtensionAPI.saveClip(clipData);
        sendProgress('complete', 'Area captured!', { usage: saveResult.usage });
        showPageToast(tab.id!, 'Area saved to PageStash', 'success');
      } catch (saveError: any) {
        if (saveError?.isLimitReached) {
          sendProgress('limit_reached', 'Monthly clip limit reached', { limitInfo: saveError.limitInfo });
          showPageToast(tab.id!, 'Monthly clip limit reached', 'error');
        } else {
          throw saveError;
        }
      }
    } else {
      sendProgress('complete', 'Area saved locally (sign in to sync)');
      showPageToast(tab.id!, 'Saved locally (sign in to sync)', 'success');
    }
  } catch (error) {
    console.error('Area capture failed:', error);
    sendProgress('error', error instanceof Error ? error.message : 'Area capture failed');
    // Show error toast on the page
    try {
      const [activeTab] = await extensionAPI.tabs.query({ active: true, currentWindow: true });
      if (activeTab?.id) showPageToast(activeTab.id, 'Capture failed — please try again', 'error');
    } catch { /* ignore */ }
  }
}

function handleCancelCapture() {
  log('Cancelling current capture');
  if (currentCaptureController) {
    currentCaptureController.abort();
    currentCaptureController = null;
  }
  sendProgress('cancelled', 'Capture cancelled');
}

async function handlePageCaptureWithActiveTab(payload: any) {
  try {
    const [activeTab] = await extensionAPI.tabs.query({ active: true, currentWindow: true });
    
    if (!activeTab) {
      sendProgress('error', 'No active tab found');
      return;
    }
    
    if (isUnscriptablePage(activeTab.url)) {
      sendProgress('error', 'This page is protected by the browser and cannot be captured. Navigate to a regular webpage and try again.');
      return;
    }

    if (activeTab.status === 'loading') {
      sendProgress('error', 'Page is still loading. Wait for it to finish, then try again.');
      return;
    }
    
    log('Found active tab:', activeTab.url);
    await handlePageCapture(payload, activeTab);
    
  } catch (error) {
    console.error('Failed to get active tab:', error);
    sendProgress('error', 'Failed to access active tab');
  }
}

async function handlePageCapture(payload: any, tab?: chrome.tabs.Tab) {
  if (!tab?.id) {
    console.error('No tab ID provided for capture');
    sendProgress('error', 'No active tab found');
    return;
  }
  
  // Create abort controller for this capture
  currentCaptureController = new AbortController();
  const signal = currentCaptureController.signal;
  
  // Set up timeout (120 seconds for full page, 15 seconds for visible)
  const captureType = payload.captureType || 'fullPage';
  const timeoutMs = captureType === 'fullPage' ? 120000 : 15000;
  const timeoutId = setTimeout(() => {
    if (currentCaptureController) {
      currentCaptureController.abort();
      sendProgress('error', captureType === 'fullPage'
        ? 'This page is very large. Try capturing just the visible area instead.'
        : 'Capture timed out. Please try again.');
    }
  }, timeoutMs);
  
  try {
    log('Starting page capture:', payload.url);
    
    // Check if cancelled
    if (signal.aborted) {
      clearTimeout(timeoutId);
      return;
    }

    sendProgress('extracting', 'Extracting page content...');

    let pageContent: any = {};
    let contentExtractionFailed = false;

    const extractContent = async (tabId: number): Promise<any> => {
      const extractionResults = await extensionAPI.scripting.executeScript({
        target: { tabId },
        func: () => {
          try {
            const rawHtml = document.documentElement.outerHTML || '';
            const cleanedHtml = rawHtml
              .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
              .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
              .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '');

            const bodyText = document.body?.innerText?.substring(0, 50000) || '';

            const faviconLink = document.querySelector('link[rel*="icon"]') as HTMLLinkElement;
            const favicon = faviconLink?.href || `${location.protocol}//${location.host}/favicon.ico`;

            const metaDesc = (document.querySelector('meta[name="description"]') as HTMLMetaElement)?.content || '';
            const metaKeywords = (document.querySelector('meta[name="keywords"]') as HTMLMetaElement)?.content || '';

            return {
              url: location.href,
              title: document.title || '',
              html: cleanedHtml,
              text: bodyText,
              favicon,
              metaDescription: metaDesc,
              metaKeywords,
              htmlLength: cleanedHtml.length,
              textLength: bodyText.length,
            };
          } catch (innerErr) {
            return { error: String(innerErr), url: location.href, title: document.title || '' };
          }
        }
      });

      const result = extractionResults?.[0]?.result;
      if (!result || result.error) {
        throw new Error(result?.error || 'Content extraction returned no results');
      }
      return result;
    };

    // Attempt extraction with one retry
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        pageContent = await extractContent(tab.id);
        log(`Content extraction (attempt ${attempt}):`, {
          url: pageContent.url,
          htmlLength: pageContent.htmlLength,
          textLength: pageContent.textLength,
          hasTitle: !!pageContent.title,
        });

        if (pageContent.htmlLength === 0 && pageContent.textLength === 0) {
          console.warn(`⚠️ Extraction returned empty content on attempt ${attempt}`);
          if (attempt === 1) {
            await new Promise(r => setTimeout(r, 500));
            continue;
          }
          contentExtractionFailed = true;
        }
        break;
      } catch (extractError: any) {
        console.error(`Content extraction attempt ${attempt} failed:`, extractError);
        if (attempt === 2) {
          contentExtractionFailed = true;
          pageContent = {
            url: payload.url,
            title: payload.title,
            html: '',
            text: '',
            favicon: payload.favicon
          };
        }
        await new Promise(r => setTimeout(r, 500));
      }
    }

    // Check if cancelled after content extraction
    if (signal.aborted) {
      clearTimeout(timeoutId);
      return;
    }
    
    // Step 2: Capture screenshot
    let screenshot: string;
    
    if (captureType === 'fullPage' && FullPageCapture.isSupported()) {
      log('Starting full-page capture for:', payload.url);
      sendProgress('capturing', 'Capturing full page screenshot...');
      
      try {
        const result = await FullPageCapture.captureFullPage(tab.id, {
          quality: 90,
          format: 'png',
          scrollDelay: 500,
        });
        
        if (signal.aborted) { clearTimeout(timeoutId); return; }
        
        screenshot = result.dataUrl;
        log(`Full-page capture completed: ${result.width}x${result.height}px in ${result.captureTime}ms`);
      } catch (fullPageErr) {
        console.warn('Full-page capture failed, falling back to visible area:', fullPageErr);
        sendProgress('capturing', 'Full page failed — capturing visible area instead...');
        screenshot = await extensionAPI.tabs.captureVisibleTab(tab.windowId, { format: 'png', quality: 90 });
      }
      
    } else {
      log('Capturing visible area for:', payload.url);
      sendProgress('capturing', 'Capturing visible area...');
      screenshot = await extensionAPI.tabs.captureVisibleTab(tab.windowId, { format: 'png', quality: 90 });
    }
    
    // Check if cancelled after capture
    if (signal.aborted) {
      clearTimeout(timeoutId);
      return;
    }
    
    log('Screenshot captured successfully');
    sendProgress('saving', 'Saving capture...');
    
    const faviconUrl = pageContent.favicon || payload.favicon || '';
    const clipData = {
      url: pageContent.url || payload.url,
      title: pageContent.title || payload.title,
      screenshot_data: screenshot,
      html_content: pageContent.html || '',
      text_content: pageContent.text || '',
      ...(faviconUrl.startsWith('http') ? { favicon_url: faviconUrl } : {}),
      ...(payload.folderId ? { folder_id: payload.folderId } : {}),
      ...(pageContent.metaDescription ? { meta_description: pageContent.metaDescription } : {}),
    };

    log('Prepared clip data:', {
      url: clipData.url,
      title: clipData.title,
      hasScreenshot: !!clipData.screenshot_data,
      htmlLength: clipData.html_content.length,
      textLength: clipData.text_content.length,
      hasFavicon: !!clipData.favicon_url,
      contentExtractionFailed,
    });

    const { token } = await ExtensionAuth.getSession();
    const contentNote = contentExtractionFailed ? ' (screenshot only — text extraction failed on this page)' : '';
    
    if (token) {
      try {
        const saveResult = await ExtensionAPI.saveClip(clipData);
        log('Clip saved successfully');
        
        if (signal.aborted) { clearTimeout(timeoutId); return; }
        
        sendProgress('complete', `Capture saved!${contentNote}`, { usage: saveResult.usage });
        
      } catch (error: any) {
        console.error('Failed to save to Supabase:', error);
        if (signal.aborted) { clearTimeout(timeoutId); return; }
        
        if (error?.isLimitReached) {
          sendProgress('limit_reached', 'Monthly clip limit reached', { limitInfo: error.limitInfo });
          return;
        }
        
        await saveClipLocally(clipData);
        sendProgress('complete', 'Saved locally (will sync when online).' + contentNote);
      }
    } else {
      await saveClipLocally(clipData);
      sendProgress('complete', `Saved locally (sign in to sync)${contentNote}`);
    }
    
    // Update capture count
    extensionAPI.storage.local.get(['captureCount'], (result) => {
      const newCount = (result.captureCount || 0) + 1;
      extensionAPI.storage.local.set({ captureCount: newCount });
    });
    
    // Clear timeout and controller
    clearTimeout(timeoutId);
    currentCaptureController = null;
    
  } catch (error) {
    console.error('Failed to capture page:', error);
    
    // Clear timeout and controller
    clearTimeout(timeoutId);
    currentCaptureController = null;
    
    // Don't send error if it was cancelled
    if (signal.aborted) {
      return;
    }
    
    sendProgress('error', error instanceof Error ? error.message : 'Capture failed. Please try again.');
  }
}

async function saveClipLocally(clipData: any) {
  return new Promise<void>((resolve) => {
    extensionAPI.storage.local.get(['localClips'], (result) => {
      const localClips = result.localClips || [];
      const newClip = {
        ...clipData,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        synced: false,
      };
      
      localClips.unshift(newClip);
      
      // Keep only last 100 local clips to avoid storage issues
      if (localClips.length > 100) {
        localClips.splice(100);
      }
      
      extensionAPI.storage.local.set({ localClips }, () => {
        log('Clip saved locally');
        resolve();
      });
    });
  });
}

async function handleGetAuthToken(sendResponse: (response: any) => void) {
  try {
    // Restore session if needed to ensure token is valid
    await ExtensionAuth.restoreSession();
    
    const { token } = await ExtensionAuth.getSession();
    sendResponse({ token });
  } catch (error) {
    console.error('Failed to get auth token:', error);
    sendResponse({ token: null });
  }
}

async function handleAuthenticate(payload: { email: string; password: string; isSignUp: boolean }, sendResponse: (response: any) => void) {
  try {
    log('Handling authentication:', payload.isSignUp ? 'sign up' : 'sign in');
    
    let result;
    if (payload.isSignUp) {
      log('Calling signUp');
      result = await ExtensionAuth.signUp(payload.email, payload.password);
    } else {
      log('Calling signIn');
      result = await ExtensionAuth.signIn(payload.email, payload.password);
    }
    
    log('Auth result:', { 
      hasData: !!result.data, 
      hasError: !!result.error, 
      errorMessage: result.error?.message 
    });
    
    if (result.error) {
      console.error('🔧 Background: Authentication failed:', result.error);
      sendResponse({ error: result.error });
    } else {
      log('Authentication successful');
      sendResponse({ data: result.data });
    }
  } catch (error) {
    console.error('🔧 Background: Authentication error:', error);
    sendResponse({ error: { message: 'Authentication failed. Please try again.' } });
  }
}

async function handleSignOut(sendResponse: (response: any) => void) {
  try {
    log('Handling sign out');
    await ExtensionAuth.signOut();
    sendResponse({ success: true });
  } catch (error) {
    console.error('Sign out error:', error);
    // Force local cleanup even if remote signout fails
    await extensionAPI.storage.local.remove(['authToken', 'userEmail', 'userId', 'refreshToken']);
    sendResponse({ success: true });
  }
}

async function handleGetFolders(sendResponse: (response: any) => void) {
  try {
    log('Getting user folders');
    
    const folders = await ExtensionAPI.getFolders();
    log('Folders retrieved:', folders.folders?.length || 0);
    
    sendResponse(folders);
  } catch (error) {
    console.error('Failed to get folders:', error);
    sendResponse({ 
      folders: [] 
    });
  }
}

async function handleGetUsage(sendResponse: (response: any) => void) {
  try {
    log('Getting user usage data');
    
    const usage = await ExtensionAPI.getUsage();
    log('Usage retrieved - remaining:', usage.clips_remaining);
    
    sendResponse(usage);
  } catch (error) {
    console.error('Failed to get usage:', error);
    sendResponse({ 
      error: 'Failed to load usage data',
      clips_remaining: 0,
      clips_limit: 10,
      subscription_tier: 'free',
      warning_level: 'critical'
    });
  }
}

async function handleCreateFolder(payload: any, sendResponse: (response: any) => void) {
  try {
    log('Creating folder:', payload.name);
    
    const folder = await ExtensionAPI.createFolder(payload);
    log('Folder created successfully');
    
    sendResponse({ folder });
  } catch (error) {
    console.error('Failed to create folder:', error);
    sendResponse({ 
      error: 'Failed to create folder'
    });
  }
}

// Sync local clips when user authenticates
extensionAPI.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.authToken && changes.authToken.newValue) {
    // User just authenticated, sync local clips
    syncLocalClips();
  }
});

async function syncLocalClips() {
  try {
    const result = await new Promise<{localClips: any[]}>((resolve) => {
      extensionAPI.storage.local.get(['localClips'], (result) => {
        resolve({ localClips: result.localClips || [] });
      });
    });

    const unsyncedClips = result.localClips.filter(clip => !clip.synced);
    
    if (unsyncedClips.length === 0) {
      return;
    }

    log(`Syncing ${unsyncedClips.length} local clips`);

    for (const clip of unsyncedClips) {
      try {
        await ExtensionAPI.saveClip({
          url: clip.url,
          title: clip.title,
          screenshot_data: clip.screenshot_data,
          html_content: clip.html_content,
          text_content: clip.text_content,
          favicon_url: clip.favicon_url,
        });
        
        // Mark as synced
        clip.synced = true;
      } catch (error) {
        console.error('Failed to sync clip:', error);
      }
    }

    // Update local storage with synced status
    extensionAPI.storage.local.set({ localClips: result.localClips });
    
    log('Local clips sync completed');
  } catch (error) {
    console.error('Failed to sync local clips:', error);
  }
}
