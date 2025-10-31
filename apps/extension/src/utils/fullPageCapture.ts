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

      // Firefox needs special handling due to captureVisibleTab limitations
      const isFirefox = typeof browser !== 'undefined';
      if (isFirefox) {
        console.log('🔧 Firefox: Using SIMPLE vertical sections - same as visible area');
        return this.captureVerticalOnlyFirefox(tabId, opts, pageInfo, startTime);
      }
      
      console.log('🔧 Chrome: Using full grid capture');

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

      console.log(`Capturing ${totalSections} sections...`);

      for (let vIndex = 0; vIndex < verticalPositions.length; vIndex++) {
        for (let hIndex = 0; hIndex < horizontalPositions.length; hIndex++) {
          const scrollY = verticalPositions[vIndex];
          const scrollX = horizontalPositions[hIndex];
          const sectionIndex = vIndex * horizontalPositions.length + hIndex + 1;
          
          // Send progress update to popup
          try {
            const extensionAPI = typeof browser !== 'undefined' ? browser : chrome;
            extensionAPI.runtime.sendMessage({
              type: 'CAPTURE_PROGRESS',
              payload: { 
                status: 'capturing', 
                message: `Capturing page... ${sectionIndex} of ${totalSections} sections`,
                progress: Math.round((sectionIndex / totalSections) * 100)
              }
            });
          } catch (e) {
            // Ignore messaging errors
          }
          
          // Scroll to position
          await this.scrollToPosition(tabId, scrollY, scrollX);
          
          // Wait for scroll to complete and content to load
          await this.delay(opts.scrollDelay);
          
          // Rate limiting delay between captures (reduced from 800ms to 400ms)
          if (sectionIndex > 1) {
            await this.delay(400); 
          }
          
          try {
            // Capture visible area with retry logic
            const screenshot = await this.captureWithRetry(opts.format, opts.quality, 5);
            screenshots.push({dataUrl: screenshot, x: scrollX, y: scrollY});
            
            // Small delay after successful capture
            if (sectionIndex < totalSections) {
              await this.delay(150);
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
      
      // Ultra aggressive compression based on number of sections
      let compressionQuality = 0.4; // Much lower default
      
      if (screenshots.length > 15) {
        compressionQuality = 0.15; // Ultra aggressive for extremely long pages
        console.log('🔧 Chrome: Extremely long page detected - using ultra compression (15%)');
      } else if (screenshots.length > 10) {
        compressionQuality = 0.2; // Very aggressive for very long pages
        console.log('🔧 Chrome: Very long page detected - using aggressive compression (20%)');
      } else if (screenshots.length > 6) {
        compressionQuality = 0.3; // Aggressive compression for long pages
        console.log('🔧 Chrome: Long page detected - using aggressive compression (30%)');
      } else if (screenshots.length > 3) {
        compressionQuality = 0.35; // Medium compression for medium pages
        console.log('🔧 Chrome: Medium page detected - using medium compression (35%)');
      } else {
        console.log('🔧 Chrome: Short page - using standard compression (40%)');
      }
      
      const compressedImage = await this.compressImage(stitchedImage, compressionQuality);
      
      // Check final size and apply emergency compression if needed
      const imageSizeMB = (compressedImage.length * 0.75) / (1024 * 1024); // Rough estimate
      console.log('🔧 Chrome: Final image size estimate:', Math.round(imageSizeMB * 100) / 100, 'MB');
      
      let finalImage = compressedImage;
      
      if (imageSizeMB > 1.5) { // Very low threshold for emergency compression
        let emergencyQuality = 0.1; // Start with ultra aggressive compression
        
        if (imageSizeMB > 3) {
          emergencyQuality = 0.08; // Extreme compression for very large images
          console.log('🔧 Chrome: Image extremely large - applying extreme emergency compression (8%)');
        } else if (imageSizeMB > 2) {
          emergencyQuality = 0.09; // Ultra aggressive for large images
          console.log('🔧 Chrome: Image very large - applying ultra emergency compression (9%)');
        } else {
          console.log('🔧 Chrome: Image too large - applying emergency compression (10%)');
        }
        
        finalImage = await this.compressImage(stitchedImage, emergencyQuality);
        
        const emergencySizeMB = (finalImage.length * 0.75) / (1024 * 1024);
        console.log('🔧 Chrome: Emergency compressed size:', Math.round(emergencySizeMB * 100) / 100, 'MB');
        
        // Final check - if still too large, apply absolute minimum quality
        if (emergencySizeMB > 1.2) {
          console.log('🔧 Chrome: Still too large - applying absolute minimum compression (5%)');
          finalImage = await this.compressImage(stitchedImage, 0.05);
          
          const finalSizeMB = (finalImage.length * 0.75) / (1024 * 1024);
          console.log('🔧 Chrome: Final absolute minimum size:', Math.round(finalSizeMB * 100) / 100, 'MB');
        }
      }
      
      console.log('Image compression completed');

      return {
        dataUrl: finalImage,
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
   * Firefox SIMPLE capture - exactly like visible area but multiple vertical sections
   */
  private static async captureVerticalOnlyFirefox(
    tabId: number,
    options: Required<CaptureOptions>,
    pageInfo: any,
    startTime: number
  ): Promise<CaptureResult> {
    console.log('🔧 Firefox: SIMPLE vertical sections - same as visible area capture');
    
    console.log('🔧 Firefox: Page dimensions:', {
      scrollWidth: pageInfo.scrollWidth,
      viewportWidth: pageInfo.viewportWidth,
      scrollHeight: pageInfo.scrollHeight,
      viewportHeight: pageInfo.viewportHeight
    });
    
    // Calculate vertical positions - same scroll logic as before
    const verticalPositions = this.calculateScrollPositions(
      pageInfo.scrollHeight,
      pageInfo.viewportHeight,
      options.maxHeight
    );
    
    console.log('🔧 Firefox: SIMPLE capture plan:', {
      verticalSections: verticalPositions.length,
      captureWidth: pageInfo.viewportWidth, // Use original viewport width
      totalHeight: pageInfo.scrollHeight,
      positions: verticalPositions
    });
    
    // Capture vertical screenshots - EXACTLY like visible area
    const screenshots: string[] = [];
    
    for (let i = 0; i < verticalPositions.length; i++) {
      const scrollY = verticalPositions[i];
      
      console.log(`🔧 Firefox: SIMPLE capture section ${i + 1}/${verticalPositions.length} at Y=${scrollY}`);
      
      // Scroll to position
      await this.scrollToPosition(tabId, scrollY, 0);
      await this.delay(options.scrollDelay);
      
      // Rate limiting
      if (i > 0) {
        await this.delay(600);
      }
      
      try {
        // EXACT SAME CAPTURE as visible area - this works perfectly!
        const screenshot = await extensionAPI.tabs.captureVisibleTab({
          format: options.format,
          quality: options.quality
        });
        
        screenshots.push(screenshot);
        
        console.log(`🔧 Firefox: SIMPLE section ${i + 1} captured successfully`);
      } catch (error) {
        console.error(`🔧 Firefox: SIMPLE capture failed section ${i + 1}:`, error);
        throw new Error(`Failed to capture section ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    // Restore original scroll position
    await this.scrollToPosition(tabId, pageInfo.originalScrollY, pageInfo.originalScrollX);
    
    // Stitch vertical screenshots - simple and clean
    console.log('🔧 Firefox: SIMPLE vertical stitching', screenshots.length, 'screenshots');
    const stitchedImage = await this.stitchFirefoxVertical(
      screenshots,
      pageInfo.viewportWidth, // Use original viewport width
      pageInfo.viewportHeight
    );
    
    // Ultra aggressive compression to stay under payload limits
    let compressionQuality = 0.4; // Much lower default
    
    if (screenshots.length > 15) {
      compressionQuality = 0.15; // Ultra aggressive for extremely long pages
      console.log('🔧 Firefox: Extremely long page detected - using ultra compression (15%)');
    } else if (screenshots.length > 10) {
      compressionQuality = 0.2; // Very aggressive for very long pages
      console.log('🔧 Firefox: Very long page detected - using aggressive compression (20%)');
    } else if (screenshots.length > 6) {
      compressionQuality = 0.3; // Aggressive compression for long pages
      console.log('🔧 Firefox: Long page detected - using aggressive compression (30%)');
    } else if (screenshots.length > 3) {
      compressionQuality = 0.35; // Medium compression for medium pages
      console.log('🔧 Firefox: Medium page detected - using medium compression (35%)');
    } else {
      console.log('🔧 Firefox: Short page - using standard compression (40%)');
    }
    
    const compressedImage = await this.compressImage(stitchedImage, compressionQuality);
    
    // Check final size and apply emergency compression if needed
    const imageSizeMB = (compressedImage.length * 0.75) / (1024 * 1024); // Rough estimate
    console.log('🔧 Firefox: Final image size estimate:', Math.round(imageSizeMB * 100) / 100, 'MB');
    
    let finalImage = compressedImage;
    
    if (imageSizeMB > 1.5) { // Very low threshold for emergency compression
      let emergencyQuality = 0.1; // Start with ultra aggressive compression
      
      if (imageSizeMB > 3) {
        emergencyQuality = 0.08; // Extreme compression for very large images
        console.log('🔧 Firefox: Image extremely large - applying extreme emergency compression (8%)');
      } else if (imageSizeMB > 2) {
        emergencyQuality = 0.09; // Ultra aggressive for large images
        console.log('🔧 Firefox: Image very large - applying ultra emergency compression (9%)');
      } else {
        console.log('🔧 Firefox: Image too large - applying emergency compression (10%)');
      }
      
      finalImage = await this.compressImage(stitchedImage, emergencyQuality);
      
      const emergencySizeMB = (finalImage.length * 0.75) / (1024 * 1024);
      console.log('🔧 Firefox: Emergency compressed size:', Math.round(emergencySizeMB * 100) / 100, 'MB');
      
      // Final check - if still too large, apply absolute minimum quality
      if (emergencySizeMB > 1.2) {
        console.log('🔧 Firefox: Still too large - applying absolute minimum compression (5%)');
        finalImage = await this.compressImage(stitchedImage, 0.05);
        
        const finalSizeMB = (finalImage.length * 0.75) / (1024 * 1024);
        console.log('🔧 Firefox: Final absolute minimum size:', Math.round(finalSizeMB * 100) / 100, 'MB');
      }
    }
    
    return {
      dataUrl: finalImage,
      width: pageInfo.viewportWidth, // Report original viewport width
      height: pageInfo.scrollHeight,
      scrollHeight: pageInfo.scrollHeight,
      captureTime: Date.now() - startTime,
    };
  }

  /**
   * Firefox GRID stitching - handles horizontal + vertical grid perfectly
   */
  private static async stitchFirefoxGrid(
    screenshots: Array<{dataUrl: string, x: number, y: number}>,
    totalWidth: number,
    totalHeight: number,
    viewportWidth: number,
    viewportHeight: number,
    verticalSections: number,
    horizontalSections: number
  ): Promise<string> {
    try {
      console.log('🔧 Firefox: BULLETPROOF grid stitching');
      console.log('🔧 Firefox: Grid dimensions:', {
        totalWidth,
        totalHeight,
        viewportWidth,
        viewportHeight,
        verticalSections,
        horizontalSections,
        totalScreenshots: screenshots.length
      });
      
      const canvas = new OffscreenCanvas(totalWidth, totalHeight);
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Failed to get OffscreenCanvas context');
      }
      
      // Calculate overlaps
      const verticalOverlap = Math.floor(viewportHeight * 0.1); // 90px
      const horizontalOverlap = Math.floor(viewportWidth * 0.1); // 128px
      
      console.log('🔧 Firefox: Grid overlaps:', {
        verticalOverlap,
        horizontalOverlap
      });
      
      // Sort screenshots by position for predictable processing
      screenshots.sort((a, b) => {
        if (a.y !== b.y) return a.y - b.y;
        return a.x - b.x;
      });
      
      // Process each screenshot in grid order
      for (let vIndex = 0; vIndex < verticalSections; vIndex++) {
        for (let hIndex = 0; hIndex < horizontalSections; hIndex++) {
          const screenshotIndex = vIndex * horizontalSections + hIndex;
          
          if (screenshotIndex >= screenshots.length) {
            console.warn(`🔧 Firefox: Missing screenshot at V${vIndex + 1}H${hIndex + 1}`);
            continue;
          }
          
          const screenshot = screenshots[screenshotIndex];
          
          console.log(`🔧 Firefox: Processing V${vIndex + 1}H${hIndex + 1} at (${screenshot.x}, ${screenshot.y})`);
          
          // Convert data URL to ImageBitmap
          const response = await fetch(screenshot.dataUrl);
          const blob = await response.blob();
          const imageBitmap = await createImageBitmap(blob);
          
          // Calculate destination position on canvas
          const destX = hIndex === 0 ? 0 : (viewportWidth - horizontalOverlap) * hIndex;
          const destY = vIndex === 0 ? 0 : (viewportHeight - verticalOverlap) * vIndex;
          
          // Calculate source area (skip overlaps for non-first sections)
          const sourceX = hIndex > 0 ? horizontalOverlap : 0;
          const sourceY = vIndex > 0 ? verticalOverlap : 0;
          const sourceWidth = hIndex > 0 ? viewportWidth - horizontalOverlap : viewportWidth;
          const sourceHeight = vIndex > 0 ? viewportHeight - verticalOverlap : viewportHeight;
          
          console.log(`🔧 Firefox: V${vIndex + 1}H${hIndex + 1} -> Canvas(${destX}, ${destY}) from Source(${sourceX}, ${sourceY}, ${sourceWidth}x${sourceHeight})`);
          
          // Draw the image section
          ctx.drawImage(
            imageBitmap,
            sourceX, sourceY, sourceWidth, sourceHeight, // Source rectangle
            destX, destY, sourceWidth, sourceHeight       // Destination rectangle
          );
          
          // Clean up
          imageBitmap.close();
        }
      }
      
      console.log('🔧 Firefox: BULLETPROOF grid stitching completed');
      
      // Convert to data URL
      const blob = await canvas.convertToBlob({ type: 'image/png' });
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to convert blob to data URL'));
        reader.readAsDataURL(blob);
      });
      
    } catch (error) {
      console.error('🔧 Firefox: BULLETPROOF grid stitching failed:', error);
      // Fallback: return first screenshot
      return screenshots[0]?.dataUrl || '';
    }
  }

  /**
   * DEAD SIMPLE vertical stitching - just stack images with NO width changes
   */
  private static async stitchFirefoxVertical(
    screenshots: string[],
    width: number,
    viewportHeight: number
  ): Promise<string> {
    try {
      console.log('🔧 Firefox: DEAD SIMPLE vertical stacking - NO width manipulation');
      
      if (screenshots.length === 0) {
        throw new Error('No screenshots to stitch');
      }
      
      if (screenshots.length === 1) {
        console.log('🔧 Firefox: Single screenshot, returning as-is');
        return screenshots[0];
      }
      
      // Get actual dimensions from first screenshot
      const firstResponse = await fetch(screenshots[0]);
      const firstBlob = await firstResponse.blob();
      const firstImage = await createImageBitmap(firstBlob);
      
      const actualWidth = firstImage.naturalWidth || firstImage.width;
      const actualHeight = firstImage.naturalHeight || firstImage.height;
      
      console.log('🔧 Firefox: Actual screenshot dimensions:', {
        actualWidth,
        actualHeight,
        providedWidth: width,
        providedHeight: viewportHeight,
        screenshots: screenshots.length
      });
      
      // Calculate total height - simple stacking with 10% overlap removal
      const overlapPixels = Math.floor(actualHeight * 0.1);
      const sectionHeight = actualHeight - overlapPixels;
      const totalHeight = actualHeight + (sectionHeight * (screenshots.length - 1));
      
      console.log('🔧 Firefox: SIMPLE stacking plan:', {
        actualWidth,
        totalHeight,
        overlapPixels,
        sectionHeight,
        sections: screenshots.length
      });
      
      // Create canvas with ACTUAL screenshot dimensions
      const canvas = new OffscreenCanvas(actualWidth, totalHeight);
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Failed to get OffscreenCanvas context');
      }
      
      let currentY = 0;
      
      for (let i = 0; i < screenshots.length; i++) {
        const screenshot = screenshots[i];
        
        // Convert data URL to ImageBitmap
        const response = await fetch(screenshot);
        const blob = await response.blob();
        const imageBitmap = await createImageBitmap(blob);
        
        console.log(`🔧 Firefox: SIMPLE stacking section ${i + 1} at Y=${currentY}`);
        
        if (i === 0) {
          // First image - draw completely at Y=0
          ctx.drawImage(imageBitmap, 0, 0);
          currentY = actualHeight;
        } else {
          // Subsequent images - skip overlap from top, draw at currentY - overlapPixels
          const drawY = currentY - overlapPixels;
          ctx.drawImage(
            imageBitmap,
            0, overlapPixels, // Source: skip overlap from top
            imageBitmap.width, imageBitmap.height - overlapPixels, // Source dimensions
            0, drawY, // Destination
            imageBitmap.width, imageBitmap.height - overlapPixels // Destination dimensions
          );
          currentY += (imageBitmap.height - overlapPixels);
        }
        
        // Clean up
        imageBitmap.close();
      }
      
      // Clean up first image
      firstImage.close();
      
      console.log('🔧 Firefox: SIMPLE stacking completed - final size:', actualWidth, 'x', totalHeight);
      
      // Convert to data URL
      const blob = await canvas.convertToBlob({ type: 'image/png' });
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to convert blob to data URL'));
        reader.readAsDataURL(blob);
      });
      
    } catch (error) {
      console.error('🔧 Firefox: SIMPLE stacking failed:', error);
      // Fallback: return first screenshot
      return screenshots[0] || '';
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
    
    // Use percentage-based overlap to match stitching logic
    const overlap = Math.floor(viewportHeight * 0.1); // 10% overlap to match stitching
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
    
    console.log('🔧 Calculating horizontal positions:', { scrollWidth, viewportWidth });
    
    // Always start at 0
    positions.push(0);
    
    // If content is wider than viewport, calculate overlapping positions
    if (scrollWidth > viewportWidth) {
      // Calculate how much we need to scroll to capture remaining width
      // We want overlap, not gaps!
      const overlap = Math.floor(viewportWidth * 0.1); // 10% overlap
      const step = viewportWidth - overlap;
      
      let currentPos = 0;
      while (currentPos + viewportWidth < scrollWidth) {
        currentPos += step;
        if (currentPos > 0 && !positions.includes(currentPos)) {
          positions.push(currentPos);
        }
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
      
      console.log('🔧 Stitching with standard overlaps:', {
        verticalOverlap,
        horizontalOverlap,
        viewportWidth,
        viewportHeight
      });

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
      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      // Create ImageBitmap (works in service workers, unlike Image())
      const imageBitmap = await createImageBitmap(blob);

      // Create canvas for compression
      const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Failed to get canvas context for compression');
      }

      // Draw image to canvas
      ctx.drawImage(imageBitmap, 0, 0);

      // Convert to compressed JPEG
      const compressedBlob = await canvas.convertToBlob({
        type: 'image/jpeg',
        quality: quality
      });

      // Convert blob back to data URL
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(compressedBlob);
      });
    } catch (error) {
      console.error('Image compression failed:', error);
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
