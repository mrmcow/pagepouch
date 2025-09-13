/**
 * Full-page screenshot capture utility
 * Captures entire webpage by scrolling and stitching screenshots
 */

export interface CaptureOptions {
  quality?: number;
  format?: 'png' | 'jpeg';
  maxHeight?: number;
  scrollDelay?: number;
}

export interface CaptureResult {
  dataUrl: string;
  width: number;
  height: number;
  scrollHeight: number;
  captureTime: number;
}

export class FullPageCapture {
  private static readonly DEFAULT_OPTIONS: Required<CaptureOptions> = {
    quality: 90,
    format: 'png',
    maxHeight: 32767, // Maximum canvas height in most browsers
    scrollDelay: 1000, // More conservative delay to respect Chrome's rate limits
  };

  /**
   * Capture full page screenshot by scrolling and stitching
   */
  static async captureFullPage(
    tabId: number,
    options: CaptureOptions = {}
  ): Promise<CaptureResult> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    const startTime = Date.now();

    try {
      // Verify permissions before starting
      if (!this.isSupported()) {
        throw new Error('Full page capture is not supported - missing Chrome APIs or permissions');
      }

      // Get page dimensions and current scroll position
      const pageInfo = await this.getPageInfo(tabId);
      
      console.log('Full page capture - Page info:', {
        scrollHeight: pageInfo.scrollHeight,
        scrollWidth: pageInfo.scrollWidth,
        viewportWidth: pageInfo.viewportWidth,
        viewportHeight: pageInfo.viewportHeight,
        originalScrollX: pageInfo.originalScrollX,
        originalScrollY: pageInfo.originalScrollY
      });
      
      if (pageInfo.scrollHeight <= pageInfo.viewportHeight) {
        // Page fits in viewport, use simple capture
        console.log('Page fits in viewport, using simple capture');
        return this.captureVisibleArea(tabId, opts, pageInfo, startTime);
      }

      // Check if we need horizontal scrolling
      const needsHorizontalScroll = pageInfo.scrollWidth > pageInfo.viewportWidth;
      console.log('Needs horizontal scroll:', needsHorizontalScroll);
      
      // Calculate scroll positions for both dimensions
      const verticalPositions = this.calculateScrollPositions(
        pageInfo.scrollHeight,
        pageInfo.viewportHeight,
        opts.maxHeight
      );
      
      const horizontalPositions = needsHorizontalScroll 
        ? this.calculateHorizontalScrollPositions(pageInfo.scrollWidth, pageInfo.viewportWidth)
        : [0];

      // Capture each section (grid of horizontal x vertical positions)
      const screenshots: Array<{dataUrl: string, x: number, y: number}> = [];
      const totalSections = verticalPositions.length * horizontalPositions.length;

      console.log(`Capturing ${totalSections} sections (${horizontalPositions.length}x${verticalPositions.length} grid)...`);

      for (let vIndex = 0; vIndex < verticalPositions.length; vIndex++) {
        for (let hIndex = 0; hIndex < horizontalPositions.length; hIndex++) {
          const scrollY = verticalPositions[vIndex];
          const scrollX = horizontalPositions[hIndex];
          const sectionIndex = vIndex * horizontalPositions.length + hIndex + 1;
          
          console.log(`Capturing section ${sectionIndex}/${totalSections} at position (${scrollX}, ${scrollY})`);
          
          // Scroll to position
          await this.scrollToPosition(tabId, scrollY, scrollX);
          
          // Wait for scroll to complete and content to load
          await this.delay(opts.scrollDelay);
          
          // Additional rate limiting delay between captures (Chrome quota protection)
          if (sectionIndex > 1) {
            console.log('Waiting for Chrome rate limit...');
            await this.delay(800); // More conservative 800ms between captures
          }
          
          try {
            // Capture visible area with retry logic (increased retries)
            const screenshot = await this.captureWithRetry(opts.format, opts.quality, 5);
            screenshots.push({dataUrl: screenshot, x: scrollX, y: scrollY});
            
            console.log(`Section ${sectionIndex} captured successfully`);
            
            // Additional delay after successful capture to be extra safe
            if (sectionIndex < totalSections) {
              await this.delay(200);
            }
          } catch (error) {
            console.error(`Failed to capture section ${sectionIndex}:`, error);
            throw new Error(`Failed to capture section ${sectionIndex}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      }

      // Restore original scroll position
      await this.scrollToPosition(tabId, pageInfo.originalScrollY, pageInfo.originalScrollX);

      // Stitch screenshots together
      console.log('Starting image stitching...');
      const actualWidth = Math.max(pageInfo.viewportWidth, pageInfo.scrollWidth);
      const actualHeight = Math.min(pageInfo.scrollHeight, opts.maxHeight);
      
      console.log('Stitching parameters:', {
        screenshotCount: screenshots.length,
        actualWidth,
        actualHeight,
        viewportWidth: pageInfo.viewportWidth,
        viewportHeight: pageInfo.viewportHeight,
        screenshotPositions: screenshots.map(s => ({ x: s.x, y: s.y }))
      });
      
      const stitchedImage = await this.stitchGridScreenshots(
        screenshots,
        actualWidth,
        actualHeight,
        pageInfo.viewportWidth,
        pageInfo.viewportHeight
      );
      console.log('Image stitching completed');

      return {
        dataUrl: stitchedImage,
        width: actualWidth,
        height: Math.min(pageInfo.scrollHeight, opts.maxHeight),
        scrollHeight: pageInfo.scrollHeight,
        captureTime: Date.now() - startTime,
      };

    } catch (error) {
      console.error('Full page capture failed:', error);
      throw new Error(`Full page capture failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get page information needed for capture
   */
  private static async getPageInfo(tabId: number): Promise<{
    scrollHeight: number;
    scrollWidth: number;
    viewportWidth: number;
    viewportHeight: number;
    originalScrollY: number;
    originalScrollX: number;
  }> {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        return {
          scrollHeight: Math.max(
            document.body.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.clientHeight,
            document.documentElement.scrollHeight,
            document.documentElement.offsetHeight
          ),
          scrollWidth: Math.max(
            document.body.scrollWidth,
            document.body.offsetWidth,
            document.documentElement.clientWidth,
            document.documentElement.scrollWidth,
            document.documentElement.offsetWidth
          ),
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
          originalScrollY: window.scrollY,
          originalScrollX: window.scrollX,
        };
      },
    });

    if (!results || !results[0] || !results[0].result) {
      throw new Error('Failed to get page information');
    }

    return results[0].result;
  }

  /**
   * Calculate optimal scroll positions for capture
   */
  private static calculateScrollPositions(
    scrollHeight: number,
    viewportHeight: number,
    maxHeight: number
  ): number[] {
    const positions: number[] = [];
    const effectiveHeight = Math.min(scrollHeight, maxHeight);
    
    // Calculate overlap to ensure seamless stitching
    const overlap = Math.floor(viewportHeight * 0.1); // 10% overlap
    const step = viewportHeight - overlap;
    
    let currentY = 0;
    
    while (currentY < effectiveHeight) {
      positions.push(currentY);
      currentY += step;
      
      // Ensure we capture the bottom of the page
      if (currentY >= effectiveHeight - viewportHeight && currentY < effectiveHeight) {
        positions.push(Math.max(0, effectiveHeight - viewportHeight));
        break;
      }
    }

    return positions;
  }

  /**
   * Calculate horizontal scroll positions for wide pages
   */
  private static calculateHorizontalScrollPositions(
    scrollWidth: number,
    viewportWidth: number
  ): number[] {
    const positions: number[] = [];
    
    // Calculate overlap to ensure seamless stitching
    const overlap = Math.floor(viewportWidth * 0.1); // 10% overlap
    const step = viewportWidth - overlap;
    
    let currentX = 0;
    
    while (currentX < scrollWidth) {
      positions.push(currentX);
      currentX += step;
      
      // Ensure we capture the right edge of the page
      if (currentX >= scrollWidth - viewportWidth && currentX < scrollWidth) {
        positions.push(Math.max(0, scrollWidth - viewportWidth));
        break;
      }
    }

    return positions;
  }

  /**
   * Scroll to specific position
   */
  private static async scrollToPosition(tabId: number, scrollY: number, scrollX: number = 0): Promise<void> {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: (x: number, y: number) => {
        window.scrollTo(x, y);
      },
      args: [scrollX, scrollY],
    });
  }

