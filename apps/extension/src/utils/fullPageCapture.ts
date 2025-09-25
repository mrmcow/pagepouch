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
    console.log('🔧 Firefox: Using Chrome approach with Firefox viewport expansion');
    
    // STEP 1: Expand viewport to capture full content width (Firefox requirement)
    console.log('🔧 Firefox: Expanding viewport to capture full content width');
    await this.executeScript(tabId, (targetWidth: number) => {
      // Store original viewport for restoration
      const viewportMeta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
      const originalViewport = viewportMeta ? viewportMeta.content : '';
      
      // Set viewport to accommodate full content width
      if (viewportMeta) {
        viewportMeta.content = `width=${targetWidth}, initial-scale=1.0, user-scalable=no`;
      } else {
        const newViewportMeta = document.createElement('meta');
        newViewportMeta.name = 'viewport';
        newViewportMeta.content = `width=${targetWidth}, initial-scale=1.0, user-scalable=no`;
        document.head.appendChild(newViewportMeta);
        newViewportMeta.setAttribute('data-pagepouch-added', 'true');
      }
      
      // Store for restoration
      (window as any).__pagepouchOriginalViewport = originalViewport;
      
      console.log('🔧 Firefox: Viewport set to', targetWidth + 'px for full width capture');
    }, [pageInfo.scrollWidth]);
    
    // Wait for viewport change to take effect
    await this.delay(1000);
    
    // Get updated page info after viewport expansion
    const updatedPageInfo = await this.getPageInfo(tabId);
    console.log('🔧 Firefox: Updated page info after viewport expansion:', {
      originalWidth: pageInfo.viewportWidth,
      originalScrollWidth: pageInfo.scrollWidth,
      newWidth: updatedPageInfo.viewportWidth,
      newScrollWidth: updatedPageInfo.scrollWidth
    });
    
    // STEP 2: Determine if we need horizontal scrolling (SAME AS CHROME)
    const needsHorizontalScroll = updatedPageInfo.scrollWidth > updatedPageInfo.viewportWidth;
    const forceHorizontalScroll = updatedPageInfo.scrollWidth >= updatedPageInfo.viewportWidth * 1.1; // Force if 10% wider
    const finalNeedsHorizontalScroll = needsHorizontalScroll || forceHorizontalScroll;
    
    console.log('🔧 Firefox horizontal scroll analysis:', {
      scrollWidth: updatedPageInfo.scrollWidth,
      viewportWidth: updatedPageInfo.viewportWidth,
      ratio: updatedPageInfo.scrollWidth / updatedPageInfo.viewportWidth,
      needsHorizontalScroll,
      forceHorizontalScroll,
      finalNeedsHorizontalScroll
    });
    
    // STEP 3: Calculate scroll positions for both dimensions using updated info
    const verticalPositions = this.calculateScrollPositions(
      updatedPageInfo.scrollHeight,
      updatedPageInfo.viewportHeight,
      options.maxHeight
    );
    
    const horizontalPositions = finalNeedsHorizontalScroll 
      ? this.calculateHorizontalScrollPositions(updatedPageInfo.scrollWidth, updatedPageInfo.viewportWidth)
      : [0];

    // STEP 3: Capture each section in grid (SAME AS CHROME)
    const screenshots: Array<{dataUrl: string, x: number, y: number}> = [];
    const totalSections = verticalPositions.length * horizontalPositions.length;
    
    console.log(`🔧 Firefox capture grid:`, {
      verticalPositions: verticalPositions.length,
      horizontalPositions: horizontalPositions.length,
      totalSections,
      verticalPositionsArray: verticalPositions,
      horizontalPositionsArray: horizontalPositions
    });

    console.log(`🔧 Firefox: Capturing ${totalSections} sections (${horizontalPositions.length}x${verticalPositions.length} grid)...`);

    for (let vIndex = 0; vIndex < verticalPositions.length; vIndex++) {
      for (let hIndex = 0; hIndex < horizontalPositions.length; hIndex++) {
        const scrollY = verticalPositions[vIndex];
        const scrollX = horizontalPositions[hIndex];
        const sectionIndex = vIndex * horizontalPositions.length + hIndex + 1;
        
        console.log(`🔧 Firefox: Capturing section ${sectionIndex}/${totalSections} at position (${scrollX}, ${scrollY})`);
        
        // Scroll to position
        await this.scrollToPosition(tabId, scrollY, scrollX);
        
        // Wait for scroll to complete and content to load
        await this.delay(options.scrollDelay);
        
        // Rate limiting delay between captures
        if (sectionIndex > 1) {
          console.log('🔧 Firefox: Rate limit delay...');
          await this.delay(800);
        }
        
        try {
          // Capture visible area (SAME AS CHROME)
          const screenshot = await extensionAPI.tabs.captureVisibleTab({
            format: options.format,
            quality: options.quality
          });
          screenshots.push({dataUrl: screenshot, x: scrollX, y: scrollY});
          
          console.log(`🔧 Firefox: Section ${sectionIndex} captured successfully`);
          
          // Additional delay after successful capture
          if (sectionIndex < totalSections) {
            await this.delay(200);
          }
        } catch (error) {
          console.error(`🔧 Firefox: Failed to capture section ${sectionIndex}:`, error);
          throw new Error(`Failed to capture section ${sectionIndex}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }

    // STEP 4: Restore original scroll position and viewport
    await this.scrollToPosition(tabId, pageInfo.originalScrollY, pageInfo.originalScrollX);
    
    // Restore original viewport
    await this.executeScript(tabId, () => {
      const originalViewport = (window as any).__pagepouchOriginalViewport;
      const viewportMeta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
      
      if (viewportMeta) {
        if (viewportMeta.getAttribute('data-pagepouch-added')) {
          // Remove the meta tag we added
          viewportMeta.remove();
        } else if (originalViewport !== undefined) {
          // Restore original content
          viewportMeta.content = originalViewport;
        }
      }
      
      delete (window as any).__pagepouchOriginalViewport;
      console.log('🔧 Firefox: Viewport restored to original state');
    });

    // STEP 5: Stitch screenshots together (SAME AS CHROME)
    console.log('🔧 Firefox: Starting image stitching...');
    const actualWidth = Math.max(updatedPageInfo.viewportWidth, updatedPageInfo.scrollWidth);
    const actualHeight = updatedPageInfo.scrollHeight;
    
    console.log('🔧 Firefox: Stitching parameters:', {
      screenshotCount: screenshots.length,
      actualWidth,
      actualHeight,
      viewportWidth: updatedPageInfo.viewportWidth,
      viewportHeight: updatedPageInfo.viewportHeight,
      screenshotPositions: screenshots.map(s => ({x: s.x, y: s.y}))
    });

    let stitchedImage: string;
    if (finalNeedsHorizontalScroll) {
      // Grid stitching (SAME AS CHROME)
      stitchedImage = await this.stitchGridScreenshots(
        screenshots,
        actualWidth,
        actualHeight,
        updatedPageInfo.viewportWidth,
        updatedPageInfo.viewportHeight
      );
    } else {
      // Vertical stitching only (SAME AS CHROME)
      const verticalScreenshots = screenshots.map(s => s.dataUrl);
      stitchedImage = await this.stitchVerticalScreenshots(
        verticalScreenshots,
        actualWidth,
        actualHeight,
        updatedPageInfo.viewportHeight
      );
    }

    console.log('🔧 Firefox: Image stitching completed');

    // Compress the image to reduce payload size for API upload
    console.log('🔧 Firefox: Compressing image to reduce payload size');
    const compressedImage = await this.compressImage(stitchedImage, 0.75); // 75% quality
    console.log('🔧 Firefox: Image compression completed');

    return {
      dataUrl: compressedImage,
      width: actualWidth,
      height: actualHeight,
      scrollHeight: pageInfo.scrollHeight,
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
    
    console.log('🔧 Calculating vertical positions:', { scrollHeight, viewportHeight, effectiveHeight });
    
    // Use precise positioning with minimal overlap for Firefox
    const overlap = 20; // Small fixed overlap to prevent gaps
    const step = viewportHeight - overlap;
    
    let currentY = 0;
    
    // Capture sections with small overlap
    while (currentY < effectiveHeight) {
      positions.push(currentY);
      currentY += step;
      
      // Stop if we're close to the end
      if (currentY >= effectiveHeight - viewportHeight) {
        break;
      }
    }
    
    // Always ensure we capture the absolute bottom
    const bottomPosition = Math.max(0, effectiveHeight - viewportHeight);
    if (!positions.includes(bottomPosition) && bottomPosition > 0) {
      positions.push(bottomPosition);
    }
    
    console.log('🔧 Vertical positions calculated:', positions);
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
    
    // For Firefox, use precise positioning without overlap for cleaner stitching
    console.log('🔧 Calculating horizontal positions:', { scrollWidth, viewportWidth });
    
    // Always start at 0
    positions.push(0);
    
    // If content is wider than viewport, add position to capture the right edge
    if (scrollWidth > viewportWidth) {
      const rightEdgePosition = scrollWidth - viewportWidth;
      if (rightEdgePosition > 0) {
        positions.push(rightEdgePosition);
      }
    }
    
    console.log('🔧 Horizontal positions calculated:', positions);
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
   * Firefox stitching with proper overlap handling
   */
  private static async stitchFirefoxScreenshotsWithOverlap(
    screenshots: string[],
    width: number,
    viewportHeight: number,
    totalHeight: number,
    scrollPositions: number[],
    overlap: number
  ): Promise<string> {
    try {
      console.log('🔧 Firefox PRECISION stitching:', {
        screenshots: screenshots.length,
        targetWidth: width,
        viewportHeight,
        totalHeight,
        scrollPositions,
        overlap
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

      // Stack images with proper overlap handling
      for (let i = 0; i < screenshots.length; i++) {
        const screenshot = screenshots[i];
        const scrollY = scrollPositions[i];
        
        console.log(`🔧 Firefox: Stitching section ${i + 1} at scroll Y=${scrollY}`);
        
        // Convert data URL to ImageBitmap
        const response = await fetch(screenshot);
        const blob = await response.blob();
        const imageBitmap = await createImageBitmap(blob);
        
        if (i === 0) {
          // First image - draw completely
          ctx.drawImage(imageBitmap, 0, 0, width, viewportHeight, 0, 0, width, viewportHeight);
          console.log(`🔧 Firefox: Drew first section at Y=0`);
        } else {
          // Subsequent images - handle overlap
          const prevScrollY = scrollPositions[i - 1];
          const expectedOverlap = Math.max(0, (prevScrollY + viewportHeight) - scrollY);
          const sourceY = Math.min(expectedOverlap, overlap);
          const sourceHeight = viewportHeight - sourceY;
          const destY = scrollY + sourceY;
          
          if (sourceHeight > 0 && destY < totalHeight) {
            const finalHeight = Math.min(sourceHeight, totalHeight - destY);
            
            ctx.drawImage(
              imageBitmap,
              0, sourceY, width, finalHeight,  // Source
              0, destY, width, finalHeight     // Destination
            );
            
            console.log(`🔧 Firefox: Drew section ${i + 1} from sourceY=${sourceY} to destY=${destY}, height=${finalHeight}`);
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
