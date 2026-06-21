import { A } from "@solidjs/router";
import type { Subscription } from "rxjs";
import {
	type Component,
	createSignal,
	onCleanup,
	onMount,
	Show,
} from "solid-js";
import { VList } from "virtua/solid";
import { fetchProfile } from "../../infrastructure/nostr/profileCache";
import {
	fetchEvents$,
	subscribeToEvents$,
} from "../../infrastructure/nostr/relayManager";
import type { TimelineEvent } from "../../shared/ui/Timeline";
import { getUser, logout } from "../auth/authStore";

interface NotificationEvent extends TimelineEvent {
	notificationType: "reply" | "reaction" | "repost" | "mention";
	authorName?: string;
}

const NotificationTimelinePage: Component = () => {
	const [notifications, setNotifications] = createSignal<NotificationEvent[]>(
		[],
	);
	const [loading, setLoading] = createSignal(true);
	const [oldestTimestamp, setOldestTimestamp] = createSignal<number>(
		Math.floor(Date.now() / 1000),
	);

	let loadSubscription: Subscription | null = null;
	let realtimeSubscription: Subscription | null = null;
	const profileCache = new Map<string, string>();

	const handleLogout = () => {
		if (confirm("ログアウトしますか？")) {
			logout();
		}
	};

	// Fetch profile name for a notification
	const getAuthorName = (notification: NotificationEvent): string => {
		// Return cached author name if already set
		if (notification.authorName) {
			return notification.authorName;
		}

		// Return cached profile name
		if (profileCache.has(notification.pubkey)) {
			return profileCache.get(notification.pubkey)!;
		}

		// Fetch profile asynchronously
		fetchProfile(notification.pubkey).then((profile) => {
			if (profile?.display_name || profile?.name) {
				const name = profile.display_name || profile.name || "";
				profileCache.set(notification.pubkey, name);
				// Update notification with author name without triggering infinite loop
				setNotifications((prev) =>
					prev.map((n) =>
						n.id === notification.id && !n.authorName
							? { ...n, authorName: name }
							: n,
					),
				);
			}
		});

		// Return pubkey as fallback
		return notification.pubkey.slice(0, 8);
	};

	const loadNotifications = async (until?: number) => {
		setLoading(true);

		// Get current user's pubkey
		const user = getUser();
		if (!user) {
			console.error("User not logged in");
			setLoading(false);
			return;
		}

		const timestamp = until || oldestTimestamp();

		try {
			// Fetch notifications: mentions (kind 1), reactions (kind 7), reposts (kind 6)
			// Using #p tag to filter events that mention the user
			const observable = fetchEvents$({
				kinds: [1, 6, 7], // Text notes, reposts, reactions
				"#p": [user.pubkey], // Events that mention this user
				limit: 50,
				until: timestamp,
			});

			loadSubscription = observable.subscribe({
				next: (event) => {
					try {
						if (event) {
							const notificationEvent = event as NotificationEvent;

							// Determine notification type
							if (notificationEvent.kind === 7) {
								notificationEvent.notificationType = "reaction";
							} else if (notificationEvent.kind === 6) {
								notificationEvent.notificationType = "repost";
							} else if (notificationEvent.kind === 1) {
								// Check if it's a reply or just a mention
								const isReply = notificationEvent.tags.some(
									(tag) =>
										tag[0] === "e" &&
										tag[3] === "reply",
								);
								notificationEvent.notificationType = isReply
									? "reply"
									: "mention";
							}

							setNotifications((prev) => {
								// Check for duplicates
								const exists = prev.some((e) => e.id === notificationEvent.id);
								if (exists) return prev;

								// Insert in chronological order
								const newList = [...prev, notificationEvent].sort(
									(a, b) => b.created_at - a.created_at,
								);
								return newList;
							});

							// Update oldest timestamp
							if (notificationEvent.created_at < oldestTimestamp()) {
								setOldestTimestamp(notificationEvent.created_at);
							}
						}
					} catch (error) {
						console.error("Error processing notification:", error);
					}
				},
				error: (err) => {
					console.error("Failed to load notifications:", err);
					setLoading(false);
				},
				complete: () => {
					console.log("✅ Notifications load completed");
					setLoading(false);

					// Start real-time subscription after initial load
					if (!until && !realtimeSubscription) {
						startRealtimeSubscription();
					}
				},
			});

			// Set timeout to stop loading after 10 seconds
			setTimeout(() => {
				if (loading()) {
					console.warn("Notifications loading timeout");
					setLoading(false);
					if (loadSubscription) {
						loadSubscription.unsubscribe();
					}
					if (!until && !realtimeSubscription) {
						startRealtimeSubscription();
					}
				}
			}, 10000);
		} catch (error) {
			console.error("Failed to load notifications:", error);
			setLoading(false);
		}
	};

	const startRealtimeSubscription = () => {
		const user = getUser();
		if (!user) return;

		const now = Math.floor(Date.now() / 1000);
		const since = now - 10 * 60; // Last 10 minutes

		console.log("🔔 Starting real-time notification subscription...");

		const observable = subscribeToEvents$({
			kinds: [1, 6, 7],
			"#p": [user.pubkey],
			since,
		});

		realtimeSubscription = observable.subscribe({
			next: (event) => {
				if (event) {
					const notificationEvent = event as NotificationEvent;

					// Determine notification type
					if (notificationEvent.kind === 7) {
						notificationEvent.notificationType = "reaction";
					} else if (notificationEvent.kind === 6) {
						notificationEvent.notificationType = "repost";
					} else if (notificationEvent.kind === 1) {
						const isReply = notificationEvent.tags.some(
							(tag) =>
								tag[0] === "e" &&
								tag[3] === "reply",
						);
						notificationEvent.notificationType = isReply ? "reply" : "mention";
					}

					console.log("🔔 New notification:", notificationEvent.notificationType);

					setNotifications((prev) => {
						const exists = prev.some((e) => e.id === notificationEvent.id);
						if (exists) return prev;

						// Add to top
						return [notificationEvent, ...prev].sort(
							(a, b) => b.created_at - a.created_at,
						);
					});
				}
			},
			error: (err) => {
				console.error("Real-time notification subscription error:", err);
			},
		});
	};


	onMount(() => {
		loadNotifications();
	});

	onCleanup(() => {
		if (loadSubscription) {
			loadSubscription.unsubscribe();
		}
		if (realtimeSubscription) {
			realtimeSubscription.unsubscribe();
		}
	});

	const getNotificationIcon = (type: string) => {
		switch (type) {
			case "reply":
				return "💬";
			case "reaction":
				return "❤️";
			case "repost":
				return "🔁";
			case "mention":
				return "📢";
			default:
				return "🔔";
		}
	};

	const getNotificationLabel = (type: string) => {
		switch (type) {
			case "reply":
				return "リプライ";
			case "reaction":
				return "リアクション";
			case "repost":
				return "リポスト";
			case "mention":
				return "メンション";
			default:
				return "通知";
		}
	};

	const formatRelativeTime = (timestamp: number) => {
		const now = Math.floor(Date.now() / 1000);
		const diff = now - timestamp;

		if (diff < 60) return `${diff}秒前`;
		if (diff < 3600) return `${Math.floor(diff / 60)}分前`;
		if (diff < 86400) return `${Math.floor(diff / 3600)}時間前`;
		if (diff < 604800) return `${Math.floor(diff / 86400)}日前`;

		return new Date(timestamp * 1000).toLocaleDateString("ja-JP");
	};

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
							class="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
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
							class="px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
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
					<h2 class="text-xl font-bold text-gray-900 dark:text-white">通知</h2>
					<p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
						{notifications().length}件の通知
					</p>
				</div>

				<Show
					when={notifications().length > 0}
					fallback={
						<div class="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
							<Show
								when={!loading()}
								fallback={
									<>
										<div class="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4" />
										<p class="text-gray-600 dark:text-gray-400">読み込み中...</p>
									</>
								}
							>
								<p class="text-gray-600 dark:text-gray-400">通知はありません</p>
							</Show>
						</div>
					}
				>
					<div class="bg-white dark:bg-gray-800 rounded-lg">
						<VList style={{ height: "calc(100vh - 250px)" }} data={notifications()}>
							{(notification: NotificationEvent) => (
								<div class="border-b border-gray-200 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
									<div class="flex items-start gap-3">
										<div class="text-xl flex-shrink-0">
											{getNotificationIcon(notification.notificationType)}
										</div>
										<div class="flex-1 min-w-0">
											<div class="flex items-center gap-2 mb-1">
												<span class="text-sm font-medium text-gray-900 dark:text-white truncate">
													{getAuthorName(notification)}
												</span>
												<span class="text-xs text-purple-600 dark:text-purple-400">
													{getNotificationLabel(notification.notificationType)}
												</span>
												<span class="text-xs text-gray-500 dark:text-gray-400 ml-auto flex-shrink-0">
													{formatRelativeTime(notification.created_at)}
												</span>
											</div>
											<Show when={notification.kind === 1}>
												<div class="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
													{notification.content}
												</div>
											</Show>
											<Show when={notification.kind === 7}>
												<div class="text-base">{notification.content || "👍"}</div>
											</Show>
											<Show when={notification.kind === 6}>
												<div class="text-sm text-gray-600 dark:text-gray-400">
													あなたの投稿をリポストしました
												</div>
											</Show>
										</div>
									</div>
								</div>
							)}
						</VList>
					</div>

					<Show when={loading()}>
						<div class="mt-4 text-center">
							<div class="inline-block w-6 h-6 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
						</div>
					</Show>
				</Show>
			</div>
		</div>
	);
};

export default NotificationTimelinePage;
