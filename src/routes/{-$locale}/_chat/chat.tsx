import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { TChatConversation } from "@/api/chat/chat-types";
import { ChatPanel } from "@/components/layout/chat/chat-panel";
import { ChatSidebar } from "@/components/layout/chat/chat-sidebar";
import { defaultPage } from "@/components/layout/chat/constants";
import {
	useGetChatConversations,
	useGetChatMessages,
	usePostConversationRead,
} from "@/hooks/chat/use-chat";
import { Elevated } from "@/lib/elevated";
import { useAuth } from "@/providers/auth";

export const Route = createFileRoute("/{-$locale}/_chat/chat")({
	component: ChatRoute,
});

function ChatRoute() {
	const [activeConversationId, setActiveConversationId] = useState<
		string | null
	>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const { user } = useAuth();

	const isAuthPending = user === undefined;

	const { conversationsData, isConversationsPending, conversationsError } =
		useGetChatConversations(defaultPage);

	const { messagesData, isMessagesPending, messagesError } = useGetChatMessages(
		activeConversationId,
		defaultPage,
	);

	const markAsRead = usePostConversationRead();

	const conversations = conversationsData?.content ?? [];
	const messages = messagesData?.content ?? [];

	const activeConversation = conversations.find(
		(conversation: TChatConversation) =>
			conversation.id === activeConversationId,
	);

	function handleSelectConversation(conversationId: string) {
		setActiveConversationId(conversationId);
		markAsRead.mutate(conversationId);
	}

	return (
		<Elevated className="relative flex h-full w-full flex-1 overflow-hidden rounded-3xl shadow-none!">
			<ChatSidebar
				conversations={conversations}
				activeConversationId={activeConversationId}
				searchQuery={searchQuery}
				isAuthPending={isAuthPending}
				isPending={isConversationsPending}
				error={conversationsError}
				onSearchChange={setSearchQuery}
				onSelectConversation={handleSelectConversation}
			/>

			<ChatPanel
				conversation={activeConversation}
				conversationId={activeConversationId}
				messages={messages}
				isPending={isMessagesPending}
				error={messagesError}
				onBack={() => setActiveConversationId(null)}
			/>
		</Elevated>
	);
}
