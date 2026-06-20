import { onMount, Show } from "solid-js";
import "./App.css";
import {
	authSignals,
	isAuthenticated,
	logout,
	restoreAuth,
} from "./features/auth/authStore";
import LoginPage from "./features/auth/LoginPage";
import { useProfile } from "./shared/nostr/hooks/useProfile";
import { initializeRelays } from "./shared/nostr/relayManager";
import ProfileCard from "./shared/ui/ProfileCard";

function App() {
	// Initialize relays and restore authentication on mount
	onMount(() => {
		initializeRelays();
		restoreAuth();
	});

	return (
		<Show when={isAuthenticated()} fallback={<LoginPage />}>
			<MainApp />
		</Show>
	);
}

function MainApp() {
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
					<button
						type="button"
						onClick={handleLogout}
						class="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
					>
						ログアウト
					</button>
				</div>

				<div class="mb-6">
					<h2 class="text-lg font-semibold text-gray-800 dark:text-white mb-3">
						あなたのプロフィール
					</h2>

					<Show
						when={!profile.loading}
						fallback={
							<div class="bg-white dark:bg-gray-800 rounded-lg p-8 shadow text-center">
								<div class="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
								<p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
									プロフィールを読み込み中...
								</p>
							</div>
						}
					>
						<ProfileCard
							profile={profile()}
							pubkey={authSignals.pubkey() || ""}
						/>
					</Show>
				</div>

				<div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
					<h3 class="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
						NIP-39 AKA Profiles 対応
					</h3>
					<p class="text-xs text-blue-800 dark:text-blue-300">
						プロフィールに外部アイデンティティ（GitHub、Twitter等）が設定されている場合、自動的に表示されます。
					</p>
				</div>

				<div class="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
					<h3 class="text-sm font-semibold text-gray-800 dark:text-white mb-2">
						次のステップ
					</h3>
					<ul class="text-sm text-gray-600 dark:text-gray-300 space-y-1">
						<li>✅ NIP-07 認証</li>
						<li>✅ NIP-39 AKA Profiles 対応</li>
						<li>⏳ タイムライン表示</li>
						<li>⏳ イベント投稿</li>
						<li>⏳ リレー管理</li>
					</ul>
				</div>
			</div>
		</div>
	);
}

export default App;
