import { For, Show } from "solid-js";
import type { AKAProfile } from "../nostr/nip39";
import { getPlatformDisplay } from "../nostr/nip39";

interface ProfileCardProps {
	profile: AKAProfile | null | undefined;
	pubkey: string;
	compact?: boolean;
}

/**
 * Profile display component with NIP-39 identity support
 */
export default function ProfileCard(props: ProfileCardProps) {
	const displayName = () =>
		props.profile?.display_name || props.profile?.name || "Anonymous";

	const shortPubkey = () =>
		`${props.pubkey.slice(0, 8)}...${props.pubkey.slice(-8)}`;

	// Show message when profile doesn't exist
	return (
		<Show
			when={props.profile !== null && props.profile !== undefined}
			fallback={
				<div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
					<div class="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white text-2xl font-bold">
						?
					</div>
					<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
						プロフィールが見つかりません
					</h3>
					<p class="text-sm text-gray-600 dark:text-gray-300 mb-2">
						このアカウントにはまだプロフィール情報が設定されていません
					</p>
					<p class="text-xs text-gray-500 dark:text-gray-400 font-mono">
						{shortPubkey()}
					</p>
				</div>
			}
		>
			<div
				class={
					props.compact
						? "flex items-center gap-3"
						: "bg-white dark:bg-gray-800 rounded-lg p-4 shadow"
				}
			>
				{/* Avatar */}
				<div class="flex-shrink-0">
					<Show
						when={props.profile?.picture}
						fallback={
							<div
								class={`${props.compact ? "w-10 h-10" : "w-16 h-16"} rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold`}
							>
								{displayName().charAt(0).toUpperCase()}
							</div>
						}
					>
						<img
							src={props.profile?.picture}
							alt={displayName()}
							class={`${props.compact ? "w-10 h-10" : "w-16 h-16"} rounded-full object-cover`}
						/>
					</Show>
				</div>

				{/* Profile Info */}
				<div class="flex-1 min-w-0">
					<div class="flex items-center gap-2">
						<h3
							class={`${props.compact ? "text-base" : "text-lg"} font-semibold text-gray-900 dark:text-white truncate`}
						>
							{displayName()}
						</h3>
						{/* NIP-05 Verification */}
						<Show when={props.profile?.nip05}>
							<span
								class="inline-flex items-center text-blue-600 dark:text-blue-400"
								title="NIP-05 verified"
							>
								<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
									<title>Verified</title>
									<path
										fill-rule="evenodd"
										d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
										clip-rule="evenodd"
									/>
								</svg>
							</span>
						</Show>
					</div>

					<Show when={!props.compact}>
						{/* About */}
						<Show when={props.profile?.about}>
							<p class="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
								{props.profile?.about}
							</p>
						</Show>
					</Show>

					{/* Pubkey */}
					<p class="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
						{shortPubkey()}
					</p>

					{/* NIP-39 External Identities */}
					<Show when={props.profile?.identities?.length}>
						<div class="flex flex-wrap gap-2 mt-2">
							<For each={props.profile?.identities}>
								{(identity) => {
									const display = getPlatformDisplay(identity.platform);
									return (
										<Show
											when={identity.proof}
											fallback={
												<span class="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300">
													<span>{display.icon}</span>
													<span>{identity.identity}</span>
												</span>
											}
										>
											<a
												href={identity.proof}
												target="_blank"
												rel="noopener noreferrer"
												class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded text-xs text-blue-700 dark:text-blue-300 transition-colors"
												title={`${display.name}: ${identity.identity}`}
											>
												<span>{display.icon}</span>
												<span>{identity.identity}</span>
											</a>
										</Show>
									);
								}}
							</For>
						</div>
					</Show>

					{/* Additional Links (non-compact) */}
					<Show when={!props.compact}>
						<div class="flex flex-wrap gap-3 mt-2">
							<Show when={props.profile?.website}>
								<a
									href={props.profile?.website}
									target="_blank"
									rel="noopener noreferrer"
									class="text-xs text-blue-600 dark:text-blue-400 hover:underline"
								>
									🌐 Website
								</a>
							</Show>
							<Show when={props.profile?.lud16}>
								<span
									class="text-xs text-yellow-600 dark:text-yellow-400"
									title="Lightning Address"
								>
									⚡ {props.profile?.lud16}
								</span>
							</Show>
						</div>
					</Show>
				</div>
			</div>
		</Show>
	);
}
