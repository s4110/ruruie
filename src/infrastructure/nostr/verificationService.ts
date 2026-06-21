/**
 * Verification Service
 * Manages Web Worker pool for parallel event verification
 */

import type { VerifiedEvent } from "nostr-tools/pure";
import type {
	VerificationRequest,
	VerificationResponse,
} from "./workers/verificationWorker";

/**
 * Worker Pool Manager
 */
class VerificationWorkerPool {
	private workers: Worker[] = [];
	private workerCount: number;
	private currentWorkerIndex = 0;
	private pendingRequests = new Map<
		string,
		{
			resolve: (value: unknown) => void;
			reject: (error: Error) => void;
		}
	>();
	private requestIdCounter = 0;

	constructor(workerCount = navigator.hardwareConcurrency || 4) {
		this.workerCount = Math.min(workerCount, 8); // Max 8 workers
		this.initializeWorkers();
	}

	/**
	 * Initialize worker pool
	 */
	private initializeWorkers(): void {
		for (let i = 0; i < this.workerCount; i++) {
			const worker = new Worker(
				new URL("./workers/verificationWorker.ts", import.meta.url),
				{ type: "module" },
			);

			worker.onmessage = (e: MessageEvent<VerificationResponse>) => {
				this.handleWorkerMessage(e.data);
			};

			worker.onerror = (error) => {
				console.error(`Worker ${i} error:`, error);
			};

			this.workers.push(worker);
		}

		console.log(`Initialized ${this.workerCount} verification workers`);
	}

	/**
	 * Handle worker response
	 */
	private handleWorkerMessage(response: VerificationResponse): void {
		const pending = this.pendingRequests.get(response.id);

		if (!pending) {
			console.warn("Received response for unknown request:", response.id);
			return;
		}

		this.pendingRequests.delete(response.id);

		if (response.type === "error") {
			pending.reject(new Error(response.error || "Verification failed"));
		} else {
			if (response.result !== undefined) {
				pending.resolve(response.result);
			} else {
				pending.reject(new Error("Invalid response: no result"));
			}
		}
	}

	/**
	 * Get next worker (round-robin)
	 */
	private getNextWorker(): Worker {
		const worker = this.workers[this.currentWorkerIndex];
		this.currentWorkerIndex = (this.currentWorkerIndex + 1) % this.workerCount;
		return worker;
	}

	/**
	 * Generate unique request ID
	 */
	private generateRequestId(): string {
		return `req_${Date.now()}_${this.requestIdCounter++}`;
	}

	/**
	 * Verify a single event
	 */
	async verify(event: unknown): Promise<boolean> {
		return new Promise((resolve, reject) => {
			const requestId = this.generateRequestId();
			const worker = this.getNextWorker();

			this.pendingRequests.set(requestId, {
				resolve: resolve as (value: unknown) => void,
				reject
			});

			const request: VerificationRequest = {
				id: requestId,
				type: "verify",
				event,
			};

			worker.postMessage(request);

			// Timeout after 5 seconds
			setTimeout(() => {
				if (this.pendingRequests.has(requestId)) {
					this.pendingRequests.delete(requestId);
					reject(new Error("Verification timeout"));
				}
			}, 5000);
		});
	}

	/**
	 * Verify multiple events in batch
	 */
	async verifyBatch(events: unknown[]): Promise<boolean[]> {
		if (events.length === 0) return [];

		// Split events across workers for parallel processing
		const chunkSize = Math.ceil(events.length / this.workerCount);
		const chunks: unknown[][] = [];

		for (let i = 0; i < events.length; i += chunkSize) {
			chunks.push(events.slice(i, i + chunkSize));
		}

		// Process chunks in parallel
		const chunkPromises = chunks.map((chunk, index) => {
			return new Promise<boolean[]>((resolve, reject) => {
				const requestId = this.generateRequestId();
				const worker = this.workers[index % this.workerCount];

				this.pendingRequests.set(requestId, {
					resolve: resolve as (value: unknown) => void,
					reject,
				});

				const request: VerificationRequest = {
					id: requestId,
					type: "verifyBatch",
					events: chunk,
				};

				worker.postMessage(request);

				// Timeout after 10 seconds
				setTimeout(() => {
					if (this.pendingRequests.has(requestId)) {
						this.pendingRequests.delete(requestId);
						reject(new Error("Batch verification timeout"));
					}
				}, 10000);
			});
		});

		// Collect all results
		const chunkResults = await Promise.all(chunkPromises);
		return chunkResults.flat();
	}

	/**
	 * Terminate all workers
	 */
	dispose(): void {
		for (const worker of this.workers) {
			worker.terminate();
		}
		this.workers = [];
		this.pendingRequests.clear();
		console.log("Verification worker pool disposed");
	}
}

/**
 * Global worker pool instance
 */
let workerPool: VerificationWorkerPool | null = null;

/**
 * Initialize verification service
 */
export function initializeVerificationService(workerCount?: number): void {
	if (workerPool) {
		console.warn("Verification service already initialized");
		return;
	}

	workerPool = new VerificationWorkerPool(workerCount);
}

/**
 * Get worker pool instance
 */
function getWorkerPool(): VerificationWorkerPool {
	if (!workerPool) {
		// Auto-initialize if not done
		initializeVerificationService();
	}
	// At this point workerPool is guaranteed to be initialized
	return workerPool as VerificationWorkerPool;
}

/**
 * Verify a single event using worker
 */
export async function verifyEvent(event: unknown): Promise<boolean> {
	return getWorkerPool().verify(event);
}

/**
 * Verify multiple events in parallel using worker pool
 */
export async function verifyEvents(events: unknown[]): Promise<boolean[]> {
	return getWorkerPool().verifyBatch(events);
}

/**
 * Filter events to only verified ones
 */
export async function filterVerifiedEvents(
	events: unknown[],
): Promise<VerifiedEvent[]> {
	const results = await verifyEvents(events);
	return events.filter((_, index) => results[index]) as VerifiedEvent[];
}

/**
 * Dispose verification service
 */
export function disposeVerificationService(): void {
	if (workerPool) {
		workerPool.dispose();
		workerPool = null;
	}
}
