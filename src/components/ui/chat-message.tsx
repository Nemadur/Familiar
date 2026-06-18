"use client";

import { Calligraph } from "calligraph";
import { type HTMLMotionProps, motion } from "framer-motion";
import { forwardRef, type ReactNode } from "react";
import { FileThumbnail } from "src/components/ui/file-thumbnail";
import { useShape } from "src/lib/shape-context";
import { spring } from "src/lib/springs";
import { cn } from "src/lib/utils";

interface ChatMessageProps extends Omit<HTMLMotionProps<"div">, "children"> {
	/** Who sent the message. Drives alignment and bubble colour:
	 *  `user` → right-aligned accent bubble, `artist` → left-aligned plain text. */
	from: "user" | "artist";
	/** Optional attachments rendered as square thumbnails above the bubble. */
	files?: (File | string)[];
	/** Side length of each attachment thumbnail in pixels. Defaults to 240. */
	thumbnailSize?: number;
	/** Timestamp shown in the hover-revealed meta row, before the actions.
	 *  User-message only — ignored on artist replies. Caller pre-formats it
	 *  (e.g. `"Wednesday 6:08 PM"`). */
	time?: ReactNode;
	/** Icon-only action buttons shown in the hover-revealed meta row (e.g. copy,
	 *  edit, regenerate). Rendered next to the timestamp. */
	actions?: ReactNode;
	/** Message body. When omitted the text bubble is dropped (attachment-only message). */
	children?: ReactNode;
	/** Is this message the first in a contiguous group from the same sender? */
	isFirstInGroup?: boolean;
	/** Is this message the last in a contiguous group from the same sender? */
	isLastInGroup?: boolean;
}

// ─── ChatMessage ──────────────────────────────────────────────────────────
// A single transcript entry with baked-in entrance + layout motion. Pairs with
// InputMessage's onSend: render one per sent/received message. `layout="position"`
// lets earlier messages slide up smoothly when a new one is appended.
const ChatMessage = forwardRef<HTMLDivElement, ChatMessageProps>(
	(
		{
			from,
			files,
			thumbnailSize = 240,
			time,
			actions,
			children,
			isFirstInGroup = true,
			isLastInGroup = true,
			className,
			...props
		},
		ref,
	) => {
		const shape = useShape();
		const isUser = from === "user";
		// Timestamps are a user-message affordance; artist replies show actions only.
		const showTime = time != null;

		return (
			<motion.div
				ref={ref}
				layout="position"
				initial={{ opacity: 0, y: 8, scale: 0.96 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				transition={spring.moderate}
				style={{ transformOrigin: isUser ? "bottom right" : "bottom left" }}
				className={cn(
					"group flex max-w-[80%] flex-col gap-1.5",
					isUser ? "items-end self-end" : "items-start self-start",
					className,
				)}
				{...props}
			>
				{files && files.length > 0 && (
					<div
						className={cn(
							"flex flex-wrap gap-1.5",
							isUser ? "justify-end" : "justify-start",
						)}
					>
						{files.map((file, idx) => {
							const key =
								file instanceof File
									? `${file.name}-${file.size}-${file.lastModified}`
									: `${file}-${idx}`;

							return (
								<div key={key} className="relative group/thumbnail">
									<FileThumbnail
										file={file}
										size={thumbnailSize}
										className={cn(
											"rounded-2xl",
											isUser
												? cn(
														!isFirstInGroup && "rounded-tr-md",
														isLastInGroup && !children
															? "rounded-br-[4px]"
															: "rounded-br-md",
													)
												: cn(
														!isFirstInGroup && "rounded-tl-md",
														isLastInGroup && !children
															? "rounded-bl-[4px]"
															: "rounded-bl-md",
													),
										)}
									/>
									{/* Time overlay for attachment-only messages */}
									{!children && showTime && (
										<span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-full bg-black/40 text-white text-[10px] font-medium opacity-100 sm:opacity-0 sm:group-hover/thumbnail:opacity-100 transition-opacity z-10 pointer-events-none">
											<Calligraph>{time as string}</Calligraph>
										</span>
									)}
								</div>
							);
						})}
					</div>
				)}
				{children != null && children !== "" && (
					<div
						className={cn(
							"py-2 text-sm whitespace-pre-wrap wrap-break-word rounded-2xl px-3.5 text-pretty flex flex-wrap items-end gap-x-2 gap-y-0.5",
							isUser
								? cn(
										"bg-accent text-accent-foreground",
										!isFirstInGroup && "rounded-tr-md",
										isLastInGroup ? "rounded-br-[4px]" : "rounded-br-md",
									)
								: cn(
										"bg-primary/12 text-primary",
										!isFirstInGroup && "rounded-tl-md",
										isLastInGroup ? "rounded-bl-[4px]" : "rounded-bl-md",
									),
						)}
					>
						<span className="flex-1">{children}</span>
						{showTime && (
							<span
								className={cn(
									"text-[10px] shrink-0 font-medium translate-y-0.5",
									isUser ? "text-accent-foreground/70" : "text-primary/60",
								)}
							>
								{time}
							</span>
						)}
					</div>
				)}
				{actions != null && (
					// Meta row: icon-only actions. Always rendered (so it
					// reserves its height and the gap between bubbles never shifts) but
					// hidden until the message is hovered or an action is focused.
					<div
						className={cn(
							"flex items-center gap-2 px-1 text-[12px] leading-none text-muted-foreground select-none",
							"opacity-0 pointer-events-none transition-opacity duration-150",
							"group-hover:opacity-100 group-hover:pointer-events-auto",
							"group-focus-within:opacity-100 group-focus-within:pointer-events-auto",
						)}
					>
						<span className="flex items-center gap-0.5">{actions}</span>
					</div>
				)}
			</motion.div>
		);
	},
);

ChatMessage.displayName = "ChatMessage";

export type { ChatMessageProps };
export { ChatMessage };
export default ChatMessage;
