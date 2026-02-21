import type { ProfileFeedTab } from "../feed";

type ProfileWrapperProps = {
	username: string;
	folderId?: string;
	initialTab?: ProfileFeedTab;
	onTabChange?: (tab: ProfileFeedTab) => void;
};

export type { ProfileWrapperProps };
