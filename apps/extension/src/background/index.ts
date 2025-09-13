// PagePouch Extension Background Script
// Service Worker for Manifest V3

import { ExtensionMessage } from '@pagepouch/shared';
import { ExtensionAuth, ExtensionAPI } from '../utils/supabase';
import { FullPageCapture } from '../utils/fullPageCapture';

console.log('PagePouch background script loaded');

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('PagePouch extension installed:', details.reason);
  
  if (details.reason === 'install') {
    // Set up initial extension state
    chrome.storage.local.set({
      isFirstRun: true,
      captureCount: 0,
    });
  }
});

// Handle extension icon click - open popup instead of direct capture
chrome.action.onClicked.addListener(async (tab) => {
  // The popup will handle the interaction
  console.log('Extension clicked on tab:', tab?.url);
});

// Global capture state
let currentCaptureController: AbortController | null = null;

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
  console.log('Background received message:', message);
  
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
    default:
      console.warn('Unknown message type:', message.type);
  }
});

function handleCancelCapture() {
  console.log('Cancelling current capture...');
  if (currentCaptureController) {
    currentCaptureController.abort();
    currentCaptureController = null;
  }
  
  chrome.runtime.sendMessage({
    type: 'CAPTURE_PROGRESS',
    payload: { status: 'cancelled', message: 'Capture cancelled by user' }
  } as ExtensionMessage);
}

async function handlePageCaptureWithActiveTab(payload: any) {
  try {
    // Get the active tab since popup messages don't have sender.tab
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!activeTab) {
      console.error('No active tab found');
      chrome.runtime.sendMessage({
        type: 'CAPTURE_PROGRESS',
        payload: { status: 'error', message: 'No active tab found' }
      } as ExtensionMessage);
      return;
    }
    
    console.log('Found active tab:', activeTab.url);
    await handlePageCapture(payload, activeTab);
    
  } catch (error) {
    console.error('Failed to get active tab:', error);
    chrome.runtime.sendMessage({
      type: 'CAPTURE_PROGRESS',
      payload: { status: 'error', message: 'Failed to access active tab' }
    } as ExtensionMessage);
  }
}

