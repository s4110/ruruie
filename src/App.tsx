import { Navigate, Router } from "@solidjs/router";
import { type Component, createSignal, onMount, Show } from "solid-js";
import "./App.css";
import routes from "~solid-pages";
import { isAuthenticated, restoreAuth } from "./features/auth/authStore";
import { initializeRelays } from "./infrastructure/nostr/relayManager";
import { initializeVerificationService } from "./infrastructure/nostr/verificationService";

function App() {
	const [authInitialized, setAuthInitialized] = createSignal(false);

	// Initialize services and restore authentication on mount
	onMount(async () => {
		// Initialize verification worker pool
		initializeVerificationService();

		// Initialize relay connections
		initializeRelays();

		// Restore auth from localStorage (wait for completion)
		await restoreAuth();
		setAuthInitialized(true);
	});

	// Show loading screen while auth is being restored
	return (
		<Show
			when={authInitialized()}
			fallback={
				<div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
					<div class="text-center">
						<div class="inline-block w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4" />
						<p class="text-gray-600 dark:text-gray-400">読み込み中...</p>
					</div>
				</div>
			}
		>
			<Router>
				{routes.map((route) => {
					// Apply ProtectedRoute wrapper to all routes except /login
					if (route.path === "/login") {
						return route;
					}
					return {
						...route,
						component: ProtectedRoute(route.component as Component),
					};
				})}
			</Router>
		</Show>
	);
}

// Route guard component for authenticated routes
function ProtectedRoute(component: Component) {
	return () => {
		if (!isAuthenticated()) {
			return <Navigate href="/login" />;
		}
		return component({});
	};
}

export default App;
