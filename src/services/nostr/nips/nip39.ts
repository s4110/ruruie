/**
 * NIP-39: External Identity References (AKA Profiles)
 * https://github.com/nostr-protocol/nips/blob/master/39.md
 *
 * Allows users to maintain multiple identities/profiles using a single key pair
 */

import type { SignedEvent, UnsignedEvent } from "./nip07";

/**
 * Identity claim in NIP-39
 */
export interface IdentityClaim {
	platform: string; // e.g., "github", "twitter", "mastodon", "telegram"
	identity: string; // e.g., username or ID on that platform
	proof?: string; // Optional proof URL
}

/**
 * Profile/Persona definition
 */
export interface NostrProfile {
	name?: string;
	display_name?: string;
	about?: string;
	picture?: string;
	banner?: string;
	nip05?: string;
	lud16?: string; // Lightning address
	website?: string;
}

/**
 * Combined profile with external identities
 */
export interface AKAProfile extends NostrProfile {
	identities: IdentityClaim[];
}

/**
 * Parse identity claims from event tags
 * NIP-39 uses "i" tags: ["i", "platform:identity", "proof"]
 */
export function parseIdentityClaims(event: SignedEvent): IdentityClaim[] {
	const identities: IdentityClaim[] = [];

	for (const tag of event.tags) {
		if (tag[0] === "i" && tag[1]) {
			const [platform, identity] = tag[1].split(":", 2);
			if (platform && identity) {
				identities.push({
					platform,
					identity,
					proof: tag[2],
				});
			}
		}
	}

	return identities;
}

/**
 * Create identity claim tags for event
 */
export function createIdentityTags(identities: IdentityClaim[]): string[][] {
	return identities.map((claim) => {
		const tag = ["i", `${claim.platform}:${claim.identity}`];
		if (claim.proof) {
			tag.push(claim.proof);
		}
		return tag;
	});
}

/**
 * Parse profile metadata from kind 0 event
 */
export function parseProfileMetadata(event: SignedEvent): NostrProfile | null {
	if (event.kind !== 0) return null;

	try {
		const metadata = JSON.parse(event.content) as NostrProfile;
		return metadata;
	} catch {
		return null;
	}
}

/**
 * Create profile metadata event (kind 0)
 */
export function createProfileMetadataEvent(
	profile: NostrProfile,
	identities: IdentityClaim[] = [],
): UnsignedEvent {
	return {
		kind: 0,
		created_at: Math.floor(Date.now() / 1000),
		tags: createIdentityTags(identities),
		content: JSON.stringify(profile),
	};
}

/**
 * Combine profile metadata with identity claims
 */
export function combineProfileWithIdentities(
	event: SignedEvent,
): AKAProfile | null {
	const profile = parseProfileMetadata(event);
	if (!profile) return null;

	const identities = parseIdentityClaims(event);

	return {
		...profile,
		identities,
	};
}

/**
 * Common platform identifiers for NIP-39
 */
export const SUPPORTED_PLATFORMS = {
	GITHUB: "github",
	TWITTER: "twitter",
	MASTODON: "mastodon",
	TELEGRAM: "telegram",
	DISCORD: "discord",
	REDDIT: "reddit",
	YOUTUBE: "youtube",
	TWITCH: "twitch",
	INSTAGRAM: "instagram",
	FACEBOOK: "facebook",
	LINKEDIN: "linkedin",
	EMAIL: "email",
	WEB: "web",
} as const;

/**
 * Validate identity claim format
 */
export function validateIdentityClaim(claim: IdentityClaim): boolean {
	// Platform must be lowercase alphanumeric
	if (!/^[a-z0-9]+$/.test(claim.platform)) {
		return false;
	}

	// Identity must not be empty
	if (!claim.identity.trim()) {
		return false;
	}

	// Proof must be valid URL if provided
	if (claim.proof) {
		try {
			new URL(claim.proof);
		} catch {
			return false;
		}
	}

	return true;
}

/**
 * Get platform icon/display name
 */
export function getPlatformDisplay(platform: string): {
	name: string;
	icon: string;
} {
	const displays: Record<string, { name: string; icon: string }> = {
		github: { name: "GitHub", icon: "🐙" },
		twitter: { name: "Twitter/X", icon: "🐦" },
		mastodon: { name: "Mastodon", icon: "🦣" },
		telegram: { name: "Telegram", icon: "✈️" },
		discord: { name: "Discord", icon: "💬" },
		reddit: { name: "Reddit", icon: "🤖" },
		youtube: { name: "YouTube", icon: "📺" },
		twitch: { name: "Twitch", icon: "🎮" },
		instagram: { name: "Instagram", icon: "📷" },
		email: { name: "Email", icon: "📧" },
		web: { name: "Website", icon: "🌐" },
	};

	return (
		displays[platform] || {
			name: platform.charAt(0).toUpperCase() + platform.slice(1),
			icon: "🔗",
		}
	);
}
