import { Link } from "@tanstack/react-router";
import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { OutlineChevronRight } from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { User } from "@/types/user";
import { ProfileDetailsContent } from "../profile-details";

interface ProfileBioProps {
	user: User;
	isShort?: boolean;
	className?: string;
}

export function ProfileBio({
	user,
	isShort = false,
	className,
}: ProfileBioProps) {
	if (!user.bio) return null;

	return (
		<div
			className={cn(
				isShort && "line-clamp-3",
				"text-sm whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none",
				className,
			)}
		>
			<ReactMarkdown
				remarkPlugins={[remarkGfm, remarkBreaks]}
				components={{
					a: ({ href, children }) => {
						if (!href) return <span>{children}</span>;

						return (
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<Link
											to={href}
											target="_blank"
											rel="noopener noreferrer"
											className=" link font-medium"
										>
											{children}
										</Link>
									</TooltipTrigger>
									<TooltipContent>
										<p className="max-w-xs break-all">{href}</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						);
					},
				}}
			>
				{user.bio}
			</ReactMarkdown>
		</div>
	);
}
