import type { Subscription } from "rxjs";
import { type Component, createSignal, onCleanup, onMount } from "solid-js";
import {
	fetchEvents$,
	subscribeToEvents$,
} from "../../infrastructure/nostr/relayManager";
import AppLayout from "../../shared/ui/AppLayout";
import Timeline, { type TimelineEvent } from "../../shared/ui/Timeline";
import PostComposer from "../post/PostComposer";

const GlobalTimelinePage: Component = () => {
	const [events, setEvents] = createSignal<TimelineEvent[]>([]);
	const [loading, setLoading] = createSignal(true);
	const [oldestTimestamp, setOldestTimestamp] = createSignal<number>(
		Math.floor(Date.now() / 1000),
	);

	let loadSubscription: Subscription | null = null;
	let realtimeSubscription: Subscription | null = null;

	const loadEvents = (until?: number) => {
		setLoading(true);

		// Cancel previous load subscription if exists
		if (loadSubscription) {
			loadSubscription.unsubscribe();
		}

		try {
			const timestamp = until || oldestTimestamp();

			// Fetch kind 1 (text notes) from global timeline using createRxOneshotReq
			const observable = fetchEvents$({
				kinds: [1],
				limit: 50,
				until: timestamp,
			});

			const eventsMap = new Map<string, TimelineEvent>();

			// Subscribe to events stream
			loadSubscription = observable.subscribe({
				next: (event) => {
					try {
						if (!eventsMap.has(event.id)) {
							eventsMap.set(event.id, event as TimelineEvent);

							// Update UI immediately when we get events
							const newEvents = Array.from(eventsMap.values()).sort(
								(a, b) => b.created_at - a.created_at,
							);

							if (until) {
								// Loading more - merge with existing
								setEvents((prev) => {
									const combined = [...prev, ...newEvents];
									const uniqueMap = new Map(combined.map((e) => [e.id, e]));
									const result = Array.from(uniqueMap.values()).sort(
										(a, b) => b.created_at - a.created_at,
									);
									return result;
								});
							} else {
								// Initial load
								setEvents(newEvents);
							}

							// Update oldest timestamp
							if (newEvents.length > 0) {
								const oldest = Math.min(...newEvents.map((e) => e.created_at));
								setOldestTimestamp(oldest);
							}
						}
					} catch (error) {
						console.error("Error processing event:", error);
					}
				},
				error: (err) => {
					console.error("Failed to load timeline events:", err);
					setLoading(false);
				},
				complete: () => {
					console.log("✅ Timeline load completed");
					setLoading(false);

					// Start real-time subscription after initial load completes
					if (!until && !realtimeSubscription) {
						startRealtimeSubscription();
					}
				},
			});

			// Set timeout to stop loading after 10 seconds if not completed
			setTimeout(() => {
				if (loading()) {
					console.warn("Timeline loading timeout");
					setLoading(false);
					if (loadSubscription) {
						loadSubscription.unsubscribe();
					}
					// Start real-time even if timeout
					if (!until && !realtimeSubscription) {
						startRealtimeSubscription();
					}
				}
			}, 10000);
		} catch (error) {
			console.error("Failed to load timeline events:", error);
			setLoading(false);
		}
	};

	const startRealtimeSubscription = () => {
		const now = Math.floor(Date.now() / 1000);
		// Start from 10 minutes ago to catch recent events
		const since = now - 10 * 60;

		// Subscribe to events from the last 10 minutes onwards
		const observable = subscribeToEvents$({
			kinds: [1],
			since: since,
		});

		realtimeSubscription = observable.subscribe({
			next: (event) => {
				try {
					// Add new event to the top of the timeline
					setEvents((prev) => {
						// Check if event already exists
						if (prev.some((e) => e.id === event.id)) {
							return prev;
						}

						// Add new event and sort
						const updated = [event as TimelineEvent, ...prev].sort(
							(a, b) => b.created_at - a.created_at,
						);
						return updated;
					});
				} catch (error) {
					console.error("Error processing real-time event:", error);
				}
			},
			error: (err) => {
				console.error("Real-time subscription error:", err);
			},
		});
	};

	const handleLoadMore = () => {
		const oldest = oldestTimestamp();
		console.log(
			"🔽 handleLoadMore called, loading:",
			loading(),
			"oldest:",
			oldest,
		);
		if (oldest && !loading()) {
			console.log("📥 Loading more events...");
			loadEvents(oldest - 1); // Load events older than current oldest
		}
	};

	onMount(() => {
		loadEvents();
	});

	onCleanup(() => {
		if (loadSubscription) {
			loadSubscription.unsubscribe();
		}
		if (realtimeSubscription) {
			realtimeSubscription.unsubscribe();
		}
	});

	return (
		<AppLayout>
			<div class="mb-4">
				<h2 class="text-xl font-bold text-gray-900 dark:text-white">
					グローバルタイムライン
				</h2>
				<p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
					{events().length}件のイベント
				</p>
			</div>

			<PostComposer onPostSuccess={() => {
				console.log("Post published successfully!");
			}} />

			<Timeline
				events={events}
				loading={loading}
				onLoadMore={handleLoadMore}
			/>
		</AppLayout>
	);
};

export default GlobalTimelinePage;
