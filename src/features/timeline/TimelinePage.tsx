import { A } from "@solidjs/router";
import type { Component } from "solid-js";
import { logout } from "../auth/authStore";

const TimelinePage: Component = () => {
	const handleLogout = () => {
		if (confirm("ログアウトしますか？")) {
			logout();
		}
	};

	return (
		<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
			<div class="max-w-2xl mx-auto p-4">
				<div class="flex items-center justify-between mb-6">
					<h1 class="text-2xl font-bold text-purple-600 dark:text-purple-400">
						ruruie
					</h1>
					<div class="flex items-center gap-4">
						<A
							href="/"
							class="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
						>
							ホーム
						</A>
						<A
							href="/timeline"
							class="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
						>
							グローバル
						</A>
						<A
							href="/notifications"
							class="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
						>
							通知
						</A>
						<A
							href="/profile"
							class="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
						>
							プロフィール
						</A>
						<button
							type="button"
							onClick={handleLogout}
							class="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
						>
							ログアウト
						</button>
					</div>
				</div>

				<div class="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
					<p class="text-gray-600 dark:text-gray-300">
						タイムライン機能は実装中です
					</p>
				</div>
			</div>
		</div>
	);
};

export default TimelinePage;
