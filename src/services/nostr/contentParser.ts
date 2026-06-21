/**
 * Nostr Content Parser using ts-parsec
 *
 * Parses Nostr event content and tags to extract:
 * - NIP-30: Custom emojis (:shortcode:)
 * - NIP-27: Mentions (nostr:npub1..., nostr:nevent1...) - Future
 * - Images/Videos - Future
 * - Links - Future
 */

import { buildLexer, type Token } from "typescript-parsec";

/**
 * Parsed content token types
 */
export type ContentToken =
	| { type: "text"; content: string }
	| { type: "emoji"; shortcode: string; url: string }
	| { type: "mention"; uri: string; metadata?: MentionMetadata } // Future: NIP-27
	| { type: "link"; url: string } // Future
	| { type: "image"; url: string; alt?: string }; // Future

/**
 * Mention metadata for NIP-27 (Future)
 */
export interface MentionMetadata {
	pubkey?: string;
	eventId?: string;
	relays?: string[];
}

/**
 * Custom emoji metadata from NIP-30 emoji tags
 */
export interface CustomEmoji {
	shortcode: string;
	url: string;
}

/**
 * Token kinds for lexer
 */
const TokenKind = {
	Colon: 0,
	Word: 1,
	Whitespace: 2,
	Newline: 3,
	Url: 4,
	Special: 5,
} as const;

type TokenKind = (typeof TokenKind)[keyof typeof TokenKind];

/**
 * Lexer definition for content parsing
 */
const lexer = buildLexer([
	// URL must come before Colon and Word to match complete URLs
	[true, /^https?:\/\/[^\s]+/g, TokenKind.Url],
	[true, /^:/g, TokenKind.Colon],
	[true, /^[a-zA-Z0-9_-]+/g, TokenKind.Word],
	[true, /^[ \t\u3000]+/g, TokenKind.Whitespace], // Include full-width space (U+3000)
	[true, /^\n/g, TokenKind.Newline],
	[true, /^./g, TokenKind.Special], // Any other character (catch-all)
]);

/**
 * Extract custom emojis from event tags
 *
 * @param tags - Event tags array
 * @returns Map of shortcode to emoji URL
 */
export function extractCustomEmojis(tags: string[][]): Map<string, string> {
	const emojis = new Map<string, string>();

	for (const tag of tags) {
		if (tag[0] === "emoji" && tag.length >= 3) {
			const shortcode = tag[1];
			const url = tag[2];
			emojis.set(shortcode, url);
		}
	}

	return emojis;
}

/**
 * Parser context with emoji map
 */
interface ParserContext {
	emojiMap: Map<string, string>;
}

/**
 * Check if URL is an image based on file extension
 */
function isImageUrl(url: string): boolean {
	const imageExtensions = [
		".jpg",
		".jpeg",
		".png",
		".gif",
		".webp",
		".bmp",
		".svg",
		".avif",
	];

	try {
		const urlObj = new URL(url);
		const pathname = urlObj.pathname.toLowerCase();
		return imageExtensions.some((ext) => pathname.endsWith(ext));
	} catch {
		// Invalid URL
		return false;
	}
}

/**
 * Parse emoji shortcode :shortcode:
 */
function parseEmoji(
	context: ParserContext,
): (
	tokens: Token<TokenKind>[],
) => { shortcode: string; isEmoji: boolean } | undefined {
	return (tokens) => {
		// Expected pattern: : word :
		if (tokens.length !== 3) return undefined;
		if (tokens[0].kind !== TokenKind.Colon) return undefined;
		if (tokens[1].kind !== TokenKind.Word) return undefined;
		if (tokens[2].kind !== TokenKind.Colon) return undefined;

		const shortcode = tokens[1].text;
		const isEmoji = context.emojiMap.has(shortcode);

		return { shortcode, isEmoji };
	};
}

/**
 * Parse content with custom emojis using ts-parsec
 *
 * @param content - Raw event content
 * @param emojiMap - Map of shortcode to URL from emoji tags
 * @returns Array of content tokens
 */
export function parseContent(
	content: string,
	emojiMap: Map<string, string>,
): ContentToken[] {
	if (!content) {
		return [];
	}

	const tokens: ContentToken[] = [];
	const context: ParserContext = { emojiMap };

	// Tokenize the content using ts-parsec lexer
	const firstToken = lexer.parse(content);
	if (!firstToken) {
		// If lexer fails, return content as plain text
		return [{ type: "text", content }];
	}

	// Convert token linked list to array
	const tokenList: Token<TokenKind>[] = [];
	let current: Token<TokenKind> | undefined = firstToken;
	while (current) {
		tokenList.push(current);
		current = current.next;
	}

	let i = 0;
	let currentText = "";

	while (i < tokenList.length) {
		const token = tokenList[i];

		// Check for URL token
		if (token.kind === TokenKind.Url) {
			// Flush accumulated text
			if (currentText) {
				tokens.push({ type: "text", content: currentText });
				currentText = "";
			}

			// Check if URL is an image
			if (isImageUrl(token.text)) {
				tokens.push({
					type: "image",
					url: token.text,
				});
			} else {
				tokens.push({
					type: "link",
					url: token.text,
				});
			}

			i++;
			continue;
		}

		// Try to match emoji pattern starting with ':'
		if (token.kind === TokenKind.Colon && i + 2 < tokenList.length) {
			const emojiTokens = tokenList.slice(i, i + 3);
			const emojiResult = parseEmoji(context)(emojiTokens);

			if (emojiResult && emojiResult.isEmoji) {
				// Flush accumulated text
				if (currentText) {
					tokens.push({ type: "text", content: currentText });
					currentText = "";
				}

				// Add emoji token
				const url = emojiMap.get(emojiResult.shortcode)!;
				tokens.push({
					type: "emoji",
					shortcode: emojiResult.shortcode,
					url,
				});

				i += 3; // Skip the 3 tokens that make up the emoji
				continue;
			}
		}

		// Not an emoji or link, accumulate as text
		currentText += token.text;
		i++;
	}

	// Flush remaining text
	if (currentText) {
		tokens.push({ type: "text", content: currentText });
	}

	// If no tokens, return the whole content as text
	if (tokens.length === 0 && content) {
		tokens.push({ type: "text", content });
	}

	return tokens;
}

/**
 * Parse Nostr event content
 *
 * @param content - Event content string
 * @param tags - Event tags array
 * @returns Parsed content tokens
 */
export function parseNostrContent(
	content: string,
	tags: string[][],
): ContentToken[] {
	const emojiMap = extractCustomEmojis(tags);
	return parseContent(content, emojiMap);
}
