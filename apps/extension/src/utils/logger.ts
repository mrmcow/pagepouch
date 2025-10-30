// Logger utility for PageStash Extension
// Allows debug logging in development, silent in production

const IS_DEV = process.env.NODE_ENV === 'development'

export const logger = {
  log: (...args: any[]) => {
    if (IS_DEV) {
      console.log('[PageStash]', ...args)
    }
  },
  
  info: (...args: any[]) => {
    if (IS_DEV) {
      console.info('[PageStash]', ...args)
    }
  },
  
  warn: (...args: any[]) => {
    // Always show warnings
    console.warn('[PageStash]', ...args)
  },
  
  error: (...args: any[]) => {
    // Always show errors
    console.error('[PageStash]', ...args)
  },
  
  debug: (...args: any[]) => {
    if (IS_DEV) {
      console.debug('[PageStash]', ...args)
    }
  },
  
  // Specialized auth logger
  auth: (...args: any[]) => {
    if (IS_DEV) {
      console.log('🔐 [PageStash Auth]', ...args)
    }
  },
  
  // Specialized API logger
  api: (...args: any[]) => {
    if (IS_DEV) {
      console.log('🌐 [PageStash API]', ...args)
    }
  },
  
  // Specialized capture logger
  capture: (...args: any[]) => {
    if (IS_DEV) {
      console.log('📸 [PageStash Capture]', ...args)
    }
  }
}

