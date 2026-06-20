import { useNavigate } from "@solidjs/router";
import { createSignal, onMount, Show } from "solid-js";
import {
	hasNostrExtension,
	waitForNostrExtension,
} from "../../shared/nostr/nip07";
import { authSignals, login } from "./authStore";

/**
 * Login page component
 * Displays authentication UI for NIP-07 login
 */
export default function LoginPage() {
	const navigate = useNavigate();
	const [isLoggingIn, setIsLoggingIn] = createSignal(false);
	const [hasExtension, setHasExtension] = createSignal(false);
	const [debugInfo, setDebugInfo] = createSignal<string>("");

	// Check for extension after mount (after window is available)
	onMount(async () => {
		const updateDebugInfo = () => {
			const extensionExists = hasNostrExtension();
			setHasExtension(extensionExists);

			// Debug info
			const info = [
				`Window object: ${typeof window !== "undefined" ? "✅" : "❌"}`,
				`window.nostr: ${typeof window !== "undefined" && window.nostr ? "✅" : "❌"}`,
				`Extension detected: ${extensionExists ? "✅" : "❌"}`,
			].join("\n");
			setDebugInfo(info);
			console.log("Extension detection:", info);
		};

		// Initial check
		updateDebugInfo();

		// If not found, wait for extension with MutationObserver + polling
		if (!hasNostrExtension()) {
			console.log("Extension not found, waiting...");
			const found = await waitForNostrExtension(3000);

			if (found) {
				console.log("Extension detected!");
				updateDebugInfo();
			} else {
				console.log("Extension not found after 3 seconds");
			}
		}
	});

	const handleLogin = async () => {
		setIsLoggingIn(true);
		try {
			await login();
			// Redirect to home page after successful login
			navigate("/");
		} catch (err) {
			console.error("Login failed:", err);
		} finally {
			setIsLoggingIn(false);
		}
	};

	return (
		<div class="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
			<div class="max-w-md w-full">
				<div class="text-center mb-8">
					<h1 class="text-5xl font-bold text-purple-600 dark:text-purple-400 mb-2">
						ruruie
					</h1>
					<p class="text-gray-600 dark:text-gray-300">
						高速 Nostr クライアント
					</p>
				</div>

				<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
					<h2 class="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
						ログイン
					</h2>

					<Show when={debugInfo().length > 0}>
						<div class="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono whitespace-pre-wrap">
							{debugInfo()}
						</div>
					</Show>

					<Show
						when={hasExtension()}
						fallback={
							<div class="space-y-4">
								<div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
									<p class="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
										Nostr拡張機能が見つかりません
									</p>
									<p class="text-xs text-yellow-700 dark:text-yellow-300">
										以下のいずれかの拡張機能をインストールしてください：
									</p>
								</div>

								<div class="space-y-2">
									<a
										href="https://github.com/fiatjaf/nos2x"
										target="_blank"
										rel="noopener noreferrer"
										class="block w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-center transition-colors"
									>
										<span class="font-medium text-gray-800 dark:text-white">
											nos2x
										</span>
										<span class="text-xs text-gray-500 dark:text-gray-400 ml-2">
											(Chrome/Firefox)
										</span>
									</a>

									<a
										href="https://getalby.com"
										target="_blank"
										rel="noopener noreferrer"
										class="block w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-center transition-colors"
									>
										<span class="font-medium text-gray-800 dark:text-white">
											Alby
										</span>
										<span class="text-xs text-gray-500 dark:text-gray-400 ml-2">
											(Chrome/Firefox)
										</span>
									</a>

									<a
										href="https://www.flamingo.me"
										target="_blank"
										rel="noopener noreferrer"
										class="block w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-center transition-colors"
									>
										<span class="font-medium text-gray-800 dark:text-white">
											Flamingo
										</span>
										<span class="text-xs text-gray-500 dark:text-gray-400 ml-2">
											(Chrome)
										</span>
									</a>
								</div>

								<p class="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
									拡張機能をインストール後、ページを再読み込みしてください
								</p>
							</div>
						}
					>
						<div class="space-y-4">
							<button
								type="button"
								onClick={handleLogin}
								disabled={isLoggingIn()}
								class="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
							>
								<Show
									when={!isLoggingIn()}
									fallback={
										<>
											<span class="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
											<span>ログイン中...</span>
										</>
									}
								>
									<svg
										class="w-5 h-5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<title>Key icon</title>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
										/>
									</svg>
									<span>拡張機能でログイン</span>
								</Show>
							</button>

							<Show when={authSignals.error()}>
								<div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
									<p class="text-sm text-red-800 dark:text-red-200">
										{authSignals.error()}
									</p>
								</div>
							</Show>

							<div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
								<p class="text-xs text-blue-800 dark:text-blue-200">
									<strong>NIP-07対応:</strong>{" "}
									秘密鍵はブラウザ拡張機能で安全に管理されます。
									このアプリは秘密鍵にアクセスできません。
								</p>
							</div>
						</div>
					</Show>
				</div>

				<p class="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
					Nostrプロトコルを使用した分散型SNS
				</p>
			</div>
		</div>
	);
}
