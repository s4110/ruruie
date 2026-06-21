import { A } from "@solidjs/router";
import type { Subscription } from "rxjs";
import { type Component, createSignal, onCleanup, onMount } from "solid-js";
import { fetchContactList } from "../../services/nostr/nips/nip02";
import {
	fetchEvents$,
	subscribeToEvents$,
} from "../../infrastructure/nostr/relayManager";
import Timeline, { type TimelineEvent } from "../../shared/ui/Timeline";
import { getUser, logout } from "../auth/authStore";
import PostComposer from "../post/PostComposer";

const HomeTimelinePage: Component = () => {
	const [events, setEvents] = createSignal<TimelineEvent[]>([]);
	const [loading, setLoading] = createSignal(true);
	const [oldestTimestamp, setOldestTimestamp] = createSignal<number>(
		Math.floor(Date.now() / 1000),
	);
	const [followingPubkeys, setFollowingPubkeys] = createSignal<string[]>([]);

	const handleLogout = () => {
		if (confirm("ログアウトしますか？")) {
			logout();
		}
	};

	let loadSubscription: Subscription | null = null;
	let realtimeSubscription: Subscription | null = null;

	const loadEvents = async (until?: number) => {
		setLoading(true);

		// Get current user's pubkey
		const user = getUser();
		if (!user) {
			console.error("User not logged in");
			setLoading(false);
			return;
		}

		// Fetch contact list if not already loaded
		if (followingPubkeys().length === 0) {
			const contacts = await fetchContactList(user.pubkey);
			const pubkeys = contacts.map((c) => c.pubkey);

			if (pubkeys.length === 0) {
				console.log("No following list found");
				setLoading(false);
				return;
			}

			setFollowingPubkeys(pubkeys);
		}

		// Cancel previous load subscription if exists
		if (loadSubscription) {
			loadSubscription.unsubscribe();
		}

		try {
			const timestamp = until || oldestTimestamp();

			// Fetch kind 1 (text notes) from followed users only
			const observable = fetchEvents$({
				kinds: [1],
				authors: followingPubkeys(), // Only from followed users
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

		// Subscribe to events from followed users
		const observable = subscribeToEvents$({
			kinds: [1],
			authors: followingPubkeys(), // Only from followed users
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
		<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
			<div class="max-w-2xl mx-auto p-4">
				<div class="flex items-center justify-between mb-6">
					<h1 class="text-2xl font-bold text-purple-600 dark:text-purple-400">
						ruruie
					</h1>
					<div class="flex items-center gap-4">
						<A
							href="/"
							class="px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
						>
							ホーム
						</A>
						<A
							href="/timeline"
							class="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
						>
							グローバル
						</A>
						<A
							href="/notifications"
							class="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
						>
							通知
						</A>
						<A
							href="/profile"
							class="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
						>
							プロフィール
						</A>
						<button
							type="button"
							onClick={handleLogout}
							class="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
						>
							ログアウト
						</button>
					</div>
				</div>

				<div class="mb-4">
					<h2 class="text-xl font-bold text-gray-900 dark:text-white">
						ホームタイムライン
					</h2>
					<p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
						{events().length}件のイベント / {followingPubkeys().length}
						人をフォロー中
					</p>
				</div>

				<PostComposer
					onPostSuccess={() => {
						console.log("Post published successfully!");
					}}
				/>

				<Timeline
					events={events}
					loading={loading}
					onLoadMore={handleLoadMore}
				/>
			</div>
		</div>
	);
};

export default HomeTimelinePage;
