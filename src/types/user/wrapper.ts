import type { ReactNode } from "react";
import type { ProfileFeedTab } from "../feed";

type ProfileWrapperProps = {
	username: string;
	folderId?: string;
	initialTab?: ProfileFeedTab;
	activeTab?: string;
	onTabChange?: (tab: string) => void;
	children?: ReactNode;
};

export type { ProfileWrapperProps };
