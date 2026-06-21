import type { Component } from "solid-js";
import { useProfile } from "../../services/nostr/hooks/useProfile";
import AppLayout from "../../shared/ui/AppLayout";
import ProfileCard from "../../shared/ui/ProfileCard";
import { authSignals } from "../auth/authStore";

const ProfilePage: Component = () => {
	const profile = useProfile(authSignals.pubkey);

	return (
		<AppLayout>
			<h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">
				プロフィール
			</h2>

			<ProfileCard profile={profile()} pubkey={authSignals.pubkey() || ""} />
		</AppLayout>
	);
};

export default ProfilePage;