async function handlePageCapture(payload: any, tab?: chrome.tabs.Tab) {
  if (!tab?.id) {
    console.error('No tab ID provided for capture');
    chrome.runtime.sendMessage({
      type: 'CAPTURE_PROGRESS',
      payload: { status: 'error', message: 'No active tab found' }
    } as ExtensionMessage);
    return;
  }
  
  // Create abort controller for this capture
  currentCaptureController = new AbortController();
  const signal = currentCaptureController.signal;
  
  // Set up timeout (60 seconds for full page due to rate limiting, 10 seconds for visible)
  const captureType = payload.captureType || 'fullPage';
  const timeoutMs = captureType === 'fullPage' ? 60000 : 10000;
  const timeoutId = setTimeout(() => {
    if (currentCaptureController) {
      currentCaptureController.abort();
      chrome.runtime.sendMessage({
        type: 'CAPTURE_PROGRESS',
        payload: { status: 'error', message: 'Capture timed out. Please try again.' }
      } as ExtensionMessage);
    }
  }, timeoutMs);
  
  try {
    console.log('Starting page capture:', { 
      url: payload.url, 
      captureType: payload.captureType,
      favicon: payload.favicon,
      faviconValid: payload.favicon && payload.favicon.startsWith('http')
    });
    
    // Check if cancelled
    if (signal.aborted) {
      clearTimeout(timeoutId);
      return;
    }

    // Step 1: Get page content from content script
    chrome.runtime.sendMessage({
      type: 'CAPTURE_PROGRESS',
      payload: { status: 'extracting', message: 'Extracting page content...' }
    } as ExtensionMessage);

    let pageContent: any = {};
    try {
      // Send message to content script to extract page data
      const response = await chrome.tabs.sendMessage(tab.id, {
        type: 'EXTRACT_PAGE_DATA'
      });
      
      if (response && response.success) {
        pageContent = response.data;
        console.log('Page content extracted:', {
          htmlLength: pageContent.html?.length || 0,
          textLength: pageContent.text?.length || 0,
          title: pageContent.title
        });
      } else {
        console.warn('Failed to extract page content from content script:', response);
        // Use fallback data from popup
        pageContent = {
          url: payload.url,
          title: payload.title,
          html: payload.html || '',
          text: payload.text || '',
          favicon: payload.favicon
        };
      }
    } catch (contentError) {
      console.warn('Content script not available, using fallback data:', contentError);
      // Use fallback data from popup
      pageContent = {
        url: payload.url,
        title: payload.title,
        html: payload.html || '',
        text: payload.text || '',
        favicon: payload.favicon
      };
    }

    // Check if cancelled after content extraction
    if (signal.aborted) {
      clearTimeout(timeoutId);
      return;
    }
    
    // Step 2: Capture screenshot
    let screenshot: string;
    
    if (captureType === 'fullPage' && FullPageCapture.isSupported()) {
      console.log('Starting full-page capture for:', payload.url);
      
      // Send progress message to popup
      chrome.runtime.sendMessage({
        type: 'CAPTURE_PROGRESS',
        payload: { status: 'capturing', message: 'Capturing full page...' }
      } as ExtensionMessage);
      
      const result = await FullPageCapture.captureFullPage(tab.id, {
        quality: 90,
        format: 'png',
        scrollDelay: 500, // Increased to match the rate limiting
      });
      
      // Check if cancelled during capture
      if (signal.aborted) {
        clearTimeout(timeoutId);
        return;
      }
      
      screenshot = result.dataUrl;
      console.log(`Full-page capture completed: ${result.width}x${result.height}px in ${result.captureTime}ms`);
      
    } else {
      // Fallback to visible area capture
      console.log('Capturing visible area for:', payload.url);
      
      chrome.runtime.sendMessage({
        type: 'CAPTURE_PROGRESS',
        payload: { status: 'capturing', message: 'Capturing visible area...' }
      } as ExtensionMessage);
      
      screenshot = await chrome.tabs.captureVisibleTab(tab.windowId, {
        format: 'png',
        quality: 90
      });
    }
    
    // Check if cancelled after capture
    if (signal.aborted) {
      clearTimeout(timeoutId);
      return;
    }
    
    console.log('Screenshot captured successfully');
    
    // Send saving progress
    chrome.runtime.sendMessage({
      type: 'CAPTURE_PROGRESS',
      payload: { status: 'saving', message: 'Saving capture...' }
    } as ExtensionMessage);
    
    // Prepare clip data using extracted page content
    const clipData = {
      url: pageContent.url || payload.url,
      title: pageContent.title || payload.title,
      screenshot_data: screenshot,
      html_content: pageContent.html || '',
      text_content: pageContent.text || '',
      // Use favicon from content script or fallback to popup data
      ...((pageContent.favicon || payload.favicon) && (pageContent.favicon || payload.favicon).startsWith('http') 
        ? { favicon_url: pageContent.favicon || payload.favicon } 
        : {}),
    };

    console.log('Prepared clip data:', {
      url: clipData.url,
      title: clipData.title,
      hasScreenshot: !!clipData.screenshot_data,
      htmlLength: clipData.html_content.length,
      textLength: clipData.text_content.length,
      hasFavicon: !!clipData.favicon_url
    });

    // Check if user is authenticated
    const { token } = await ExtensionAuth.getSession();
    
    if (token) {
      try {
        // Save to Supabase
        await ExtensionAPI.saveClip(clipData);
        console.log('Clip saved to Supabase successfully');
        
        // Check if cancelled during save
        if (signal.aborted) {
          clearTimeout(timeoutId);
          return;
        }
        
        // Send success message to popup
        chrome.runtime.sendMessage({
          type: 'CAPTURE_PROGRESS',
          payload: { status: 'complete', message: 'Capture saved to cloud!' }
        } as ExtensionMessage);
        
      } catch (error) {
        console.error('Failed to save to Supabase:', error);
        
        // Check if cancelled during error handling
        if (signal.aborted) {
          clearTimeout(timeoutId);
          return;
        }
        
        // Fallback to local storage
        await saveClipLocally(clipData);
        
        // Send success message (local only)
        chrome.runtime.sendMessage({
          type: 'CAPTURE_PROGRESS',
          payload: { status: 'complete', message: 'Capture saved locally (will sync when online)' }
        } as ExtensionMessage);
      }
    } else {
      // Save locally when not authenticated
      await saveClipLocally(clipData);
      
      // Send success message (local only)
      chrome.runtime.sendMessage({
        type: 'CAPTURE_PROGRESS',
        payload: { status: 'complete', message: 'Capture saved locally (sign in to sync)' }
      } as ExtensionMessage);
    }
    
    // Update capture count
    chrome.storage.local.get(['captureCount'], (result) => {
      const newCount = (result.captureCount || 0) + 1;
      chrome.storage.local.set({ captureCount: newCount });
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
    
    // Send error message to popup
    chrome.runtime.sendMessage({
      type: 'CAPTURE_PROGRESS',
      payload: { status: 'error', message: error instanceof Error ? error.message : 'Capture failed' }
    } as ExtensionMessage);
  }
}

async function saveClipLocally(clipData: any) {
  return new Promise<void>((resolve) => {
    chrome.storage.local.get(['localClips'], (result) => {
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
      
      chrome.storage.local.set({ localClips }, () => {
        console.log('Clip saved locally');
        resolve();
      });
    });
  });
}

async function handleGetAuthToken(sendResponse: (response: any) => void) {
  try {
    const { token } = await ExtensionAuth.getSession();
    sendResponse({ token });
  } catch (error) {
    console.error('Failed to get auth token:', error);
    sendResponse({ token: null });
  }
}

// Sync local clips when user authenticates
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.authToken && changes.authToken.newValue) {
    // User just authenticated, sync local clips
    syncLocalClips();
  }
});

async function syncLocalClips() {
  try {
    const result = await new Promise<{localClips: any[]}>((resolve) => {
      chrome.storage.local.get(['localClips'], (result) => {
        resolve({ localClips: result.localClips || [] });
      });
    });

    const unsyncedClips = result.localClips.filter(clip => !clip.synced);
    
    if (unsyncedClips.length === 0) {
      return;
    }

    console.log(`Syncing ${unsyncedClips.length} local clips...`);

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
    chrome.storage.local.set({ localClips: result.localClips });
    
    console.log('Local clips sync completed');
  } catch (error) {
    console.error('Failed to sync local clips:', error);
  }
}
