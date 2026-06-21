import type { Component } from "solid-js";
import { createResource, For, Show } from "solid-js";
import {
	type ContentToken,
	parseNostrContent,
} from "../../services/nostr/contentParser";
import { fetchOGP } from "../../services/ogp/ogpFetcher";

interface RichContentProps {
	content: string;
	tags: string[][];
	class?: string;
}

/**
 * Link Preview component with favicon and title
 */
const LinkPreview: Component<{ url: string }> = (props) => {
	const [ogp] = createResource(() => props.url, fetchOGP);

	return (
		<Show
			when={ogp() !== null && ogp()?.title}
			fallback={
				<a
					href={props.url}
					target="_blank"
					rel="noopener noreferrer"
					class="text-blue-600 dark:text-blue-400 hover:underline break-all"
				>
					{props.url}
				</a>
			}
		>
			<a
				href={props.url}
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline max-w-full"
			>
				<Show when={ogp()?.favicon}>
					<img
						src={ogp()?.favicon}
						alt=""
						class="w-4 h-4 flex-shrink-0"
						onError={(e) => {
							e.currentTarget.style.display = "none";
						}}
					/>
				</Show>
				<span class="truncate">{ogp()?.title}</span>
			</a>
		</Show>
	);
};

/**
 * RichContent component
 *
 * Renders Nostr event content with support for:
 * - NIP-30: Custom emojis
 * - NIP-27: Mentions (future)
 * - Links with favicon and title preview
 * - Images (auto-detected by file extension)
 * - Videos (future)
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
				return <LinkPreview url={token.url} />;

			case "image":
				return (
					<img
						src={token.url}
						alt={token.alt || ""}
						class="max-w-full rounded-lg my-2 block"
						loading="lazy"
						onError={(e) => {
							// Fallback to link if image fails to load
							const link = document.createElement("a");
							link.href = token.url;
							link.target = "_blank";
							link.rel = "noopener noreferrer";
							link.className =
								"text-blue-600 dark:text-blue-400 hover:underline";
							link.textContent = token.url;
							e.currentTarget.replaceWith(link);
						}}
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
