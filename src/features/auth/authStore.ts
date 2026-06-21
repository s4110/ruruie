import { createSignal } from "solid-js";
import {
	getPublicKey,
	waitForNostrExtension,
} from "../../services/nostr/nips/nip07";

/**
 * Authentication state and actions
 * Manages user authentication via NIP-07
 */

export type AuthState = "unauthenticated" | "loading" | "authenticated";

// Global auth state
const [pubkey, setPubkey] = createSignal<string | null>(null);
const [authState, setAuthState] = createSignal<AuthState>("unauthenticated");
const [error, setError] = createSignal<string | null>(null);

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
	return authState() === "authenticated" && pubkey() !== null;
}

/**
 * Get current user's public key
 */
export function getCurrentPubkey(): string | null {
	return pubkey();
}

/**
 * Get current user object
 */
export function getUser(): { pubkey: string } | null {
	const pk = pubkey();
	return pk ? { pubkey: pk } : null;
}

/**
 * Get current authentication state
 */
export function getAuthState(): AuthState {
	return authState();
}

/**
 * Get authentication error message
 */
export function getAuthError(): string | null {
	return error();
}

/**
 * Login using NIP-07 extension
 */
export async function login(): Promise<void> {
	setError(null);
	setAuthState("loading");

	try {
		// Wait for extension to be available (5 second timeout for user action)
		const extensionFound = await waitForNostrExtension(5000);

		if (!extensionFound) {
			throw new Error(
				"Nostr拡張機能が見つかりません。nos2x、Alby、Flamingoなどのブラウザ拡張機能をインストールしてください。",
			);
		}

		const pk = await getPublicKey();
		setPubkey(pk);
		setAuthState("authenticated");

		// Store in localStorage for persistence
		localStorage.setItem("nostr_pubkey", pk);
	} catch (err) {
		const message =
			err instanceof Error ? err.message : "ログインに失敗しました";
		setError(message);
		setAuthState("unauthenticated");
		throw err;
	}
}

/**
 * Logout current user
 */
export function logout(): void {
	setPubkey(null);
	setAuthState("unauthenticated");
	setError(null);
	localStorage.removeItem("nostr_pubkey");
}

/**
 * Restore authentication from localStorage
 * Call this on app initialization
 */
export async function restoreAuth(): Promise<void> {
	const storedPubkey = localStorage.getItem("nostr_pubkey");

	if (!storedPubkey) {
		setAuthState("unauthenticated");
		return;
	}

	// Wait for Nostr extension to load (with 3 second timeout)
	const extensionFound = await waitForNostrExtension(3000);

	if (!extensionFound) {
		// Extension was removed or not available, clear stored auth
		logout();
		return;
	}

	try {
		setAuthState("loading");
		const currentPubkey = await getPublicKey();

		if (currentPubkey === storedPubkey) {
			setPubkey(currentPubkey);
			setAuthState("authenticated");
		} else {
			// Pubkey mismatch, user changed account
			logout();
		}
	} catch (err) {
		// Extension error, clear auth
		logout();
	}
}

/**
 * Export signals for reactive access in components
 */
export const authSignals = {
	pubkey,
	authState,
	error,
} as const;
