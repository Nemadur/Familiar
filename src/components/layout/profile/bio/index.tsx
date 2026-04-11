import { Link } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { TUserProfile } from "@/types/user";

interface ProfileBioProps {
	user: TUserProfile;
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
				"text-sm whitespace-pre-wrap prose-p:m-0 prose prose-sm dark:prose-invert max-w-none",
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
											className="link font-medium"
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
