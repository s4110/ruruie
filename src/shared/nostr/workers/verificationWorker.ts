/**
 * Web Worker for Nostr Event Verification
 * Offloads CPU-intensive cryptographic operations from the main thread
 */

import { type VerifiedEvent, verifyEvent } from "nostr-tools/pure";

export interface VerificationRequest {
	id: string; // Request ID for matching responses
	type: "verify" | "verifyBatch";
	event?: unknown; // Single event to verify
	events?: unknown[]; // Multiple events to verify
}

export interface VerificationResponse {
	id: string; // Matches request ID
	type: "success" | "error";
	result?: boolean | boolean[]; // Verification result(s)
	verified?: VerifiedEvent | VerifiedEvent[]; // Verified event(s)
	error?: string;
}

/**
 * Verify a single event
 */
function verifySingleEvent(event: unknown): {
	isValid: boolean;
	verified: VerifiedEvent | null;
} {
	try {
		// Type guard - basic structure check
		if (
			!event ||
			typeof event !== "object" ||
			!("id" in event) ||
			!("pubkey" in event) ||
			!("sig" in event)
		) {
			return { isValid: false, verified: null };
		}

		// Verify the event signature
		const isValid = verifyEvent(event as VerifiedEvent);

		if (isValid) {
			return { isValid: true, verified: event as VerifiedEvent };
		}

		return { isValid: false, verified: null };
	} catch (error) {
		console.error("Event verification failed:", error);
		return { isValid: false, verified: null };
	}
}

/**
 * Verify multiple events in batch
 */
function verifyBatchEvents(events: unknown[]): {
	results: boolean[];
	verified: (VerifiedEvent | null)[];
} {
	const results: boolean[] = [];
	const verified: (VerifiedEvent | null)[] = [];

	for (const event of events) {
		const { isValid, verified: verifiedEvent } = verifySingleEvent(event);
		results.push(isValid);
		verified.push(verifiedEvent);
	}

	return { results, verified };
}

/**
 * Message handler for worker
 */
self.onmessage = (e: MessageEvent<VerificationRequest>) => {
	const request = e.data;

	try {
		if (request.type === "verify" && request.event) {
			// Single event verification
			const { isValid, verified } = verifySingleEvent(request.event);

			const response: VerificationResponse = {
				id: request.id,
				type: "success",
				result: isValid,
				verified: verified || undefined,
			};

			self.postMessage(response);
		} else if (request.type === "verifyBatch" && request.events) {
			// Batch event verification
			const { results, verified } = verifyBatchEvents(request.events);

			const response: VerificationResponse = {
				id: request.id,
				type: "success",
				result: results,
				verified: verified.filter((v): v is VerifiedEvent => v !== null),
			};

			self.postMessage(response);
		} else {
			throw new Error("Invalid request type or missing data");
		}
	} catch (error) {
		const response: VerificationResponse = {
			id: request.id,
			type: "error",
			error: error instanceof Error ? error.message : "Unknown error",
		};

		self.postMessage(response);
	}
};

// Export types for TypeScript (not used at runtime in worker)
export type { VerifiedEvent };
