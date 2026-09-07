import { Info, MoreVertical } from "lucide-react";
import { OutlineArrowLeft } from "@/components/icons/assets/arrows/arrow-left";
import User from "@/components/layout/profile/user";
import { Button } from "@/components/ui/button";
import { getConversationUser } from "./helpers";
import type { ChatHeaderProps } from "./types";

export function ChatHeader({ conversation, onBack }: ChatHeaderProps) {
	const user = getConversationUser(conversation);

	return (
		<header className="flex items-center justify-between border-b p-4">
			<div className="flex items-center gap-3">
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="shrink-0 rounded-full md:hidden"
					onClick={onBack}
				>
					<OutlineArrowLeft data-icon="inline-start" />
				</Button>

				<div className="pointer-events-none">
					<User
						user={user}
						avatarSize="default"
						showAvatar={false}
						status={undefined}
						buttonClassName="h-auto w-auto p-0 hover:bg-transparent"
						nonDropdownButtonClassName="!opacity-100"
					/>
				</div>
			</div>

			<div className="flex items-center gap-2">
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="rounded-full"
				>
					<Info data-icon="inline-start" />
				</Button>

				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="rounded-full"
				>
					<MoreVertical data-icon="inline-start" />
				</Button>
			</div>
		</header>
	);
}
