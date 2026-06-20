/**
 * Global Relay Connection Manager (rx-nostr based)
 * Manages WebSocket connections to Nostr relays using reactive streams
 */

import type { NostrEvent } from "nostr-tools/pure";
import { verifyEvent } from "nostr-tools/pure";
import {
	createRxForwardReq,
	createRxNostr,
	createRxOneshotReq,
} from "rx-nostr";
import { firstValueFrom, type Observable } from "rxjs";
import { first, map, shareReplay, timeout } from "rxjs/operators";
import { createSignal } from "solid-js";

export type RelayStatus = "connecting" | "connected" | "disconnected" | "error";

/**
 * Default relay list
 */
export const DEFAULT_RELAYS = [
	"wss://yabu.me/",
	"wss://r.kojira.io/",
	"wss://relay-jp.nostr.wirednet.jp/",
	"wss://nostr.wine/",
	"wss://nostr.land/",
	"wss://nrelay-jp.c-stellar.net/",
] as const;

/**
 * Global RxNostr instance
 */
let rxNostr: ReturnType<typeof createRxNostr> | null = null;

/**
 * Reactive signal for relay statuses
 */
const [relayStatuses, setRelayStatuses] = createSignal<
	Map<string, RelayStatus>
>(new Map());

/**
 * Initialize RxNostr with default relays
 */
export function initializeRelays(
	urls: readonly string[] = DEFAULT_RELAYS,
): void {
	if (rxNostr) {
		console.warn("RxNostr already initialized");
		return;
	}

	// Create RxNostr with verifier (async wrapper for verifyEvent)
	rxNostr = createRxNostr({
		verifier: async (event) => verifyEvent(event),
	});

	// Set default relays
	rxNostr.setDefaultRelays(urls as string[]);

	// Update relay statuses
	for (const url of urls) {
		updateRelayStatus(url, "connected");
	}

	console.log("RxNostr initialized with relays:", urls);
}

/**
 * Get RxNostr instance
 */
export function getRxNostr(): ReturnType<typeof createRxNostr> {
	if (!rxNostr) {
		throw new Error("RxNostr not initialized. Call initializeRelays() first.");
	}
	return rxNostr;
}

/**
 * Update relay status signal
 */
function updateRelayStatus(url: string, status: RelayStatus): void {
	setRelayStatuses((prev) => {
		const next = new Map(prev);
		next.set(url, status);
		return next;
	});
}

/**
 * Get relay status
 */
export function getRelayStatus(url: string): RelayStatus {
	return relayStatuses().get(url) || "disconnected";
}

/**
 * Get all relay statuses (reactive)
 */
export function getAllRelayStatuses(): Map<string, RelayStatus> {
	return relayStatuses();
}

/**
 * Disconnect from all relays
 */
export function disconnectAllRelays(): void {
	if (rxNostr) {
		rxNostr.dispose();
		rxNostr = null;
	}

	// Update all statuses to disconnected
	setRelayStatuses((prev) => {
		const next = new Map(prev);
		for (const [url] of prev) {
			next.set(url, "disconnected");
		}
		return next;
	});
}

/**
 * Fetch a single event from relays using Observable
 */
export function fetchEvent$(filter: {
	kinds?: number[];
	authors?: string[];
	ids?: string[];
	limit?: number;
	since?: number;
	until?: number;
}): Observable<NostrEvent> {
	const rxn = getRxNostr();
	const req = createRxOneshotReq({ filters: [filter] });

	return rxn.use(req).pipe(
		map((packet) => packet.event),
		first(), // Take only the first event
		timeout(3000), // 3 second timeout
		shareReplay(1), // Cache the result
	);
}

/**
 * Fetch a single event from relays (Promise-based)
 */
export async function fetchEventFromRelays(
	filter: {
		kinds?: number[];
		authors?: string[];
		ids?: string[];
		limit?: number;
		since?: number;
		until?: number;
	},
	timeoutMs = 3000,
): Promise<NostrEvent | null> {
	try {
		const event = await firstValueFrom(
			fetchEvent$(filter).pipe(timeout(timeoutMs)),
			{ defaultValue: null },
		);
		return event;
	} catch (error) {
		console.warn("Failed to fetch event:", error);
		return null;
	}
}

/**
 * Fetch multiple events from relays using Observable
 */
export function fetchEvents$(filter: {
	kinds?: number[];
	authors?: string[];
	ids?: string[];
	limit?: number;
	since?: number;
	until?: number;
}): Observable<NostrEvent> {
	const rxn = getRxNostr();
	const req = createRxOneshotReq({ filters: [filter] });

	return rxn.use(req).pipe(
		map((packet) => packet.event),
		// shareReplay() can prevent complete() from propagating
		// Remove it to allow proper completion
	);
}

/**
 * Fetch multiple events from relays (Promise-based)
 */
export async function fetchEventsFromRelays(
	filter: {
		kinds?: number[];
		authors?: string[];
		ids?: string[];
		limit?: number;
		since?: number;
		until?: number;
	},
	timeoutMs = 5000,
): Promise<NostrEvent[]> {
	try {
		const events: NostrEvent[] = [];
		const eventsMap = new Map<string, NostrEvent>(); // Deduplicate by event ID

		await fetchEvents$(filter)
			.pipe(timeout(timeoutMs))
			.forEach((event) => {
				if (!eventsMap.has(event.id)) {
					eventsMap.set(event.id, event);
					events.push(event);
				}
			});

		return events;
	} catch (error) {
		console.warn("Failed to fetch events:", error);
		return [];
	}
}

/**
 * Subscribe to real-time events using Observable
 * For continuous subscriptions (e.g., timeline, live updates)
 * This uses createRxForwardReq to receive both stored and new real-time events
 */
export function subscribeToEvents$(filter: {
	kinds?: number[];
	authors?: string[];
	ids?: string[];
	since?: number;
	until?: number;
	limit?: number;
}): Observable<NostrEvent> {
	const rxn = getRxNostr();
	const req = createRxForwardReq();

	const observable = rxn.use(req);

	// Emit filter AFTER creating observable
	setTimeout(() => {
		req.emit([filter]);
	}, 0);

	return observable.pipe(map((packet) => packet.event));
}
