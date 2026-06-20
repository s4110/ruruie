/**
 * Contact List Manager (NIP-02)
 * Manages follow lists (kind 3 events)
 */

import type { NostrEvent } from "nostr-tools/pure";
import { firstValueFrom } from "rxjs";
import { createSignal } from "solid-js";
import { fetchEvent$ } from "./relayManager";

export interface Contact {
	pubkey: string;
	relay?: string;
	petname?: string;
}

// Global contact list signal
const [contactList, setContactList] = createSignal<Contact[]>([]);
const [contactListLoading, setContactListLoading] = createSignal(false);
const [lastFetchedPubkey, setLastFetchedPubkey] = createSignal<string | null>(
	null,
);

/**
 * Parse kind 3 contact list event
 */
function parseContactList(event: NostrEvent): Contact[] {
	const contacts: Contact[] = [];

	for (const tag of event.tags) {
		if (tag[0] === "p" && tag[1]) {
			contacts.push({
				pubkey: tag[1],
				relay: tag[2],
				petname: tag[3],
			});
		}
	}

	return contacts;
}

/**
 * Fetch contact list (following list) for a pubkey
 */
export async function fetchContactList(pubkey: string): Promise<Contact[]> {
	// Return cached if already fetched for this pubkey
	if (lastFetchedPubkey() === pubkey) {
		return contactList();
	}

	setContactListLoading(true);

	try {
		// fetchEvent$は既にタイムアウト処理を含むので、追加のtimeoutは不要
		const event = await firstValueFrom(
			fetchEvent$({
				kinds: [3],
				authors: [pubkey],
				limit: 1,
			}),
			{ defaultValue: null },
		);

		if (!event) {
			console.log("No contact list found for", pubkey.slice(0, 8));
			setContactList([]);
			setLastFetchedPubkey(pubkey);
			return [];
		}

		const contacts = parseContactList(event);
		console.log(
			`📋 Loaded ${contacts.length} contacts for ${pubkey.slice(0, 8)}`,
		);

		setContactList(contacts);
		setLastFetchedPubkey(pubkey);
		return contacts;
	} catch (error) {
		console.error("Failed to fetch contact list:", error);
		// エラー詳細をログ出力
		if (error instanceof Error) {
			console.error("Error details:", error.message);
		}
		setContactList([]);
		return [];
	} finally {
		setContactListLoading(false);
	}
}

/**
 * Get current contact list (reactive signal)
 */
export function getContactList() {
	return contactList;
}

/**
 * Check if contact list is loading
 */
export function isContactListLoading() {
	return contactListLoading;
}

/**
 * Get pubkeys of all contacts
 */
export function getContactPubkeys(): string[] {
	return contactList().map((c) => c.pubkey);
}

/**
 * Check if a pubkey is in the contact list
 */
export function isFollowing(pubkey: string): boolean {
	return contactList().some((c) => c.pubkey === pubkey);
}

/**
 * Clear contact list
 */
export function clearContactList(): void {
	setContactList([]);
	setLastFetchedPubkey(null);
}
