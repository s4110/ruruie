/**
 * URL Metadata Fetcher
 *
 * Fetches and caches page title and favicon for URLs
 */

export interface OGPMetadata {
	url: string;
	title?: string;
	favicon?: string;
	// Future: Add OGP fields if needed
	// description?: string;
	// image?: string;
	// siteName?: string;
}

// In-memory cache: URL -> OGP metadata
const ogpCache = new Map<string, OGPMetadata | null>();

// Pending requests to avoid duplicate fetches
const pendingRequests = new Map<string, Promise<OGPMetadata | null>>();

/**
 * Extract domain from URL for favicon fallback
 */
function extractDomain(url: string): string {
	try {
		const urlObj = new URL(url);
		return urlObj.origin;
	} catch {
		return "";
	}
}

/**
 * Parse HTML and extract page title and favicon
 */
function parseMetadataFromHTML(html: string, url: string): OGPMetadata {
	const parser = new DOMParser();
	const doc = parser.parseFromString(html, "text/html");

	// Extract title from <title> tag
	const title = doc.querySelector("title")?.textContent?.trim() || undefined;

	// Extract favicon
	let favicon: string | undefined;

	// Try various favicon link tags
	const iconSelectors = [
		'link[rel="icon"]',
		'link[rel="shortcut icon"]',
		'link[rel="apple-touch-icon"]',
	];

	for (const selector of iconSelectors) {
		const iconLink = doc.querySelector(selector);
		if (iconLink) {
			const href = iconLink.getAttribute("href");
			if (href) {
				try {
					// Convert relative URLs to absolute
					favicon = new URL(href, url).href;
					break;
				} catch {
					// Invalid URL, continue to next
				}
			}
		}
	}

	// Fallback to /favicon.ico
	if (!favicon) {
		const domain = extractDomain(url);
		if (domain) {
			favicon = `${domain}/favicon.ico`;
		}
	}

	return {
		url,
		title,
		favicon,
	};
}

/**
 * Fetch page metadata (title and favicon) from a URL
 * Note: May fail due to CORS restrictions. Falls back to plain URL on error.
 */
export async function fetchOGP(url: string): Promise<OGPMetadata | null> {
	// Check cache first
	if (ogpCache.has(url)) {
		return ogpCache.get(url)!;
	}

	// Check if already fetching
	if (pendingRequests.has(url)) {
		return pendingRequests.get(url)!;
	}

	// Fetch from URL
	const request = (async () => {
		try {
			// Try direct fetch (may fail due to CORS)
			const response = await fetch(url, {
				mode: "cors",
				credentials: "omit",
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`);
			}

			const html = await response.text();
			const metadata = parseMetadataFromHTML(html, url);

			ogpCache.set(url, metadata);
			return metadata;
		} catch (error) {
			// CORS error or network error - fail silently and show plain URL
			console.debug(`Failed to fetch OGP for ${url}:`, error);
			ogpCache.set(url, null);
			return null;
		} finally {
			pendingRequests.delete(url);
		}
	})();

	pendingRequests.set(url, request);
	return request;
}

/**
 * Get cached metadata (synchronous)
 * Returns undefined if not in cache, null if fetch failed
 */
export function getCachedOGP(url: string): OGPMetadata | null | undefined {
	return ogpCache.get(url);
}

/**
 * Prefetch metadata for multiple URLs
 */
export async function prefetchOGP(urls: string[]): Promise<void> {
	await Promise.all(urls.map((url) => fetchOGP(url)));
}

/**
 * Clear metadata cache
 */
export function clearOGPCache(): void {
	ogpCache.clear();
	pendingRequests.clear();
}
