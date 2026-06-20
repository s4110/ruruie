import type { Accessor, Component } from "solid-js";
import { createEffect, createSignal, Show } from "solid-js";
import { VList, type VListHandle } from "virtua/solid";
import ReplyComposer from "../../features/post/ReplyComposer";
import {
	fetchProfiles,
	getAvatarUrl,
	getCachedProfile,
	getDisplayName,
} from "../nostr/profileCache";

export interface TimelineEvent {
	id: string;
	pubkey: string;
	created_at: number;
	kind: number;
	content: string;
	tags: string[][];
	sig: string;
}

interface TimelineProps {
	events: Accessor<TimelineEvent[]>;
	loading: Accessor<boolean>;
	onLoadMore?: () => void;
}

const Timeline: Component<TimelineProps> = (props) => {
	let vlistHandle: VListHandle | undefined;
	const [isAtTop, setIsAtTop] = createSignal(true);
	const [, setProfilesLoaded] = createSignal(0); // Trigger re-render when profiles load
	const [replyingToId, setReplyingToId] = createSignal<string | null>(null);

	// Fetch profiles for visible events
	createEffect(() => {
		const events = props.events();
		if (events.length === 0) return;

		// Get unique pubkeys
		const pubkeys = [...new Set(events.map((e) => e.pubkey))];

		// Fetch profiles in background
		fetchProfiles(pubkeys).then(() => {
			// Trigger re-render
			setProfilesLoaded((prev) => prev + 1);
		});
	});

	const handleScroll = (offset: number) => {
		if (!vlistHandle) return;

		// Check if user is at the top (within 50px)
		const atTop = offset <= 50;
		setIsAtTop(atTop);

		// Check if user scrolled near the bottom for loading more
		if (props.onLoadMore && !props.loading()) {
			const isAtBottom =
				offset - vlistHandle.scrollSize + vlistHandle.viewportSize >= -100;

			if (isAtBottom) {
				console.log("📍 Reached bottom, triggering load more");
				props.onLoadMore();
			}
		}
	};

	const formatTime = (timestamp: number) => {
		const date = new Date(timestamp * 1000);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMins / 60);
		const diffDays = Math.floor(diffHours / 24);

		if (diffMins < 1) return "たった今";
		if (diffMins < 60) return `${diffMins}分前`;
		if (diffHours < 24) return `${diffHours}時間前`;
		if (diffDays < 7) return `${diffDays}日前`;

		return date.toLocaleDateString("ja-JP", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	return (
		<div>
			<Show
				when={props.events().length > 0}
				fallback={
					<div class="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
						<p class="text-gray-600 dark:text-gray-400">
							{props.loading() ? "読み込み中..." : "イベントがありません"}
						</p>
					</div>
				}
			>
				<VList
					ref={(handle) => (vlistHandle = handle)}
					data={props.events()}
					style={{ height: "calc(100vh - 16rem)" }}
					onScroll={handleScroll}
					shift={!isAtTop()}
				>
					{(event: TimelineEvent) => {
						const profile = getCachedProfile(event.pubkey);
						const displayName = getDisplayName(profile, event.pubkey);
						const avatarUrl = getAvatarUrl(profile);

						return (
							<div class="border-b border-gray-200 dark:border-gray-700 py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
								<div class="flex items-start gap-3">
									{/* Avatar */}
									<div class="shrink-0">
										<Show
											when={avatarUrl}
											fallback={
												<div class="w-10 h-10 rounded-full bg-linear-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
													{displayName.slice(0, 2).toUpperCase()}
												</div>
											}
										>
											{avatarUrl && (
												<img
													src={avatarUrl}
													alt={displayName}
													class="w-10 h-10 rounded-full object-cover"
													onError={(e) => {
														// Fallback to gradient on image error
														e.currentTarget.style.display = "none";
													}}
												/>
											)}
										</Show>
									</div>

									{/* Content */}
									<div class="flex-1 min-w-0">
										<div class="flex items-center gap-2 mb-1">
											<span class="text-sm font-semibold text-gray-900 dark:text-white truncate">
												{displayName}
											</span>
											<span class="text-xs text-gray-500 dark:text-gray-500">
												{formatTime(event.created_at)}
											</span>
										</div>
										<div class="text-gray-900 dark:text-white whitespace-pre-wrap wrap-break-word">
											{event.content}
										</div>

										{/* Action buttons */}
										<div class="flex items-center gap-4 mt-2">
											<button
												type="button"
												onClick={() =>
													setReplyingToId((prev) =>
														prev === event.id ? null : event.id,
													)
												}
												class="text-xs text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
											>
												💬 リプライ
											</button>
										</div>

										{/* Reply composer */}
										<Show when={replyingToId() === event.id}>
											<div class="mt-3">
												<ReplyComposer
													replyTo={event}
													onReplySuccess={() => {
														setReplyingToId(null);
													}}
													onCancel={() => setReplyingToId(null)}
												/>
											</div>
										</Show>
									</div>
								</div>
							</div>
						);
					}}
				</VList>
			</Show>

			{props.loading() && (
				<div class="flex justify-center py-4">
					<div class="inline-block w-6 h-6 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
				</div>
			)}
		</div>
	);
};

export default Timeline;
