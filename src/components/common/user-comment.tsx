import { Surface } from "@heroui/react";
import { AuthError } from "@supabase/supabase-js";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import UserAvatar from "@/components/layout/profile/avatar";
import { ProfileBadge } from "@/components/layout/profile/badge";
import { cn } from "@/lib/utils";
import type { User } from "@/types/user";

interface UserCommentProps {
	author: User | undefined;
	// Content to show below the name (e.g. handle or date)
	subtitle?: ReactNode;
	// Content to show on the right side (e.g. date + stars)
	rightSideContent?: ReactNode;
	children?: ReactNode;
	className?: string;
	contentClassName?: string;
}

export function UserComment({
	author,
	rightSideContent,
	children,
	className,
}: UserCommentProps) {
	return (
		<div className={cn("flex flex-col gap-1", className)}>
			<div className="flex items-start gap-3 py-2">
				<Link
					to="/$username"
					params={{ username: author?.username || "unknown" }}
				>
					<UserAvatar user={author ?? undefined} />
				</Link>
				<div className="flex-1 min-w-0">
					<div className="flex items-center justify-between">
						<Link
							to="/$username"
							params={{ username: author?.username || "unknown" }}
						>
							<div className="flex flex-col">
								<div className="flex items-center gap-1">
									<span className="font-semibold text-sm">
										{author?.display_name || "Unknown"}
									</span>
									{author && <ProfileBadge user={author} />}
								</div>
								{author && (
									<div className="text-muted-foreground text-xs">
										@{author.username}
									</div>
								)}
							</div>
						</Link>
						{rightSideContent && (
							<div className="flex items-center gap-2">{rightSideContent}</div>
						)}
					</div>
				</div>
			</div>
			{children && (
				<Surface
					variant="secondary"
					className={"ml-12 md:ml-13 rounded-2xl rounded-tl-sm p-4 text-sm"}
				>
					{children}
				</Surface>
			)}
		</div>
	);
}
