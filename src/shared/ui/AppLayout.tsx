import type { Component, JSX } from "solid-js";
import LeftSideBar from "./LeftSideBar";

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
			<div class="flex">
				{/* Left Sidebar - Fixed */}
				<aside class="fixed left-0 top-0 h-screen p-4 min-w-[15%]">
					<LeftSideBar />
				</aside>

				{/* Main Content - With left margin to avoid overlap */}
				<main class="flex-1 ml-[15%] mr-[15%] p-4">{props.children}</main>

				{/* Right Sidebar - Fixed */}
				<aside class="fixed right-0 top-0 h-screen w-[15%] p-4 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
					<div class="sticky top-4">
						<h3 class="font-semibold text-gray-900 dark:text-white mb-3">
							右サイドバー
						</h3>
						<p class="text-sm text-gray-600 dark:text-gray-400">
							固定されたサイドバー
						</p>
					</div>
				</aside>
			</div>
		</div>
	);
};

export default AppLayout;
