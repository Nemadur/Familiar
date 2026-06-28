import { Calligraph } from "calligraph";
import User from "@/components/layout/profile/user";
import { cn } from "@/lib/utils";
import { formatMessageTime, getConversationUser } from "./helpers";
import type { ChatSidebarItemProps } from "./types";

export function ChatSidebarItem({
	conversation,
	isActive,
	onSelect,
}: ChatSidebarItemProps) {
	const user = getConversationUser(conversation);
	const unreadCount = conversation.unreadCount;
	const lastMessage = conversation.lastMessagePreview ?? "No messages yet";
	const updatedAt = conversation.lastMessageAt ?? conversation.createdAt;

	return (
		<button
			type="button"
			tabIndex={0}
			onClick={onSelect}
			onKeyDown={(event) => {
				if (event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					onSelect();
				}
			}}
			aria-current={isActive ? "true" : undefined}
			className={cn(
				"group/user-btn flex w-full cursor-pointer items-center gap-3 rounded-2xl p-3 text-left transition-colors outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]",
				isActive
					? "bg-accent text-accent-foreground"
					: "text-foreground hover:bg-accent/12",
			)}
		>
			<div className="pointer-events-none flex w-full justify-between gap-3">
				<User
					user={user}
					avatarSize="lg"
					description={lastMessage}
					status={isActive ? "active" : undefined}
					nonDropdownButtonClassName="!opacity-100"
					// avatarBadgeClassName={cn(
					// 	"transition-colors",
					// 	isActive
					// 		? "!border-accent"
					// 		: "!border-background group-hover/user-btn:!border-accent/12",
					// )}
				/>

				<div className="flex flex-col items-end justify-between py-1.5 flex-1">
					<span
						className={cn(
							"text-xs",
							isActive ? "text-accent-foreground/80" : "text-muted-foreground",
						)}
					>
						{formatMessageTime(updatedAt)}
					</span>

					{unreadCount > 0 && (
						<Calligraph
							className={cn(
								"flex size-5 items-center justify-center rounded-full text-[10px] font-medium",
								isActive
									? "bg-accent-foreground text-accent"
									: "bg-primary text-primary-foreground",
							)}
						>
							{unreadCount}
						</Calligraph>
					)}
				</div>
			</div>
		</button>
	);
}
