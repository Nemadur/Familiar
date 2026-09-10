import { ScrollShadow, Typography } from "@heroui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Upload, X } from "lucide-react";
import { type FormEvent, useEffect, useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { getCommissionCategories } from "@/api/commisions/categories";
import { getTags } from "@/api/commisions/index";
import type { CatalogResponse } from "@/api/portfolio/catalogs/catalog-types";
import type {
	CreatePortfolioPostRequest,
	PortfolioPostResponse,
} from "@/api/portfolio/posts/post-types";
import { OutlineClose, OutlinePlus } from "@/components/icons/icons";
import { UniversalModalLayout } from "@/components/layout/modal/universal-modal-layout";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import {
	InputGroup,
	InputGroupInput,
	InputGroupTextArea,
} from "@/components/ui/input-group";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { useUploadPortfolioPostMedia } from "@/hooks/portfolio/use-portfolio";
import { cn } from "@/lib/utils";

function MultiSelectPopover({
	title,
	options,
	selected,
	onChange,
	placeholder,
	emptyText,
	chipClassName,
}: {
	title: string;
	options: { label: string; value: string }[];
	selected: string[];
	onChange: (values: string[]) => void;
	placeholder: string;
	emptyText: string;
	chipClassName?: string;
}) {
	const [open, setOpen] = useState(false);

	const toggleOption = (value: string) => {
		const newSelected = selected.includes(value)
			? selected.filter((v) => v !== value)
			: [...selected, value];
		onChange(newSelected);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					type="button"
					role="combobox"
					aria-expanded={open}
					className="border-input data-placeholder:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50 flex min-h-12 w-full items-center justify-between gap-2 rounded-full border bg-transparent px-3 py-2 text-sm text-primary transition-[color] outline-none hover:bg-transparent focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
				>
					<div className="flex min-w-0 flex-wrap items-center gap-1.5">
						{selected.length > 0 ? (
							selected.map((val) => {
								const label =
									options.find((opt) => opt.value === val)?.label || val;
								return (
									<Badge
										key={val}
										variant="secondary"
										className={cn(chipClassName)}
										onClick={(e) => {
											e.stopPropagation();
											toggleOption(val);
										}}
									>
										{label}
										<OutlineClose className="size-3 hover:text-foreground/80 cursor-pointer" />
									</Badge>
								);
							})
						) : (
							<span className="text-muted-foreground">{placeholder}</span>
						)}
					</div>
					<ChevronDown className="size-4 shrink-0 opacity-50" />
				</button>
			</PopoverTrigger>
			<PopoverContent
				className="w-(--radix-popover-trigger-width) p-0"
				align="start"
			>
				<Command>
					<CommandInput placeholder={`Search ${title.toLowerCase()}...`} />
					<CommandEmpty>{emptyText}</CommandEmpty>
					<CommandList>
						<CommandGroup>
							{options.map((option) => {
								const isSelected = selected.includes(option.value);
								return (
									<CommandItem
										key={option.value}
										value={option.value}
										onSelect={() => toggleOption(option.value)}
										className="cursor-pointer flex items-center gap-2 group"
									>
										<Checkbox
											checked={isSelected}
											className={cn(
												"opacity-0 border-primary/12 transition-opacity",
												isSelected && "opacity-100",
												"group-hover:opacity-100",
											)}
										/>
										<span>{option.label}</span>
									</CommandItem>
								);
							})}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}

interface CreatePostModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCreatePost: (
		data: CreatePortfolioPostRequest,
	) => Promise<PortfolioPostResponse | undefined>;
	isCreating: boolean;
	catalogs: CatalogResponse[];
}

export function CreatePostModal({
	open,
	onOpenChange,
	onCreatePost,
	isCreating,
	catalogs,
}: CreatePostModalProps) {
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const titleDescriptionId = useId();
	const submitErrorId = useId();

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [selectedContentWarnings, setSelectedContentWarnings] = useState<
		string[]
	>([]);
	const [selectedCatalogs, setSelectedCatalogs] = useState<string[]>([]);

	const [imageFiles, setImageFiles] = useState<File[]>([]);
	const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

	const [submitted, setSubmitted] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);

	const trimmedTitle = title.trim();
	const titleInvalid = submitted && trimmedTitle.length === 0;

	// Fetch tags from API
	const { data: allTags = [] } = useQuery({
		queryKey: ["tags"],
		queryFn: () => getTags(true),
	});

	// Fetch categories from API
	const { data: allCategories = [] } = useQuery({
		queryKey: ["commission-categories"],
		queryFn: () => getCommissionCategories(),
	});

	const availableCWs = allTags.filter((tag) => tag.hasContentWarning);

	useEffect(() => {
		if (!open) {
			setTitle("");
			setDescription("");
			setVisibility("PUBLIC");
			setSelectedTags([]);
			setSelectedContentWarnings([]);
			setSelectedCatalogs([]);
			setImageFiles([]);
			setImagePreviewUrls([]);
			setSubmitted(false);
			setSubmitError(null);
		}
	}, [open]);

	useEffect(() => {
		return () => {
			imagePreviewUrls.forEach((url) => {
				URL.revokeObjectURL(url);
			});
		};
	}, [imagePreviewUrls]);

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			const newFiles = Array.from(e.target.files);
			const newUrls = newFiles.map((file) => URL.createObjectURL(file));
			setImageFiles((prev) => [...prev, ...newFiles]);
			setImagePreviewUrls((prev) => [...prev, ...newUrls]);
		}
	};

	const removeImage = (indexToRemove: number) => {
		setImageFiles((prev) => {
			const updated = [...prev];
			updated.splice(indexToRemove, 1);
			return updated;
		});
		setImagePreviewUrls((prev) => {
			const updated = [...prev];
			URL.revokeObjectURL(updated[indexToRemove]);
			updated.splice(indexToRemove, 1);
			return updated;
		});
	};

	const uploadMediaMutation = useUploadPortfolioPostMedia();

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setSubmitted(true);
		setIsSubmitting(true);
		setSubmitError(null);

		if (!trimmedTitle) {
			setIsSubmitting(false);
			return;
		}

		try {
			const createdPost = await onCreatePost({
				title: trimmedTitle,
				description: description.trim() || undefined,
				visibility,
				tags: selectedTags, // using category ids or tag ids, the API expects strings. If they are strings like "fantasy", we map to their names. Let's use their names as tags
				contentWarnings: selectedContentWarnings,
				catalogIds: selectedCatalogs,
			});

			const postId = createdPost?.id;

			if (postId && imageFiles.length > 0) {
				// Upload all selected images
				await Promise.all(
					imageFiles.map((file) =>
						uploadMediaMutation.mutateAsync({ postId, file }),
					),
				);

				// Invalidate portfolio so the newly uploaded images appear in the grid
				await queryClient.invalidateQueries({ queryKey: ["portfolio"] });
				await queryClient.invalidateQueries({ queryKey: ["profile-content"] });
			}

			toast.success(
				t(
					"components.portfolio.post.create.success",
					"Post created successfully!",
				),
			);
			onOpenChange(false);
		} catch (error) {
			setSubmitError(
				error instanceof Error
					? error.message
					: "The post could not be created.",
			);
			toast.error(
				t("components.portfolio.post.create.error", "Failed to create post."),
			);
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<UniversalModalLayout
			open={open}
			onOpenChange={onOpenChange}
			title={t("components.portfolio.post.create.title", "New Post")}
			mediaClassName="min-h-0 bg-surface-1 lg:overflow-hidden"
			mediaContent={
				<div className="flex size-full min-h-0 flex-col gap-4 p-6">
					<div className="flex shrink-0 items-center justify-between gap-3">
						<Typography.Heading level={4}>
							{t("components.portfolio.post.create.media.title", "IMAGES")}
						</Typography.Heading>
						<label
							className={cn(
								buttonVariants({ variant: "secondary", size: "xl" }),
								"cursor-pointer",
							)}
						>
							<OutlinePlus />
							{t("components.portfolio.post.create.media.upload", "Add images")}
							<input
								type="file"
								className="hidden"
								accept="image/*"
								multiple
								onChange={handleImageChange}
							/>
						</label>
					</div>

					<div className="min-h-0 flex-1">
						<ScrollShadow className="flex size-full flex-col" size={32}>
							{imagePreviewUrls.length === 0 ? (
								<label className="flex size-full min-h-64 cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-muted-foreground/25 bg-background px-6 text-center text-muted-foreground transition-colors hover:bg-surface-2">
									<Upload className="size-8 opacity-50" />
									<p className="text-sm font-medium">
										{t(
											"components.portfolio.post.create.media.upload",
											"Click to upload image",
										)}
									</p>
									<input
										type="file"
										className="hidden"
										accept="image/*"
										multiple
										onChange={handleImageChange}
									/>
								</label>
							) : (
								<div className="grid w-full grid-cols-2 gap-4 xl:grid-cols-3">
									{imagePreviewUrls.map((url, idx) => (
										<div
											key={url}
											className="group relative aspect-square overflow-hidden rounded-2xl bg-surface-2"
										>
											<img
												src={url}
												alt={`Preview ${idx + 1}`}
												className="size-full object-cover"
											/>
											<button
												type="button"
												onClick={() => removeImage(idx)}
												aria-label={t(
													"components.portfolio.post.create.media.remove",
													"Remove image",
												)}
												className="absolute top-3 right-3 rounded-full bg-background/85 p-2 text-foreground opacity-100 backdrop-blur-sm transition-colors hover:bg-destructive hover:text-destructive-foreground lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100"
											>
												<X className="size-4" />
											</button>
										</div>
									))}
								</div>
							)}
						</ScrollShadow>
					</div>
				</div>
			}
			detailsContent={
				<form className="flex h-full min-h-0 flex-col" onSubmit={handleSubmit}>
					<div className="min-h-0 flex-1">
						<ScrollShadow className="h-full p-6" size={32}>
							<div className="flex flex-col gap-6">
								<FieldGroup>
									<Field data-invalid={titleInvalid || undefined}>
										<FieldLabel htmlFor="post-title">
											{t(
												"components.portfolio.post.create.fields.title",
												"TITLE *",
											)}
										</FieldLabel>

										<InputGroup
											className="h-12"
											data-invalid={titleInvalid || undefined}
										>
											<InputGroupInput
												id="post-title"
												value={title}
												maxLength={100}
												required
												autoFocus
												aria-invalid={titleInvalid || undefined}
												aria-describedby={titleDescriptionId}
												placeholder={t(
													"components.portfolio.post.create.placeholders.title",
													"e.g. Character portrait",
												)}
												onChange={(event) => setTitle(event.target.value)}
											/>
										</InputGroup>

										<FieldDescription id={titleDescriptionId}>
											{titleInvalid
												? t(
														"components.portfolio.post.create.errors.title_required",
														"Title is required.",
													)
												: t(
														"components.portfolio.post.create.hints.title_length",
														"Maximum 100 characters.",
													)}
										</FieldDescription>
									</Field>

									<Field>
										<FieldLabel htmlFor="post-description">
											{t(
												"components.portfolio.post.create.fields.description",
												"DESCRIPTION",
											)}
										</FieldLabel>

										<InputGroup className="rounded-xl">
											<InputGroupTextArea
												id="post-description"
												value={description}
												rows={5}
												placeholder={t(
													"components.portfolio.post.create.placeholders.description",
													"Optional description...",
												)}
												onChange={(event) => setDescription(event.target.value)}
											/>
										</InputGroup>
									</Field>

									<Field>
										<FieldLabel htmlFor="post-visibility">
											{t(
												"components.portfolio.post.create.fields.visibility",
												"VISIBILITY",
											)}
										</FieldLabel>
										<Select
											value={visibility}
											onValueChange={(value: "PUBLIC" | "PRIVATE") =>
												setVisibility(value)
											}
										>
											<SelectTrigger
												id="post-visibility"
												size="xl"
												className="w-full"
											>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="PUBLIC">
													{t(
														"components.portfolio.post.create.visibility.public",
														"Public",
													)}
												</SelectItem>
												<SelectItem value="PRIVATE">
													{t(
														"components.portfolio.post.create.visibility.private",
														"Private",
													)}
												</SelectItem>
											</SelectContent>
										</Select>
									</Field>

									<Field>
										<FieldLabel>
											{t(
												"components.portfolio.post.create.fields.categories",
												"CATEGORIES (TAGS)",
											)}
										</FieldLabel>
										<MultiSelectPopover
											title="Categories"
											options={allCategories.map((c) => ({
												label: c.name,
												value: c.name,
											}))}
											selected={selectedTags}
											onChange={setSelectedTags}
											placeholder="Select categories..."
											emptyText="No categories found."
										/>
										<FieldDescription>
											{t(
												"components.portfolio.post.create.hints.categories",
												"Select from available categories.",
											)}
										</FieldDescription>
									</Field>

									<Field>
										<FieldLabel>
											{t(
												"components.portfolio.post.create.fields.cws",
												"CONTENT WARNINGS",
											)}
										</FieldLabel>
										<MultiSelectPopover
											title="Warnings"
											options={availableCWs.map((cw) => ({
												label: cw.name,
												value: cw.name,
											}))}
											selected={selectedContentWarnings}
											onChange={setSelectedContentWarnings}
											placeholder="Select warnings..."
											emptyText="No warnings found."
											chipClassName="bg-destructive/10 text-destructive hover:bg-destructive/20"
										/>
										<FieldDescription>
											{t(
												"components.portfolio.post.create.hints.cws",
												"Select applicable content warnings.",
											)}
										</FieldDescription>
									</Field>

									<Field>
										<FieldLabel>
											{t(
												"components.portfolio.post.create.fields.catalogs",
												"ADD TO CATALOGS",
											)}
										</FieldLabel>
										<MultiSelectPopover
											title="Catalogs"
											options={catalogs.map((c) => ({
												label: c.name,
												value: c.id,
											}))}
											selected={selectedCatalogs}
											onChange={setSelectedCatalogs}
											placeholder="Select catalogs..."
											emptyText="No catalogs found."
										/>
									</Field>
								</FieldGroup>

								{submitError && (
									<p
										id={submitErrorId}
										role="alert"
										className="text-sm text-destructive"
									>
										{submitError}
									</p>
								)}
							</div>
						</ScrollShadow>
					</div>

					<Separator />

					<div className="flex justify-end gap-2 p-4">
						<Button
							type="button"
							size={"xl"}
							variant="outline"
							disabled={isCreating}
							onClick={() => onOpenChange(false)}
						>
							{t("components.portfolio.post.create.actions.cancel", "Cancel")}
						</Button>

						<Button
							type="submit"
							size={"xl"}
							disabled={isSubmitting || !trimmedTitle}
							aria-describedby={submitError ? submitErrorId : undefined}
						>
							{isSubmitting ? (
								<Spinner data-icon="inline-start" />
							) : (
								<OutlinePlus data-icon="inline-start" aria-hidden="true" />
							)}

							{isSubmitting
								? t(
										"components.portfolio.post.create.actions.creating",
										"Creating...",
									)
								: t(
										"components.portfolio.post.create.actions.create",
										"Create",
									)}
						</Button>
					</div>
				</form>
			}
		/>
	);
}
