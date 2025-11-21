/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// ./src/utils/supabase.ts
// Supabase client for browser extension
// SECURITY NOTE: Extension does NOT include Supabase credentials
// All authentication and data operations go through the web app's API
// Firefox compatibility layer
const extensionAPI = typeof browser !== 'undefined' ? browser : chrome;
// Get the API base URL based on environment
const API_BASE_URL =  true
    ? 'https://pagestash.app'
    : 0;
// Extension-specific auth helpers
class ExtensionAuth {
    static async signIn(email, password) {
        console.log('🔐 ExtensionAuth.signIn called for:', email);
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            const result = await response.json();
            if (!response.ok) {
                console.error('🔐 Login error:', result.error);
                return { data: null, error: { message: result.error } };
            }
            console.log('🔐 Login successful:', {
                hasSession: !!result.session,
                hasUser: !!result.user,
            });
            if (result.session) {
                console.log('🔐 Storing session in extension storage');
                // Store session in extension storage
                await extensionAPI.storage.local.set({
                    authToken: result.session.access_token,
                    refreshToken: result.session.refresh_token,
                    userEmail: result.user?.email,
                    userId: result.user?.id,
                });
            }
            return {
                data: {
                    session: result.session,
                    user: result.user
                },
                error: null
            };
        }
        catch (err) {
            console.error('🔐 Login request failed:', err);
            return {
                data: null,
                error: { message: err.message || 'Network error' }
            };
        }
    }
    static async signUp(email, password, fullName) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, fullName }),
            });
            const result = await response.json();
            if (!response.ok) {
                console.error('🔐 Signup error:', result.error);
                return { data: null, error: { message: result.error } };
            }
            if (result.session) {
                // Store session in extension storage
                await extensionAPI.storage.local.set({
                    authToken: result.session.access_token,
                    refreshToken: result.session.refresh_token,
                    userEmail: result.user?.email,
                    userId: result.user?.id,
                });
            }
            return {
                data: {
                    session: result.session,
                    user: result.user
                },
                error: null
            };
        }
        catch (err) {
            console.error('🔐 Signup request failed:', err);
            return {
                data: null,
                error: { message: err.message || 'Network error' }
            };
        }
    }
    static async signOut() {
        // Just clear local storage - no need to call API for logout
        await extensionAPI.storage.local.remove([
            'authToken',
            'refreshToken',
            'userEmail',
            'userId',
        ]);
        console.log('🔐 Signed out and cleared local storage');
        return { error: null };
    }
    static async restoreSession() {
        try {
            const stored = await new Promise((resolve) => {
                extensionAPI.storage.local.get(['authToken', 'refreshToken', 'userId', 'userEmail'], (result) => {
                    resolve({
                        authToken: result.authToken || null,
                        refreshToken: result.refreshToken || null,
                        userId: result.userId || null,
                        userEmail: result.userEmail || null,
                    });
                });
            });
            // No stored session
            if (!stored.authToken) {
                console.log('🔐 No stored session found');
                return false;
            }
            console.log('🔐 Session found for user:', stored.userEmail);
            // Token validation will happen when making actual API calls
            // The API will return 401 if token is invalid, and we'll handle it there
            return true;
        }
        catch (err) {
            console.error('🔐 Session restoration error:', err);
            await this.signOut();
            return false;
        }
    }
    static async getSession() {
        // Get session from local storage
        return new Promise((resolve) => {
            extensionAPI.storage.local.get(['authToken', 'userId'], (result) => {
                resolve({
                    token: result.authToken || null,
                    userId: result.userId || null,
                });
            });
        });
    }
    static async refreshSession() {
        // For now, we don't implement token refresh
        // The API will handle token validation and return 401 if expired
        // In that case, user will need to sign in again
        console.log('🔐 Token refresh not implemented - user will need to sign in again if token expires');
        return { data: null, error: new Error('Token refresh not implemented') };
    }
}
// API helpers for extension
class ExtensionAPI {
    // Get the correct API base URL based on environment
    static getApiBaseUrl() {
        // In production, use the deployed web app URL
        // In development, use localhost
        return API_BASE_URL;
    }
    // Helper method to make authenticated requests with automatic retry
    static async authenticatedFetch(url, options = {}) {
        // Ensure session is valid before API call
        await ExtensionAuth.restoreSession();
        const { token } = await ExtensionAuth.getSession();
        if (!token) {
            throw new Error('Not authenticated');
        }
        // Make first request
        let response = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${token}`,
            },
        });
        // Handle 401 - token might have expired mid-request
        if (response.status === 401) {
            console.log('Token expired, refreshing and retrying...');
            await ExtensionAuth.refreshSession();
            // Retry with new token
            const { token: newToken } = await ExtensionAuth.getSession();
            if (!newToken) {
                throw new Error('Authentication failed after refresh');
            }
            response = await fetch(url, {
                ...options,
                headers: {
                    ...options.headers,
                    'Authorization': `Bearer ${newToken}`,
                },
            });
        }
        return response;
    }
    static async saveClip(clipData) {
        const apiUrl = `${this.getApiBaseUrl()}/api/clips`;
        console.log('Saving clip to API endpoint:', apiUrl);
        const response = await this.authenticatedFetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(clipData),
        });
        console.log('API response status:', response.status);
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API error response:', errorText);
            let error;
            try {
                error = JSON.parse(errorText);
            }
            catch {
                error = { error: errorText || 'Failed to save clip' };
            }
            throw new Error(error.error || 'Failed to save clip');
        }
        const result = await response.json();
        console.log('Clip saved successfully:', result);
        return result;
    }
    static async getClips(params) {
        const searchParams = new URLSearchParams();
        if (params?.limit)
            searchParams.set('limit', params.limit.toString());
        if (params?.offset)
            searchParams.set('offset', params.offset.toString());
        if (params?.folder_id)
            searchParams.set('folder_id', params.folder_id);
        if (params?.q)
            searchParams.set('q', params.q);
        const response = await this.authenticatedFetch(`${this.getApiBaseUrl()}/api/clips?${searchParams}`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch clips');
        }
        return response.json();
    }
    static async getFolders() {
        const response = await this.authenticatedFetch(`${this.getApiBaseUrl()}/api/folders`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch folders');
        }
        return response.json();
    }
    static async getUsage() {
        const response = await this.authenticatedFetch(`${this.getApiBaseUrl()}/api/usage`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch usage data');
        }
        return response.json();
    }
    static async createFolder(folderData) {
        const response = await this.authenticatedFetch(`${this.getApiBaseUrl()}/api/folders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(folderData),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create folder');
        }
        const result = await response.json();
        return result.folder;
    }
}

