/**
 * NIP-25 Reactions Service
 * Handles sending and fetching reactions (kind 7 events)
 */

import type { UnsignedEvent } from "../../shared/nostr/nip07";
import { signEvent } from "../../shared/nostr/nip07";
import {
	fetchEvents$,
	publishEvent,
	subscribeToEvents$,
} from "../../shared/nostr/relayManager";
import type { TimelineEvent } from "../../shared/ui/Timeline";
import { getCurrentPubkey } from "../auth/authStore";

/**
 * Send a reaction to an event (NIP-25 compliant)
 *
 * @param targetEvent - The event to react to
 * @param content - Reaction content ("+" for like, emoji for custom reaction)
 * @returns Array of relay URLs that accepted the reaction
 */
export async function sendReaction(
	targetEvent: TimelineEvent,
	content = "+",
): Promise<string[]> {
	const pubkey = getCurrentPubkey();
	if (!pubkey) {
		throw new Error("Not authenticated");
	}

	// NIP-25に従ったタグの構築
	const tags: string[][] = [];

	// eタグ: リアクション対象のイベント（最後に配置）
	// ["e", <event-id>, <relay-url>, <pubkey>]
	tags.push(["e", targetEvent.id, "", targetEvent.pubkey]);

	// pタグ: リアクション対象の作成者（最後に配置）
	// ["p", <pubkey>, <relay-url>]
	tags.push(["p", targetEvent.pubkey, ""]);

	// kタグ: リアクション対象のイベント種別
	tags.push(["k", targetEvent.kind.toString()]);

	// イベントを作成
	const unsignedEvent: UnsignedEvent = {
		kind: 7,
		created_at: Math.floor(Date.now() / 1000),
		content,
		tags,
	};

	// Sign event using NIP-07
	const signedEvent = await signEvent(unsignedEvent);

	// Publish to relays
	const publishedRelays = await publishEvent(signedEvent);

	return publishedRelays;
}

/**
 * Fetch reaction count for an event
 *
 * @param eventId - The event ID to count reactions for
 * @param timeoutMs - Timeout in milliseconds
 * @returns Number of reactions
 */
export async function fetchReactionCount(
	eventId: string,
	timeoutMs = 3000,
): Promise<number> {
	return new Promise((resolve) => {
		const reactions = new Set<string>(); // Use Set to deduplicate by reaction event ID
		let completed = false;

		const subscription = fetchEvents$({
			kinds: [7],
			"#e": [eventId],
		}).subscribe({
			next: (event) => {
				if (event && event.id) {
					reactions.add(event.id);
				}
			},
			error: (err) => {
				console.error("Error fetching reactions:", err);
				if (!completed) {
					completed = true;
					resolve(reactions.size);
				}
			},
			complete: () => {
				if (!completed) {
					completed = true;
					resolve(reactions.size);
				}
			},
		});

		// Timeout fallback
		setTimeout(() => {
			if (!completed) {
				completed = true;
				subscription.unsubscribe();
				resolve(reactions.size);
			}
		}, timeoutMs);
	});
}

/**
 * Check if current user has reacted to an event
 *
 * @param eventId - The event ID to check
 * @param timeoutMs - Timeout in milliseconds
 * @returns True if user has reacted
 */
export async function hasUserReacted(
	eventId: string,
	timeoutMs = 3000,
): Promise<boolean> {
	const pubkey = getCurrentPubkey();
	if (!pubkey) return false;

	return new Promise((resolve) => {
		let completed = false;

		const subscription = fetchEvents$({
			kinds: [7],
			authors: [pubkey],
			"#e": [eventId],
			limit: 1,
		}).subscribe({
			next: (event) => {
				if (event && !completed) {
					completed = true;
					resolve(true);
				}
			},
			error: () => {
				if (!completed) {
					completed = true;
					resolve(false);
				}
			},
			complete: () => {
				if (!completed) {
					completed = true;
					resolve(false);
				}
			},
		});

		setTimeout(() => {
			if (!completed) {
				completed = true;
				subscription.unsubscribe();
				resolve(false);
			}
		}, timeoutMs);
	});
}

/**
 * Subscribe to real-time reaction updates for an event
 *
 * @param eventId - The event ID to watch
 * @param onReactionUpdate - Callback with updated count
 * @returns Unsubscribe function
 */
export function subscribeToReactions(
	eventId: string,
	onReactionUpdate: (count: number) => void,
): () => void {
	const reactions = new Set<string>();

	const subscription = subscribeToEvents$({
		kinds: [7],
		"#e": [eventId],
	}).subscribe({
		next: (event) => {
			if (event && event.id) {
				reactions.add(event.id);
				onReactionUpdate(reactions.size);
			}
		},
		error: (err) => {
			console.error("Reaction subscription error:", err);
		},
	});

	return () => subscription.unsubscribe();
}
