import type { Accessor, Component } from "solid-js";
import { createSignal, Show } from "solid-js";
import { VList, type VListHandle } from "virtua/solid";

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

	const shortenPubkey = (pubkey: string) => {
		return `${pubkey.slice(0, 8)}...${pubkey.slice(-8)}`;
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
					{(event: TimelineEvent) => (
						<div class="border-b border-gray-200 dark:border-gray-700 py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
							<div class="flex items-start gap-3">
								<div class="text-xs text-gray-500 dark:text-gray-400 shrink-0 w-16">
									{formatTime(event.created_at)}
								</div>
								<div class="flex-1 min-w-0">
									<div class="text-sm font-mono text-gray-600 dark:text-gray-400 mb-1">
										{shortenPubkey(event.pubkey)}
									</div>
									<div class="text-gray-900 dark:text-white whitespace-pre-wrap wrap-break-word">
										{event.content}
									</div>
								</div>
							</div>
						</div>
					)}
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
