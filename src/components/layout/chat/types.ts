import type { TChatConversation, TChatMessage } from "@/api/chat/chat-types";

export type ChatSidebarProps = {
	conversations: TChatConversation[];
	activeConversationId: string | null;
	searchQuery: string;
	isAuthPending: boolean;
	isPending: boolean;
	error: Error | null;
	onSearchChange: (query: string) => void;
	onSelectConversation: (conversationId: string) => void;
};

export type ChatSidebarListProps = {
	conversations: TChatConversation[];
	activeConversationId: string | null;
	onSelectConversation: (conversationId: string) => void;
};

export type ChatSidebarItemProps = {
	conversation: TChatConversation;
	isActive: boolean;
	onSelect: () => void;
};

export type ChatPanelProps = {
	conversation: TChatConversation | undefined;
	conversationId: string | null;
	messages: TChatMessage[];
	isPending: boolean;
	error: Error | null;
	onBack: () => void;
};

export type ChatHeaderProps = {
	conversation: TChatConversation;
	onBack: () => void;
};
