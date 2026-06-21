import { type Component, createSignal, Show } from "solid-js";
import { signEvent } from "../../services/nostr/nips/nip07";
import { publishEvent } from "../../infrastructure/nostr/relayManager";

interface PostComposerProps {
	onPostSuccess?: () => void;
}

const PostComposer: Component<PostComposerProps> = (props) => {
	const [content, setContent] = createSignal("");
	const [includeVia, setIncludeVia] = createSignal(true);
	const [posting, setPosting] = createSignal(false);
	const [error, setError] = createSignal<string | null>(null);
	const [success, setSuccess] = createSignal(false);

	const APP_NAME = "ruruie";
	// TODO: kind:31990のhandler eventを作成後、そのアドレスに変更
	// Format: 31990:pubkey:d-identifier
	const HANDLER_ADDRESS = ""; // 空の場合はclientタグを追加しない
	const RELAY_HINT = "wss://yabu.me/";

	const handleSubmit = async (e: Event) => {
		e.preventDefault();

		const text = content().trim();
		if (!text) {
			setError("投稿内容を入力してください");
			return;
		}

		setPosting(true);
		setError(null);
		setSuccess(false);

		try {
			// Create unsigned event
			const tags: string[][] = [];

			// Add client tag if enabled and handler address is set
			// NIP-89: client tag should reference a kind:31990 handler event
			if (includeVia() && HANDLER_ADDRESS) {
				tags.push(["client", APP_NAME, HANDLER_ADDRESS, RELAY_HINT]);
			}

			const unsignedEvent = {
				created_at: Math.floor(Date.now() / 1000),
				kind: 1, // Text note
				tags,
				content: text,
			};

			// Sign event using NIP-07
			const signedEvent = await signEvent(unsignedEvent);

			// Publish to relays
			const publishedRelays = await publishEvent(signedEvent);

			if (publishedRelays.length === 0) {
				throw new Error("投稿に失敗しました。リレーに接続できませんでした。");
			}

			console.log(`✅ Posted to ${publishedRelays.length} relays:`, publishedRelays);

			// Success
			setSuccess(true);
			setContent("");
			setError(null);

			// Call success callback
			if (props.onPostSuccess) {
				props.onPostSuccess();
			}

			// Hide success message after 3 seconds
			setTimeout(() => {
				setSuccess(false);
			}, 3000);
		} catch (err) {
			console.error("Failed to post:", err);
			setError(err instanceof Error ? err.message : "投稿に失敗しました");
		} finally {
			setPosting(false);
		}
	};

	// Nostr has no character limit, but we show a soft warning
	// Most clients display ~500-1000 characters comfortably
	const SOFT_LIMIT = 500;
	const HARD_LIMIT = 5000; // Prevent extremely long posts
	const length = () => content().length;
	const isOverSoftLimit = () => length() > SOFT_LIMIT;
	const isOverHardLimit = () => length() > HARD_LIMIT;

	return (
		<div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-4">
			<form onSubmit={handleSubmit}>
				<textarea
					value={content()}
					onInput={(e) => setContent(e.currentTarget.value)}
					placeholder="いまどうしてる？"
					class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
					rows={3}
					disabled={posting()}
				/>

				<div class="flex items-center justify-between mt-3">
					<div class="flex items-center gap-4">
						<label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
							<input
								type="checkbox"
								checked={includeVia()}
								onChange={(e) => setIncludeVia(e.currentTarget.checked)}
								class="rounded text-purple-600 focus:ring-purple-500"
								disabled={posting() || !HANDLER_ADDRESS}
								title={!HANDLER_ADDRESS ? "Handler event未設定" : ""}
							/>
							<span
								classList={{
									"opacity-50": !HANDLER_ADDRESS,
								}}
							>
								via {APP_NAME} {!HANDLER_ADDRESS && "(未設定)"}
							</span>
						</label>

						<div
							class="text-sm"
							classList={{
								"text-gray-500 dark:text-gray-400": !isOverSoftLimit(),
								"text-yellow-600 dark:text-yellow-500": isOverSoftLimit() && !isOverHardLimit(),
								"text-red-600 dark:text-red-500": isOverHardLimit(),
							}}
						>
							{length()} / {isOverSoftLimit() ? HARD_LIMIT : SOFT_LIMIT}
						</div>
					</div>

					<button
						type="submit"
						disabled={posting() || !content().trim() || isOverHardLimit()}
						class="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
					>
						{posting() ? "投稿中..." : "投稿"}
					</button>
				</div>

				<Show when={error()}>
					<div class="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
						{error()}
					</div>
				</Show>

				<Show when={success()}>
					<div class="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 text-sm">
						投稿しました！
					</div>
				</Show>
			</form>
		</div>
	);
};

export default PostComposer;
