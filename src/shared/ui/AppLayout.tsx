import type { Component, JSX } from "solid-js";
import Header from "./Header";

interface AppLayoutProps {
	children: JSX.Element;
}

/**
 * Main application layout wrapper
 * Provides consistent page structure with header and content area
 */
const AppLayout: Component<AppLayoutProps> = (props) => {
	return (
		<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
			<div class="max-w-2xl mx-auto p-4">
				<Header />
				{props.children}
			</div>
		</div>
	);
};

export default AppLayout;
