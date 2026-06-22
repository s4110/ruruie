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
			<div class="p-4 flex">
				<Header />
				<div class="flex-1">{props.children}</div>
				<aside class="min-w-[15%]">hidari</aside>
			</div>
		</div>
	);
};

export default AppLayout;
