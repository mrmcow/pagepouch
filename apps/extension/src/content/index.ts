// PagePouch Extension Content Script
// Runs on all web pages to extract content

import { ExtensionMessage, cleanHtmlContent, extractTextFromHtml } from '@pagepouch/shared';

console.log('PagePouch content script loaded on:', window.location.href);

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
  console.log('Content script received message:', message);
  
  switch (message.type) {
    case 'CAPTURE_PAGE':
      handleCapturePage();
      break;
    case 'EXTRACT_PAGE_DATA':
      handleExtractPageData(sendResponse);
      return true; // Keep message channel open for async response
    default:
      console.warn('Unknown message type:', message.type);
  }
});

function handleCapturePage() {
  try {
    const pageData = extractPageData();
    
    // Send page data to background script
    chrome.runtime.sendMessage({
      type: 'CAPTURE_PAGE',
      payload: pageData
    } as ExtensionMessage);
    
  } catch (error) {
    console.error('Failed to capture page data:', error);
    
    chrome.runtime.sendMessage({
      type: 'CAPTURE_ERROR',
      payload: { error: error instanceof Error ? error.message : 'Unknown error' }
    } as ExtensionMessage);
  }
}

function handleExtractPageData(sendResponse: (response: any) => void) {
  try {
    const pageData = extractPageData();
    console.log('Extracted page data:', {
      url: pageData.url,
      title: pageData.title,
      htmlLength: pageData.html?.length || 0,
      textLength: pageData.text?.length || 0,
      favicon: pageData.favicon
    });
    
    sendResponse({
      success: true,
      data: pageData
    });
  } catch (error) {
    console.error('Failed to extract page data:', error);
    sendResponse({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

function extractPageData() {
  // Get page metadata
  const title = document.title || '';
  const url = window.location.href;
  const favicon = getFaviconUrl();
  
  // Get page content
  const html = document.documentElement.outerHTML;
  const cleanedHtml = cleanHtmlContent(html);
  const text = extractTextFromHtml(cleanedHtml);
  
  return {
    url,
    title,
    html: cleanedHtml,
    text,
    favicon,
    timestamp: new Date().toISOString(),
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    }
  };
}

function getFaviconUrl(): string | undefined {
  // Try to find favicon
  const faviconLink = document.querySelector('link[rel*="icon"]') as HTMLLinkElement;
  if (faviconLink?.href) {
    return faviconLink.href;
  }
  
  // Fallback to default favicon location
  const baseUrl = new URL(window.location.href);
  return `${baseUrl.protocol}//${baseUrl.host}/favicon.ico`;
}

// Auto-capture functionality (optional)
function setupAutoCapture() {
  // Listen for specific events that might trigger auto-capture
  // This could be useful for monitoring specific sites or content changes
  
  // Example: Capture when page is fully loaded
  if (document.readyState === 'complete') {
    console.log('Page fully loaded, ready for capture');
  } else {
    window.addEventListener('load', () => {
      console.log('Page fully loaded, ready for capture');
    });
  }
}

// Initialize
setupAutoCapture();
