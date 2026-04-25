/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// ./src/utils/supabase.ts
// Supabase client for browser extension
// SECURITY NOTE: Extension does NOT include Supabase credentials
// All authentication and data operations go through the web app's API
// Firefox compatibility layer
const extensionAPI = typeof browser !== 'undefined' ? browser : chrome;
// Get the API base URL based on environment.
// IMPORTANT: must match the canonical host configured in apps/web/next.config.js
// (currently `www.pagestash.app`). The apex domain `pagestash.app` 301-redirects
// to `www`, and POSTs with Authorization headers do not safely survive a 301 —
// the body and auth header get stripped, the request silently fails, and the
// extension falls back to local-only saves.
const API_BASE_URL =  true
    ? 'https://www.pagestash.app'
    : 0;
// Extension-specific auth helpers
class ExtensionAuth {
    static async signIn(email, password) {
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
                return { data: null, error: { message: result.error } };
            }
            if (result.session) {
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
                return { data: null, error: { message: result.error } };
            }
            if (result.session) {
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
            return {
                data: null,
                error: { message: err.message || 'Network error' }
            };
        }
    }
    static async signOut() {
        await extensionAPI.storage.local.remove([
            'authToken',
            'refreshToken',
            'userEmail',
            'userId',
        ]);
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
            if (!stored.authToken) {
                return false;
            }
            // Validate token with a lightweight API call
            try {
                const res = await fetch(`${API_BASE_URL}/api/usage`, {
                    headers: { 'Authorization': `Bearer ${stored.authToken}` },
                });
                if (res.status === 401 && stored.refreshToken) {
                    const refreshResult = await this.refreshSession();
                    return !refreshResult.error;
                }
                return res.ok;
            }
            catch {
                // Network error — trust the stored token and let real calls handle failures
                return true;
            }
        }
        catch (err) {
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
        try {
            const stored = await new Promise((resolve) => {
                extensionAPI.storage.local.get(['refreshToken'], (result) => {
                    resolve({ refreshToken: result.refreshToken || null });
                });
            });
            if (!stored.refreshToken) {
                await this.signOut();
                return { data: null, error: new Error('No refresh token available') };
            }
            const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: stored.refreshToken }),
            });
            const result = await response.json();
            if (!response.ok || !result.session) {
                await this.signOut();
                return { data: null, error: new Error(result.error || 'Session expired — please sign in again') };
            }
            await extensionAPI.storage.local.set({
                authToken: result.session.access_token,
                refreshToken: result.session.refresh_token,
                userEmail: result.user?.email,
                userId: result.user?.id,
            });
            return { data: { session: result.session, user: result.user }, error: null };
        }
        catch (err) {
            await this.signOut();
            return { data: null, error: new Error(err.message || 'Session refresh failed') };
        }
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
        if (response.status === 401) {
            const refreshResult = await ExtensionAuth.refreshSession();
            if (refreshResult.error) {
                throw new Error('Session expired — please sign in again');
            }
            const { token: newToken } = await ExtensionAuth.getSession();
            if (!newToken) {
                throw new Error('Session expired — please sign in again');
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
        const response = await this.authenticatedFetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(clipData),
        });
        if (!response.ok) {
            const errorText = await response.text();
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            }
            catch {
                errorData = { error: errorText || 'Failed to save clip' };
            }
            if (response.status === 429) {
                const limitError = new Error(errorData.error || 'Clip limit reached');
                limitError.isLimitReached = true;
                limitError.limitInfo = {
                    clips_limit: errorData.clips_limit,
                    clips_this_month: errorData.clips_this_month,
                    subscription_tier: errorData.subscription_tier,
                    days_until_reset: errorData.days_until_reset,
                    reset_date: errorData.reset_date,
                };
                throw limitError;
            }
            throw new Error(errorData.error || 'Failed to save clip');
        }
        return response.json();
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
const _DEBUG = "production" !== 'production';
const _log = (...args) => { if (_DEBUG)
    console.log('[PageStash:FullPage]', ...args); };
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
            _log('Full page capture - Page info:', {
                scrollHeight: pageInfo.scrollHeight,
                scrollWidth: pageInfo.scrollWidth,
                viewportWidth: pageInfo.viewportWidth,
                viewportHeight: pageInfo.viewportHeight,
                originalScrollX: pageInfo.originalScrollX,
                originalScrollY: pageInfo.originalScrollY
            });
            if (pageInfo.scrollHeight <= pageInfo.viewportHeight) {
                // Page fits in viewport, use simple capture
                _log('Page fits in viewport, using simple capture');
                return this.captureVisibleArea(tabId, opts, pageInfo, startTime);
            }
            // Firefox needs special handling due to captureVisibleTab limitations
            const isFirefox = typeof browser !== 'undefined';
            if (isFirefox) {
                _log('🔧 Firefox: Using SIMPLE vertical sections - same as visible area');
                return this.captureVerticalOnlyFirefox(tabId, opts, pageInfo, startTime);
            }
            _log('🔧 Chrome: Using full grid capture');
            // Check if we need horizontal scrolling
            // Only do horizontal capture if page is SIGNIFICANTLY wider (50%+ wider)
            // Most responsive sites (like Reddit) don't need horizontal capture
            const needsHorizontalScroll = pageInfo.scrollWidth >= pageInfo.viewportWidth * 1.5;
            const finalNeedsHorizontalScroll = needsHorizontalScroll;
            _log('🔧 Horizontal scroll analysis:', {
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
            _log(`🔧 Firefox capture grid analysis:`, {
                verticalPositions: verticalPositions.length,
                horizontalPositions: horizontalPositions.length,
                totalSections,
                verticalPositionsArray: verticalPositions,
                horizontalPositionsArray: horizontalPositions
            });
            _log(`Capturing ${totalSections} sections...`);
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
            _log('Starting image stitching...');
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
            _log('Stitching parameters:', {
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
            _log('Image stitching completed');
            const maxW = screenshots.length > 6 ? 1024 : 1440;
            const quality = screenshots.length > 10 ? 0.45 : screenshots.length > 4 ? 0.55 : 0.65;
            let finalImage = await this.resizeAndCompress(stitchedImage, quality, maxW);
            const sizeMB = (finalImage.length * 0.75) / (1024 * 1024);
            if (sizeMB > 1.5) {
                finalImage = await this.resizeAndCompress(stitchedImage, 0.35, 960);
            }
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
        _log('🔧 Firefox: SIMPLE vertical sections - same as visible area capture');
        _log('🔧 Firefox: Page dimensions:', {
            scrollWidth: pageInfo.scrollWidth,
            viewportWidth: pageInfo.viewportWidth,
            scrollHeight: pageInfo.scrollHeight,
            viewportHeight: pageInfo.viewportHeight
        });
        // Calculate vertical positions - same scroll logic as before
        const verticalPositions = this.calculateScrollPositions(pageInfo.scrollHeight, pageInfo.viewportHeight, options.maxHeight);
        _log('🔧 Firefox: SIMPLE capture plan:', {
            verticalSections: verticalPositions.length,
            captureWidth: pageInfo.viewportWidth, // Use original viewport width
            totalHeight: pageInfo.scrollHeight,
            positions: verticalPositions
        });
        // Capture vertical screenshots - EXACTLY like visible area
        const screenshots = [];
        for (let i = 0; i < verticalPositions.length; i++) {
            const scrollY = verticalPositions[i];
            _log(`🔧 Firefox: SIMPLE capture section ${i + 1}/${verticalPositions.length} at Y=${scrollY}`);
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
                _log(`🔧 Firefox: SIMPLE section ${i + 1} captured successfully`);
            }
            catch (error) {
                console.error(`🔧 Firefox: SIMPLE capture failed section ${i + 1}:`, error);
                throw new Error(`Failed to capture section ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
        // Restore original scroll position
        await this.scrollToPosition(tabId, pageInfo.originalScrollY, pageInfo.originalScrollX);
        // Stitch vertical screenshots - simple and clean
        _log('🔧 Firefox: SIMPLE vertical stitching', screenshots.length, 'screenshots');
        const stitchedImage = await this.stitchFirefoxVertical(screenshots, pageInfo.viewportWidth, // Use original viewport width
        pageInfo.viewportHeight);
        const maxW = screenshots.length > 6 ? 1024 : 1440;
        const quality = screenshots.length > 10 ? 0.45 : screenshots.length > 4 ? 0.55 : 0.65;
        let finalImage = await this.resizeAndCompress(stitchedImage, quality, maxW);
        const sizeMB = (finalImage.length * 0.75) / (1024 * 1024);
        if (sizeMB > 1.5) {
            finalImage = await this.resizeAndCompress(stitchedImage, 0.35, 960);
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
            _log('🔧 Firefox: BULLETPROOF grid stitching');
            _log('🔧 Firefox: Grid dimensions:', {
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
            _log('🔧 Firefox: Grid overlaps:', {
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
                    _log(`🔧 Firefox: Processing V${vIndex + 1}H${hIndex + 1} at (${screenshot.x}, ${screenshot.y})`);
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
                    _log(`🔧 Firefox: V${vIndex + 1}H${hIndex + 1} -> Canvas(${destX}, ${destY}) from Source(${sourceX}, ${sourceY}, ${sourceWidth}x${sourceHeight})`);
                    // Draw the image section
                    ctx.drawImage(imageBitmap, sourceX, sourceY, sourceWidth, sourceHeight, // Source rectangle
                    destX, destY, sourceWidth, sourceHeight // Destination rectangle
                    );
                    // Clean up
                    imageBitmap.close();
                }
            }
            _log('🔧 Firefox: BULLETPROOF grid stitching completed');
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
            _log('🔧 Firefox: DEAD SIMPLE vertical stacking - NO width manipulation');
            if (screenshots.length === 0) {
                throw new Error('No screenshots to stitch');
            }
            if (screenshots.length === 1) {
                _log('🔧 Firefox: Single screenshot, returning as-is');
                return screenshots[0];
            }
            // Get actual dimensions from first screenshot
            const firstResponse = await fetch(screenshots[0]);
            const firstBlob = await firstResponse.blob();
            const firstImage = await createImageBitmap(firstBlob);
            const actualWidth = firstImage.naturalWidth || firstImage.width;
            const actualHeight = firstImage.naturalHeight || firstImage.height;
            _log('🔧 Firefox: Actual screenshot dimensions:', {
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
            _log('🔧 Firefox: SIMPLE stacking plan:', {
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
                _log(`🔧 Firefox: SIMPLE stacking section ${i + 1} at Y=${currentY}`);
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
            _log('🔧 Firefox: SIMPLE stacking completed - final size:', actualWidth, 'x', totalHeight);
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
        _log('🔧 Calculating vertical positions:', { scrollHeight, viewportHeight, effectiveHeight });
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
        _log('🔧 Vertical positions calculated:', positions);
        return positions;
    }
    /**
     * Calculate horizontal scroll positions for wide pages
     */
    static calculateHorizontalScrollPositions(scrollWidth, viewportWidth) {
        const positions = [];
        _log('🔧 Calculating horizontal positions:', { scrollWidth, viewportWidth });
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
        _log('🔧 Horizontal positions calculated:', positions);
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
            _log('Stitching grid screenshots:', {
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
            _log('🔧 Device pixel ratio detected:', {
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
            _log('🔧 Stitching with overlaps (scaled for DPR):', {
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
                    _log(`🔧 Processing screenshot at scroll position (${screenshot.x}, ${screenshot.y}), row ${rowIndex}, col ${colIndex}`);
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
                    _log(`🔧 Drawing: source(${sourceX}, ${sourceY}, ${sourceWidth}x${sourceHeight}) -> canvas(${destX}, ${destY}, ${sourceWidth}x${sourceHeight})`);
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
            _log('🔧 Grid stitching completed successfully');
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
                _log(`Capture attempt ${attempt}/${maxRetries} failed:`, errorMessage);
                // Handle rate limiting
                if (errorMessage.includes('MAX_CAPTURE_VISIBLE_TAB_CALLS_PER_SECOND')) {
                    _log(`Rate limit hit on attempt ${attempt}/${maxRetries}, waiting...`);
                    if (attempt < maxRetries) {
                        // More aggressive backoff: 2s, 4s, 8s...
                        const waitTime = Math.pow(2, attempt) * 1000;
                        await this.delay(waitTime);
                        continue;
                    }
                }
                // Handle permission errors
                if (errorMessage.includes('permission') || errorMessage.includes('activeTab') || errorMessage.includes('all_urls')) {
                    _log(`Permission error on attempt ${attempt}/${maxRetries}, waiting longer...`);
                    if (attempt < maxRetries) {
                        // Wait longer for permission issues: 3s, 6s, 12s...
                        const waitTime = Math.pow(2, attempt) * 1500;
                        await this.delay(waitTime);
                        continue;
                    }
                }
                // For other errors, wait a bit before retrying
                if (attempt < maxRetries) {
                    _log(`Generic error, waiting before retry...`);
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
            _log('🔧 Using scripting.executeScript (Chrome)');
            const results = await fullPageCapture_extensionAPI.scripting.executeScript({
                target: { tabId },
                func,
                args
            });
            return results.map(result => result.result);
        }
        else if (fullPageCapture_extensionAPI?.tabs && typeof fullPageCapture_extensionAPI.tabs.executeScript === 'function') {
            // Firefox Manifest V2 approach
            _log('🔧 Using tabs.executeScript (Firefox)');
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
            _log('🔧 Firefox PRECISION stitching:', {
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
                _log(`🔧 Firefox: Stitching section ${i + 1} at scroll Y=${scrollY}`);
                // Convert data URL to ImageBitmap
                const response = await fetch(screenshot);
                const blob = await response.blob();
                const imageBitmap = await createImageBitmap(blob);
                if (i === 0) {
                    // First image - draw completely
                    ctx.drawImage(imageBitmap, 0, 0, width, viewportHeight, 0, 0, width, viewportHeight);
                    _log(`🔧 Firefox: Drew first section at Y=0`);
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
                        _log(`🔧 Firefox: Drew section ${i + 1} from sourceY=${sourceY} to destY=${destY}, height=${finalHeight}`);
                    }
                }
                imageBitmap.close();
            }
            _log(`🔧 Firefox: Stitching completed, canvas height: ${totalHeight}`);
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
     * Resize then compress — far more effective than lowering JPEG quality alone.
     * maxWidth caps the output; aspect ratio is preserved.
     */
    static async resizeAndCompress(dataUrl, quality = 0.7, maxWidth = 1440) {
        try {
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            const imageBitmap = await createImageBitmap(blob);
            let outW = imageBitmap.width;
            let outH = imageBitmap.height;
            if (outW > maxWidth) {
                const scale = maxWidth / outW;
                outW = maxWidth;
                outH = Math.round(imageBitmap.height * scale);
            }
            const canvas = new OffscreenCanvas(outW, outH);
            const ctx = canvas.getContext('2d');
            if (!ctx)
                throw new Error('Canvas context unavailable');
            ctx.drawImage(imageBitmap, 0, 0, outW, outH);
            imageBitmap.close();
            const compressedBlob = await canvas.convertToBlob({ type: 'image/jpeg', quality });
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(compressedBlob);
            });
        }
        catch (error) {
            console.error('Image resize/compress failed:', error);
            return dataUrl;
        }
    }
    /**
     * @deprecated Use resizeAndCompress instead.
     */
    static async compressImage(dataUrl, quality = 0.7) {
        return this.resizeAndCompress(dataUrl, quality, Infinity);
    }
    /**
     * Check if full page capture is supported
     */
    static isSupported() {
        const hasScriptExecution = !!((fullPageCapture_extensionAPI?.scripting && typeof fullPageCapture_extensionAPI.scripting.executeScript === 'function') ||
            (fullPageCapture_extensionAPI?.tabs && typeof fullPageCapture_extensionAPI.tabs.executeScript === 'function'));
        return !!(fullPageCapture_extensionAPI &&
            fullPageCapture_extensionAPI.tabs &&
            typeof fullPageCapture_extensionAPI.tabs.captureVisibleTab === 'function' &&
            hasScriptExecution);
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


const DEBUG = "production" !== 'production';
const log = (...args) => { if (DEBUG)
    console.log('[PageStash]', ...args); };
const background_extensionAPI = typeof browser !== 'undefined' ? browser : chrome;
const UNSCRIPTABLE_PATTERNS = [
    /^chrome:/i,
    /^chrome-extension:/i,
    /^about:/i,
    /^edge:/i,
    /^brave:/i,
    /^moz-extension:/i,
    /^view-source:/i,
    /^devtools:/i,
    /^chrome\.google\.com\/webstore/i,
    /^chromewebstore\.google\.com/i,
    /^addons\.mozilla\.org/i,
    /^microsoftedge\.microsoft\.com\/addons/i,
];
function isUnscriptablePage(url) {
    if (!url)
        return true;
    return UNSCRIPTABLE_PATTERNS.some(p => p.test(url));
}
function sendProgress(status, message, extra) {
    background_extensionAPI.runtime.sendMessage({
        type: 'CAPTURE_PROGRESS',
        payload: { status, message, ...extra }
    }).catch(() => { });
}
async function showPageToast(tabId, message, type = 'success') {
    try {
        await background_extensionAPI.scripting.executeScript({
            target: { tabId },
            func: (msg, toastType) => {
                const existing = document.getElementById('__pagestash-toast');
                if (existing)
                    existing.remove();
                const toast = document.createElement('div');
                toast.id = '__pagestash-toast';
                const isSuccess = toastType === 'success';
                const isSaving = toastType === 'saving';
                const bg = isSuccess ? '#059669' : isSaving ? '#2563eb' : '#dc2626';
                const icon = isSuccess ? '✓' : isSaving ? '⟳' : '✕';
                Object.assign(toast.style, {
                    position: 'fixed', top: '20px', right: '20px', zIndex: '2147483647',
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '12px 20px', borderRadius: '12px',
                    background: bg, color: '#fff', fontFamily: "'Inter', system-ui, sans-serif",
                    fontSize: '14px', fontWeight: '600', boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    transform: 'translateY(-10px)', opacity: '0',
                    transition: 'transform 0.3s ease, opacity 0.3s ease',
                });
                const iconSpan = document.createElement('span');
                Object.assign(iconSpan.style, { fontSize: '16px', ...(isSaving ? { animation: 'pagestash-spin 1s linear infinite', display: 'inline-block' } : {}) });
                iconSpan.textContent = icon;
                toast.appendChild(iconSpan);
                const text = document.createElement('span');
                text.textContent = msg;
                toast.appendChild(text);
                if (isSaving) {
                    const style = document.createElement('style');
                    style.textContent = '@keyframes pagestash-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}';
                    toast.appendChild(style);
                }
                document.body.appendChild(toast);
                requestAnimationFrame(() => {
                    toast.style.transform = 'translateY(0)';
                    toast.style.opacity = '1';
                });
                if (!isSaving) {
                    setTimeout(() => {
                        toast.style.transform = 'translateY(-10px)';
                        toast.style.opacity = '0';
                        setTimeout(() => toast.remove(), 300);
                    }, 3000);
                }
            },
            args: [message, type],
        });
    }
    catch {
        // Tab may have navigated away — ignore
    }
}
// Session monitor state
let sessionRefreshInterval = null;
// Handle extension installation / update
background_extensionAPI.runtime.onInstalled.addListener((details) => {
    log('Extension installed:', details.reason);
    if (details.reason === 'install') {
        // Set up initial extension state
        background_extensionAPI.storage.local.set({
            isFirstRun: true,
            captureCount: 0,
        });
    }
    // Restore session on installation, then attempt to flush any backlog of
    // locally-saved clips. This is critical for users coming from <= v3.1.0
    // who accumulated unsynced clips during the Apr 11 – Apr 24 server-side
    // outage of POST /api/clips. Triggers on both 'install' AND 'update' so
    // every existing user automatically recovers their backlog the moment
    // v3.1.1+ reaches them — no sign-out / sign-in dance required.
    ExtensionAuth.restoreSession().then(() => {
        startSessionMonitor();
        if (details.reason === 'install' || details.reason === 'update') {
            // Small delay so the auth session and any service-worker boot work has
            // a chance to settle before we hammer the network.
            setTimeout(() => { void syncLocalClips(); }, 2000);
        }
    });
});
// Restore session on browser startup, then opportunistically flush backlog.
// Important for users who keep their browser running for days — the install/
// update hook may have fired weeks ago, so we re-check on every cold start.
if (background_extensionAPI.runtime.onStartup) {
    background_extensionAPI.runtime.onStartup.addListener(async () => {
        log('Restoring session');
        await ExtensionAuth.restoreSession();
        startSessionMonitor();
        setTimeout(() => { void syncLocalClips(); }, 2000);
    });
}
// Defense-in-depth: a periodic alarm that retries the backlog every 30 min.
// Guarantees recovery even if onStartup never fires (e.g. service worker
// kept alive across browser sessions) or if the network was offline at the
// install/update hook moment. No-op when localClips is empty.
if (background_extensionAPI.alarms) {
    const ALARM_NAME = 'pagestash-backlog-sync';
    background_extensionAPI.alarms.create(ALARM_NAME, {
        delayInMinutes: 5,
        periodInMinutes: 30,
    });
    background_extensionAPI.alarms.onAlarm.addListener((alarm) => {
        if (alarm.name === ALARM_NAME) {
            void syncLocalClips();
        }
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
                log('Session is active');
                // Token validation happens on API calls
                // If token is expired, API will return 401 and user will need to sign in again
            }
            else {
                log('No active session');
            }
        }
        catch (error) {
            console.error('Session monitor error:', error);
        }
    }, 5 * 60 * 1000); // Every 5 minutes
    log('Session monitor started');
}
// Stop monitor on shutdown
if (background_extensionAPI.runtime.onSuspend) {
    background_extensionAPI.runtime.onSuspend.addListener(() => {
        log('Stopping session monitor');
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
        log('Extension clicked on tab:', tab?.url);
    });
}
else {
    log('Action API not available (popup will be used instead)');
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
            return true;
        case 'AREA_SELECT':
            handleAreaSelect();
            break;
        case 'AREA_SELECTED':
            handleAreaSelected(message.payload, sender);
            break;
        default:
            console.warn('Unknown message type:', message.type);
    }
});
async function handleAreaSelect() {
    try {
        const [tab] = await background_extensionAPI.tabs.query({ active: true, currentWindow: true });
        if (!tab?.id)
            return;
        if (isUnscriptablePage(tab.url)) {
            sendProgress('error', 'This page is protected by the browser and cannot be captured. Try a regular webpage.');
            return;
        }
        await background_extensionAPI.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['areaSelect.js'],
        });
    }
    catch (err) {
        console.error('Area select injection failed:', err);
        sendProgress('error', 'Could not open area selector on this page.');
    }
}
async function handleAreaSelected(rect, sender) {
    try {
        sendProgress('capturing', 'Capturing selected area...');
        const tab = sender?.tab || (await background_extensionAPI.tabs.query({ active: true, currentWindow: true }))[0];
        if (!tab?.id)
            throw new Error('No active tab');
        const fullScreenshot = await background_extensionAPI.tabs.captureVisibleTab(tab.windowId, { format: 'png' });
        // Crop to selected area using offscreen canvas
        const dpr = rect.devicePixelRatio || 1;
        const cropResult = await background_extensionAPI.scripting.executeScript({
            target: { tabId: tab.id },
            func: (dataUrl, x, y, w, h, dpr) => {
                return new Promise((resolve) => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        canvas.width = w * dpr;
                        canvas.height = h * dpr;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, x * dpr, y * dpr, w * dpr, h * dpr, 0, 0, w * dpr, h * dpr);
                        resolve(canvas.toDataURL('image/png'));
                    };
                    img.src = dataUrl;
                });
            },
            args: [fullScreenshot, rect.x, rect.y, rect.width, rect.height, dpr],
        });
        const croppedDataUrl = cropResult?.[0]?.result;
        if (!croppedDataUrl)
            throw new Error('Failed to crop screenshot');
        // Extract page content (HTML + text)
        let pageContent = {};
        try {
            const result = await background_extensionAPI.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                    const rawHtml = document.documentElement.outerHTML;
                    const cleaned = rawHtml
                        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                        .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '');
                    const text = document.body.innerText?.substring(0, 50000) || '';
                    const faviconEl = document.querySelector('link[rel*="icon"]');
                    return {
                        html_content: cleaned,
                        text_content: text,
                        favicon_url: faviconEl?.href || `${location.protocol}//${location.host}/favicon.ico`,
                    };
                },
            });
            pageContent = result?.[0]?.result || {};
        }
        catch (e) {
            console.warn('Area capture content extraction failed:', e);
        }
        sendProgress('saving', 'Saving capture...');
        showPageToast(tab.id, 'Saving area capture...', 'saving');
        const clipData = {
            url: tab.url || '',
            title: tab.title || '',
            screenshot_data: croppedDataUrl,
            html_content: pageContent.html_content || '',
            text_content: pageContent.text_content || '',
            favicon_url: pageContent.favicon_url || '',
            notes: `Area capture (${rect.width}×${rect.height}px)`,
        };
        log('Area clip data:', {
            url: clipData.url,
            title: clipData.title,
            hasScreenshot: !!clipData.screenshot_data,
            htmlLength: clipData.html_content.length,
            textLength: clipData.text_content.length,
        });
        const isAuthenticated = await ExtensionAuth.restoreSession();
        if (isAuthenticated) {
            try {
                const saveResult = await ExtensionAPI.saveClip(clipData);
                sendProgress('complete', 'Area captured!', { usage: saveResult.usage });
                showPageToast(tab.id, 'Area saved to PageStash', 'success');
            }
            catch (saveError) {
                if (saveError?.isLimitReached) {
                    sendProgress('limit_reached', 'Monthly clip limit reached', { limitInfo: saveError.limitInfo });
                    showPageToast(tab.id, 'Monthly clip limit reached', 'error');
                }
                else {
                    throw saveError;
                }
            }
        }
        else {
            sendProgress('complete', 'Area saved locally (sign in to sync)');
            showPageToast(tab.id, 'Saved locally (sign in to sync)', 'success');
        }
    }
    catch (error) {
        console.error('Area capture failed:', error);
        sendProgress('error', error instanceof Error ? error.message : 'Area capture failed');
        // Show error toast on the page
        try {
            const [activeTab] = await background_extensionAPI.tabs.query({ active: true, currentWindow: true });
            if (activeTab?.id)
                showPageToast(activeTab.id, 'Capture failed — please try again', 'error');
        }
        catch { /* ignore */ }
    }
}
function handleCancelCapture() {
    log('Cancelling current capture');
    if (currentCaptureController) {
        currentCaptureController.abort();
        currentCaptureController = null;
    }
    sendProgress('cancelled', 'Capture cancelled');
}
async function handlePageCaptureWithActiveTab(payload) {
    try {
        const [activeTab] = await background_extensionAPI.tabs.query({ active: true, currentWindow: true });
        if (!activeTab) {
            sendProgress('error', 'No active tab found');
            return;
        }
        if (isUnscriptablePage(activeTab.url)) {
            sendProgress('error', 'This page is protected by the browser and cannot be captured. Navigate to a regular webpage and try again.');
            return;
        }
        if (activeTab.status === 'loading') {
            sendProgress('error', 'Page is still loading. Wait for it to finish, then try again.');
            return;
        }
        log('Found active tab:', activeTab.url);
        await handlePageCapture(payload, activeTab);
    }
    catch (error) {
        console.error('Failed to get active tab:', error);
        sendProgress('error', 'Failed to access active tab');
    }
}
async function handlePageCapture(payload, tab) {
    if (!tab?.id) {
        console.error('No tab ID provided for capture');
        sendProgress('error', 'No active tab found');
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
            sendProgress('error', captureType === 'fullPage'
                ? 'This page is very large. Try capturing just the visible area instead.'
                : 'Capture timed out. Please try again.');
        }
    }, timeoutMs);
    try {
        log('Starting page capture:', payload.url);
        // Check if cancelled
        if (signal.aborted) {
            clearTimeout(timeoutId);
            return;
        }
        sendProgress('extracting', 'Extracting page content...');
        let pageContent = {};
        let contentExtractionFailed = false;
        const extractContent = async (tabId) => {
            const extractionResults = await background_extensionAPI.scripting.executeScript({
                target: { tabId },
                func: () => {
                    try {
                        const rawHtml = document.documentElement.outerHTML || '';
                        const cleanedHtml = rawHtml
                            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                            .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '');
                        const bodyText = document.body?.innerText?.substring(0, 50000) || '';
                        const faviconLink = document.querySelector('link[rel*="icon"]');
                        const favicon = faviconLink?.href || `${location.protocol}//${location.host}/favicon.ico`;
                        const metaDesc = document.querySelector('meta[name="description"]')?.content || '';
                        const metaKeywords = document.querySelector('meta[name="keywords"]')?.content || '';
                        return {
                            url: location.href,
                            title: document.title || '',
                            html: cleanedHtml,
                            text: bodyText,
                            favicon,
                            metaDescription: metaDesc,
                            metaKeywords,
                            htmlLength: cleanedHtml.length,
                            textLength: bodyText.length,
                        };
                    }
                    catch (innerErr) {
                        return { error: String(innerErr), url: location.href, title: document.title || '' };
                    }
                }
            });
            const result = extractionResults?.[0]?.result;
            if (!result || result.error) {
                throw new Error(result?.error || 'Content extraction returned no results');
            }
            return result;
        };
        // Attempt extraction with one retry
        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
                pageContent = await extractContent(tab.id);
                log(`Content extraction (attempt ${attempt}):`, {
                    url: pageContent.url,
                    htmlLength: pageContent.htmlLength,
                    textLength: pageContent.textLength,
                    hasTitle: !!pageContent.title,
                });
                if (pageContent.htmlLength === 0 && pageContent.textLength === 0) {
                    console.warn(`⚠️ Extraction returned empty content on attempt ${attempt}`);
                    if (attempt === 1) {
                        await new Promise(r => setTimeout(r, 500));
                        continue;
                    }
                    contentExtractionFailed = true;
                }
                break;
            }
            catch (extractError) {
                console.error(`Content extraction attempt ${attempt} failed:`, extractError);
                if (attempt === 2) {
                    contentExtractionFailed = true;
                    pageContent = {
                        url: payload.url,
                        title: payload.title,
                        html: '',
                        text: '',
                        favicon: payload.favicon
                    };
                }
                await new Promise(r => setTimeout(r, 500));
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
            log('Starting full-page capture for:', payload.url);
            sendProgress('capturing', 'Capturing full page screenshot...');
            try {
                const result = await FullPageCapture.captureFullPage(tab.id, {
                    quality: 90,
                    format: 'png',
                    scrollDelay: 500,
                });
                if (signal.aborted) {
                    clearTimeout(timeoutId);
                    return;
                }
                screenshot = result.dataUrl;
                log(`Full-page capture completed: ${result.width}x${result.height}px in ${result.captureTime}ms`);
            }
            catch (fullPageErr) {
                console.warn('Full-page capture failed, falling back to visible area:', fullPageErr);
                sendProgress('capturing', 'Full page failed — capturing visible area instead...');
                screenshot = await background_extensionAPI.tabs.captureVisibleTab(tab.windowId, { format: 'png', quality: 90 });
            }
        }
        else {
            log('Capturing visible area for:', payload.url);
            sendProgress('capturing', 'Capturing visible area...');
            screenshot = await background_extensionAPI.tabs.captureVisibleTab(tab.windowId, { format: 'png', quality: 90 });
        }
        // Check if cancelled after capture
        if (signal.aborted) {
            clearTimeout(timeoutId);
            return;
        }
        log('Screenshot captured successfully');
        sendProgress('saving', 'Saving capture...');
        const faviconUrl = pageContent.favicon || payload.favicon || '';
        const clipData = {
            url: pageContent.url || payload.url,
            title: pageContent.title || payload.title,
            screenshot_data: screenshot,
            html_content: pageContent.html || '',
            text_content: pageContent.text || '',
            ...(faviconUrl.startsWith('http') ? { favicon_url: faviconUrl } : {}),
            ...(payload.folderId ? { folder_id: payload.folderId } : {}),
            ...(pageContent.metaDescription ? { meta_description: pageContent.metaDescription } : {}),
        };
        log('Prepared clip data:', {
            url: clipData.url,
            title: clipData.title,
            hasScreenshot: !!clipData.screenshot_data,
            htmlLength: clipData.html_content.length,
            textLength: clipData.text_content.length,
            hasFavicon: !!clipData.favicon_url,
            contentExtractionFailed,
        });
        const { token } = await ExtensionAuth.getSession();
        const contentNote = contentExtractionFailed ? ' (screenshot only — text extraction failed on this page)' : '';
        if (token) {
            try {
                const saveResult = await ExtensionAPI.saveClip(clipData);
                log('Clip saved successfully');
                if (signal.aborted) {
                    clearTimeout(timeoutId);
                    return;
                }
                sendProgress('complete', `Capture saved!${contentNote}`, { usage: saveResult.usage });
            }
            catch (error) {
                console.error('Failed to save to Supabase:', error);
                if (signal.aborted) {
                    clearTimeout(timeoutId);
                    return;
                }
                if (error?.isLimitReached) {
                    sendProgress('limit_reached', 'Monthly clip limit reached', { limitInfo: error.limitInfo });
                    return;
                }
                await saveClipLocally(clipData);
                sendProgress('complete', 'Saved locally (will sync when online).' + contentNote);
            }
        }
        else {
            await saveClipLocally(clipData);
            sendProgress('complete', `Saved locally (sign in to sync)${contentNote}`);
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
        sendProgress('error', error instanceof Error ? error.message : 'Capture failed. Please try again.');
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
                log('Clip saved locally');
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
        log('Handling authentication:', payload.isSignUp ? 'sign up' : 'sign in');
        let result;
        if (payload.isSignUp) {
            log('Calling signUp');
            result = await ExtensionAuth.signUp(payload.email, payload.password);
        }
        else {
            log('Calling signIn');
            result = await ExtensionAuth.signIn(payload.email, payload.password);
        }
        log('Auth result:', {
            hasData: !!result.data,
            hasError: !!result.error,
            errorMessage: result.error?.message
        });
        if (result.error) {
            console.error('🔧 Background: Authentication failed:', result.error);
            sendResponse({ error: result.error });
        }
        else {
            log('Authentication successful');
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
        log('Handling sign out');
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
            clips_remaining: 0,
            clips_limit: 10,
            subscription_tier: 'free',
            warning_level: 'critical'
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
// Single-flight guard so overlapping triggers (onStartup + onInstalled +
// alarm + auth-token-change all racing on extension boot) don't double-upload.
let syncInFlight = null;
async function syncLocalClips() {
    if (syncInFlight) {
        log('Sync already in flight; skipping');
        return syncInFlight;
    }
    syncInFlight = (async () => {
        try {
            // Bail early if there's no auth — nothing we can sync without a token.
            const { token } = await ExtensionAuth.getSession();
            if (!token) {
                return;
            }
            const result = await new Promise((resolve) => {
                background_extensionAPI.storage.local.get(['localClips'], (r) => {
                    resolve({ localClips: r.localClips || [] });
                });
            });
            const all = result.localClips || [];
            const pending = all.filter((c) => !c.synced);
            if (pending.length === 0) {
                return;
            }
            log(`[sync] flushing ${pending.length} backlog clip(s)`);
            let successCount = 0;
            let limitReached = false;
            for (const clip of pending) {
                try {
                    await ExtensionAPI.saveClip({
                        url: clip.url,
                        title: clip.title,
                        screenshot_data: clip.screenshot_data,
                        html_content: clip.html_content,
                        text_content: clip.text_content,
                        favicon_url: clip.favicon_url,
                        // folder_id intentionally omitted — folders may have been deleted
                        // server-side since the local save; let the clip land at the root.
                    });
                    clip.synced = true;
                    successCount++;
                }
                catch (error) {
                    // If we hit the monthly clip limit, stop attempting the rest of the
                    // backlog — they'll get retried on the next alarm tick after the
                    // user upgrades or the monthly counter resets.
                    if (error?.isLimitReached) {
                        log('[sync] clip limit reached — pausing backlog flush');
                        limitReached = true;
                        break;
                    }
                    // Network or 5xx error: leave clip pending, try again on next tick.
                    console.error('[sync] failed to upload clip; will retry later', error);
                }
                // Throttle: 1 upload per ~750ms to avoid hammering the API and to
                // give the serverless function room between cold-starts. Backlog of
                // 100 clips => ~75s wall time, perfectly acceptable for a recovery
                // operation that runs in the background.
                await new Promise((r) => setTimeout(r, 750));
            }
            // Drop fully-synced clips so storage doesn't grow unbounded and we
            // don't re-evaluate them on every future tick. Keep any clips still
            // marked unsynced (failed uploads, limit-reached) for the next retry.
            const remaining = all.filter((c) => !c.synced);
            background_extensionAPI.storage.local.set({ localClips: remaining });
            log(`[sync] backlog flush complete — uploaded ${successCount}, remaining ${remaining.length}${limitReached ? ' (paused: limit reached)' : ''}`);
        }
        catch (error) {
            console.error('[sync] failed to sync local clips:', error);
        }
    })().finally(() => {
        syncInFlight = null;
    });
    return syncInFlight;
}

/******/ })()
;
//# sourceMappingURL=background.js.map