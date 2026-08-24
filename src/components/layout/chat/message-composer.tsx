import { zodResolver } from "@hookform/resolvers/zod";
import {
	FileImageIcon,
	FileTextIcon,
	FilmIcon,
	Paperclip,
	XIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { OutlineSend } from "@/components/icons/assets/user_interface/send";
import {
	Attachment,
	AttachmentAction,
	AttachmentActions,
	AttachmentContent,
	AttachmentDescription,
	AttachmentGroup,
	AttachmentMedia,
	AttachmentTitle,
} from "@/components/ui/attachment";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupTextArea,
} from "@/components/ui/input-group";
import { usePostChatMessage } from "@/hooks/chat/use-chat";

import {
	type MessageComposerValues,
	messageComposerSchema,
} from "./message-composer.schema";

const EMPTY_MESSAGE_ERROR = "Write a message or attach media.";
const MAX_MEDIA_COUNT = 10;
const MIN_COMPOSER_HEIGHT = 36;
const MAX_COMPOSER_HEIGHT = 144;
const ACCEPTED_MEDIA_TYPES = [
	"image/jpeg",
	"image/png",
	"image/webp",
	"image/bmp",
	"image/tiff",
	"image/gif",
	"video/mp4",
	"video/webm",
	"video/quicktime",
	"video/x-msvideo",
	"video/x-matroska",
];

export function MessageComposer({
	conversationId,
}: {
	conversationId: string;
}) {
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);
	const [files, setFiles] = useState<File[]>([]);
	const sendMessage = usePostChatMessage(conversationId);

	const form = useForm<MessageComposerValues>({
		resolver: zodResolver(messageComposerSchema),
		defaultValues: {
			body: "",
		},
		mode: "onChange",
	});
	const bodyField = form.register("body");

	const bodyValue = form.watch("body");
	const bodyError = form.formState.errors.body?.message;
	const isSubmitting = sendMessage.isPending;
	const hasBody = bodyValue.trim().length > 0;
	const hasFiles = files.length > 0;
	const canSubmit = (hasBody || hasFiles) && !bodyError && !isSubmitting;

	useEffect(() => {
		if ((hasBody || hasFiles) && bodyError === EMPTY_MESSAGE_ERROR) {
			form.clearErrors("body");
		}
	}, [bodyError, form, hasBody, hasFiles]);

	const submitMessage = form.handleSubmit(async (values) => {
		const body = values.body.trim();

		if (!body && files.length === 0) {
			form.setError("body", {
				type: "manual",
				message: EMPTY_MESSAGE_ERROR,
			});
			return;
		}

		await sendMessage.mutateAsync({
			body,
			files,
		});

		form.reset({ body: "" });
		setFiles([]);
		resetTextareaHeight(textareaRef.current);

		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	});

	function addFiles(nextFiles: FileList | null) {
		if (!nextFiles?.length) return;

		const mediaFiles = Array.from(nextFiles).filter(isSupportedMediaFile);

		if (mediaFiles.length === 0) {
			form.setError("body", {
				type: "manual",
				message: "Only supported image, GIF, or video files can be attached.",
			});
			return;
		}

		setFiles((currentFiles) =>
			[...currentFiles, ...mediaFiles].slice(0, MAX_MEDIA_COUNT),
		);
	}

	function removeFile(index: number) {
		setFiles((currentFiles) =>
			currentFiles.filter((_, currentIndex) => currentIndex !== index),
		);
	}

	return (
		<footer className="shrink-0 border-t p-3">
			<form onSubmit={submitMessage} className="w-full">
				<FieldGroup className="gap-0">
					<Field
						data-invalid={Boolean(bodyError)}
						data-disabled={isSubmitting || undefined}
						className="gap-2"
					>
						<FieldLabel htmlFor="chat-message-body" className="sr-only">
							Message
						</FieldLabel>

						{files.length > 0 && (
							<div className="max-w-full overflow-x-auto pb-1">
								<AttachmentGroup
									className="w-max max-w-none gap-2"
									role="group"
									aria-label="Selected media"
								>
									{files.map((file, index) => (
										<SelectedMediaAttachment
											key={`${file.name}-${file.size}-${file.lastModified}`}
											file={file}
											isUploading={isSubmitting}
											onRemove={() => removeFile(index)}
										/>
									))}
								</AttachmentGroup>
							</div>
						)}

						<input
							ref={fileInputRef}
							type="file"
							accept={ACCEPTED_MEDIA_TYPES.join(",")}
							multiple
							className="sr-only"
							onChange={(event) => addFiles(event.target.files)}
						/>

						<InputGroup className="min-h-12 items-end gap-1 rounded-[26px] p-1.5">
							<InputGroupAddon
								align="inline-start"
								className="self-end py-0 pr-0 pl-2"
							>
								<InputGroupButton
									type="button"
									variant="ghost"
									size="icon-sm"
									className="size-9 rounded-full"
									disabled={isSubmitting}
									onClick={() => fileInputRef.current?.click()}
									aria-label="Attach media"
								>
									<Paperclip data-icon="inline-start" />
								</InputGroupButton>
							</InputGroupAddon>

							<InputGroupTextArea
								id="chat-message-body"
								placeholder="Write a message or attach media..."
								rows={1}
								aria-invalid={Boolean(bodyError)}
								disabled={isSubmitting}
								className="h-9 max-h-36 min-h-9 min-w-0 flex-1 resize-none overflow-y-hidden px-2 py-2 text-sm leading-5"
								name={bodyField.name}
								ref={(element) => {
									textareaRef.current = element;
									bodyField.ref(element);
								}}
								onBlur={bodyField.onBlur}
								onChange={(event) => {
									bodyField.onChange(event);
									resizeTextarea(event.currentTarget);
								}}
								onKeyDown={(event) => {
									if (event.key === "Enter" && !event.shiftKey) {
										event.preventDefault();
										void submitMessage();
									}
								}}
							/>

							<InputGroupAddon
								align="inline-end"
								className="self-end py-0 pr-2 pl-0"
							>
								<InputGroupButton
									type="submit"
									size="icon-sm"
									disabled={!canSubmit}
									className="size-9 rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
									aria-label="Send message"
								>
									<OutlineSend data-icon="inline-start" />
								</InputGroupButton>
							</InputGroupAddon>
						</InputGroup>

						{bodyError && (
							<FieldDescription className="px-1 text-destructive">
								{bodyError}
							</FieldDescription>
						)}

						{sendMessage.error && (
							<FieldDescription className="px-1 text-destructive">
								{sendMessage.error.message}
							</FieldDescription>
						)}
					</Field>
				</FieldGroup>
			</form>
		</footer>
	);
}

