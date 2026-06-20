import { Navigate, Route, Router } from "@solidjs/router";
import { type Component, onMount } from "solid-js";
import "./App.css";
import { isAuthenticated, restoreAuth } from "./features/auth/authStore";
import LoginPage from "./features/auth/LoginPage";
import ProfilePage from "./features/profile/ProfilePage";
import GlobalTimelinePage from "./features/timeline/GlobalTimelinePage";
import TimelinePage from "./features/timeline/TimelinePage";
import { initializeRelays } from "./shared/nostr/relayManager";
import { initializeVerificationService } from "./shared/nostr/verificationService";

function App() {
	// Initialize services and restore authentication on mount
	onMount(() => {
		// Initialize verification worker pool
		initializeVerificationService();

		// Initialize relay connections
		initializeRelays();

		// Restore auth from localStorage
		restoreAuth();
	});

	return (
		<Router>
			<Route path="/login" component={LoginPage} />
			<Route path="/" component={ProtectedRoute(TimelinePage)} />
			<Route path="/global" component={ProtectedRoute(GlobalTimelinePage)} />
			<Route path="/profile" component={ProtectedRoute(ProfilePage)} />
			<Route
				path="*"
				component={() => <Navigate href={isAuthenticated() ? "/" : "/login"} />}
			/>
		</Router>
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
