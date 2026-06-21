import { createResource, type Resource } from "solid-js";
import {
	fetchEventFromRelays,
	fetchEventsFromRelays,
} from "../../../infrastructure/nostr/relayManager";
import { type AKAProfile, combineProfileWithIdentities } from "../nips/nip39";

/**
 * Fetch profile metadata (kind 0) for a given pubkey
 */
async function fetchProfile(pubkey: string): Promise<AKAProfile | null> {
	if (!pubkey) return null;

	// Use relay manager to fetch from multiple relays (race for first result)
	const event = await fetchEventFromRelays(
		{
			kinds: [0],
			authors: [pubkey],
			limit: 1,
		},
		3000, // 3 second timeout
	);

	if (!event) return null;

	// Parse profile with NIP-39 identities
	return combineProfileWithIdentities(event);
}

/**
 * SolidJS hook to fetch and reactively track a user profile
 */
export function useProfile(
	pubkey: () => string | null,
): Resource<AKAProfile | null> {
	const [profile] = createResource(pubkey, fetchProfile);
	return profile;
}

/**
 * Fetch multiple profiles in parallel
 */
export async function fetchProfiles(
	pubkeys: string[],
): Promise<Map<string, AKAProfile>> {
	const profiles = new Map<string, AKAProfile>();

	if (pubkeys.length === 0) return profiles;

	// Fetch all profiles from relays (returns array of events)
	const events = await fetchEventsFromRelays(
		{
			kinds: [0],
			authors: pubkeys,
		},
		10000, // 10 second timeout for batch operation
	);

	// Parse each profile
	for (const event of events) {
		const profile = combineProfileWithIdentities(event);
		if (profile) {
			profiles.set(event.pubkey, profile);
		}
	}

	return profiles;
}
