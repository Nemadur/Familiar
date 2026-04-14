import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
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

interface MarkdownDisplayProps {
	content: string | null | undefined;
	className?: string;
	isShort?: boolean;
}

export function MarkdownDisplay({
	content,
	className,
	isShort = false,
}: MarkdownDisplayProps) {
	const remarkPlugins = useMemo(() => [remarkGfm, remarkBreaks], []);

	const components = useMemo(
		() => ({
			a: ({ href, children }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
				if (!href) return <span>{children}</span>;

				return (
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Link
									to={href}
									target="_blank"
									rel="noopener noreferrer"
									className="link font-medium hover:underline text-primary"
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
		}),
		[],
	);

	if (!content) return null;

	return (
		<div
			className={cn(
				isShort && "line-clamp-3",
				"text-sm prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-secondary prose-pre:text-secondary-foreground",
				className,
			)}
		>
			<ReactMarkdown remarkPlugins={remarkPlugins} components={components}>
				{content}
			</ReactMarkdown>
		</div>
	);
}
