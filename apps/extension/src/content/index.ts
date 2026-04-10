// PageStash Extension Content Script
// Runs on all web pages to extract content

import { ExtensionMessage, cleanHtmlContent, extractTextFromHtml } from '@pagestash/shared';

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
  
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
    sendResponse({
      success: true,
      data: pageData
    });
  } catch (error) {
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

