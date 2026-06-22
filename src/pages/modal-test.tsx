/**
 * Modal Test Page
 * Test the Modal component functionality
 */

import { type Component, createSignal } from "solid-js";
import AppLayout from "../shared/ui/AppLayout";
import Modal from "../shared/ui/Modal";

const ModalTestPage: Component = () => {
	const [basicOpen, setBasicOpen] = createSignal(false);
	const [formOpen, setFormOpen] = createSignal(false);
	const [confirmOpen, setConfirmOpen] = createSignal(false);
	const [name, setName] = createSignal("");

	const handleFormSubmit = (e: Event) => {
		e.preventDefault();
		console.log("Form submitted:", name());
		alert(`Hello, ${name()}!`);
		setFormOpen(false);
		setName("");
	};

	const handleConfirm = () => {
		console.log("Confirmed!");
		alert("Item deleted!");
		setConfirmOpen(false);
	};

	return (
		<AppLayout>
			<div class="p-8 space-y-6">
				<h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">
					Modal Component Test
				</h1>

				{/* Test Buttons */}
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					<button
						type="button"
						onClick={() => setBasicOpen(true)}
						class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium shadow-md hover:shadow-lg transition-all"
					>
						Open Basic Modal
					</button>

					<button
						type="button"
						onClick={() => setFormOpen(true)}
						class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-md hover:shadow-lg transition-all"
					>
						Open Form Modal
					</button>

					<button
						type="button"
						onClick={() => setConfirmOpen(true)}
						class="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-md hover:shadow-lg transition-all"
					>
						Delete Confirmation
					</button>
				</div>

				{/* Info Section */}
				<div class="mt-12 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
					<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
						How to Test:
					</h2>
					<ul class="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
						<li>Click any button above to open a modal</li>
						<li>Try closing with the X button</li>
						<li>Try closing by clicking the backdrop (dark area)</li>
						<li>Try closing with the ESC key</li>
						<li>Check the console for View Transitions API support</li>
					</ul>
				</div>

				{/* Debug Info */}
				<div class="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
					<h3 class="font-semibold text-blue-900 dark:text-blue-100 mb-2">
						Debug Info:
					</h3>
					<p class="text-blue-800 dark:text-blue-200 font-mono text-sm">
						View Transitions API supported:{" "}
						{typeof document !== "undefined" &&
						"startViewTransition" in document
							? "✅ Yes"
							: "❌ No"}
					</p>
					<p class="text-blue-800 dark:text-blue-200 text-sm mt-2">
						{typeof document !== "undefined" &&
						"startViewTransition" in document
							? "You should see smooth animations when opening/closing modals!"
							: "Your browser doesn't support View Transitions API. Modals will work but without animations."}
					</p>
				</div>
			</div>

			{/* Basic Modal */}
			<Modal
				isOpen={basicOpen()}
				onClose={() => setBasicOpen(false)}
				title="Basic Modal Example"
				size="md"
			>
				<div class="space-y-4">
					<p class="text-gray-700 dark:text-gray-300">
						This is a basic modal with a title and close button.
					</p>
					<p class="text-gray-700 dark:text-gray-300">
						You can close this modal by:
					</p>
					<ul class="list-disc list-inside text-gray-600 dark:text-gray-400 ml-4">
						<li>Clicking the X button</li>
						<li>Clicking outside (the backdrop)</li>
						<li>Pressing the ESC key</li>
					</ul>
					<div class="pt-4 border-t border-gray-200 dark:border-gray-700">
						<button
							type="button"
							onClick={() => setBasicOpen(false)}
							class="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
						>
							Got it!
						</button>
					</div>
				</div>
			</Modal>

			{/* Form Modal */}
			<Modal
				isOpen={formOpen()}
				onClose={() => setFormOpen(false)}
				title="Enter Your Name"
				size="md"
			>
				<form onSubmit={handleFormSubmit} class="space-y-4">
					<div>
						<label
							for="name-input"
							class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
						>
							What's your name?
						</label>
						<input
							id="name-input"
							type="text"
							value={name()}
							onInput={(e) => setName(e.currentTarget.value)}
							placeholder="Enter your name"
							class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
							required
						/>
					</div>

					<div class="flex gap-3 justify-end pt-4">
						<button
							type="button"
							onClick={() => setFormOpen(false)}
							class="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
						>
							Cancel
						</button>
						<button
							type="submit"
							class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
						>
							Submit
						</button>
					</div>
				</form>
			</Modal>

			{/* Confirmation Modal */}
			<Modal
				isOpen={confirmOpen()}
				onClose={() => setConfirmOpen(false)}
				title="⚠️ Confirm Delete"
				size="sm"
			>
				<div class="space-y-4">
					<p class="text-gray-700 dark:text-gray-300">
						Are you sure you want to delete this item?
					</p>
					<p class="text-sm text-red-600 dark:text-red-400">
						This action cannot be undone.
					</p>

					<div class="flex gap-3 justify-end pt-4">
						<button
							type="button"
							onClick={() => setConfirmOpen(false)}
							class="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
						>
							Cancel
						</button>
						<button
							type="button"
							onClick={handleConfirm}
							class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
						>
							Delete
						</button>
					</div>
				</div>
			</Modal>
		</AppLayout>
	);
};

export default ModalTestPage;
