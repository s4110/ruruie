import { Navigate, Route, Router } from "@solidjs/router";
import { type Component, createSignal, onMount, Show } from "solid-js";
import "./App.css";
import { isAuthenticated, restoreAuth } from "./features/auth/authStore";
import LoginPage from "./features/auth/LoginPage";
import ProfilePage from "./features/profile/ProfilePage";
import GlobalTimelinePage from "./features/timeline/GlobalTimelinePage";
import HomeTimelinePage from "./features/timeline/HomeTimelinePage";
import TimelinePage from "./features/timeline/TimelinePage";
import { initializeRelays } from "./shared/nostr/relayManager";
import { initializeVerificationService } from "./shared/nostr/verificationService";

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
				<Route path="/login" component={LoginPage} />
				<Route path="/" component={ProtectedRoute(TimelinePage)} />
				<Route path="/home" component={ProtectedRoute(HomeTimelinePage)} />
				<Route path="/timeline" component={ProtectedRoute(GlobalTimelinePage)} />
				<Route path="/profile" component={ProtectedRoute(ProfilePage)} />
				<Route
					path="*"
					component={() => <Navigate href={isAuthenticated() ? "/" : "/login"} />}
				/>
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