;// ./src/utils/fullPageCapture.ts
/**
 * Full-page screenshot capture utility
 * Captures entire webpage by scrolling and stitching screenshots
 */
// Firefox compatibility layer
const fullPageCapture_extensionAPI = typeof browser !== 'undefined' ? browser : chrome;
class FullPageCapture {
    /**
     * Capture full page screenshot by scrolling and stitching
     */
    static async captureFullPage(tabId, options = {}) {
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
            // Only do horizontal capture if page is SIGNIFICANTLY wider (50%+ wider)
            // Most responsive sites (like Reddit) don't need horizontal capture
            const needsHorizontalScroll = pageInfo.scrollWidth >= pageInfo.viewportWidth * 1.5;
            const finalNeedsHorizontalScroll = needsHorizontalScroll;
            console.log('🔧 Horizontal scroll analysis:', {
                scrollWidth: pageInfo.scrollWidth,
                viewportWidth: pageInfo.viewportWidth,
                ratio: pageInfo.scrollWidth / pageInfo.viewportWidth,
                needsHorizontalScroll,
                finalNeedsHorizontalScroll
            });
            // Calculate scroll positions for both dimensions
            const verticalPositions = this.calculateScrollPositions(pageInfo.scrollHeight, pageInfo.viewportHeight, opts.maxHeight);
            const horizontalPositions = finalNeedsHorizontalScroll
                ? this.calculateHorizontalScrollPositions(pageInfo.scrollWidth, pageInfo.viewportWidth)
                : [0];
            // Capture each section (grid of horizontal x vertical positions)
            const screenshots = [];
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
                    }
                    catch (e) {
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
                        screenshots.push({ dataUrl: screenshot, x: scrollX, y: scrollY });
                        // Small delay after successful capture
                        if (sectionIndex < totalSections) {
                            await this.delay(150);
                        }
                    }
                    catch (error) {
                        console.error(`Failed to capture section ${sectionIndex}:`, error);
                        throw new Error(`Failed to capture section ${sectionIndex}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    }
                }
            }
            // Restore original scroll position
            await this.scrollToPosition(tabId, pageInfo.originalScrollY, pageInfo.originalScrollX);
            // Stitch screenshots together
            console.log('Starting image stitching...');
            // Calculate actual canvas dimensions based on how we'll stitch
            const overlap = Math.floor(pageInfo.viewportHeight * 0.1);
            const horizontalOverlap = Math.floor(pageInfo.viewportWidth * 0.1);
            // Calculate final stitched dimensions
            const stitchedWidth = horizontalPositions.length === 1
                ? pageInfo.viewportWidth
                : pageInfo.viewportWidth + ((horizontalPositions.length - 1) * (pageInfo.viewportWidth - horizontalOverlap));
            const stitchedHeight = verticalPositions.length === 1
                ? pageInfo.viewportHeight
                : pageInfo.viewportHeight + ((verticalPositions.length - 1) * (pageInfo.viewportHeight - overlap));
            console.log('Stitching parameters:', {
                screenshotCount: screenshots.length,
                stitchedWidth,
                stitchedHeight,
                viewportWidth: pageInfo.viewportWidth,
                viewportHeight: pageInfo.viewportHeight,
                verticalSections: verticalPositions.length,
                horizontalSections: horizontalPositions.length,
                overlap,
                horizontalOverlap,
                screenshotPositions: screenshots.map(s => ({ x: s.x, y: s.y }))
            });
            const stitchedImage = await this.stitchGridScreenshots(screenshots, stitchedWidth, stitchedHeight, pageInfo.viewportWidth, pageInfo.viewportHeight);
            console.log('Image stitching completed');
            // Compress the image for API upload to avoid payload size limits
            console.log('Compressing image for API upload...');
            // Ultra aggressive compression based on number of sections
            let compressionQuality = 0.4; // Much lower default
            if (screenshots.length > 15) {
                compressionQuality = 0.15; // Ultra aggressive for extremely long pages
                console.log('🔧 Chrome: Extremely long page detected - using ultra compression (15%)');
            }
            else if (screenshots.length > 10) {
                compressionQuality = 0.2; // Very aggressive for very long pages
                console.log('🔧 Chrome: Very long page detected - using aggressive compression (20%)');
            }
            else if (screenshots.length > 6) {
                compressionQuality = 0.3; // Aggressive compression for long pages
                console.log('🔧 Chrome: Long page detected - using aggressive compression (30%)');
            }
            else if (screenshots.length > 3) {
                compressionQuality = 0.35; // Medium compression for medium pages
                console.log('🔧 Chrome: Medium page detected - using medium compression (35%)');
            }
            else {
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
                }
                else if (imageSizeMB > 2) {
                    emergencyQuality = 0.09; // Ultra aggressive for large images
                    console.log('🔧 Chrome: Image very large - applying ultra emergency compression (9%)');
                }
                else {
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
                width: stitchedWidth,
                height: stitchedHeight,
                scrollHeight: pageInfo.scrollHeight,
                captureTime: Date.now() - startTime,
            };
        }
        catch (error) {
            console.error('Full page capture failed:', error);
            throw new Error(`Full page capture failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Firefox SIMPLE capture - exactly like visible area but multiple vertical sections
     */
    static async captureVerticalOnlyFirefox(tabId, options, pageInfo, startTime) {
        console.log('🔧 Firefox: SIMPLE vertical sections - same as visible area capture');
        console.log('🔧 Firefox: Page dimensions:', {
            scrollWidth: pageInfo.scrollWidth,
            viewportWidth: pageInfo.viewportWidth,
            scrollHeight: pageInfo.scrollHeight,
            viewportHeight: pageInfo.viewportHeight
        });
        // Calculate vertical positions - same scroll logic as before
        const verticalPositions = this.calculateScrollPositions(pageInfo.scrollHeight, pageInfo.viewportHeight, options.maxHeight);
        console.log('🔧 Firefox: SIMPLE capture plan:', {
            verticalSections: verticalPositions.length,
            captureWidth: pageInfo.viewportWidth, // Use original viewport width
            totalHeight: pageInfo.scrollHeight,
            positions: verticalPositions
        });
        // Capture vertical screenshots - EXACTLY like visible area
        const screenshots = [];
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
                const screenshot = await fullPageCapture_extensionAPI.tabs.captureVisibleTab({
                    format: options.format,
                    quality: options.quality
                });
                screenshots.push(screenshot);
                console.log(`🔧 Firefox: SIMPLE section ${i + 1} captured successfully`);
            }
            catch (error) {
                console.error(`🔧 Firefox: SIMPLE capture failed section ${i + 1}:`, error);
                throw new Error(`Failed to capture section ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
        // Restore original scroll position
        await this.scrollToPosition(tabId, pageInfo.originalScrollY, pageInfo.originalScrollX);
        // Stitch vertical screenshots - simple and clean
        console.log('🔧 Firefox: SIMPLE vertical stitching', screenshots.length, 'screenshots');
        const stitchedImage = await this.stitchFirefoxVertical(screenshots, pageInfo.viewportWidth, // Use original viewport width
        pageInfo.viewportHeight);
        // Ultra aggressive compression to stay under payload limits
        let compressionQuality = 0.4; // Much lower default
        if (screenshots.length > 15) {
            compressionQuality = 0.15; // Ultra aggressive for extremely long pages
            console.log('🔧 Firefox: Extremely long page detected - using ultra compression (15%)');
        }
        else if (screenshots.length > 10) {
            compressionQuality = 0.2; // Very aggressive for very long pages
            console.log('🔧 Firefox: Very long page detected - using aggressive compression (20%)');
        }
        else if (screenshots.length > 6) {
            compressionQuality = 0.3; // Aggressive compression for long pages
            console.log('🔧 Firefox: Long page detected - using aggressive compression (30%)');
        }
        else if (screenshots.length > 3) {
            compressionQuality = 0.35; // Medium compression for medium pages
            console.log('🔧 Firefox: Medium page detected - using medium compression (35%)');
        }
        else {
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
            }
            else if (imageSizeMB > 2) {
                emergencyQuality = 0.09; // Ultra aggressive for large images
                console.log('🔧 Firefox: Image very large - applying ultra emergency compression (9%)');
            }
            else {
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
    static async stitchFirefoxGrid(screenshots, totalWidth, totalHeight, viewportWidth, viewportHeight, verticalSections, horizontalSections) {
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
                if (a.y !== b.y)
                    return a.y - b.y;
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
                    ctx.drawImage(imageBitmap, sourceX, sourceY, sourceWidth, sourceHeight, // Source rectangle
                    destX, destY, sourceWidth, sourceHeight // Destination rectangle
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
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => reject(new Error('Failed to convert blob to data URL'));
                reader.readAsDataURL(blob);
            });
        }
        catch (error) {
            console.error('🔧 Firefox: BULLETPROOF grid stitching failed:', error);
            // Fallback: return first screenshot
            return screenshots[0]?.dataUrl || '';
        }
    }
    /**
     * DEAD SIMPLE vertical stitching - just stack images with NO width changes
     */
    static async stitchFirefoxVertical(screenshots, width, viewportHeight) {
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
                }
                else {
                    // Subsequent images - skip overlap from top, draw at currentY - overlapPixels
                    const drawY = currentY - overlapPixels;
                    ctx.drawImage(imageBitmap, 0, overlapPixels, // Source: skip overlap from top
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
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => reject(new Error('Failed to convert blob to data URL'));
                reader.readAsDataURL(blob);
            });
        }
        catch (error) {
            console.error('🔧 Firefox: SIMPLE stacking failed:', error);
            // Fallback: return first screenshot
            return screenshots[0] || '';
        }
    }
    /**
     * Get page information needed for capture
     */
    static async getPageInfo(tabId) {
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
            }
            catch (e) {
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
                scrollHeight: Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight),
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
    static calculateScrollPositions(scrollHeight, viewportHeight, maxHeight) {
        const positions = [];
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
    static calculateHorizontalScrollPositions(scrollWidth, viewportWidth) {
        const positions = [];
        console.log('🔧 Calculating horizontal positions:', { scrollWidth, viewportWidth });
        // Always start at 0
        positions.push(0);
        // If content is wider than viewport, calculate overlapping positions
        if (scrollWidth > viewportWidth) {
            // Calculate how much we need to scroll to capture remaining width
            const overlap = Math.floor(viewportWidth * 0.1); // 10% overlap
            const step = viewportWidth - overlap;
            let currentPos = 0;
            while (currentPos + viewportWidth < scrollWidth) {
                currentPos += step;
                if (currentPos > 0 && !positions.includes(currentPos)) {
                    positions.push(currentPos);
                }
            }
            // Add the rightmost position ONLY if it's further right than our last position
            const rightmostPosition = Math.max(0, scrollWidth - viewportWidth);
            const lastPosition = positions[positions.length - 1];
            // Only add rightmost if it's significantly different from the last position
            // and it's actually to the right of where we are
            if (rightmostPosition > lastPosition && (rightmostPosition - lastPosition) > (viewportWidth * 0.2)) {
                positions.push(rightmostPosition);
            }
        }
        console.log('🔧 Horizontal positions calculated:', positions);
        return positions;
    }
    /**
     * Scroll to specific position
     */
    static async scrollToPosition(tabId, scrollY, scrollX = 0) {
        await this.executeScript(tabId, (x, y) => {
            window.scrollTo(x, y);
        }, [scrollX, scrollY]);
    }
    /**
     * Capture visible area (fallback for single-viewport pages)
     */
    static async captureVisibleArea(tabId, options, pageInfo, startTime) {
        const screenshot = await fullPageCapture_extensionAPI.tabs.captureVisibleTab({
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
    static async stitchScreenshots(screenshots, width, viewportHeight, scrollPositions) {
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
                }
                else {
                    // Subsequent images - calculate overlap and draw only new content
                    const prevY = scrollPositions[i - 1];
                    const overlap = (prevY + viewportHeight) - scrollY;
                    if (overlap > 0) {
                        // Draw only the non-overlapping part
                        ctx.drawImage(imageBitmap, 0, overlap, // Source x, y
                        imageBitmap.width, imageBitmap.height - overlap, // Source width, height
                        0, scrollY + overlap, // Dest x, y
                        imageBitmap.width, imageBitmap.height - overlap // Dest width, height
                        );
                    }
                    else {
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
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => reject(new Error('Failed to convert blob to data URL'));
                reader.readAsDataURL(blob);
            });
        }
        catch (error) {
            console.error('Stitching failed:', error);
            // Fallback: return the first screenshot if stitching fails
            return screenshots[0] || '';
        }
    }
    /**
     * Stitch grid of screenshots into single image using OffscreenCanvas
     */
    static async stitchGridScreenshots(screenshots, totalWidth, totalHeight, viewportWidth, viewportHeight) {
        try {
            console.log('Stitching grid screenshots:', {
                totalScreenshots: screenshots.length,
                totalWidth,
                totalHeight,
                viewportWidth,
                viewportHeight
            });
            // Detect device pixel ratio from first screenshot
            const firstResponse = await fetch(screenshots[0].dataUrl);
            const firstBlob = await firstResponse.blob();
            const firstImage = await createImageBitmap(firstBlob);
            const actualWidth = firstImage.width;
            const actualHeight = firstImage.height;
            const devicePixelRatio = actualWidth / viewportWidth;
            console.log('🔧 Device pixel ratio detected:', {
                logicalViewport: `${viewportWidth}x${viewportHeight}`,
                actualScreenshot: `${actualWidth}x${actualHeight}`,
                devicePixelRatio
            });
            firstImage.close();
            // Scale all dimensions by device pixel ratio
            const scaledTotalWidth = Math.round(totalWidth * devicePixelRatio);
            const scaledTotalHeight = Math.round(totalHeight * devicePixelRatio);
            const scaledViewportWidth = Math.round(viewportWidth * devicePixelRatio);
            const scaledViewportHeight = Math.round(viewportHeight * devicePixelRatio);
            // Use OffscreenCanvas for service worker compatibility
            const canvas = new OffscreenCanvas(scaledTotalWidth, scaledTotalHeight);
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('Failed to get OffscreenCanvas context');
            }
            // Sort screenshots by position (top-to-bottom, left-to-right)
            screenshots.sort((a, b) => {
                if (a.y !== b.y)
                    return a.y - b.y;
                return a.x - b.x;
            });
            // Calculate overlap amounts (10% of viewport, scaled by DPR)
            const verticalOverlap = Math.floor(scaledViewportHeight * 0.1);
            const horizontalOverlap = Math.floor(scaledViewportWidth * 0.1);
            console.log('🔧 Stitching with overlaps (scaled for DPR):', {
                verticalOverlap,
                horizontalOverlap,
                scaledViewportWidth,
                scaledViewportHeight,
                scaledTotalWidth,
                scaledTotalHeight,
                devicePixelRatio
            });
            // Group screenshots by rows
            const rows = new Map();
            screenshots.forEach(screenshot => {
                if (!rows.has(screenshot.y)) {
                    rows.set(screenshot.y, []);
                }
                rows.get(screenshot.y).push(screenshot);
            });
            // Process each row
            const sortedRowKeys = Array.from(rows.keys()).sort((a, b) => a - b);
            let currentCanvasY = 0;
            for (let rowIndex = 0; rowIndex < sortedRowKeys.length; rowIndex++) {
                const rowY = sortedRowKeys[rowIndex];
                const rowScreenshots = rows.get(rowY);
                // Sort screenshots in this row by x position
                rowScreenshots.sort((a, b) => a.x - b.x);
                let currentCanvasX = 0;
                let rowHeight = 0;
                for (let colIndex = 0; colIndex < rowScreenshots.length; colIndex++) {
                    const screenshot = rowScreenshots[colIndex];
                    console.log(`🔧 Processing screenshot at scroll position (${screenshot.x}, ${screenshot.y}), row ${rowIndex}, col ${colIndex}`);
                    // Convert data URL to ImageBitmap
                    const response = await fetch(screenshot.dataUrl);
                    const blob = await response.blob();
                    const imageBitmap = await createImageBitmap(blob);
                    // Calculate source rectangle (what to copy from the screenshot)
                    let sourceX = 0;
                    let sourceY = 0;
                    let sourceWidth = imageBitmap.width;
                    let sourceHeight = imageBitmap.height;
                    // For non-first columns, skip the horizontal overlap from the left
                    if (colIndex > 0) {
                        sourceX = horizontalOverlap;
                        sourceWidth -= horizontalOverlap;
                    }
                    // For non-first rows, skip the vertical overlap from the top
                    if (rowIndex > 0) {
                        sourceY = verticalOverlap;
                        sourceHeight -= verticalOverlap;
                    }
                    // Calculate destination position on canvas
                    const destX = currentCanvasX;
                    const destY = currentCanvasY;
                    console.log(`🔧 Drawing: source(${sourceX}, ${sourceY}, ${sourceWidth}x${sourceHeight}) -> canvas(${destX}, ${destY}, ${sourceWidth}x${sourceHeight})`);
                    // Draw the non-overlapping portion
                    ctx.drawImage(imageBitmap, sourceX, sourceY, sourceWidth, sourceHeight, // Source rectangle (skip overlaps)
                    destX, destY, sourceWidth, sourceHeight // Destination rectangle
                    );
                    // Update canvas X position for next column
                    currentCanvasX += sourceWidth;
                    // Track row height (use the full height minus overlap for first screenshot in row)
                    if (colIndex === 0) {
                        rowHeight = sourceHeight;
                    }
                    // Clean up ImageBitmap to free memory
                    imageBitmap.close();
                }
                // Update canvas Y position for next row
                currentCanvasY += rowHeight;
            }
            console.log('🔧 Grid stitching completed successfully');
            // Convert to blob and then to data URL
            const blob = await canvas.convertToBlob({ type: 'image/png' });
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => reject(new Error('Failed to convert blob to data URL'));
                reader.readAsDataURL(blob);
            });
        }
        catch (error) {
            console.error('Grid stitching failed:', error);
            // Fallback: return the first screenshot if stitching fails
            return screenshots[0]?.dataUrl || '';
        }
    }
    /**
     * Capture with retry logic for rate limiting and permissions
     */
    static async captureWithRetry(format, quality, maxRetries) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                // Check permissions before attempting capture
                if (!fullPageCapture_extensionAPI.tabs || typeof fullPageCapture_extensionAPI.tabs.captureVisibleTab !== 'function') {
                    throw new Error('Chrome tabs API not available');
                }
                const screenshot = await fullPageCapture_extensionAPI.tabs.captureVisibleTab({
                    format,
                    quality,
                });
                return screenshot;
            }
            catch (error) {
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
    static delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Execute script with browser compatibility
     */
    static async executeScript(tabId, func, args) {
        if (fullPageCapture_extensionAPI?.scripting && typeof fullPageCapture_extensionAPI.scripting.executeScript === 'function') {
            // Chrome Manifest V3 approach
            console.log('🔧 Using scripting.executeScript (Chrome)');
            const results = await fullPageCapture_extensionAPI.scripting.executeScript({
                target: { tabId },
                func,
                args
            });
            return results.map(result => result.result);
        }
        else if (fullPageCapture_extensionAPI?.tabs && typeof fullPageCapture_extensionAPI.tabs.executeScript === 'function') {
            // Firefox Manifest V2 approach
            console.log('🔧 Using tabs.executeScript (Firefox)');
            return new Promise((resolve, reject) => {
                const code = args ? `(${func.toString()})(${args.map(arg => JSON.stringify(arg)).join(', ')})` : `(${func.toString()})()`;
                fullPageCapture_extensionAPI.tabs.executeScript(tabId, { code }, (results) => {
                    if (fullPageCapture_extensionAPI.runtime.lastError) {
                        reject(new Error(fullPageCapture_extensionAPI.runtime.lastError.message));
                    }
                    else {
                        resolve(results || []);
                    }
                });
            });
        }
        else {
            throw new Error('No script execution API available');
        }
    }
    /**
     * Firefox stitching with proper overlap handling
     */
    static async stitchFirefoxScreenshotsWithOverlap(screenshots, width, viewportHeight, totalHeight, scrollPositions, overlap) {
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
                }
                else {
                    // Subsequent images - handle overlap
                    const prevScrollY = scrollPositions[i - 1];
                    const expectedOverlap = Math.max(0, (prevScrollY + viewportHeight) - scrollY);
                    const sourceY = Math.min(expectedOverlap, overlap);
                    const sourceHeight = viewportHeight - sourceY;
                    const destY = scrollY + sourceY;
                    if (sourceHeight > 0 && destY < totalHeight) {
                        const finalHeight = Math.min(sourceHeight, totalHeight - destY);
                        ctx.drawImage(imageBitmap, 0, sourceY, width, finalHeight, // Source
                        0, destY, width, finalHeight // Destination
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
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        }
        catch (error) {
            console.error('🔧 Firefox stitching failed:', error);
            // Fallback to first screenshot
            return screenshots[0] || '';
        }
    }
    /**
     * Compress image to reduce payload size for API upload
     */
    static async compressImage(dataUrl, quality = 0.7) {
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
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(compressedBlob);
            });
        }
        catch (error) {
            console.error('Image compression failed:', error);
            return dataUrl; // Fallback to original if compression fails
        }
    }
    /**
     * Check if full page capture is supported
     */
    static isSupported() {
        console.log('🔧 Checking FullPageCapture support...');
        console.log('🔧 extensionAPI available:', !!fullPageCapture_extensionAPI);
        console.log('🔧 tabs API available:', !!fullPageCapture_extensionAPI?.tabs);
        console.log('🔧 captureVisibleTab available:', typeof fullPageCapture_extensionAPI?.tabs?.captureVisibleTab === 'function');
        console.log('🔧 scripting API available:', !!fullPageCapture_extensionAPI?.scripting);
        console.log('🔧 executeScript available:', typeof fullPageCapture_extensionAPI?.scripting?.executeScript === 'function');
        console.log('🔧 tabs.executeScript available:', typeof fullPageCapture_extensionAPI?.tabs?.executeScript === 'function');
        // Firefox uses tabs.executeScript (Manifest V2), Chrome uses scripting.executeScript (Manifest V3)
        const hasScriptExecution = !!((fullPageCapture_extensionAPI?.scripting && typeof fullPageCapture_extensionAPI.scripting.executeScript === 'function') ||
            (fullPageCapture_extensionAPI?.tabs && typeof fullPageCapture_extensionAPI.tabs.executeScript === 'function'));
        const isSupported = !!(fullPageCapture_extensionAPI &&
            fullPageCapture_extensionAPI.tabs &&
            typeof fullPageCapture_extensionAPI.tabs.captureVisibleTab === 'function' &&
            hasScriptExecution);
        console.log('🔧 hasScriptExecution:', hasScriptExecution);
        console.log('🔧 FullPageCapture isSupported:', isSupported);
        return isSupported;
    }
}
FullPageCapture.DEFAULT_OPTIONS = {
    quality: 90,
    format: 'png',
    maxHeight: 32767, // Maximum canvas height in most browsers
    scrollDelay: 1000, // More conservative delay to respect Chrome's rate limits
};

;// ./src/background/index.ts
// PageStash Extension Background Script
// Service Worker for Manifest V3


// Debug mode - set to true for verbose logging
const DEBUG = false;
const log = (...args) => {
    if (DEBUG)
        console.log(...args);
};
console.log('PageStash background script loaded');
// Firefox compatibility layer
const background_extensionAPI = typeof browser !== 'undefined' ? browser : chrome;
// Session monitor state
let sessionRefreshInterval = null;
// Handle extension installation
background_extensionAPI.runtime.onInstalled.addListener((details) => {
    console.log('PageStash extension installed:', details.reason);
    if (details.reason === 'install') {
        // Set up initial extension state
        background_extensionAPI.storage.local.set({
            isFirstRun: true,
            captureCount: 0,
        });
    }
    // Restore session on installation
    ExtensionAuth.restoreSession().then(() => {
        startSessionMonitor();
    });
});
// Restore session on browser startup
if (background_extensionAPI.runtime.onStartup) {
    background_extensionAPI.runtime.onStartup.addListener(async () => {
        console.log('🔐 Extension startup - restoring session');
        await ExtensionAuth.restoreSession();
        startSessionMonitor();
    });
}
// Session monitor - checks if session exists
function startSessionMonitor() {
    // Clear existing interval
    if (sessionRefreshInterval) {
        clearInterval(sessionRefreshInterval);
    }
    // Check session every 5 minutes
    sessionRefreshInterval = setInterval(async () => {
        try {
            const { token } = await ExtensionAuth.getSession();
            if (token) {
                console.log('🔐 Session is active');
                // Token validation happens on API calls
                // If token is expired, API will return 401 and user will need to sign in again
            }
            else {
                console.log('🔐 No active session');
            }
        }
        catch (error) {
            console.error('Session monitor error:', error);
        }
    }, 5 * 60 * 1000); // Every 5 minutes
    console.log('🔐 Session monitor started');
}
// Stop monitor on shutdown
if (background_extensionAPI.runtime.onSuspend) {
    background_extensionAPI.runtime.onSuspend.addListener(() => {
        console.log('🔐 Stopping session monitor');
        if (sessionRefreshInterval) {
            clearInterval(sessionRefreshInterval);
        }
    });
}
// Handle extension icon click - open popup instead of direct capture
// Note: Firefox uses browserAction, Chrome uses action
const actionAPI = background_extensionAPI.action || background_extensionAPI.browserAction;
if (actionAPI && actionAPI.onClicked) {
    actionAPI.onClicked.addListener(async (tab) => {
        // The popup will handle the interaction
        console.log('Extension clicked on tab:', tab?.url);
    });
}
else {
    console.log('🔧 Action API not available (popup will be used instead)');
}
// Global capture state
let currentCaptureController = null;
// Handle messages from content script and popup
background_extensionAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
    log('Background received message:', message);
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
        case 'AUTHENTICATE':
            handleAuthenticate(message.payload, sendResponse);
            return true; // Keep message channel open for async response
        case 'SIGN_OUT':
            handleSignOut(sendResponse);
            return true; // Keep message channel open for async response
        case 'GET_FOLDERS':
            handleGetFolders(sendResponse);
            return true; // Keep message channel open for async response
        case 'GET_USAGE':
            handleGetUsage(sendResponse);
            return true; // Keep message channel open for async response
        case 'CREATE_FOLDER':
            handleCreateFolder(message.payload, sendResponse);
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
    background_extensionAPI.runtime.sendMessage({
        type: 'CAPTURE_PROGRESS',
        payload: { status: 'cancelled', message: 'Capture cancelled by user' }
    });
}
async function handlePageCaptureWithActiveTab(payload) {
    try {
        // Get the active tab since popup messages don't have sender.tab
        const [activeTab] = await background_extensionAPI.tabs.query({ active: true, currentWindow: true });
        if (!activeTab) {
            console.error('No active tab found');
            background_extensionAPI.runtime.sendMessage({
                type: 'CAPTURE_PROGRESS',
                payload: { status: 'error', message: 'No active tab found' }
            });
            return;
        }
        console.log('Found active tab:', activeTab.url);
        await handlePageCapture(payload, activeTab);
    }
    catch (error) {
        console.error('Failed to get active tab:', error);
        background_extensionAPI.runtime.sendMessage({
            type: 'CAPTURE_PROGRESS',
            payload: { status: 'error', message: 'Failed to access active tab' }
        });
    }
}
async function handlePageCapture(payload, tab) {
    if (!tab?.id) {
        console.error('No tab ID provided for capture');
        background_extensionAPI.runtime.sendMessage({
            type: 'CAPTURE_PROGRESS',
            payload: { status: 'error', message: 'No active tab found' }
        });
        return;
    }
    // Create abort controller for this capture
    currentCaptureController = new AbortController();
    const signal = currentCaptureController.signal;
    // Set up timeout (120 seconds for full page, 15 seconds for visible)
    const captureType = payload.captureType || 'fullPage';
    const timeoutMs = captureType === 'fullPage' ? 120000 : 15000;
    const timeoutId = setTimeout(() => {
        if (currentCaptureController) {
            currentCaptureController.abort();
            const errorMsg = captureType === 'fullPage'
                ? 'This page is very large and took too long to capture. Try capturing just the visible area instead.'
                : 'Capture timed out. Please try again.';
            background_extensionAPI.runtime.sendMessage({
                type: 'CAPTURE_PROGRESS',
                payload: { status: 'error', message: errorMsg }
            });
        }
    }, timeoutMs);
    try {
        log('Starting page capture:', payload.url);
        // Check if cancelled
        if (signal.aborted) {
            clearTimeout(timeoutId);
            return;
        }
        // Step 1: Get page content from content script
        background_extensionAPI.runtime.sendMessage({
            type: 'CAPTURE_PROGRESS',
            payload: { status: 'extracting', message: 'Extracting page content...' }
        });
        let pageContent = {};
        try {
            // Send message to content script to extract page data (Firefox compatible)
            const response = await background_extensionAPI.tabs.sendMessage(tab.id, {
                type: 'EXTRACT_PAGE_DATA'
            });
            if (response && response.success) {
                pageContent = response.data;
                console.log('✅ Page content extracted from content script:', {
                    htmlLength: pageContent.html?.length || 0,
                    textLength: pageContent.text?.length || 0,
                    title: pageContent.title
                });
                if (!pageContent.html || pageContent.html.length === 0) {
                    console.warn('⚠️ Content script returned empty HTML!');
                }
                if (!pageContent.text || pageContent.text.length === 0) {
                    console.warn('⚠️ Content script returned empty text!');
                }
            }
            else {
                console.warn('⚠️ Failed to extract page content from content script:', response);
                console.warn('⚠️ Using fallback data from popup (may be empty)');
                // Use fallback data from popup
                pageContent = {
                    url: payload.url,
                    title: payload.title,
                    html: payload.html || '',
                    text: payload.text || '',
                    favicon: payload.favicon
                };
            }
        }
        catch (contentError) {
            console.warn('⚠️ Content script not available, trying dynamic injection:', contentError);
            // Try to dynamically inject and extract content
            try {
                const extractionResults = await background_extensionAPI.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: () => {
                        // Inline content extraction function
                        const html = document.documentElement.outerHTML;
                        const cleanedHtml = html
                            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                            .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '');
                        const text = cleanedHtml
                            .replace(/<[^>]*>/g, ' ')
                            .replace(/&nbsp;/g, ' ')
                            .replace(/&amp;/g, '&')
                            .replace(/&lt;/g, '<')
                            .replace(/&gt;/g, '>')
                            .replace(/\s+/g, ' ')
                            .trim();
                        const faviconLink = document.querySelector('link[rel*="icon"]');
                        const favicon = faviconLink?.href || `${window.location.protocol}//${window.location.host}/favicon.ico`;
                        return {
                            url: window.location.href,
                            title: document.title || '',
                            html: cleanedHtml,
                            text: text,
                            favicon: favicon
                        };
                    }
                });
                if (extractionResults && extractionResults[0]?.result) {
                    pageContent = extractionResults[0].result;
                    console.log('✅ Content extracted via dynamic injection:', {
                        htmlLength: pageContent.html?.length || 0,
                        textLength: pageContent.text?.length || 0,
                        title: pageContent.title
                    });
                }
                else {
                    throw new Error('Dynamic extraction returned no results');
                }
            }
            catch (dynamicError) {
                console.error('❌ Dynamic content extraction failed:', dynamicError);
                // Final fallback
                pageContent = {
                    url: payload.url,
                    title: payload.title,
                    html: '',
                    text: '',
                    favicon: payload.favicon
                };
            }
        }
        // Check if cancelled after content extraction
        if (signal.aborted) {
            clearTimeout(timeoutId);
            return;
        }
        // Step 2: Capture screenshot
        let screenshot;
        if (captureType === 'fullPage' && FullPageCapture.isSupported()) {
            console.log('Starting full-page capture for:', payload.url);
            // Send progress message to popup
            background_extensionAPI.runtime.sendMessage({
                type: 'CAPTURE_PROGRESS',
                payload: { status: 'capturing', message: 'Capturing full page...' }
            });
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
        }
        else {
            // Fallback to visible area capture
            console.log('Capturing visible area for:', payload.url);
            background_extensionAPI.runtime.sendMessage({
                type: 'CAPTURE_PROGRESS',
                payload: { status: 'capturing', message: 'Capturing visible area...' }
            });
            screenshot = await background_extensionAPI.tabs.captureVisibleTab(tab.windowId, {
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
        background_extensionAPI.runtime.sendMessage({
            type: 'CAPTURE_PROGRESS',
            payload: { status: 'saving', message: 'Saving capture...' }
        });
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
            // Include folder ID if provided
            ...(payload.folderId ? { folder_id: payload.folderId } : {}),
        };
        console.log('✅ Prepared clip data:', {
            url: clipData.url,
            title: clipData.title,
            hasScreenshot: !!clipData.screenshot_data,
            htmlLength: clipData.html_content.length,
            textLength: clipData.text_content.length,
            hasFavicon: !!clipData.favicon_url
        });
        // DEBUG: Check if content is actually empty
        if (!clipData.html_content || clipData.html_content.length === 0) {
            console.warn('⚠️ WARNING: html_content is empty!');
        }
        if (!clipData.text_content || clipData.text_content.length === 0) {
            console.warn('⚠️ WARNING: text_content is empty!');
        }
        // Check if user is authenticated
        const { token } = await ExtensionAuth.getSession();
        if (token) {
            try {
                // Save to Supabase
                const saveResult = await ExtensionAPI.saveClip(clipData);
                console.log('Clip saved to Supabase successfully');
                // Check if cancelled during save
                if (signal.aborted) {
                    clearTimeout(timeoutId);
                    return;
                }
                // Send success message to popup with usage data
                background_extensionAPI.runtime.sendMessage({
                    type: 'CAPTURE_PROGRESS',
                    payload: {
                        status: 'complete',
                        message: 'Capture saved to cloud!',
                        usage: saveResult.usage // Include usage data from API response
                    }
                });
            }
            catch (error) {
                console.error('Failed to save to Supabase:', error);
                // Check if cancelled during error handling
                if (signal.aborted) {
                    clearTimeout(timeoutId);
                    return;
                }
                // Fallback to local storage
                await saveClipLocally(clipData);
                // Send success message (local only)
                background_extensionAPI.runtime.sendMessage({
                    type: 'CAPTURE_PROGRESS',
                    payload: { status: 'complete', message: 'Capture saved locally (will sync when online)' }
                });
            }
        }
        else {
            // Save locally when not authenticated
            await saveClipLocally(clipData);
            // Send success message (local only)
            background_extensionAPI.runtime.sendMessage({
                type: 'CAPTURE_PROGRESS',
                payload: { status: 'complete', message: 'Capture saved locally (sign in to sync)' }
            });
        }
        // Update capture count
        background_extensionAPI.storage.local.get(['captureCount'], (result) => {
            const newCount = (result.captureCount || 0) + 1;
            background_extensionAPI.storage.local.set({ captureCount: newCount });
        });
        // Clear timeout and controller
        clearTimeout(timeoutId);
        currentCaptureController = null;
    }
    catch (error) {
        console.error('Failed to capture page:', error);
        // Clear timeout and controller
        clearTimeout(timeoutId);
        currentCaptureController = null;
        // Don't send error if it was cancelled
        if (signal.aborted) {
            return;
        }
        // Send error message to popup
        background_extensionAPI.runtime.sendMessage({
            type: 'CAPTURE_PROGRESS',
            payload: { status: 'error', message: error instanceof Error ? error.message : 'Capture failed' }
        });
    }
}
async function saveClipLocally(clipData) {
    return new Promise((resolve) => {
        background_extensionAPI.storage.local.get(['localClips'], (result) => {
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
            background_extensionAPI.storage.local.set({ localClips }, () => {
                console.log('Clip saved locally');
                resolve();
            });
        });
    });
}
async function handleGetAuthToken(sendResponse) {
    try {
        // Restore session if needed to ensure token is valid
        await ExtensionAuth.restoreSession();
        const { token } = await ExtensionAuth.getSession();
        sendResponse({ token });
    }
    catch (error) {
        console.error('Failed to get auth token:', error);
        sendResponse({ token: null });
    }
}
async function handleAuthenticate(payload, sendResponse) {
    try {
        console.log('🔧 Background: Handling authentication:', payload.isSignUp ? 'sign up' : 'sign in', 'for', payload.email);
        let result;
        if (payload.isSignUp) {
            console.log('🔧 Background: Calling ExtensionAuth.signUp');
            result = await ExtensionAuth.signUp(payload.email, payload.password);
        }
        else {
            console.log('🔧 Background: Calling ExtensionAuth.signIn');
            result = await ExtensionAuth.signIn(payload.email, payload.password);
        }
        console.log('🔧 Background: Auth result:', {
            hasData: !!result.data,
            hasError: !!result.error,
            errorMessage: result.error?.message
        });
        if (result.error) {
            console.error('🔧 Background: Authentication failed:', result.error);
            sendResponse({ error: result.error });
        }
        else {
            console.log('🔧 Background: Authentication successful, sending response');
            sendResponse({ data: result.data });
        }
    }
    catch (error) {
        console.error('🔧 Background: Authentication error:', error);
        sendResponse({ error: { message: 'Authentication failed. Please try again.' } });
    }
}
async function handleSignOut(sendResponse) {
    try {
        console.log('Handling sign out');
        await ExtensionAuth.signOut();
        sendResponse({ success: true });
    }
    catch (error) {
        console.error('Sign out error:', error);
        // Force local cleanup even if remote signout fails
        await background_extensionAPI.storage.local.remove(['authToken', 'userEmail', 'userId', 'refreshToken']);
        sendResponse({ success: true });
    }
}
async function handleGetFolders(sendResponse) {
    try {
        log('Getting user folders');
        const folders = await ExtensionAPI.getFolders();
        log('Folders retrieved:', folders.folders?.length || 0);
        sendResponse(folders);
    }
    catch (error) {
        console.error('Failed to get folders:', error);
        sendResponse({
            folders: []
        });
    }
}
async function handleGetUsage(sendResponse) {
    try {
        log('Getting user usage data');
        const usage = await ExtensionAPI.getUsage();
        log('Usage retrieved - remaining:', usage.clips_remaining);
        sendResponse(usage);
    }
    catch (error) {
        console.error('Failed to get usage:', error);
        sendResponse({
            error: 'Failed to load usage data',
            clips_remaining: 50,
            clips_limit: 50,
            subscription_tier: 'free',
            warning_level: 'safe'
        });
    }
}
async function handleCreateFolder(payload, sendResponse) {
    try {
        log('Creating folder:', payload.name);
        const folder = await ExtensionAPI.createFolder(payload);
        log('Folder created successfully');
        sendResponse({ folder });
    }
    catch (error) {
        console.error('Failed to create folder:', error);
        sendResponse({
            error: 'Failed to create folder'
        });
    }
}
// Sync local clips when user authenticates
background_extensionAPI.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.authToken && changes.authToken.newValue) {
        // User just authenticated, sync local clips
        syncLocalClips();
    }
});
async function syncLocalClips() {
    try {
        const result = await new Promise((resolve) => {
            background_extensionAPI.storage.local.get(['localClips'], (result) => {
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
            }
            catch (error) {
                console.error('Failed to sync clip:', error);
            }
        }
        // Update local storage with synced status
        background_extensionAPI.storage.local.set({ localClips: result.localClips });
        console.log('Local clips sync completed');
    }
    catch (error) {
        console.error('Failed to sync local clips:', error);
    }
}

/******/ })()
;
//# sourceMappingURL=background.js.map