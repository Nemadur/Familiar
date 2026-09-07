import { Skeleton as BoneyardSkeleton } from "boneyard-js/react";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { OutlineUser } from "@/components/icons/icons";
import { EmptyPage } from "@/components/layout/empty-page";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ChatSidebarList } from "./chat-sidebar-list";
import { BONEYARD_PRIMARY_12 } from "./constants";
import { createSidebarLayoutConversations } from "./helpers";
import type { ChatSidebarProps } from "./types";

type ChatSidebarTab = "direct" | "requests";
type ChatSidebarConversation = ChatSidebarProps["conversations"][number];

const chatSidebarTabs = [
	{
		value: "direct",
		label: "DMs",
	},
	{
		value: "requests",
		label: "Requests",
	},
] satisfies { value: ChatSidebarTab; label: string }[];

function isRequestConversation(conversation: ChatSidebarConversation) {
	return Boolean(conversation.commissionRequestId);
}

function getConversationTab(
	conversation: ChatSidebarConversation | undefined,
): ChatSidebarTab {
	return conversation && isRequestConversation(conversation)
		? "requests"
		: "direct";
}

function filterConversations(
	conversations: ChatSidebarConversation[],
	searchQuery: string,
) {
	const query = searchQuery.trim().toLowerCase();

	if (!query) {
		return conversations;
	}

	return conversations.filter((conversation) => {
		const title = conversation.otherParticipant.displayName.toLowerCase();
		const username = conversation.otherParticipant.username.toLowerCase();
		const lastMessage = (conversation.lastMessagePreview ?? "").toLowerCase();

		return (
			title.includes(query) ||
			username.includes(query) ||
			lastMessage.includes(query)
		);
	});
}

function getEmptyState(tab: ChatSidebarTab, searchQuery: string) {
	const hasSearch = searchQuery.trim().length > 0;

	if (tab === "requests") {
		return {
			title: "No request chats found.",
			description: hasSearch
				? "Try a different search."
				: "Request conversations will show up here.",
		};
	}

	return {
		title: "No direct messages found.",
		description: hasSearch
			? "Try a different search."
			: "Start a new conversation.",
	};
}

function SidebarConversationScroller({
	activeConversationId,
	conversations,
	emptyDescription,
	emptyTitle,
	error,
	isPending,
	onSelectConversation,
}: {
	activeConversationId: string | null;
	conversations: ChatSidebarConversation[];
	emptyDescription: string;
	emptyTitle: string;
	error: Error | null;
	isPending: boolean;
	onSelectConversation: (conversationId: string) => void;
}) {
	const visibleConversations =
		isPending && conversations.length === 0
			? createSidebarLayoutConversations()
			: conversations;

	return (
		<ScrollArea className="h-full min-h-0">
			<BoneyardSkeleton
				name="chat-sidebar-items"
				loading={isPending}
				color={BONEYARD_PRIMARY_12}
				darkColor={BONEYARD_PRIMARY_12}
				animate="solid"
				stagger={35}
				transition={180}
				fixture={
					<div className="flex flex-col gap-1 p-2">
						<ChatSidebarList
							conversations={visibleConversations}
							activeConversationId={activeConversationId}
							onSelectConversation={onSelectConversation}
						/>
					</div>
				}
				snapshotConfig={{
					excludeSelectors: ["svg", "[data-no-skeleton]"],
					leafTags: ["span", "p"],
					captureRoundedBorders: true,
				}}
			>
				{error ? (
					<div className="flex flex-col gap-1 p-2">
						<EmptyPage
							title="Could not load conversations."
							icon={OutlineUser}
							description="Check console for more details."
						/>
					</div>
				) : !isPending && conversations.length === 0 ? (
					<div className="flex flex-col gap-1 p-2">
						<EmptyPage
							title={emptyTitle}
							icon={OutlineUser}
							description={emptyDescription}
						/>
					</div>
				) : (
					<div className="flex flex-col gap-1 p-2">
						<ChatSidebarList
							conversations={visibleConversations}
							activeConversationId={activeConversationId}
							onSelectConversation={onSelectConversation}
						/>
					</div>
				)}
			</BoneyardSkeleton>
		</ScrollArea>
	);
}

export function ChatSidebar({
	conversations,
	activeConversationId,
	searchQuery,
	isPending,
	error,
	onSearchChange,
	onSelectConversation,
}: ChatSidebarProps) {
	const [activeTab, setActiveTab] = useState<ChatSidebarTab>("direct");

	const activeConversation = useMemo(() => {
		return conversations.find(
			(conversation) => conversation.id === activeConversationId,
		);
	}, [activeConversationId, conversations]);

	useEffect(() => {
		if (!activeConversation) return;

		setActiveTab(getConversationTab(activeConversation));
	}, [activeConversation]);

	const directConversations = useMemo(() => {
		return conversations.filter(
			(conversation) => !isRequestConversation(conversation),
		);
	}, [conversations]);

	const requestConversations = useMemo(() => {
		return conversations.filter(isRequestConversation);
	}, [conversations]);

	const filteredDirectConversations = useMemo(() => {
		return filterConversations(directConversations, searchQuery);
	}, [directConversations, searchQuery]);

	const filteredRequestConversations = useMemo(() => {
		return filterConversations(requestConversations, searchQuery);
	}, [requestConversations, searchQuery]);

	const directEmptyState = getEmptyState("direct", searchQuery);
	const requestEmptyState = getEmptyState("requests", searchQuery);

	if (error) console.error(error);

	return (
		<aside
			className={cn(
				"flex min-h-0 w-full shrink-0 flex-col border-r md:w-80 lg:w-96",
				activeConversationId ? "hidden md:flex" : "flex",
			)}
		>
			<Tabs
				value={activeTab}
				onValueChange={(value) => setActiveTab(value as ChatSidebarTab)}
				className="min-h-0 flex-1 gap-0"
			>
				<div className="flex flex-col gap-3 p-5 pb-2">
					<InputGroup>
						<InputGroupAddon align="inline-start">
							<Search />
						</InputGroupAddon>

						<InputGroupInput
							value={searchQuery}
							onChange={(event) => onSearchChange(event.target.value)}
							placeholder="Search messages..."
						/>
					</InputGroup>

					<TabsList className="w-full">
						{chatSidebarTabs.map((tab) => {
							const count =
								tab.value === "requests"
									? requestConversations.length
									: directConversations.length;

							return (
								<TabsTrigger key={tab.value} value={tab.value}>
									<span>{tab.label}</span>
									<span className="text-xs text-muted-foreground">{count}</span>
								</TabsTrigger>
							);
						})}
					</TabsList>
				</div>

				<TabsContent
					value="direct"
					className="min-h-0 flex-1 overflow-hidden data-[state=inactive]:hidden"
				>
					<SidebarConversationScroller
						activeConversationId={activeConversationId}
						conversations={filteredDirectConversations}
						emptyTitle={directEmptyState.title}
						emptyDescription={directEmptyState.description}
						error={error}
						isPending={isPending}
						onSelectConversation={onSelectConversation}
					/>
				</TabsContent>

				<TabsContent
					value="requests"
					className="min-h-0 flex-1 overflow-hidden data-[state=inactive]:hidden"
				>
					<SidebarConversationScroller
						activeConversationId={activeConversationId}
						conversations={filteredRequestConversations}
						emptyTitle={requestEmptyState.title}
						emptyDescription={requestEmptyState.description}
						error={error}
						isPending={isPending}
						onSelectConversation={onSelectConversation}
					/>
				</TabsContent>
			</Tabs>
		</aside>
	);
}
