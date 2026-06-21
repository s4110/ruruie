import type { Component } from "solid-js";
import { For, Show } from "solid-js";
import {
	type ContentToken,
	parseNostrContent,
} from "../../services/nostr/contentParser";

interface RichContentProps {
	content: string;
	tags: string[][];
	class?: string;
}

/**
 * RichContent component
 *
 * Renders Nostr event content with support for:
 * - NIP-30: Custom emojis
 * - NIP-27: Mentions (future)
 * - Images/Videos (future)
 * - Links (future)
 */
const RichContent: Component<RichContentProps> = (props) => {
	const tokens = () => parseNostrContent(props.content, props.tags);

	const renderToken = (token: ContentToken) => {
		switch (token.type) {
			case "text":
				return <span>{token.content}</span>;

			case "emoji":
				return (
					<img
						src={token.url}
						alt={`:${token.shortcode}:`}
						title={`:${token.shortcode}:`}
						class="inline-block h-5 w-5 align-text-bottom"
						loading="lazy"
					/>
				);

			case "mention":
				// Future: NIP-27 mention rendering
				return (
					<span class="text-purple-600 dark:text-purple-400">{token.uri}</span>
				);

			case "link":
				// Future: Link rendering
				return (
					<a
						href={token.url}
						target="_blank"
						rel="noopener noreferrer"
						class="text-blue-600 dark:text-blue-400 hover:underline"
					>
						{token.url}
					</a>
				);

			case "image":
				// Future: Image rendering
				return (
					<img
						src={token.url}
						alt={token.alt || ""}
						class="max-w-full rounded-lg my-2"
						loading="lazy"
					/>
				);

			default:
				return null;
		}
	};

	return (
		<div class={props.class || "whitespace-pre-wrap break-words"}>
			<Show when={tokens().length > 0} fallback={<span>{props.content}</span>}>
				<For each={tokens()}>{(token) => renderToken(token)}</For>
			</Show>
		</div>
	);
};

export default RichContent;