type SelectedMediaAttachmentProps = {
	file: File;
	isUploading: boolean;
	onRemove: () => void;
};

function SelectedMediaAttachment({
	file,
	isUploading,
	onRemove,
}: SelectedMediaAttachmentProps) {
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const isImage = file.type.startsWith("image/");
	const isVideo = file.type.startsWith("video/");
	const fileTypeLabel = getFileTypeLabel(file);

	useEffect(() => {
		const objectUrl = URL.createObjectURL(file);
		setPreviewUrl(objectUrl);

		return () => URL.revokeObjectURL(objectUrl);
	}, [file]);

	return (
		<Attachment
			state={isUploading ? "uploading" : "idle"}
			className="w-56 shrink-0 rounded-xl"
		>
			{previewUrl && (isImage || isVideo) ? (
				<AttachmentMedia variant="image">
					{isImage ? (
						<img src={previewUrl} alt="" className="size-full object-cover" />
					) : (
						<video src={previewUrl} muted className="size-full object-cover" />
					)}
				</AttachmentMedia>
			) : (
				<AttachmentMedia>
					{isVideo ? (
						<FilmIcon />
					) : isImage ? (
						<FileImageIcon />
					) : (
						<FileTextIcon />
					)}
				</AttachmentMedia>
			)}

			<AttachmentContent>
				<AttachmentTitle>{file.name}</AttachmentTitle>
				<AttachmentDescription>
					{fileTypeLabel} · {formatFileSize(file.size)}
				</AttachmentDescription>
			</AttachmentContent>

			<AttachmentActions>
				<AttachmentAction
					type="button"
					aria-label={`Remove ${file.name}`}
					disabled={isUploading}
					onClick={onRemove}
				>
					<XIcon />
				</AttachmentAction>
			</AttachmentActions>
		</Attachment>
	);
}

function isSupportedMediaFile(file: File) {
	return ACCEPTED_MEDIA_TYPES.includes(file.type);
}

function getFileTypeLabel(file: File) {
	const extension = file.name.split(".").pop()?.toUpperCase();

	if (extension && extension !== file.name.toUpperCase()) {
		return extension;
	}

	if (file.type.startsWith("image/")) return "Image";
	if (file.type.startsWith("video/")) return "Video";
	return "File";
}

function formatFileSize(size: number) {
	if (size < 1024) return `${size} B`;
	if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
	return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function resizeTextarea(textarea: HTMLTextAreaElement) {
	textarea.style.height = "auto";

	const nextHeight = Math.min(
		Math.max(textarea.scrollHeight, MIN_COMPOSER_HEIGHT),
		MAX_COMPOSER_HEIGHT,
	);

	textarea.style.height = `${nextHeight}px`;
	textarea.style.overflowY =
		textarea.scrollHeight > MAX_COMPOSER_HEIGHT ? "auto" : "hidden";
}

function resetTextareaHeight(textarea: HTMLTextAreaElement | null) {
	if (!textarea) return;

	textarea.style.height = `${MIN_COMPOSER_HEIGHT}px`;
	textarea.style.overflowY = "hidden";
}