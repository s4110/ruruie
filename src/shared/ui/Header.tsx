import { A, useLocation } from "@solidjs/router";
import type { Component } from "solid-js";
import { logout } from "../../features/auth/authStore";

/**
 * Common navigation header component
 * Displays app logo and navigation links
 */
const Header: Component = () => {
	const location = useLocation();

	const handleLogout = () => {
		if (confirm("ログアウトしますか？")) {
			logout();
		}
	};

	const isActive = (path: string) => {
		return location.pathname === path;
	};

	const linkClass = (path: string) => {
		const base = "px-4 py-2 text-sm transition-colors";
		if (isActive(path)) {
			return `${base} font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300`;
		}
		return `${base} text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white`;
	};

	return (
		<div class="flex flex-col gap-5 min-w-[15%]">
			<h1 class="text-2xl font-bold text-purple-600 dark:text-purple-400">
				ruruie
			</h1>
			<div class="flex flex-col gap-3">
				<A href="/" class={linkClass("/")}>
					ホーム
				</A>
				<A href="/timeline" class={linkClass("/timeline")}>
					グローバル
				</A>
				<A href="/notifications" class={linkClass("/notifications")}>
					通知
				</A>
				<A href="/profile" class={linkClass("/profile")}>
					プロフィール
				</A>
				<button
					type="button"
					onClick={handleLogout}
					class="px-4 py-2 text-sm text-left text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
				>
					ログアウト
				</button>
			</div>
		</div>
	);
};

export default Header;
