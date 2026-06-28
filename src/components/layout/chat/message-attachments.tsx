import { FileTextIcon } from "lucide-react";
import { type SyntheticEvent, useState } from "react";
import type { TChatMessageAttachment } from "@/api/chat/chat-types";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Message, MessageContent } from "@/components/ui/message";
import { cn } from "@/lib/utils";

type MessageAttachmentBubbleProps = {
	attachment: TChatMessageAttachment;
	index: number;
	align?: "start" | "end";
	time: string;
	isFirstInGroup: boolean;
	isLastInGroup: boolean;
};

export function MessageAttachmentBubble({
	attachment,
	index,
	align = "start",
	time,
	isFirstInGroup,
	isLastInGroup,
}: MessageAttachmentBubbleProps) {
	const isMine = align === "end";
	const title = getAttachmentTitle(attachment, index);
	const imageUrl = getAttachmentImageUrl(attachment);
	const href = attachment.fullSizeUrl || imageUrl;

	return (
		<Message
			align={align}
			className={cn(!isFirstInGroup && "pt-0.5", !isLastInGroup && "pb-0")}
		>
			<MessageContent
				className={cn(
					// Keep media constrained by the same chat bubble width rule.
					// The image itself then only fits inside this max width instead of
					// creating its own oversized square/cropped layout.
					"w-fit max-w-[80%]",
					isMine && "items-end",
				)}
			>
				{imageUrl ? (
					<ImageAttachmentBubble
						align={align}
						href={href}
						title={title}
						imageUrl={imageUrl}
						time={time}
					/>
				) : (
					<Bubble align={align} variant={isMine ? "default" : "secondary"}>
						<BubbleContent className="flex min-w-64 items-center gap-3 p-3">
							<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background/60 text-muted-foreground ring-1 ring-border">
								<FileTextIcon className="size-5" />
							</div>

							<div className="min-w-0 flex-1">
								<a
									href={href}
									target="_blank"
									rel="noreferrer"
									className="block truncate text-sm font-medium underline-offset-4 hover:underline"
								>
									{title}
								</a>
								<p className="text-xs text-muted-foreground">File attachment</p>
							</div>

							<span className="self-end text-[11px] text-muted-foreground">
								{time}
							</span>
						</BubbleContent>
					</Bubble>
				)}
			</MessageContent>
		</Message>
	);
}

type ImageAttachmentBubbleProps = {
	align: "start" | "end";
	href: string;
	title: string;
	imageUrl: string;
	time: string;
};

function ImageAttachmentBubble({
	align,
	href,
	title,
	imageUrl,
	time,
}: ImageAttachmentBubbleProps) {
	const [isLoaded, setIsLoaded] = useState(false);
	const isMine = align === "end";

	function handleLoad(event: SyntheticEvent<HTMLImageElement>) {
		const image = event.currentTarget;

		if (image.naturalWidth > 0 && image.naturalHeight > 0) {
			image.style.aspectRatio = `${image.naturalWidth} / ${image.naturalHeight}`;
		}

		setIsLoaded(true);
	}

	return (
		<Bubble
			align={align}
			variant={isMine ? "default" : "secondary"}
			className="w-fit max-w-full overflow-hidden p-0"
		>
			<BubbleContent className="p-0">
				<a
					href={href}
					target="_blank"
					rel="noreferrer"
					className="group/image relative block w-fit max-w-full overflow-hidden rounded-[inherit] outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
					aria-label={`Open ${title}`}
				>
					<img
						src={imageUrl}
						alt=""
						loading="lazy"
						onLoad={handleLoad}
						className={cn(
							// Fit the image into the bubble width instead of forcing a square/crop.
							"block h-auto w-auto max-h-[min(28rem,70vh)] max-w-full object-contain transition-opacity",
							!isLoaded && "opacity-0",
						)}
					/>

					<span className="absolute right-2 bottom-2 rounded-full bg-primary/20 px-2 py-0.5 text-[11px] text-primary-foreground opacity-100 backdrop-blur transition-opacity lg:opacity-0 lg:group-hover/image:opacity-100 lg:group-focus-visible/image:opacity-100">
						{time}
					</span>
				</a>
			</BubbleContent>
		</Bubble>
	);
}

function getAttachmentTitle(attachment: TChatMessageAttachment, index: number) {
	const position = Number.isFinite(attachment.position)
		? attachment.position + 1
		: index + 1;

	return `Attachment ${position}`;
}

function getAttachmentImageUrl(attachment: TChatMessageAttachment) {
	const fullSizeUrl = attachment.fullSizeUrl ?? "";

	if (isImageUrl(fullSizeUrl)) {
		return fullSizeUrl;
	}

	const thumbnailUrl = attachment.thumbnailUrl ?? "";

	if (isImageUrl(thumbnailUrl)) {
		return thumbnailUrl;
	}

	return "";
}

function isImageUrl(url: string) {
	const cleanUrl = url.split("?")[0] ?? "";

	return /\.(avif|bmp|gif|jpe?g|png|svg|webp)$/i.test(cleanUrl);
}
