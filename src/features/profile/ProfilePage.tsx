import { A } from "@solidjs/router";
import type { Component } from "solid-js";
import { useProfile } from "../../services/nostr/hooks/useProfile";
import ProfileCard from "../../shared/ui/ProfileCard";
import { authSignals, logout } from "../auth/authStore";

const ProfilePage: Component = () => {
	const profile = useProfile(authSignals.pubkey);

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
							href="/global"
							class="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
						>
							グローバル
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

				<h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">
					プロフィール
				</h2>

				<ProfileCard profile={profile()} pubkey={authSignals.pubkey() || ""} />
			</div>
		</div>
	);
};

export default ProfilePage;
