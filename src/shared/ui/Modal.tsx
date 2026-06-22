/**
 * Modal Component with View Transitions API
 *
 * A reusable modal component that uses:
 * - SolidJS Portal for rendering outside DOM hierarchy
 * - View Transitions API for smooth animations
 */

import {
	type Component,
	createEffect,
	type JSX,
	onCleanup,
	Show,
} from "solid-js";
import { Portal } from "solid-js/web";

export interface ModalProps {
	/** Whether the modal is open */
	isOpen: boolean;
	/** Callback when modal should close */
	onClose: () => void;
	/** Modal title (optional) */
	title?: string;
	/** Modal content */
	children: JSX.Element;
	/** Size variant */
	size?: "sm" | "md" | "lg" | "xl" | "full";
	/** Whether clicking backdrop closes modal (default: true) */
	closeOnBackdrop?: boolean;
	/** Whether ESC key closes modal (default: true) */
	closeOnEsc?: boolean;
	/** Custom class for modal content */
	class?: string;
	/** Show close button (default: true) */
	showCloseButton?: boolean;
}

/**
 * Modal Component
 *
 * @example
 * ```tsx
 * const [open, setOpen] = createSignal(false);
 *
 * <Modal isOpen={open()} onClose={() => setOpen(false)} title="My Modal">
 *   <p>Modal content goes here</p>
 * </Modal>
 * ```
 */
const Modal: Component<ModalProps> = (props) => {
	// Handle ESC key press
	const handleEscKey = (e: KeyboardEvent) => {
		if (e.key === "Escape" && (props.closeOnEsc ?? true)) {
			handleClose();
		}
	};

	// Handle backdrop click
	const handleBackdropClick = (e: MouseEvent) => {
		// Only close if clicking the backdrop itself (not the modal content)
		if (e.target === e.currentTarget && (props.closeOnBackdrop ?? true)) {
			handleClose();
		}
	};

	// Close with View Transition
	const handleClose = () => {
		if (!props.isOpen) return;

		// Check if View Transitions API is supported
		// Using unknown type for experimental API
		const doc = document as unknown as {
			startViewTransition?: (callback: () => void) => void;
		};

		if (doc.startViewTransition) {
			doc.startViewTransition(() => {
				props.onClose();
			});
		} else {
			// Fallback without transition
			props.onClose();
		}
	};

	// Setup/cleanup event listeners based on isOpen state
	// Use createEffect to respond to prop changes
	createEffect(() => {
		if (props.isOpen) {
			// Modal is opening
			document.addEventListener("keydown", handleEscKey);
			document.body.style.overflow = "hidden";
		} else {
			// Modal is closing
			document.removeEventListener("keydown", handleEscKey);
			document.body.style.overflow = "";
		}
	});

	// Cleanup on unmount
	onCleanup(() => {
		document.removeEventListener("keydown", handleEscKey);
		document.body.style.overflow = "";
	});

	// Get size classes
	const getSizeClass = () => {
		switch (props.size || "md") {
			case "sm":
				return "max-w-sm";
			case "md":
				return "max-w-md";
			case "lg":
				return "max-w-lg";
			case "xl":
				return "max-w-xl";
			case "full":
				return "max-w-full mx-4";
			default:
				return "max-w-md";
		}
	};

	return (
		<Portal mount={document.body}>
			<Show when={props.isOpen}>
				{/* Backdrop */}
				{/* biome-ignore lint/a11y/noStaticElementInteractions: backdrop uses div to avoid button semantics, ESC key provides keyboard access */}
				<div
					class="modal-backdrop fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4"
					onMouseDown={handleBackdropClick}
				>
					{/* Modal Content */}
					<div
						role="dialog"
						aria-modal="true"
						class={`modal-content bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full ${getSizeClass()} ${
							props.class || ""
						}`}
						style={{ "view-transition-name": "modal-content" }}
						onMouseDown={(e) => e.stopPropagation()}
					>
						{/* Header */}
						<Show when={props.title || props.showCloseButton !== false}>
							<div class="modal-header flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
								<Show when={props.title}>
									<h2 class="text-xl font-semibold text-gray-900 dark:text-white">
										{props.title}
									</h2>
								</Show>

								<Show when={props.showCloseButton !== false}>
									<button
										type="button"
										onClick={handleClose}
										class="modal-close-btn text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
										aria-label="Close modal"
									>
										<svg
											class="w-6 h-6"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											aria-hidden="true"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M6 18L18 6M6 6l12 12"
											/>
										</svg>
									</button>
								</Show>
							</div>
						</Show>

						{/* Body */}
						<div class="modal-body p-4">{props.children}</div>
					</div>
				</div>
			</Show>
		</Portal>
	);
};

export default Modal;
