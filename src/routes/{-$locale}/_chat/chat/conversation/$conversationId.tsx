import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/{-$locale}/_chat/chat/conversation/$conversationId',
)({
  component: ConversationRoute,
})

function ConversationRoute() {
	return null;
}
