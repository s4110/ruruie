/**
 * NIP-07: Browser Extension for Key Management
 * https://github.com/nostr-protocol/nips/blob/master/07.md
 */

// Extend Window interface for Nostr extension
declare global {
	interface Window {
		nostr?: {
			getPublicKey(): Promise<string>;
			signEvent(event: {
				created_at: number;
				kind: number;
				tags: string[][];
				content: string;
			}): Promise<{
				id: string;
				pubkey: string;
				created_at: number;
				kind: number;
				tags: string[][];
				content: string;
				sig: string;
			}>;
			getRelays?(): Promise<Record<string, { read: boolean; write: boolean }>>;
			nip04?: {
				encrypt(pubkey: string, plaintext: string): Promise<string>;
				decrypt(pubkey: string, ciphertext: string): Promise<string>;
			};
		};
	}
}

export interface NostrExtension {
	getPublicKey(): Promise<string>;
	signEvent(event: UnsignedEvent): Promise<SignedEvent>;
	getRelays?(): Promise<Record<string, RelayPermissions>>;
	nip04?: {
		encrypt(pubkey: string, plaintext: string): Promise<string>;
		decrypt(pubkey: string, ciphertext: string): Promise<string>;
	};
}

export interface UnsignedEvent {
	created_at: number;
	kind: number;
	tags: string[][];
	content: string;
}

export interface SignedEvent extends UnsignedEvent {
	id: string;
	pubkey: string;
	sig: string;
}

export interface RelayPermissions {
	read: boolean;
	write: boolean;
}

/**
 * Check if NIP-07 browser extension is available
 */
export function hasNostrExtension(): boolean {
	return typeof window !== "undefined" && window.nostr !== undefined;
}

/**
 * Wait for Nostr extension to be available
 * Uses MutationObserver for efficient detection with polling fallback
 *
 * @param timeout - Maximum time to wait in milliseconds (default: 3000ms)
 * @returns Promise that resolves to true if extension is found, false if timeout
 */
export function waitForNostrExtension(timeout = 3000): Promise<boolean> {
	return new Promise((resolve) => {
		// Already available
		if (hasNostrExtension()) {
			resolve(true);
			return;
		}

		let timeoutId: ReturnType<typeof setTimeout> | null = null;
		let pollingId: ReturnType<typeof setInterval> | null = null;
		let observer: MutationObserver | null = null;

		const cleanup = () => {
			if (timeoutId) clearTimeout(timeoutId);
			if (pollingId) clearInterval(pollingId);
			if (observer) observer.disconnect();
		};

		const onFound = () => {
			cleanup();
			resolve(true);
		};

		const onTimeout = () => {
			cleanup();
			resolve(false);
		};

		// Strategy 1: MutationObserver (most efficient)
		// Watch for script injections that might add window.nostr
		try {
			observer = new MutationObserver(() => {
				if (hasNostrExtension()) {
					onFound();
				}
			});

			observer.observe(document.documentElement, {
				childList: true,
				subtree: true,
			});
		} catch (error) {
			console.warn("MutationObserver not available:", error);
		}

		// Strategy 2: Polling fallback (every 100ms)
		pollingId = setInterval(() => {
			if (hasNostrExtension()) {
				onFound();
			}
		}, 100);

		// Strategy 3: Timeout
		timeoutId = setTimeout(onTimeout, timeout);
	});
}

/**
 * Get the Nostr extension instance
 * @throws Error if extension is not available
 */
export function getNostrExtension(): NostrExtension {
	if (!hasNostrExtension()) {
		throw new Error(
			"Nostr extension not found. Please install a NIP-07 compatible browser extension (e.g., nos2x, Alby, Flamingo).",
		);
	}
	return window.nostr as NostrExtension;
}

/**
 * Get public key from NIP-07 extension
 */
export async function getPublicKey(): Promise<string> {
	const nostr = getNostrExtension();
	return await nostr.getPublicKey();
}

/**
 * Sign an event using NIP-07 extension
 */
export async function signEvent(event: UnsignedEvent): Promise<SignedEvent> {
	const nostr = getNostrExtension();
	return await nostr.signEvent(event);
}

/**
 * Get user's relay list from NIP-07 extension (if supported)
 */
export async function getRelays(): Promise<Record<
	string,
	RelayPermissions
> | null> {
	const nostr = getNostrExtension();
	if (!nostr.getRelays) {
		return null;
	}
	return await nostr.getRelays();
}

/**
 * Check if NIP-04 (encrypted DMs) is supported
 */
export function hasNip04Support(): boolean {
	if (!hasNostrExtension()) return false;
	return window.nostr?.nip04 !== undefined;
}

/**
 * Encrypt a message using NIP-04 (if supported)
 */
export async function encryptMessage(
	recipientPubkey: string,
	plaintext: string,
): Promise<string> {
	const nostr = getNostrExtension();
	if (!nostr.nip04) {
		throw new Error("NIP-04 encryption not supported by extension");
	}
	return await nostr.nip04.encrypt(recipientPubkey, plaintext);
}

/**
 * Decrypt a message using NIP-04 (if supported)
 */
export async function decryptMessage(
	senderPubkey: string,
	ciphertext: string,
): Promise<string> {
	const nostr = getNostrExtension();
	if (!nostr.nip04) {
		throw new Error("NIP-04 decryption not supported by extension");
	}
	return await nostr.nip04.decrypt(senderPubkey, ciphertext);
}