  /**
   * Capture visible area (fallback for single-viewport pages)
   */
  private static async captureVisibleArea(
    tabId: number,
    options: Required<CaptureOptions>,
    pageInfo: any,
    startTime: number
  ): Promise<CaptureResult> {
    const screenshot = await chrome.tabs.captureVisibleTab({
      format: options.format,
      quality: options.quality,
    });

    return {
      dataUrl: screenshot,
      width: pageInfo.viewportWidth,
      height: pageInfo.viewportHeight,
      scrollHeight: pageInfo.scrollHeight,
      captureTime: Date.now() - startTime,
    };
  }

  /**
   * Stitch multiple screenshots into single image using OffscreenCanvas
   */
  private static async stitchScreenshots(
    screenshots: string[],
    width: number,
    viewportHeight: number,
    scrollPositions: number[]
  ): Promise<string> {
    try {
      // Use OffscreenCanvas for service worker compatibility
      const totalHeight = scrollPositions[scrollPositions.length - 1] + viewportHeight;
      const canvas = new OffscreenCanvas(width, totalHeight);
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Failed to get OffscreenCanvas context');
      }

      // Load and process images sequentially to avoid memory issues
      for (let i = 0; i < screenshots.length; i++) {
        const screenshot = screenshots[i];
        const scrollY = scrollPositions[i];
        
        // Convert data URL to ImageBitmap
        const response = await fetch(screenshot);
        const blob = await response.blob();
        const imageBitmap = await createImageBitmap(blob);
        
        if (i === 0) {
          // First image - draw completely
          ctx.drawImage(imageBitmap, 0, scrollY);
        } else {
          // Subsequent images - calculate overlap and draw only new content
          const prevY = scrollPositions[i - 1];
          const overlap = (prevY + viewportHeight) - scrollY;
          
          if (overlap > 0) {
            // Draw only the non-overlapping part
            ctx.drawImage(
              imageBitmap,
              0, overlap, // Source x, y
              imageBitmap.width, imageBitmap.height - overlap, // Source width, height
              0, scrollY + overlap, // Dest x, y
              imageBitmap.width, imageBitmap.height - overlap // Dest width, height
            );
          } else {
            // No overlap, draw completely
            ctx.drawImage(imageBitmap, 0, scrollY);
          }
        }
        
        // Clean up ImageBitmap to free memory
        imageBitmap.close();
      }

      // Convert to blob and then to data URL
      const blob = await canvas.convertToBlob({ type: 'image/png' });
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to convert blob to data URL'));
        reader.readAsDataURL(blob);
      });
      
    } catch (error) {
      console.error('Stitching failed:', error);
      // Fallback: return the first screenshot if stitching fails
      return screenshots[0] || '';
    }
  }

  /**
   * Stitch grid of screenshots into single image using OffscreenCanvas
   */
  private static async stitchGridScreenshots(
    screenshots: Array<{dataUrl: string, x: number, y: number}>,
    totalWidth: number,
    totalHeight: number,
    viewportWidth: number,
    viewportHeight: number
  ): Promise<string> {
    try {
      console.log('Stitching grid screenshots:', {
        totalScreenshots: screenshots.length,
        totalWidth,
        totalHeight,
        viewportWidth,
        viewportHeight
      });
      
      // Use OffscreenCanvas for service worker compatibility
      const canvas = new OffscreenCanvas(totalWidth, totalHeight);
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Failed to get OffscreenCanvas context');
      }

      // Sort screenshots by position (top-to-bottom, left-to-right)
      screenshots.sort((a, b) => {
        if (a.y !== b.y) return a.y - b.y;
        return a.x - b.x;
      });

      // Calculate overlap amounts
      const verticalOverlap = Math.floor(viewportHeight * 0.1);
      const horizontalOverlap = Math.floor(viewportWidth * 0.1);

      // Group screenshots by rows
      const rows = new Map<number, Array<{dataUrl: string, x: number, y: number}>>();
      screenshots.forEach(screenshot => {
        if (!rows.has(screenshot.y)) {
          rows.set(screenshot.y, []);
        }
        rows.get(screenshot.y)!.push(screenshot);
      });

      // Process each row
      let canvasY = 0;
      const sortedRowKeys = Array.from(rows.keys()).sort((a, b) => a - b);
      
      for (let rowIndex = 0; rowIndex < sortedRowKeys.length; rowIndex++) {
        const rowY = sortedRowKeys[rowIndex];
        const rowScreenshots = rows.get(rowY)!;
        
        // Sort screenshots in this row by x position
        rowScreenshots.sort((a, b) => a.x - b.x);
        
        let canvasX = 0;
        
        for (let colIndex = 0; colIndex < rowScreenshots.length; colIndex++) {
          const screenshot = rowScreenshots[colIndex];
          
          // Convert data URL to ImageBitmap
          const response = await fetch(screenshot.dataUrl);
          const blob = await response.blob();
          const imageBitmap = await createImageBitmap(blob);
          
          // Calculate source and destination areas to handle overlaps
          let sourceX = 0;
          let sourceY = 0;
          let sourceWidth = imageBitmap.width;
          let sourceHeight = imageBitmap.height;
          let destWidth = sourceWidth;
          let destHeight = sourceHeight;
          
          // Handle horizontal overlap (not the first column)
          if (colIndex > 0) {
            sourceX = horizontalOverlap;
            sourceWidth -= horizontalOverlap;
            destWidth = sourceWidth;
          }
          
          // Handle vertical overlap (not the first row)
          if (rowIndex > 0) {
            sourceY = verticalOverlap;
            sourceHeight -= verticalOverlap;
            destHeight = sourceHeight;
          }
          
          // Draw the image section
          ctx.drawImage(
            imageBitmap,
            sourceX, sourceY, sourceWidth, sourceHeight, // Source rectangle
            canvasX, canvasY, destWidth, destHeight       // Destination rectangle
          );
          
          // Update canvas X position for next column
          canvasX += destWidth;
          
          // Clean up ImageBitmap to free memory
          imageBitmap.close();
        }
        
        // Update canvas Y position for next row
        // Use the height from the first image in the row, accounting for overlap
        if (rowScreenshots.length > 0) {
          const firstScreenshot = rowScreenshots[0];
          const response = await fetch(firstScreenshot.dataUrl);
          const blob = await response.blob();
          const imageBitmap = await createImageBitmap(blob);
          
          const heightToAdd = rowIndex > 0 
            ? imageBitmap.height - verticalOverlap 
            : imageBitmap.height;
          canvasY += heightToAdd;
          
          imageBitmap.close();
        }
      }

      // Convert to blob and then to data URL
      const blob = await canvas.convertToBlob({ type: 'image/png' });
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to convert blob to data URL'));
        reader.readAsDataURL(blob);
      });
      
    } catch (error) {
      console.error('Grid stitching failed:', error);
      // Fallback: return the first screenshot if stitching fails
      return screenshots[0]?.dataUrl || '';
    }
  }

  /**
   * Capture with retry logic for rate limiting and permissions
   */
  private static async captureWithRetry(
    format: 'png' | 'jpeg',
    quality: number,
    maxRetries: number
  ): Promise<string> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Check permissions before attempting capture
        if (!chrome.tabs || typeof chrome.tabs.captureVisibleTab !== 'function') {
          throw new Error('Chrome tabs API not available');
        }

        const screenshot = await chrome.tabs.captureVisibleTab({
          format,
          quality,
        });
        return screenshot;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        console.log(`Capture attempt ${attempt}/${maxRetries} failed:`, errorMessage);
        
        // Handle rate limiting
        if (errorMessage.includes('MAX_CAPTURE_VISIBLE_TAB_CALLS_PER_SECOND')) {
          console.log(`Rate limit hit on attempt ${attempt}/${maxRetries}, waiting...`);
          
          if (attempt < maxRetries) {
            // More aggressive backoff: 2s, 4s, 8s...
            const waitTime = Math.pow(2, attempt) * 1000;
            await this.delay(waitTime);
            continue;
          }
        }
        
        // Handle permission errors
        if (errorMessage.includes('permission') || errorMessage.includes('activeTab') || errorMessage.includes('all_urls')) {
          console.log(`Permission error on attempt ${attempt}/${maxRetries}, waiting longer...`);
          
          if (attempt < maxRetries) {
            // Wait longer for permission issues: 3s, 6s, 12s...
            const waitTime = Math.pow(2, attempt) * 1500;
            await this.delay(waitTime);
            continue;
          }
        }
        
        // For other errors, wait a bit before retrying
        if (attempt < maxRetries) {
          console.log(`Generic error, waiting before retry...`);
          await this.delay(1000 * attempt);
          continue;
        }
        
        // Re-throw if max retries reached
        throw error;
      }
    }
    
    throw new Error('Max retries exceeded for capture');
  }

  /**
   * Utility delay function
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if full page capture is supported
   */
  static isSupported(): boolean {
    return !!(
      typeof chrome !== 'undefined' &&
      chrome.tabs &&
      typeof chrome.tabs.captureVisibleTab === 'function' &&
      chrome.scripting &&
      typeof chrome.scripting.executeScript === 'function'
    );
  }
}
