import { ChatSidebarItem } from "./chat-sidebar-item";
import type { ChatSidebarListProps } from "./types";

export function ChatSidebarList({
	conversations,
	activeConversationId,
	onSelectConversation,
}: ChatSidebarListProps) {
	return conversations.map((conversation) => (
		<ChatSidebarItem
			key={conversation.id}
			conversation={conversation}
			isActive={conversation.id === activeConversationId}
			onSelect={() => onSelectConversation(conversation.id)}
		/>
	));
}
