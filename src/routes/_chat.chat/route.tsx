import { Typography } from "@heroui/react";
import { createFileRoute } from "@tanstack/react-router";
import { Calligraph } from "calligraph";
import { Info, MoreVertical, Paperclip, Send } from "lucide-react";
import { Fragment, useState } from "react";
import {
	OutlineArrowLeft,
	OutlineChat,
	OutlineSend,
} from "@/components/icons/icons";
import { EmptyPage } from "@/components/layout/empty-page";
import { FilterBar } from "@/components/layout/filter-bar";
import User from "@/components/layout/profile/user";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "@/components/ui/chat-message";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupTextArea,
} from "@/components/ui/input-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Elevated } from "@/lib/elevated";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_chat/chat")({
	component: ChatLayout,
});

// --- Mock Data ---
const MOCK_USERS = [
	{
		id: "u1",
		name: "Prismagic",
		avatar: "https://i.pravatar.cc/150?u=1",
		lastMessage: "Sounds great! I'll get started.",
		time: "10:42 AM",
		unread: 3,
		online: true,
	},
	{
		id: "u2",
		name: "Almond Neko",
		avatar: "https://i.pravatar.cc/150?u=2",
		lastMessage: "Can you send the references again?",
		time: "Yesterday",
		unread: 0,
		online: false,
	},
	{
		id: "u3",
		name: "UniqueOly",
		avatar: "https://i.pravatar.cc/150?u=3",
		lastMessage: "Thanks for the update!",
		time: "Monday",
		unread: 0,
		online: true,
	},
];

const MOCK_MESSAGES: Record<
	string,
	{
		id: string;
		from: "user" | "artist";
		text?: string;
		time: string;
		date: string;
		files?: (File | string)[];
	}[]
> = {
	u1: [
		{
			id: "m1",
			from: "artist",
			text: "Hello! Thanks for reaching out. What kind of commission are you looking for?",
			time: "10:30 AM",
			date: "May 24, 2025",
		},
		{
			id: "m2",
			from: "user",
			text: "Hi! I'd love to get a character design based on some ideas I have.",
			time: "10:32 AM",
			date: "May 24, 2025",
		},
		{
			id: "m3",
			from: "artist",
			text: "Awesome! Do you have any reference images or moodboards you can share?",
			time: "10:35 AM",
			date: "May 24, 2025",
		},
		{
			id: "m4",
			from: "user",
			text: "Yes, I'll send them over right now. Give me a sec.",
			time: "10:38 AM",
			date: "May 25, 2025",
		},
		{
			id: "m5-1",
			from: "user",
			time: "10:40 AM",
			date: "May 25, 2025",
			files: [
				"https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=400&auto=format&fit=crop",
			],
		},
		{
			id: "m5-2",
			from: "user",
			time: "10:40 AM",
			date: "May 25, 2025",
			files: [
				"https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=400&auto=format&fit=crop",
			],
		},
		{
			id: "m5",
			from: "user",
			text: "Here are some color palettes I like.",
			time: "10:40 AM",
			date: "May 25, 2025",
		},
		{
			id: "m6",
			from: "artist",
			text: "Sounds great! I'll get started.",
			time: "10:42 AM",
			date: "May 25, 2025",
		},
	],
	u2: [
		{
			id: "m1",
			from: "artist",
			text: "Can you send the references again?",
			time: "Yesterday",
			date: "May 24, 2025",
		},
	],
	u3: [
		{
			id: "m1",
			from: "user",
			text: "Thanks for the update!",
			time: "Monday",
			date: "May 20, 2025",
		},
	],
};

