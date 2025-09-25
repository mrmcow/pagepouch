/**
 * Full-page screenshot capture utility
 * Captures entire webpage by scrolling and stitching screenshots
 */

// Firefox compatibility layer
const extensionAPI = typeof browser !== 'undefined' ? browser : chrome;

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

      // Firefox-specific: Use simplified vertical-only approach for better reliability
      const isFirefox = typeof browser !== 'undefined';
      if (isFirefox) {
        console.log('🔧 Firefox detected: Using simplified vertical capture');
        return this.captureFullPageFirefox(tabId, opts, pageInfo, startTime);
      }

      // Check if we need horizontal scrolling
      // Firefox often underreports scrollWidth, so be more aggressive about detecting wide pages
      const needsHorizontalScroll = pageInfo.scrollWidth > pageInfo.viewportWidth;
      const forceHorizontalScroll = pageInfo.scrollWidth >= pageInfo.viewportWidth * 1.1; // Force if 10% wider
      const finalNeedsHorizontalScroll = needsHorizontalScroll || forceHorizontalScroll;
      
      console.log('🔧 Horizontal scroll analysis:', {
        scrollWidth: pageInfo.scrollWidth,
        viewportWidth: pageInfo.viewportWidth,
        ratio: pageInfo.scrollWidth / pageInfo.viewportWidth,
        needsHorizontalScroll,
        forceHorizontalScroll,
        finalNeedsHorizontalScroll
      });
      
      // Calculate scroll positions for both dimensions
      const verticalPositions = this.calculateScrollPositions(
        pageInfo.scrollHeight,
        pageInfo.viewportHeight,
        opts.maxHeight
      );
      
      const horizontalPositions = finalNeedsHorizontalScroll 
        ? this.calculateHorizontalScrollPositions(pageInfo.scrollWidth, pageInfo.viewportWidth)
        : [0];

      // Capture each section (grid of horizontal x vertical positions)
      const screenshots: Array<{dataUrl: string, x: number, y: number}> = [];
      const totalSections = verticalPositions.length * horizontalPositions.length;
      
      console.log(`🔧 Firefox capture grid analysis:`, {
        verticalPositions: verticalPositions.length,
        horizontalPositions: horizontalPositions.length,
        totalSections,
        verticalPositionsArray: verticalPositions,
        horizontalPositionsArray: horizontalPositions
      });

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

      // Compress the image for API upload to avoid payload size limits
      console.log('Compressing image for API upload...');
      const compressedImage = await this.compressImage(stitchedImage, 0.7); // 70% quality
      console.log('Image compression completed');

      return {
        dataUrl: compressedImage,
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
   * Firefox-specific full page capture with robust width detection and simple stitching
   */
  private static async captureFullPageFirefox(
    tabId: number,
    options: Required<CaptureOptions>,
    pageInfo: any,
    startTime: number
  ): Promise<CaptureResult> {
    console.log('🔧 Firefox: Starting robust full page capture');
    
    // Force page to full width by temporarily removing responsive constraints
    await this.executeScript(tabId, () => {
      // Remove viewport meta tag constraints
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (viewportMeta) {
        viewportMeta.setAttribute('data-original-content', viewportMeta.getAttribute('content') || '');
        viewportMeta.setAttribute('content', 'width=1200, initial-scale=1');
      }
      
      // Force body to minimum width
      document.body.style.minWidth = '1200px';
      document.documentElement.style.minWidth = '1200px';
      
      // Force any responsive containers to full width
      const containers = document.querySelectorAll('[class*="container"], [class*="wrapper"], [class*="content"]');
      containers.forEach(el => {
        const element = el as HTMLElement;
        element.style.maxWidth = 'none';
        element.style.width = '100%';
      });
    });
    
    // Wait for layout to stabilize
    await this.delay(1000);
    
    // Get updated page dimensions after width forcing
    const updatedPageInfo = await this.getPageInfo(tabId);
    console.log('🔧 Firefox: Updated page dimensions after width forcing:', {
      originalWidth: pageInfo.viewportWidth,
      newWidth: updatedPageInfo.viewportWidth,
      scrollWidth: updatedPageInfo.scrollWidth,
      scrollHeight: updatedPageInfo.scrollHeight
    });
    
    // Use actual viewport width to avoid stretching - don't force wider than necessary
    const captureWidth = updatedPageInfo.viewportWidth;
    
    // Get more accurate page height by checking again after layout stabilization
    await this.delay(500);
    const finalPageInfo = await this.getPageInfo(tabId);
    
    // Calculate simple vertical positions with small overlap to ensure complete capture
    const viewportHeight = finalPageInfo.viewportHeight;
    const totalHeight = finalPageInfo.scrollHeight;
    const positions: number[] = [];
    
    // Add small overlap (5%) to ensure we don't miss any content
    const overlap = Math.floor(viewportHeight * 0.05);
    const step = viewportHeight - overlap;
    
    let currentY = 0;
    while (currentY < totalHeight) {
      positions.push(currentY);
      currentY += step;
    }
    
    // Always ensure we capture the absolute bottom of the page
    const lastPosition = Math.max(0, totalHeight - viewportHeight);
    if (positions[positions.length - 1] < lastPosition) {
      positions.push(lastPosition);
    }
    
    // Remove any duplicate positions
    const uniquePositions = [...new Set(positions)].sort((a, b) => a - b);
    
    console.log(`🔧 Firefox: Capturing ${uniquePositions.length} sections with 5% overlap`, {
      captureWidth,
      viewportHeight,
      totalHeight,
      finalHeight: finalPageInfo.scrollHeight,
      overlap,
      step,
      positions: uniquePositions
    });

    // Capture each section
    const screenshots: string[] = [];
    
    for (let i = 0; i < uniquePositions.length; i++) {
      const scrollY = uniquePositions[i];
      const sectionIndex = i + 1;
      
      console.log(`🔧 Firefox: Capturing section ${sectionIndex}/${uniquePositions.length} at Y=${scrollY}`);
      
      // Scroll to position
      await this.scrollToPosition(tabId, scrollY, 0);
      await this.delay(800); // Longer delay for content to load
      
      try {
        // Capture with high quality
        const screenshot = await extensionAPI.tabs.captureVisibleTab({
          format: 'png', // Always use PNG for best quality
          quality: 95
        });
        
        screenshots.push(screenshot);
        console.log(`🔧 Firefox: Section ${sectionIndex} captured (${screenshot.length} chars)`);
        
      } catch (error) {
        console.error(`🔧 Firefox: Failed to capture section ${sectionIndex}:`, error);
        throw new Error(`Failed to capture section ${sectionIndex}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Restore original scroll position and page constraints
    await this.scrollToPosition(tabId, pageInfo.originalScrollY, pageInfo.originalScrollX);
    
    // Restore original page constraints
    await this.executeScript(tabId, () => {
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (viewportMeta && viewportMeta.getAttribute('data-original-content')) {
        viewportMeta.setAttribute('content', viewportMeta.getAttribute('data-original-content') || '');
        viewportMeta.removeAttribute('data-original-content');
      }
      
      document.body.style.minWidth = '';
      document.documentElement.style.minWidth = '';
      
      const containers = document.querySelectorAll('[class*="container"], [class*="wrapper"], [class*="content"]');
      containers.forEach(el => {
        const element = el as HTMLElement;
        element.style.maxWidth = '';
        element.style.width = '';
      });
    });

    // Simple vertical stitching with overlap handling
    console.log('🔧 Firefox: Starting overlap-aware stitching');
    const stitchedImage = await this.stitchFirefoxScreenshots(
      screenshots, 
      captureWidth, 
      viewportHeight, 
      finalPageInfo.scrollHeight,
      uniquePositions,
      overlap
    );
    console.log('🔧 Firefox: Stitching completed');

    // Light compression to maintain quality
    console.log('🔧 Firefox: Compressing image');
    const compressedImage = await this.compressImage(stitchedImage, 0.85);
    console.log('🔧 Firefox: Compression completed');

    return {
      dataUrl: compressedImage,
      width: captureWidth,
      height: finalPageInfo.scrollHeight,
      scrollHeight: finalPageInfo.scrollHeight,
      captureTime: Date.now() - startTime,
    };
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
    const results = await this.executeScript(tabId, () => {
        // Enhanced dimension calculation for Firefox compatibility
        const bodyScrollWidth = document.body.scrollWidth || 0;
        const bodyOffsetWidth = document.body.offsetWidth || 0;
        const docScrollWidth = document.documentElement.scrollWidth || 0;
        const docOffsetWidth = document.documentElement.offsetWidth || 0;
        const docClientWidth = document.documentElement.clientWidth || 0;
        
        // Firefox-specific: More aggressive width detection
        // Check all possible width measurements and find the true content width
        const allWidthMeasurements = [
          bodyScrollWidth,
          bodyOffsetWidth,
          docScrollWidth,
          docOffsetWidth,
          docClientWidth,
          window.innerWidth,
          window.outerWidth,
          screen.width
        ];
        
        // Also check for elements that might extend beyond viewport
        let maxElementWidth = 0;
        try {
          const allElements = document.querySelectorAll('*');
          for (let i = 0; i < Math.min(allElements.length, 100); i++) { // Check first 100 elements
            const element = allElements[i];
            const rect = element.getBoundingClientRect();
            const elementRight = rect.right + window.scrollX;
            if (elementRight > maxElementWidth) {
              maxElementWidth = elementRight;
            }
          }
        } catch (e) {
          console.warn('Could not check element widths:', e);
        }
        
        allWidthMeasurements.push(maxElementWidth);
        
        const contentWidth = Math.max(...allWidthMeasurements);
        
        // Firefox often underreports width, so add a safety margin if we detect potential issues
        const finalWidth = contentWidth > window.innerWidth ? contentWidth : Math.max(contentWidth, window.innerWidth * 1.2);
        
        console.log('🔧 Firefox page dimensions debug:', {
          bodyScrollWidth,
          bodyOffsetWidth,
          docScrollWidth,
          docOffsetWidth,
          docClientWidth,
          windowInnerWidth: window.innerWidth,
          windowOuterWidth: window.outerWidth,
          screenWidth: screen.width,
          maxElementWidth,
          calculatedContentWidth: contentWidth,
          finalWidth,
          allMeasurements: allWidthMeasurements
        });
        
        return {
          scrollHeight: Math.max(
            document.body.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.clientHeight,
            document.documentElement.scrollHeight,
            document.documentElement.offsetHeight
          ),
          scrollWidth: finalWidth,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
          originalScrollY: window.scrollY,
          originalScrollX: window.scrollX,
        };
    });

    if (!results || !results[0]) {
      throw new Error('Failed to get page information');
    }

    return results[0];
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
    await this.executeScript(tabId, (x: number, y: number) => {
      window.scrollTo(x, y);
    }, [scrollX, scrollY]);
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
    const screenshot = await extensionAPI.tabs.captureVisibleTab({
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
        if (!extensionAPI.tabs || typeof extensionAPI.tabs.captureVisibleTab !== 'function') {
          throw new Error('Chrome tabs API not available');
        }

        const screenshot = await extensionAPI.tabs.captureVisibleTab({
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
   * Execute script with browser compatibility
   */
  private static async executeScript(tabId: number, func: Function, args?: any[]): Promise<any[]> {
    if (extensionAPI?.scripting && typeof extensionAPI.scripting.executeScript === 'function') {
      // Chrome Manifest V3 approach
      console.log('🔧 Using scripting.executeScript (Chrome)');
      const results = await extensionAPI.scripting.executeScript({
        target: { tabId },
        func,
        args
      });
      return results.map(result => result.result);
    } else if (extensionAPI?.tabs && typeof extensionAPI.tabs.executeScript === 'function') {
      // Firefox Manifest V2 approach
      console.log('🔧 Using tabs.executeScript (Firefox)');
      return new Promise((resolve, reject) => {
        const code = args ? `(${func.toString()})(${args.map(arg => JSON.stringify(arg)).join(', ')})` : `(${func.toString()})()`;
        extensionAPI.tabs.executeScript(tabId, { code }, (results) => {
          if (extensionAPI.runtime.lastError) {
            reject(new Error(extensionAPI.runtime.lastError.message));
          } else {
            resolve(results || []);
          }
        });
      });
    } else {
      throw new Error('No script execution API available');
    }
  }

  /**
   * Firefox stitching with overlap handling for complete capture
   */
  private static async stitchFirefoxScreenshots(
    screenshots: string[],
    width: number,
    viewportHeight: number,
    totalHeight: number,
    scrollPositions: number[],
    overlap: number
  ): Promise<string> {
    try {
      console.log('🔧 Firefox stitching:', {
        screenshots: screenshots.length,
        width,
        viewportHeight,
        totalHeight
      });
      
      // Create canvas with exact dimensions
      const canvas = new OffscreenCanvas(width, totalHeight);
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // Fill with white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, totalHeight);

      // Stack images vertically with proper overlap handling
      for (let i = 0; i < screenshots.length; i++) {
        const screenshot = screenshots[i];
        const scrollY = scrollPositions[i];
        
        console.log(`🔧 Firefox: Stitching section ${i + 1} at scroll Y=${scrollY}`);
        
        // Convert data URL to ImageBitmap
        const response = await fetch(screenshot);
        const blob = await response.blob();
        const imageBitmap = await createImageBitmap(blob);
        
        if (i === 0) {
          // First image - draw completely at the top
          ctx.drawImage(imageBitmap, 0, 0, width, viewportHeight, 0, 0, width, viewportHeight);
          console.log(`🔧 Firefox: Drew first section at canvas Y=0`);
        } else {
          // Subsequent images - handle overlap
          const prevScrollY = scrollPositions[i - 1];
          const canvasY = scrollY; // Use actual scroll position as canvas position
          
          // Calculate how much of this image to draw (skip overlapping part)
          const sourceY = Math.max(0, (prevScrollY + viewportHeight) - scrollY);
          const sourceHeight = viewportHeight - sourceY;
          const destY = canvasY + sourceY;
          
          if (sourceHeight > 0 && destY < totalHeight) {
            const finalHeight = Math.min(sourceHeight, totalHeight - destY);
            
            ctx.drawImage(
              imageBitmap,
              0, sourceY, width, finalHeight,  // Source
              0, destY, width, finalHeight     // Destination
            );
            
            console.log(`🔧 Firefox: Drew section ${i + 1} from sourceY=${sourceY} to canvasY=${destY}, height=${finalHeight}`);
          }
        }
        
        imageBitmap.close();
      }

      console.log(`🔧 Firefox: Stitching completed, canvas height: ${totalHeight}`);

      // Convert to data URL
      const blob = await canvas.convertToBlob({ type: 'image/png' });
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      
    } catch (error) {
      console.error('🔧 Firefox stitching failed:', error);
      // Fallback to first screenshot
      return screenshots[0] || '';
    }
  }

  /**
   * Compress image to reduce payload size for API upload
   */
  private static async compressImage(dataUrl: string, quality: number = 0.7): Promise<string> {
    try {
      // Create image from data URL
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = dataUrl;
      });

      // Create canvas for compression
      const canvas = new OffscreenCanvas(img.width, img.height);
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Failed to get canvas context for compression');
      }

      // Draw image to canvas
      ctx.drawImage(img, 0, 0);

      // Convert to compressed JPEG
      const blob = await canvas.convertToBlob({
        type: 'image/jpeg',
        quality: quality
      });

      // Convert blob back to data URL
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.warn('Image compression failed, using original:', error);
      return dataUrl; // Fallback to original if compression fails
    }
  }

  /**
   * Check if full page capture is supported
   */
  static isSupported(): boolean {
    console.log('🔧 Checking FullPageCapture support...');
    console.log('🔧 extensionAPI available:', !!extensionAPI);
    console.log('🔧 tabs API available:', !!extensionAPI?.tabs);
    console.log('🔧 captureVisibleTab available:', typeof extensionAPI?.tabs?.captureVisibleTab === 'function');
    console.log('🔧 scripting API available:', !!extensionAPI?.scripting);
    console.log('🔧 executeScript available:', typeof extensionAPI?.scripting?.executeScript === 'function');
    console.log('🔧 tabs.executeScript available:', typeof extensionAPI?.tabs?.executeScript === 'function');
    
    // Firefox uses tabs.executeScript (Manifest V2), Chrome uses scripting.executeScript (Manifest V3)
    const hasScriptExecution = !!(
      (extensionAPI?.scripting && typeof extensionAPI.scripting.executeScript === 'function') ||
      (extensionAPI?.tabs && typeof extensionAPI.tabs.executeScript === 'function')
    );
    
    const isSupported = !!(
      extensionAPI &&
      extensionAPI.tabs &&
      typeof extensionAPI.tabs.captureVisibleTab === 'function' &&
      hasScriptExecution
    );
    
    console.log('🔧 hasScriptExecution:', hasScriptExecution);
    console.log('🔧 FullPageCapture isSupported:', isSupported);
    return isSupported;
  }
}
