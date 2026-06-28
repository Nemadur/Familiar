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
	const [files, setFiles] = useState<File[]>([]);
	const sendMessage = usePostChatMessage(conversationId);

	const form = useForm<MessageComposerValues>({
		resolver: zodResolver(messageComposerSchema),
		defaultValues: {
			body: "",
		},
		mode: "onChange",
	});

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

		form.reset({
			body: "",
		});
		setFiles([]);

		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	});

	function addFiles(nextFiles: FileList | null) {
		if (!nextFiles || nextFiles.length === 0) {
			return;
		}

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
		<footer className="border-t p-4">
			<form onSubmit={submitMessage} className="flex w-full">
				<FieldGroup className="w-full">
					<Field data-invalid={Boolean(bodyError)}>
						<FieldLabel htmlFor="chat-message-body" className="sr-only">
							Message
						</FieldLabel>

						{files.length > 0 ? (
							<div className="mb-3 max-w-full overflow-x-auto pb-1">
								<AttachmentGroup
									className="w-max max-w-none"
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
						) : null}

						<InputGroup>
							<InputGroupAddon align="inline-start">
								<InputGroupButton
									type="button"
									variant="ghost"
									size="icon-sm"
									className="shrink-0 text-muted-foreground hover:text-foreground"
									disabled={isSubmitting}
									onClick={() => fileInputRef.current?.click()}
									aria-label="Attach media"
								>
									<Paperclip data-icon="inline-start" />
								</InputGroupButton>
							</InputGroupAddon>

							<input
								ref={fileInputRef}
								type="file"
								accept={ACCEPTED_MEDIA_TYPES.join(",")}
								multiple
								className="sr-only"
								onChange={(event) => addFiles(event.target.files)}
							/>

							<InputGroupTextArea
								id="chat-message-body"
								placeholder="Write a message or attach media..."
								rows={1}
								aria-invalid={Boolean(bodyError)}
								disabled={isSubmitting}
								className="max-h-32 min-h-[40px] text-sm"
								{...form.register("body")}
								onKeyDown={(event) => {
									if (event.key === "Enter" && !event.shiftKey) {
										event.preventDefault();
										void submitMessage();
									}
								}}
							/>

							<InputGroupAddon align="inline-end">
								<InputGroupButton
									type="submit"
									size="icon-sm"
									disabled={!canSubmit}
									className="shrink-0 bg-accent text-accent-foreground hover:bg-accent/90"
								>
									<OutlineSend data-icon="inline-start" />
								</InputGroupButton>
							</InputGroupAddon>
						</InputGroup>

						{bodyError ? (
							<FieldDescription>{bodyError}</FieldDescription>
						) : null}
						{sendMessage.error ? (
							<FieldDescription className="text-destructive">
								{sendMessage.error.message}
							</FieldDescription>
						) : null}
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
			className="w-64 shrink-0"
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

	if (file.type.startsWith("image/")) {
		return "Image";
	}

	if (file.type.startsWith("video/")) {
		return "Video";
	}

	return "File";
}

function formatFileSize(size: number) {
	if (size < 1024) {
		return `${size} B`;
	}

	if (size < 1024 * 1024) {
		return `${(size / 1024).toFixed(1)} KB`;
	}

	return `${(size / 1024 / 1024).toFixed(1)} MB`;
}