function ChatLayout() {
	const [activeChat, setActiveChat] = useState<string | null>(null);
	const [search, setSearch] = useState("");
	const [messageText, setMessageText] = useState("");

	const activeUser = MOCK_USERS.find((u) => u.id === activeChat);
	const messages = activeChat ? MOCK_MESSAGES[activeChat] || [] : [];

	const filteredUsers = MOCK_USERS.filter((user) => {
		if (!search.trim()) return true;
		const query = search.toLowerCase();

		if (user.name.toLowerCase().includes(query)) return true;

		const userMessages = MOCK_MESSAGES[user.id] || [];
		return userMessages.some((msg) => msg.text?.toLowerCase().includes(query));
	});

	return (
		<Elevated className="flex h-full w-full overflow-hidden shadow-none! rounded-3xl relative">
			{/* Left Sidebar: Chat List */}
			<div
				className={cn(
					"w-full md:w-80 lg:w-96 flex flex-col border-r bg-muted/10 shrink-0",
					activeChat ? "hidden md:flex" : "flex",
				)}
			>
				{/* Sidebar Header */}
				<div className="p-4 border-b space-y-4">
					<Typography.Heading level={4} className="font-bold">
						Messages
					</Typography.Heading>
					<FilterBar
						className="[&>div>div.shrink-0]:hidden [&>div.flex.w-full]:hidden"
						data={[]}
						groups={[]}
						searchQuery={search}
						onSearchChange={setSearch}
						searchPlaceholder="Search messages..."
						onFilterChange={() => {}}
					/>
				</div>

				{/* Chat List */}
				<ScrollArea className="flex-1">
					<div className="flex flex-col p-2 gap-1">
						{filteredUsers.length === 0 ? (
							<div className="p-4 text-center text-sm text-muted-foreground">
								No conversations found.
							</div>
						) : (
							filteredUsers.map((user) => {
								const isActive = activeChat === user.id;

								return (
									<button
										type="button"
										key={user.id}
										onClick={() => setActiveChat(user.id)}
										className={cn(
											"flex items-center gap-3 p-3 rounded-2xl text-left transition-colors group/user-btn",
											isActive
												? "bg-accent text-accent-foreground"
												: "hover:bg-accent/12 text-foreground",
										)}
									>
										<div className="flex-1 min-w-0 flex items-center justify-between gap-3 pointer-events-none">
											<User
												user={{
													userId: user.id,
													username: user.name.toLowerCase().replace(/\s/g, ""),
													displayName: user.name,
													avatarPath: user.avatar,
													createdAt: "",
													roles: [],
												}}
												showInfo
												showAvatar
												avatarSize="lg"
												description={user.lastMessage}
												isOnline={user.online}
												status={isActive ? "active" : undefined} // Used to style the text colors in User
												buttonClassName="p-0 hover:bg-transparent h-auto w-auto max-w-[70%]"
												nonDropdownButtonClassName="!opacity-100"
												avatarBadgeClassName={cn(
													"transition-colors",
													isActive
														? "border-accent"
														: "border-background group-hover/user-btn:border-[color-mix(in_oklab,var(--accent)_12%,var(--background))]",
												)}
											/>
											<div className="flex flex-col items-end gap-1 shrink-0">
												<span
													className={cn(
														"text-xs shrink-0",
														isActive
															? "text-accent-foreground/80"
															: "text-muted-foreground",
													)}
												>
													{user.time}
												</span>
												{user.unread > 0 && (
													<Calligraph
														className={cn(
															"flex items-center justify-center size-5 rounded-full text-[10px] font-medium",
															isActive
																? "bg-accent-foreground text-accent"
																: "bg-primary text-primary-foreground",
														)}
													>
														{user.unread}
													</Calligraph>
												)}
											</div>
										</div>
									</button>
								);
							})
						)}
					</div>
				</ScrollArea>
			</div>

			{/* Right Content: Chat Area */}
			<div
				className={cn(
					"flex-1 flex flex-col min-w-0 min-h-0",
					!activeChat ? "hidden md:flex" : "flex",
				)}
			>
				{!activeChat || !activeUser ? (
					<div className="flex-1 flex items-center justify-center p-8">
						<EmptyPage
							icon={OutlineChat}
							title="Your Messages"
							description="Select a conversation to start chatting."
						/>
					</div>
				) : (
					<>
						{/* Chat Header */}
						<div className="flex items-center justify-between p-4 border-b">
							<div className="flex items-center gap-3">
								<Button
									variant="ghost"
									size="icon"
									className="rounded-full md:hidden shrink-0"
									onClick={() => setActiveChat(null)}
								>
									<OutlineArrowLeft />
								</Button>
								<div className="pointer-events-none">
									<User
										user={{
											userId: activeUser.id,
											username: activeUser.name
												.toLowerCase()
												.replace(/\s/g, ""),
											displayName: activeUser.name,
											avatarPath: activeUser.avatar,
											createdAt: "",
											roles: [],
										}}
										showInfo
										showAvatar={false}
										avatarSize="default"
										status={activeUser.online ? "Online" : "Offline"}
										isOnline={false} // Disable badge in header
										buttonClassName="p-0 hover:bg-transparent h-auto w-auto"
										nonDropdownButtonClassName="!opacity-100"
									/>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<Button variant="ghost" size="icon" className="rounded-full">
									<Info className="size-5" />
								</Button>
								<Button variant="ghost" size="icon" className="rounded-full">
									<MoreVertical className="size-5" />
								</Button>
							</div>
						</div>

						{/* Messages Area */}
						<ScrollArea className="flex-1 min-h-0">
							<div className="flex flex-col gap-0.5 max-w-3xl mx-auto p-4">
								{messages.map((msg, idx) => {
									const prevMsg = messages[idx - 1];
									const nextMsg = messages[idx + 1];
									const showDate = !prevMsg || prevMsg.date !== msg.date;

									// Simplified grouping logic: same user, same day.
									// (In reality you might also check time differences)
									const isFirstInGroup =
										!prevMsg ||
										prevMsg.from !== msg.from ||
										prevMsg.date !== msg.date;
									const isLastInGroup =
										!nextMsg ||
										nextMsg.from !== msg.from ||
										nextMsg.date !== msg.date;

									return (
										<Fragment key={msg.id}>
											{showDate && (
												<div className="flex justify-center my-4 select-none">
													<span className="bg-primary/10 text-primary/60 text-[11px] px-3 py-1 rounded-full font-semibold tracking-wide">
														{msg.date}
													</span>
												</div>
											)}
											<ChatMessage
												from={msg.from}
												time={msg.time}
												files={msg.files}
												isFirstInGroup={isFirstInGroup}
												isLastInGroup={isLastInGroup}
												className={cn(isLastInGroup ? "mb-4" : "mb-0")}
											>
												{msg.text}
											</ChatMessage>
										</Fragment>
									);
								})}
							</div>
						</ScrollArea>

						{/* Input Area */}
						<div className="p-4 border-t">
							<form
								onSubmit={(e) => {
									e.preventDefault();
									if (!messageText.trim()) return;
									// Handle sending message here
									setMessageText("");
								}}
								className="max-w-3xl mx-auto"
							>
								<InputGroup>
									<InputGroupAddon align="inline-start">
										<InputGroupButton
											variant="ghost"
											size="icon-sm"
											className="text-muted-foreground hover:text-foreground shrink-0"
										>
											<Paperclip className="size-5" />
										</InputGroupButton>
									</InputGroupAddon>
									<InputGroupTextArea
										placeholder="Write a message..."
										value={messageText}
										onChange={(e) => setMessageText(e.target.value)}
										className="min-h-[40px] max-h-32 text-sm"
										rows={1}
										onKeyDown={(e) => {
											if (e.key === "Enter" && !e.shiftKey) {
												e.preventDefault();
												e.currentTarget.form?.dispatchEvent(
													new Event("submit", {
														cancelable: true,
														bubbles: true,
													}),
												);
											}
										}}
									/>
									<InputGroupAddon align="inline-end">
										<InputGroupButton
											type="submit"
											size="icon-sm"
											className="bg-accent text-accent-foreground hover:bg-accent/90 shrink-0"
										>
											<OutlineSend />
										</InputGroupButton>
									</InputGroupAddon>
								</InputGroup>
							</form>
						</div>
					</>
				)}
			</div>
		</Elevated>
	);
}
