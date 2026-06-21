/**
 * Profile Cache Manager
 * Fetches and caches user metadata (kind 0 events)
 */

import type { NostrEvent } from "nostr-tools/pure";
import { firstValueFrom } from "rxjs";
import { timeout } from "rxjs/operators";
import { fetchEvent$ } from "./relayManager";

export interface UserProfile {
	pubkey: string;
	name?: string;
	display_name?: string;
	about?: string;
	picture?: string;
	banner?: string;
	nip05?: string;
	lud06?: string;
	lud16?: string;
	website?: string;
}

// In-memory cache: pubkey -> profile
const profileCache = new Map<string, UserProfile>();

// Pending requests: pubkey -> Promise
const pendingRequests = new Map<string, Promise<UserProfile | null>>();

/**
 * Parse kind 0 metadata event content
 */
function parseMetadata(event: NostrEvent): UserProfile | null {
	try {
		const metadata = JSON.parse(event.content);
		return {
			pubkey: event.pubkey,
			name: metadata.name,
			display_name: metadata.display_name,
			about: metadata.about,
			picture: metadata.picture,
			banner: metadata.banner,
			nip05: metadata.nip05,
			lud06: metadata.lud06,
			lud16: metadata.lud16,
			website: metadata.website,
		};
	} catch (error) {
		console.warn("Failed to parse metadata:", error);
		return null;
	}
}

/**
 * Fetch profile metadata for a pubkey
 * Uses cache if available, otherwise fetches from relays
 */
export async function fetchProfile(
	pubkey: string,
): Promise<UserProfile | null> {
	// Check cache first
	if (profileCache.has(pubkey)) {
		return profileCache.get(pubkey)!;
	}

	// Check if already fetching
	if (pendingRequests.has(pubkey)) {
		return pendingRequests.get(pubkey)!;
	}

	// Fetch from relays
	const request = (async () => {
		try {
			const event = await firstValueFrom(
				fetchEvent$({
					kinds: [0],
					authors: [pubkey],
					limit: 1,
				}).pipe(timeout(3000)),
				{ defaultValue: null },
			);

			if (!event) {
				// Create minimal profile if no metadata found
				const minimalProfile: UserProfile = { pubkey };
				profileCache.set(pubkey, minimalProfile);
				return minimalProfile;
			}

			const profile = parseMetadata(event);
			if (profile) {
				profileCache.set(pubkey, profile);
				return profile;
			}

			return null;
		} catch (error) {
			console.warn(`Failed to fetch profile for ${pubkey.slice(0, 8)}:`, error);
			// Create minimal profile on error
			const minimalProfile: UserProfile = { pubkey };
			profileCache.set(pubkey, minimalProfile);
			return minimalProfile;
		} finally {
			pendingRequests.delete(pubkey);
		}
	})();

	pendingRequests.set(pubkey, request);
	return request;
}

/**
 * Fetch multiple profiles in batch
 */
export async function fetchProfiles(
	pubkeys: string[],
): Promise<Map<string, UserProfile | null>> {
	const results = new Map<string, UserProfile | null>();

	// Fetch all profiles in parallel
	const promises = pubkeys.map(async (pubkey) => {
		const profile = await fetchProfile(pubkey);
		results.set(pubkey, profile);
	});

	await Promise.all(promises);
	return results;
}

/**
 * Get cached profile (synchronous)
 * Returns null if not in cache
 */
export function getCachedProfile(pubkey: string): UserProfile | null {
	return profileCache.get(pubkey) || null;
}

/**
 * Clear profile cache
 */
export function clearProfileCache(): void {
	profileCache.clear();
	pendingRequests.clear();
}

/**
 * Get display name for a user
 * Priority: display_name > name > shortened pubkey
 */
export function getDisplayName(
	profile: UserProfile | null,
	pubkey: string,
): string {
	if (profile?.display_name) return profile.display_name;
	if (profile?.name) return profile.name;
	return `${pubkey.slice(0, 8)}...${pubkey.slice(-8)}`;
}

/**
 * Get avatar URL for a user
 * Returns picture URL or null if not available
 */
export function getAvatarUrl(profile: UserProfile | null): string | null {
	return profile?.picture || null;
}
