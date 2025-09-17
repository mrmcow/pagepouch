/**
 * Browser API Polyfill for Cross-Browser Compatibility
 * Ensures consistent API access across Chrome and Firefox
 */

// Extend global types for browser API
declare global {
  const browser: typeof chrome;
}

/**
 * Ensure browser API is available
 * Firefox uses 'browser' namespace, Chrome uses 'chrome'
 * This polyfill provides consistent access
 */
if (typeof browser === "undefined") {
  (globalThis as any).browser = chrome;
}

/**
 * Cross-browser API wrapper
 * Provides promise-based APIs for both Chrome and Firefox
 */
export const browserAPI = {
  // Runtime APIs
  runtime: {
    sendMessage: (message: any): Promise<any> => {
      if (typeof browser !== 'undefined' && browser.runtime.sendMessage) {
        // Firefox - already returns promises
        return browser.runtime.sendMessage(message);
      } else {
        // Chrome - wrap callback in promise
        return new Promise((resolve, reject) => {
          chrome.runtime.sendMessage(message, (response) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(response);
            }
          });
        });
      }
    },
    
    onMessage: {
      addListener: (callback: (message: any, sender: any, sendResponse: any) => void) => {
        if (typeof browser !== 'undefined') {
          browser.runtime.onMessage.addListener(callback);
        } else {
          chrome.runtime.onMessage.addListener(callback);
        }
      }
    }
  },

  // Storage APIs
  storage: {
    local: {
      get: (keys?: string | string[] | Record<string, any>): Promise<Record<string, any>> => {
        if (typeof browser !== 'undefined' && browser.storage.local.get) {
          return browser.storage.local.get(keys);
        } else {
          return new Promise((resolve, reject) => {
            chrome.storage.local.get(keys, (result) => {
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
              } else {
                resolve(result);
              }
            });
          });
        }
      },
      
      set: (items: Record<string, any>): Promise<void> => {
        if (typeof browser !== 'undefined' && browser.storage.local.set) {
          return browser.storage.local.set(items);
        } else {
          return new Promise((resolve, reject) => {
            chrome.storage.local.set(items, () => {
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
              } else {
                resolve();
              }
            });
          });
        }
      }
    }
  },

  // Tabs APIs
  tabs: {
    query: (queryInfo: chrome.tabs.QueryInfo): Promise<chrome.tabs.Tab[]> => {
      if (typeof browser !== 'undefined' && browser.tabs.query) {
        return browser.tabs.query(queryInfo);
      } else {
        return new Promise((resolve, reject) => {
          chrome.tabs.query(queryInfo, (tabs) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(tabs);
            }
          });
        });
      }
    },
    
    create: (createProperties: chrome.tabs.CreateProperties): Promise<chrome.tabs.Tab> => {
      if (typeof browser !== 'undefined' && browser.tabs.create) {
        return browser.tabs.create(createProperties);
      } else {
        return new Promise((resolve, reject) => {
          chrome.tabs.create(createProperties, (tab) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(tab);
            }
          });
        });
      }
    }
  },

  // Scripting APIs (Manifest V3 Chrome / executeScript for Firefox)
  scripting: {
    executeScript: (injection: any): Promise<any> => {
      if (typeof browser !== 'undefined' && browser.scripting?.executeScript) {
        return browser.scripting.executeScript(injection);
      } else if (chrome.scripting?.executeScript) {
        return new Promise((resolve, reject) => {
          chrome.scripting.executeScript(injection, (results) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(results);
            }
          });
        });
      } else {
        // Fallback for older APIs
        return new Promise((resolve, reject) => {
          chrome.tabs.executeScript(injection.target.tabId, {
            code: injection.func?.toString() || injection.code
          }, (results) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(results);
            }
          });
        });
      }
    }
  }
};

/**
 * Browser detection utility
 */
export const getBrowserInfo = () => {
  const userAgent = navigator.userAgent;
  
  if (userAgent.includes('Firefox')) {
    return {
      name: 'Firefox',
      isFirefox: true,
      isChrome: false,
      supportsManifestV3: false
    };
  } else if (userAgent.includes('Chrome') || userAgent.includes('Chromium')) {
    return {
      name: 'Chrome',
      isFirefox: false,
      isChrome: true,
      supportsManifestV3: true
    };
  } else {
    return {
      name: 'Unknown',
      isFirefox: false,
      isChrome: false,
      supportsManifestV3: false
    };
  }
};

// Export browser for direct usage
export { browser };
