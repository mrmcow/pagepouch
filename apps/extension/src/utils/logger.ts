// Logger utility for PagePouch Extension
// Allows debug logging in development, silent in production

const IS_DEV = process.env.NODE_ENV === 'development'

export const logger = {
  log: (...args: any[]) => {
    if (IS_DEV) {
      console.log('[PagePouch]', ...args)
    }
  },
  
  info: (...args: any[]) => {
    if (IS_DEV) {
      console.info('[PagePouch]', ...args)
    }
  },
  
  warn: (...args: any[]) => {
    // Always show warnings
    console.warn('[PagePouch]', ...args)
  },
  
  error: (...args: any[]) => {
    // Always show errors
    console.error('[PagePouch]', ...args)
  },
  
  debug: (...args: any[]) => {
    if (IS_DEV) {
      console.debug('[PagePouch]', ...args)
    }
  },
  
  // Specialized auth logger
  auth: (...args: any[]) => {
    if (IS_DEV) {
      console.log('🔐 [PagePouch Auth]', ...args)
    }
  },
  
  // Specialized API logger
  api: (...args: any[]) => {
    if (IS_DEV) {
      console.log('🌐 [PagePouch API]', ...args)
    }
  },
  
  // Specialized capture logger
  capture: (...args: any[]) => {
    if (IS_DEV) {
      console.log('📸 [PagePouch Capture]', ...args)
    }
  }
}

