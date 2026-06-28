import { Fragment, useMemo } from "react";
import type { TChatMessage } from "@/api/chat/chat-types";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Marker, MarkerContent } from "@/components/ui/marker";
import { Message, MessageContent, MessageGroup } from "@/components/ui/message";
import {
	MessageScroller,
	MessageScrollerButton,
	MessageScrollerContent,
	MessageScrollerItem,
	MessageScrollerProvider,
	MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { Elevated } from "@/lib/elevated";
import { cn } from "@/lib/utils";
import { formatMessageTime, getMessageDateLabel } from "./helpers";
import { MessageAttachmentBubble } from "./message-attachments";

type MessageListProps = {
	messages: TChatMessage[];
	unreadCount?: number;
};

export function MessageList({ messages, unreadCount = 0 }: MessageListProps) {
	const orderedMessages = useMemo(() => {
		return [...messages].reverse();
	}, [messages]);

	const timelineItems = useMemo(() => {
		return createTimelineItems(orderedMessages, unreadCount);
	}, [orderedMessages, unreadCount]);

	return (
		<MessageScrollerProvider autoScroll>
			<MessageScroller className="min-h-0 flex-1">
				<MessageScrollerViewport>
					<MessageScrollerContent className="flex flex-col gap-0.5 p-4">
						{timelineItems.map((item) => {
							if (item.type === "date") {
								return (
									<MessageScrollerItem key={item.id} messageId={item.id}>
										<DatePill>{item.label}</DatePill>
									</MessageScrollerItem>
								);
							}

							if (item.type === "unread") {
								return (
									<MessageScrollerItem key={item.id} messageId={item.id}>
										<Marker variant="separator" className="my-4 text-primary">
											<MarkerContent>New messages</MarkerContent>
										</Marker>
									</MessageScrollerItem>
								);
							}

							const firstMessage = item.messages[0];
							const lastMessage = item.messages[item.messages.length - 1];

							if (!firstMessage || !lastMessage) {
								return null;
							}

							return (
								<MessageScrollerItem
									key={item.id}
									messageId={item.id}
									scrollAnchor={lastMessage.isMine}
									className="mb-4"
								>
									<MessageGroup>
										{item.messages.map((message, index) => (
											<ChatMessageRows
												key={message.id}
												message={message}
												isFirstInGroup={index === 0}
												isLastInGroup={index === item.messages.length - 1}
											/>
										))}
									</MessageGroup>
								</MessageScrollerItem>
							);
						})}
					</MessageScrollerContent>
				</MessageScrollerViewport>

				<MessageScrollerButton />
			</MessageScroller>
		</MessageScrollerProvider>
	);
}

function DatePill({ children }: { children: string }) {
	return (
		<div className="my-4 flex justify-center select-none">
			<Elevated className="rounded-full px-3 py-1 text-[11px] tracking-wide text-primary/70 shadow-none!">
				{children}
			</Elevated>
		</div>
	);
}

type ChatMessageRowsProps = {
	message: TChatMessage;
	isFirstInGroup: boolean;
	isLastInGroup: boolean;
};

function ChatMessageRows({
	message,
	isFirstInGroup,
	isLastInGroup,
}: ChatMessageRowsProps) {
	const body = message.body ?? "";
	const attachments = getOrderedAttachments(message);
	const hasBody = body.trim().length > 0;
	const hasAttachments = attachments.length > 0;

	if (!hasBody && !hasAttachments) {
		return null;
	}

	return (
		<Fragment>
			{hasBody ? (
				<ChatTextMessageRow
					message={message}
					isFirstInGroup={isFirstInGroup}
					isLastInGroup={!hasAttachments && isLastInGroup}
				/>
			) : null}

			{attachments.map((attachment, index) => {
				const isFirstAttachment = index === 0;
				const isLastAttachment = index === attachments.length - 1;
				const isRowFirstInGroup =
					!hasBody && isFirstAttachment && isFirstInGroup;
				const isRowLastInGroup = isLastAttachment && isLastInGroup;

				return (
					<MessageAttachmentBubble
						key={`${message.id}-${attachment.fullSizeId ?? index}`}
						attachment={attachment}
						index={index}
						align={message.isMine ? "end" : "start"}
						time={formatMessageTime(message.createdAt)}
						isFirstInGroup={isRowFirstInGroup}
						isLastInGroup={isRowLastInGroup}
					/>
				);
			})}
		</Fragment>
	);
}

type ChatTextMessageRowProps = {
	message: TChatMessage;
	isFirstInGroup: boolean;
	isLastInGroup: boolean;
};

function ChatTextMessageRow({
	message,
	isFirstInGroup,
	isLastInGroup,
}: ChatTextMessageRowProps) {
	const align = message.isMine ? "end" : "start";
	const time = formatMessageTime(message.createdAt);

	return (
		<Message
			align={align}
			className={cn(!isFirstInGroup && "pt-0.5", !isLastInGroup && "pb-0")}
		>
			<MessageContent
				className={cn("max-w-[min(34rem,85%)]", message.isMine && "items-end")}
			>
				<Bubble
					align={align}
					variant={message.isMine ? "default" : "secondary"}
				>
					<BubbleContent className="block whitespace-pre-wrap break-words text-sm leading-relaxed">
						<span>{message.body}</span>
						<span
							className={cn(
								"ml-2 inline-flex translate-y-[1px] items-center align-baseline text-[11px] leading-none",
								message.isMine
									? "text-primary-foreground/70"
									: "text-muted-foreground",
							)}
						>
							{time}
						</span>
					</BubbleContent>
				</Bubble>
			</MessageContent>
		</Message>
	);
}

type TimelineItem =
	| {
			type: "date";
			id: string;
			label: string;
	  }
	| {
			type: "unread";
			id: string;
	  }
	| {
			type: "group";
			id: string;
			messages: TChatMessage[];
	  };

function createTimelineItems(messages: TChatMessage[], unreadCount: number) {
	const timelineItems: TimelineItem[] = [];
	const unreadStartIndex =
		unreadCount > 0 && messages.length > 0
			? Math.max(0, messages.length - unreadCount)
			: -1;

	let currentGroup: Extract<TimelineItem, { type: "group" }> | null = null;

	function pushCurrentGroup() {
		if (!currentGroup || currentGroup.messages.length === 0) {
			currentGroup = null;
			return;
		}

		currentGroup.id = getMessageGroupId(currentGroup.messages);
		timelineItems.push(currentGroup);
		currentGroup = null;
	}

	messages.forEach((message, index) => {
		const prevMessage = messages[index - 1];
		const messageDateLabel = getMessageDateLabel(message);
		const prevMessageDateLabel = prevMessage
			? getMessageDateLabel(prevMessage)
			: null;
		const showDate = prevMessageDateLabel !== messageDateLabel;
		const showUnreadMarker = unreadStartIndex === index;

		if (showDate) {
			pushCurrentGroup();
			timelineItems.push({
				type: "date",
				id: `date-${messageDateLabel}-${message.createdAt}`,
				label: messageDateLabel,
			});
		}

		if (showUnreadMarker) {
			pushCurrentGroup();
			timelineItems.push({
				type: "unread",
				id: "unread-messages-marker",
			});
		}

		if (
			currentGroup &&
			canAppendToMessageGroup(currentGroup.messages, message)
		) {
			currentGroup.messages.push(message);
			return;
		}

		pushCurrentGroup();
		currentGroup = {
			type: "group",
			id: message.id,
			messages: [message],
		};
	});

	pushCurrentGroup();

	return timelineItems;
}

function canAppendToMessageGroup(
	groupMessages: TChatMessage[],
	nextMessage: TChatMessage,
) {
	const previousMessage = groupMessages[groupMessages.length - 1];

	if (!previousMessage) {
		return false;
	}

	// Group by message direction instead of raw senderId. In this chat UI there are
	// only two visual sides: my messages and the other participant's messages.
	// Some API responses can have missing/different senderId values for incoming
	// messages, which made consecutive incoming bubbles split into separate groups.
	if (
		getMessageGroupSenderKey(previousMessage) !==
		getMessageGroupSenderKey(nextMessage)
	) {
		return false;
	}

	return (
		getMessageDateLabel(previousMessage) === getMessageDateLabel(nextMessage)
	);
}

function getMessageGroupSenderKey(message: TChatMessage) {
	return message.isMine ? "mine" : "other";
}

function getMessageGroupId(messages: TChatMessage[]) {
	const firstMessage = messages[0];
	const lastMessage = messages[messages.length - 1] ?? firstMessage;

	if (!firstMessage || !lastMessage) {
		return "empty-message-group";
	}

	return `group-${firstMessage.id}-${lastMessage.id}`;
}

function getOrderedAttachments(message: TChatMessage) {
	const attachments = message.attachments ?? [];

	return [...attachments].sort((firstAttachment, secondAttachment) => {
		const firstPosition = Number.isFinite(firstAttachment.position)
			? firstAttachment.position
			: 0;
		const secondPosition = Number.isFinite(secondAttachment.position)
			? secondAttachment.position
			: 0;

		return firstPosition - secondPosition;
	});
}
