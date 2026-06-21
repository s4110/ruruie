import type { Component } from "solid-js";
import { createSignal, Show } from "solid-js";
import type { UnsignedEvent } from "../../shared/nostr/nip07";
import { signEvent } from "../../shared/nostr/nip07";
import { publishEvent } from "../../shared/nostr/relayManager";
import type { TimelineEvent } from "../../shared/ui/Timeline";
import { getCurrentPubkey } from "../auth/authStore";

interface ReplyComposerProps {
	replyTo: TimelineEvent;
	onReplySuccess?: () => void;
	onCancel?: () => void;
}

/**
 * ReplyComposer - NIP-10準拠のリプライ投稿コンポーネント
 *
 * NIP-10仕様に従って、以下のタグを正しく構成します：
 * - "e"タグ: rootマーカーで最上位イベント、replyマーカーで直接の親イベント
 * - "p"タグ: リプライチェーン内の全てのユーザー
 */
const ReplyComposer: Component<ReplyComposerProps> = (props) => {
	const [content, setContent] = createSignal("");
	const [isSubmitting, setIsSubmitting] = createSignal(false);
	const [error, setError] = createSignal<string | null>(null);

	const handleSubmit = async (e: Event) => {
		e.preventDefault();

		const text = content().trim();
		if (!text) return;

		const pubkey = getCurrentPubkey();
		if (!pubkey) {
			setError("ログインが必要です");
			return;
		}

		setIsSubmitting(true);
		setError(null);

		try {
			// NIP-10に従ったタグの構築
			const tags: string[][] = [];

			// 1. "e"タグの構築
			// リプライ対象イベントのeタグを解析してroot eventを見つける
			const replyToETags = props.replyTo.tags.filter(
				(tag: string[]) => tag[0] === "e",
			);
			let rootEventId: string | null = null;

			// rootマーカーを持つeタグを探す
			const rootTag = replyToETags.find((tag: string[]) => tag[3] === "root");
			if (rootTag) {
				rootEventId = rootTag[1];
			} else if (replyToETags.length > 0) {
				// rootマーカーがない場合、最初のeタグをrootとする（古い形式との互換性）
				rootEventId = replyToETags[0][1];
			} else {
				// eタグがない場合、リプライ対象自体がroot
				rootEventId = props.replyTo.id;
			}

			// NIP-10準拠: トップレベルリプライとスレッド内リプライを区別
			if (rootEventId === props.replyTo.id || !rootEventId) {
				// トップレベルリプライ（rootに直接返信）: rootマーカーのみ
				// NIP-10: "For top level replies (those replying directly to the root event),
				// only the 'root' marker should be used."
				tags.push(["e", props.replyTo.id, "", "root", props.replyTo.pubkey]);
			} else {
				// スレッド内のリプライ: rootとreply両方
				tags.push(["e", rootEventId, "", "root"]);
				tags.push(["e", props.replyTo.id, "", "reply", props.replyTo.pubkey]);
			}

			// 2. "p"タグの構築
			// リプライ対象の作成者を追加
			const mentionedPubkeys = new Set<string>();
			mentionedPubkeys.add(props.replyTo.pubkey);

			// リプライ対象イベント内の全てのpタグを継承
			props.replyTo.tags
				.filter((tag: string[]) => tag[0] === "p" && tag[1])
				.forEach((tag: string[]) => {
					mentionedPubkeys.add(tag[1]);
				});

			// 自分自身は除外
			mentionedPubkeys.delete(pubkey);

			// pタグとして追加
			mentionedPubkeys.forEach((pk) => {
				tags.push(["p", pk]);
			});

			// イベントを作成
			const unsignedEvent: UnsignedEvent = {
				kind: 1,
				created_at: Math.floor(Date.now() / 1000),
				content: text,
				tags,
			};

			// Sign event using NIP-07
			const signedEvent = await signEvent(unsignedEvent);

			// Publish to relays
			const publishedRelays = await publishEvent(signedEvent);

			if (publishedRelays.length === 0) {
				throw new Error("投稿に失敗しました。リレーに接続できませんでした。");
			}

			setContent("");
			props.onReplySuccess?.();
		} catch (err) {
			console.error("Failed to publish reply:", err);
			setError(
				err instanceof Error ? err.message : "リプライの投稿に失敗しました",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
			<div class="mb-2 text-sm text-gray-600 dark:text-gray-400">
				<span class="font-medium">{props.replyTo.pubkey.slice(0, 8)}...</span>{" "}
				へのリプライ
			</div>

			<form onSubmit={handleSubmit}>
				<textarea
					value={content()}
					onInput={(e) => setContent(e.currentTarget.value)}
					placeholder="返信を入力..."
					disabled={isSubmitting()}
					class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
					rows={3}
				/>

				<Show when={error()}>
					<div class="mt-2 text-sm text-red-600 dark:text-red-400">
						{error()}
					</div>
				</Show>

				<div class="flex items-center justify-end gap-2 mt-3">
					<Show when={props.onCancel}>
						<button
							type="button"
							onClick={props.onCancel}
							disabled={isSubmitting()}
							class="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							キャンセル
						</button>
					</Show>

					<button
						type="submit"
						disabled={!content().trim() || isSubmitting()}
						class="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						{isSubmitting() ? "送信中..." : "リプライ"}
					</button>
				</div>
			</form>
		</div>
	);
};

export default ReplyComposer;
