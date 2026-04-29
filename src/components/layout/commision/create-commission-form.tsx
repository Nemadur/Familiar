import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
	AlertCircle,
	Check,
	CheckCircle2,
	ClipboardList,
	ExternalLink,
	FileImage,
	Loader2,
	MessageCircle,
	Send,
	Type,
} from "lucide-react";
import {
	type ChangeEvent,
	type ComponentType,
	type DragEvent,
	type ReactNode,
	useMemo,
	useState,
} from "react";
import { toast } from "sonner";
import CurrencySelect from "@/components/layout/select/currency";
import { OutlineClose } from "@/components/icons/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupNumberInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
} from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import {
	useCommissionCategories,
	useCreateCommission,
	usePublishCommission,
	useTags,
	useUploadCommissionMedia,
} from "@/hooks/use-commisions";
import {
	useAssignFormTemplate,
	useFormTemplates,
} from "@/hooks/use-form-templates";
import { cn } from "@/lib/utils";
import {
	commissionMediaFileSchema,
	createCommissionFormSchema,
	createCommissionRequestSchema,
	toCreateCommissionRequest,
} from "@/schemas/commissions";
import type {
	TCommissionCategoryResponse,
	TCommissionResponse,
	TTagResponse,
} from "@/types/commissions";
import { TCommissionStatus } from "@/types/commissions";

type UploadStatus = "pending" | "uploading" | "done" | "error";
type EditorTab = "details" | "media" | "request-form" | "publish";

interface UploadQueueItem {
	id: string;
	file: File;
	progress: number;
	status: UploadStatus;
	error?: string;
}

interface CreateCommissionFormProps {
	username: string;
	tab: string;
	artistId: string;
	onClose: () => void;
}

interface FlatCategory {
	id: string;
	label: string;
	depth: number;
}

function flattenCategories(categories: TCommissionCategoryResponse[]) {
	const seen = new Set<string>();
	const rows: FlatCategory[] = [];

	const walk = (items: TCommissionCategoryResponse[], depth = 0) => {
		for (const item of items) {
			if (seen.has(item.id)) continue;

			seen.add(item.id);
			rows.push({
				id: item.id,
				label: `${depth > 0 ? `${"— ".repeat(depth)}` : ""}${item.name}`,
				depth,
			});

			if (item.subcategories?.length) walk(item.subcategories, depth + 1);
		}
	};

	const roots = categories.filter((category) => !category.parentId);
	walk(roots.length > 0 ? roots : categories);

	return rows;
}

const toUploadId = () =>
	typeof crypto !== "undefined" && "randomUUID" in crypto
		? crypto.randomUUID()
		: `upload-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const fileKey = (file: File) =>
	`${file.name}-${file.size}-${file.lastModified}`;

const formatBytes = (bytes: number) => {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

const navItems = [
	{ key: "details", name: "Details", icon: ClipboardList },
	{ key: "media", name: "Media", icon: FileImage },
	{ key: "request-form", name: "Request Form", icon: MessageCircle },
	{ key: "publish", name: "Publish", icon: Send },
] as const satisfies ReadonlyArray<{
	key: EditorTab;
	name: string;
	icon: ComponentType<{ className?: string }>;
}>;

function FlatSection({
	title,
	description,
	children,
}: {
	title: string;
	description?: string;
	children: ReactNode;
}) {
	return (
		<section className="flex flex-col gap-5">
			<div className="flex flex-col gap-1">
				<h3 className="text-sm font-semibold text-foreground">{title}</h3>
				{description && (
					<p className="text-sm text-muted-foreground">{description}</p>
				)}
			</div>
			<div>{children}</div>
		</section>
	);
}

function FieldGroup({
	label,
	htmlFor,
	hint,
	error,
	children,
}: {
	label: string;
	htmlFor?: string;
	hint?: string;
	error?: string;
	children: ReactNode;
}) {
	return (
		<div
			className="flex flex-col gap-2.5"
			data-invalid={Boolean(error) || undefined}
		>
			<div className="flex items-center justify-between gap-3">
				<Label htmlFor={htmlFor} className="text-sm font-medium">
					{label}
				</Label>
				{hint && <span className="text-xs text-muted-foreground">{hint}</span>}
			</div>
			{children}
			{error && <p className="text-xs text-destructive">{error}</p>}
		</div>
	);
}

function StatusPill({ status }: { status: TCommissionStatus }) {
	return (
		<Badge
			size="sm"
			variant={status === TCommissionStatus.Active ? "default" : "secondary"}
		>
			{status}
		</Badge>
	);
}

function SidebarInfoRow({ label, value }: { label: string; value: ReactNode }) {
	return (
		<div className="flex items-center justify-between gap-3 text-sm">
			<span className="text-muted-foreground">{label}</span>
			<span className="font-medium text-foreground">{value}</span>
		</div>
	);
}

function FileRow({
	item,
	onRemove,
	disabled,
}: {
	item: UploadQueueItem;
	onRemove: (id: string) => void;
	disabled: boolean;
}) {
	return (
		<div className="flex items-start gap-3 rounded-xl border border-border px-3 py-3">
			<div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
				<FileImage className="size-4 text-muted-foreground" />
			</div>

			<div className="flex min-w-0 flex-1 flex-col gap-1.5">
				<div className="flex items-start justify-between gap-3">
					<div className="min-w-0">
						<p className="truncate text-sm font-medium">{item.file.name}</p>
						<p className="text-xs text-muted-foreground">
							{formatBytes(item.file.size)}
						</p>
					</div>

					<div className="flex shrink-0 items-center gap-1">
						{item.status === "done" && <CheckCircle2 className="size-4" />}
						{item.status === "error" && (
							<AlertCircle className="size-4 text-destructive" />
						)}
						{item.status === "uploading" && (
							<Loader2 className="size-4 animate-spin text-muted-foreground" />
						)}

						<Button
							type="button"
							variant="ghost"
							size="icon"
							onClick={() => onRemove(item.id)}
							disabled={disabled}
						>
							<OutlineClose />
						</Button>
					</div>
				</div>

				{item.status !== "pending" && (
					<Progress value={item.progress} className="h-1.5 rounded-full" />
				)}
				{item.error && <p className="text-xs text-destructive">{item.error}</p>}
			</div>
		</div>
	);
}

function TagToggleButton({
	tag,
	selected,
	onToggle,
	disabled,
}: {
	tag: TTagResponse;
	selected: boolean;
	onToggle: (tagId: string) => void;
	disabled: boolean;
}) {
	const isWarning = tag.hasContentWarning || tag.isAdultOnly;

	return (
		<Button
			type="button"
			variant={isWarning ? "destructive" : selected ? "default" : "outline"}
			size="sm"
			aria-pressed={selected}
			onClick={() => onToggle(tag.id)}
			disabled={disabled}
			className={cn(
				"rounded-full",
				isWarning &&
					!selected &&
					"bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive",
				isWarning &&
					selected &&
					"bg-destructive text-(--color-red-50) hover:bg-destructive/90",
			)}
		>
			{tag.name}
		</Button>
	);
}

export function CreateCommissionForm({
	username,
	tab,
	artistId,
	onClose,
}: CreateCommissionFormProps) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const { data: formTemplates, isPending: isFormTemplatesPending } =
		useFormTemplates();
	const assignTemplateMutation = useAssignFormTemplate();
	const createCommissionMutation = useCreateCommission();
	const publishCommissionMutation = usePublishCommission();
	const uploadMediaMutation = useUploadCommissionMedia();

	const {
		data: categories,
		isPending: isCategoriesPending,
		error: categoriesError,
	} = useCommissionCategories();

	const { data: tags, isPending: isTagsPending } = useTags(false);

	const [activeTab, setActiveTab] = useState<EditorTab>("details");
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [categoryId, setCategoryId] = useState("");
	const [basePrice, setBasePrice] = useState(50);
	const [currencyCode, setCurrencyCode] = useState("USD");
	const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
	const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
		null,
	);
	const [uploads, setUploads] = useState<UploadQueueItem[]>([]);
	const [createdCommission, setCreatedCommission] =
		useState<TCommissionResponse | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const [hasTriedSubmit, setHasTriedSubmit] = useState(false);

	const normalizedTags = useMemo(() => (tags ?? []) as TTagResponse[], [tags]);

	const flatCategories = useMemo(
		() => flattenCategories(categories ?? []),
		[categories],
	);
	const selectedCategory = useMemo(
		() => flatCategories.find((category) => category.id === categoryId),
		[categoryId, flatCategories],
	);

	const selectedTags = useMemo(
		() => normalizedTags.filter((tag) => selectedTagIds.includes(tag.id)),
		[normalizedTags, selectedTagIds],
	);

	const regularTags = useMemo(
		() =>
			normalizedTags.filter(
				(tag) => !tag.hasContentWarning && !tag.isAdultOnly,
			),
		[normalizedTags],
	);

	const contentWarningTags = useMemo(
		() =>
			normalizedTags.filter((tag) => tag.hasContentWarning || tag.isAdultOnly),
		[normalizedTags],
	);

	const selectedContentWarningCount = useMemo(
		() =>
			contentWarningTags.filter((tag) => selectedTagIds.includes(tag.id))
				.length,
		[contentWarningTags, selectedTagIds],
	);

	const doneCount = useMemo(
		() => uploads.filter((item) => item.status === "done").length,
		[uploads],
	);

	const totalProgress = useMemo(() => {
		if (uploads.length === 0) return 0;
		const sum = uploads.reduce((acc, item) => acc + item.progress, 0);
		return Math.round(sum / uploads.length);
	}, [uploads]);

	const isBusy =
		createCommissionMutation.isPending ||
		publishCommissionMutation.isPending ||
		uploadMediaMutation.isPending ||
		assignTemplateMutation.isPending ||
		isUploading;
	const hasCreated = Boolean(createdCommission?.id);

	const priceNumber = Number(basePrice);
	const normalizedCurrency = currencyCode.trim().toUpperCase();
	const mediaFiles = useMemo(() => uploads.map((item) => item.file), [uploads]);

	const createRequestInput = useMemo(
		() => ({
			title,
			description,
			categoryId,
			basePrice,
			currencyCode: normalizedCurrency,
			tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
			commissionStatus: TCommissionStatus.Draft,
		}),
		[
			title,
			description,
			categoryId,
			basePrice,
			normalizedCurrency,
			selectedTagIds,
		],
	);

	const formInput = useMemo(
		() => ({
			title,
			description,
			categoryId,
			basePrice,
			currencyCode: normalizedCurrency,
			tagIds: selectedTagIds,
			templateId: selectedTemplateId ?? undefined,
			mediaFiles,
		}),
		[
			title,
			description,
			categoryId,
			basePrice,
			normalizedCurrency,
			selectedTagIds,
			selectedTemplateId,
			mediaFiles,
		],
	);

	const createRequestValidation = useMemo(
		() => createCommissionRequestSchema.safeParse(createRequestInput),
		[createRequestInput],
	);

	const formValidation = useMemo(
		() => createCommissionFormSchema.safeParse(formInput),
		[formInput],
	);

	const requestFieldErrors = useMemo(
		() =>
			createRequestValidation.success
				? {}
				: createRequestValidation.error.flatten().fieldErrors,
		[createRequestValidation],
	);

	const formFieldErrors = useMemo(
		() =>
			formValidation.success ? {} : formValidation.error.flatten().fieldErrors,
		[formValidation],
	);

	const detailsReady = createRequestValidation.success;
	const requestFormReady = Boolean(selectedTemplateId);
	const hasInvalidUploads = uploads.some((item) => item.status === "error");
	const canSubmit = !isBusy && !hasCreated;

	const titleError = hasTriedSubmit ? requestFieldErrors.title?.[0] : undefined;
	const categoryError = hasTriedSubmit
		? requestFieldErrors.categoryId?.[0]
		: undefined;
	const priceError = hasTriedSubmit
		? requestFieldErrors.basePrice?.[0]
		: undefined;
	const currencyError = hasTriedSubmit
		? requestFieldErrors.currencyCode?.[0]
		: undefined;
	const descriptionError = hasTriedSubmit
		? requestFieldErrors.description?.[0]
		: undefined;
	const mediaError = hasTriedSubmit
		? formFieldErrors.mediaFiles?.[0]
		: undefined;

	const updateUploads = (ids: string[], next: Partial<UploadQueueItem>) => {
		setUploads((prev) =>
			prev.map((item) => (ids.includes(item.id) ? { ...item, ...next } : item)),
		);
	};

	const removeUpload = (id: string) => {
		if (isUploading) return;
		setUploads((prev) => prev.filter((item) => item.id !== id));
	};

	const addFiles = (files: File[]) => {
		if (files.length === 0) return;

		setUploads((prev) => {
			const existing = new Set(prev.map((item) => fileKey(item.file)));
			const next: UploadQueueItem[] = [];

			for (const file of files) {
				const key = fileKey(file);
				if (existing.has(key)) continue;
				existing.add(key);

				const validation = commissionMediaFileSchema.safeParse(file);

				next.push({
					id: toUploadId(),
					file,
					progress: validation.success ? 0 : 100,
					status: validation.success ? "pending" : "error",
					error: validation.success
						? undefined
						: validation.error.issues[0]?.message || "Unsupported file.",
				});
			}

			return [...prev, ...next];
		});
	};

	const toggleTag = (tagId: string) => {
		setSelectedTagIds((prev) => {
			if (prev.includes(tagId)) return prev.filter((id) => id !== tagId);
			if (prev.length >= 20) {
				toast.error("You can select up to 20 tags.");
				return prev;
			}
			return [...prev, tagId];
		});
	};

	const uploadQueuedMedia = async (
		commissionId: string,
		items: UploadQueueItem[],
	) => {
		if (items.length === 0) return;

		const ids = items.map((item) => item.id);
		setIsUploading(true);
		updateUploads(ids, {
			status: "uploading",
			progress: 25,
			error: undefined,
		});

		try {
			updateUploads(ids, { progress: 60 });
			await uploadMediaMutation.mutateAsync({
				commissionId,
				files: items.map((item) => item.file),
			});
			updateUploads(ids, { status: "done", progress: 100 });
		} catch (error) {
			const message = error instanceof Error ? error.message : "Upload failed";
			updateUploads(ids, { status: "error", progress: 100, error: message });
			throw error;
		} finally {
			setIsUploading(false);
		}
	};

	const handlePublish = async () => {
		setHasTriedSubmit(true);

		const parsedForm = createCommissionFormSchema.safeParse(formInput);

		if (!parsedForm.success) {
			const flattenedErrors = parsedForm.error.flatten().fieldErrors;
			const firstError = Object.values(flattenedErrors).flat()[0];

			toast.error(firstError || "Fill the required commission fields first.");

			if (flattenedErrors.mediaFiles?.length) {
				setActiveTab("media");
			} else {
				setActiveTab("details");
			}

			return;
		}

		if (hasInvalidUploads) {
			toast.error("Remove invalid media files before publishing.");
			setActiveTab("media");
			return;
		}

		if (!detailsReady) {
			toast.error("Fill the required commission fields first.");
			setActiveTab("details");
			return;
		}

		if (!canSubmit) return;

		try {
			const queuedFilesSnapshot = [...uploads];
			const createRequest = toCreateCommissionRequest(parsedForm.data);

			const created = await createCommissionMutation.mutateAsync(createRequest);
			setCreatedCommission(created);

			if (parsedForm.data.templateId) {
				await assignTemplateMutation.mutateAsync({
					commissionId: created.id,
					templateId: parsedForm.data.templateId,
				});
			}

			await uploadQueuedMedia(created.id, queuedFilesSnapshot);

			const published = await publishCommissionMutation.mutateAsync(created.id);
			setCreatedCommission(published);

			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: ["profile-content", artistId, "commissions"],
				}),
				queryClient.invalidateQueries({
					queryKey: ["commissions", "artist", artistId],
				}),
				queryClient.invalidateQueries({
					queryKey: ["commissions", created.id],
				}),
			]);

			toast.success("Commission created and published.");
			setActiveTab("publish");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to create commission",
			);
		}
	};

	const handleFilesChange = (event: ChangeEvent<HTMLInputElement>) => {
		addFiles(Array.from(event.target.files || []));
		event.currentTarget.value = "";
	};

	const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
		event.preventDefault();
		setIsDragging(false);
		addFiles(Array.from(event.dataTransfer.files));
	};

	const currentTabLabel =
		navItems.find((item) => item.key === activeTab)?.name ?? "Details";
	const currentStatus =
		createdCommission?.commissionStatus ?? TCommissionStatus.Draft;

	return (
		<Dialog open={true} onOpenChange={(open) => !open && !isBusy && onClose()}>
			<DialogContent
				showCloseButton={false}
				className="overflow-hidden rounded-[28px] p-0 md:max-h-[760px] md:max-w-[1180px]"
			>
				<DialogTitle className="sr-only">Create commission</DialogTitle>
				<DialogDescription className="sr-only">
					Create and publish a commission offering.
				</DialogDescription>

				<SidebarProvider className="min-h-full items-start">
					<Sidebar
						collapsible="none"
						className="hidden border-r bg-background md:flex"
					>
						<SidebarContent>
							<SidebarGroup>
								<SidebarGroupContent className="flex flex-col gap-6 p-3">
									<div className="flex flex-col gap-1">
										<p className="text-sm font-semibold">New Commission</p>
										<p className="text-xs text-muted-foreground">
											{hasCreated
												? "Created from API"
												: "Draft until published"}
										</p>
									</div>

									<StatusPill status={currentStatus} />

									<SidebarMenu>
										{navItems.map((item) => (
											<SidebarMenuItem key={item.key}>
												<SidebarMenuButton
													onClick={() => setActiveTab(item.key)}
													isActive={activeTab === item.key}
												>
													<item.icon />
													{item.name}
													{item.key === "details" && detailsReady && (
														<Check className="ml-auto" />
													)}
													{item.key === "request-form" && requestFormReady && (
														<Check className="ml-auto" />
													)}
												</SidebarMenuButton>
											</SidebarMenuItem>
										))}
									</SidebarMenu>
								</SidebarGroupContent>
							</SidebarGroup>
						</SidebarContent>
					</Sidebar>

					<main className="flex h-[720px] flex-1 flex-col overflow-hidden bg-background">
						<header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b pl-6 pr-4">
							<div className="flex items-center gap-3">
								<Button
									onClick={onClose}
									size="icon"
									variant="ghost"
									disabled={isBusy}
								>
									<OutlineClose />
								</Button>
								<div className="hidden flex-col md:flex">
									<p className="text-sm font-medium">{currentTabLabel}</p>
								</div>
							</div>

							<div className="flex items-center gap-2">
								<StatusPill status={currentStatus} />

								{createdCommission?.id && (
									<Button
										variant="outline"
										onClick={() =>
											navigate({
												to: `/${username}/${tab}/${createdCommission.id}`,
												replace: true,
											})
										}
										className="rounded-full"
									>
										<ExternalLink data-icon="inline-start" />
										Open
									</Button>
								)}

								<Button
									onClick={handlePublish}
									size={"lg"}
									disabled={!canSubmit}
								>
									{isBusy ? (
										<>
											<Loader2
												data-icon="inline-start"
												className="animate-spin"
											/>
											{createCommissionMutation.isPending
												? "Creating..."
												: isUploading || uploadMediaMutation.isPending
													? "Uploading..."
													: "Publishing..."}
										</>
									) : hasCreated ? (
										"Published"
									) : (
										"Create & publish"
									)}
								</Button>
							</div>
						</header>

						<div className="flex-1 overflow-y-auto">
							<div className="mx-auto w-full px-6 py-8">
								{activeTab === "details" && (
									<div className="flex flex-col gap-8">
										<FlatSection
											title="Commission details"
											description="Only fields supported by the commission API are included here."
										>
											<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
												<FieldGroup
													label="Title"
													htmlFor="commission-title"
													error={titleError}
												>
													<InputGroup>
														<InputGroupAddon>
															<Type className="size-4" />
														</InputGroupAddon>
														<InputGroupInput
															id="commission-title"
															value={title}
															onChange={(event) => setTitle(event.target.value)}
															placeholder="Portrait commission"
															disabled={isBusy}
															aria-invalid={Boolean(titleError) || undefined}
															maxLength={255}
														/>
													</InputGroup>
												</FieldGroup>

												<FieldGroup label="Category" error={categoryError}>
													<Select
														value={categoryId}
														onValueChange={setCategoryId}
														disabled={
															isBusy ||
															isCategoriesPending ||
															Boolean(categoriesError)
														}
													>
														<SelectTrigger
															className="rounded-xl"
															aria-invalid={Boolean(categoryError) || undefined}
														>
															<SelectValue
																placeholder={
																	isCategoriesPending
																		? "Loading categories..."
																		: "Select category"
																}
															/>
														</SelectTrigger>
														<SelectContent>
															<SelectGroup>
																{flatCategories.map((category) => (
																	<SelectItem
																		key={category.id}
																		value={category.id}
																	>
																		{category.label}
																	</SelectItem>
																))}
															</SelectGroup>
														</SelectContent>
													</Select>
													{categoriesError && (
														<p className="text-xs text-destructive">
															{categoriesError instanceof Error
																? categoriesError.message
																: "Failed to load categories"}
														</p>
													)}
												</FieldGroup>

												<FieldGroup
													label="Base price"
													htmlFor="commission-price"
													error={priceError}
												>
													<InputGroup>
														<InputGroupAddon>
															{normalizedCurrency}
														</InputGroupAddon>
														<InputGroupNumberInput
															id="commission-price"
															min={0}
															decimalScale={2}
															stepper={0.01}
															value={basePrice}
															onChange={(event) =>
																setBasePrice(event.target.valueAsNumber)
															}
															disabled={isBusy}
															placeholder="50.00"
															aria-invalid={Boolean(priceError) || undefined}
														/>
													</InputGroup>
												</FieldGroup>

												<FieldGroup
													label="Currency"
													htmlFor="commission-currency"
													error={currencyError}
												>
													<CurrencySelect
														id="commission-currency"
														display="field"
														value={normalizedCurrency}
														onValueChange={setCurrencyCode}
														disabled={isBusy}
														aria-invalid={Boolean(currencyError)}
													/>
												</FieldGroup>
											</div>
										</FlatSection>

										<Separator />

										<FlatSection
											title="Description"
											description="Optional, up to 5000 characters."
										>
											<FieldGroup
												label="Description"
												htmlFor="commission-description"
												error={descriptionError}
											>
												<Textarea
													id="commission-description"
													value={description}
													onChange={(event) =>
														setDescription(event.target.value)
													}
													placeholder="Describe what the client receives, boundaries, turnaround, and notes."
													disabled={isBusy}
													className="min-h-40 resize-none rounded-2xl"
													aria-invalid={Boolean(descriptionError) || undefined}
													maxLength={5000}
												/>
											</FieldGroup>
										</FlatSection>

										<FlatSection
											title="Tags"
											description="Choose regular tags and content warnings separately."
										>
											{isTagsPending ? (
												<p className="text-sm text-muted-foreground">
													Loading tags...
												</p>
											) : normalizedTags.length > 0 ? (
												<div className="flex flex-col gap-6">
													{regularTags.length > 0 && (
														<div className="flex flex-col gap-3">
															<div className="flex items-center justify-between gap-3">
																<p className="text-sm font-medium">
																	General tags
																</p>
																<Badge size="sm" variant="secondary">
																	{regularTags.length}
																</Badge>
															</div>

															<div className="flex flex-wrap gap-2">
																{regularTags.map((tag) => (
																	<TagToggleButton
																		key={tag.id}
																		tag={tag}
																		selected={selectedTagIds.includes(tag.id)}
																		onToggle={toggleTag}
																		disabled={isBusy}
																	/>
																))}
															</div>
														</div>
													)}

													{contentWarningTags.length > 0 && (
														<div className="flex flex-col gap-3 rounded-2xl border border-destructive bg-destructive/10 p-4">
															<div className="flex items-start justify-between gap-3">
																<div className="flex items-start gap-2">
																	<AlertCircle className="mt-0.5 size-4 text-destructive" />
																	<div className="flex flex-col gap-1">
																		<p className="text-sm font-medium text-destructive">
																			Content warnings
																		</p>
																		<p className="text-xs text-destructive/80">
																			These tags are shown as warning-sensitive
																			metadata on the listing.
																		</p>
																	</div>
																</div>

																<Badge size="sm" variant="destructive">
																	{selectedContentWarningCount > 0
																		? `${selectedContentWarningCount} selected`
																		: "CW"}
																</Badge>
															</div>

															<div className="flex flex-wrap gap-2">
																{contentWarningTags.map((tag) => (
																	<TagToggleButton
																		key={tag.id}
																		tag={tag}
																		selected={selectedTagIds.includes(tag.id)}
																		onToggle={toggleTag}
																		disabled={isBusy}
																	/>
																))}
															</div>
														</div>
													)}
												</div>
											) : (
												<p className="text-sm text-muted-foreground">
													No tags configured yet.
												</p>
											)}
										</FlatSection>
									</div>
								)}

								{activeTab === "media" && (
									<div className="flex flex-col gap-8">
										<FlatSection
											title="Commission media"
											description="Files are uploaded to /api/commissions/{commissionId}/media after the commission is created."
										>
											<FieldGroup
												label="Media"
												hint="Images, GIFs, and videos"
												error={mediaError}
											>
												<label
													htmlFor="commission-files"
													onDragOver={(event) => {
														event.preventDefault();
														setIsDragging(true);
													}}
													onDragLeave={() => setIsDragging(false)}
													onDrop={handleDrop}
													className={cn(
														"flex min-h-44 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-6 py-8 text-center transition-colors",
														isDragging
															? "border-primary bg-primary/5"
															: "border-border hover:border-primary/40 hover:bg-muted/20",
														(isBusy || hasInvalidUploads) &&
															"border-destructive/40",
														isBusy && "pointer-events-none opacity-50",
													)}
												>
													<input
														id="commission-files"
														type="file"
														multiple
														accept="image/*,video/*,.gif"
														onChange={handleFilesChange}
														disabled={isBusy}
														className="sr-only"
													/>

													<div className="flex size-12 items-center justify-center rounded-2xl border bg-background">
														<FileImage className="size-5 text-muted-foreground" />
													</div>

													<div>
														<p className="text-sm font-medium">
															{isDragging
																? "Drop files here"
																: "Drag and drop or click to upload"}
														</p>
														<p className="mt-1 text-sm text-muted-foreground">
															Optional gallery media for the commission listing
														</p>
													</div>
												</label>
											</FieldGroup>
										</FlatSection>

										{uploads.length > 0 && (
											<>
												<Separator />
												<FlatSection
													title="Queued files"
													description="The API returns processing job IDs after upload, so conversion continues asynchronously."
												>
													<div className="flex flex-col gap-3">
														{isUploading && (
															<div className="flex flex-col gap-2">
																<div className="flex justify-between text-xs text-muted-foreground">
																	<span>Uploading</span>
																	<span>{totalProgress}%</span>
																</div>
																<Progress
																	value={totalProgress}
																	className="h-1.5 rounded-full"
																/>
															</div>
														)}

														{uploads.map((item) => (
															<FileRow
																key={item.id}
																item={item}
																onRemove={removeUpload}
																disabled={isUploading}
															/>
														))}
													</div>
												</FlatSection>
											</>
										)}
									</div>
								)}

								{activeTab === "request-form" && (
									<div className="flex flex-col gap-8">
										<FlatSection
											title="Request form"
											description="Optional form template assignment supported by the API."
										>
											<div className="max-w-xl">
												<FieldGroup label="Form template" hint="Optional">
													<Select
														value={selectedTemplateId || "none"}
														onValueChange={(value) =>
															setSelectedTemplateId(
																value === "none" ? null : value,
															)
														}
														disabled={isBusy || isFormTemplatesPending}
													>
														<SelectTrigger className="rounded-xl">
															<SelectValue placeholder="Select template" />
														</SelectTrigger>
														<SelectContent>
															<SelectGroup>
																<SelectItem value="none">None</SelectItem>
																{formTemplates?.map((template) => (
																	<SelectItem
																		key={template.id}
																		value={template.id}
																	>
																		{template.name}
																	</SelectItem>
																))}
															</SelectGroup>
														</SelectContent>
													</Select>
												</FieldGroup>
											</div>
										</FlatSection>
									</div>
								)}

								{activeTab === "publish" && (
									<div className="flex flex-col gap-8">
										<FlatSection
											title="Review"
											description="This is the API payload summary before publishing."
										>
											<div className="flex flex-col gap-6">
												<div className="flex flex-col gap-2">
													<p className="text-sm font-medium">
														{title.trim() || "Untitled commission"}
													</p>
													<p className="text-sm leading-relaxed text-muted-foreground">
														{description.trim() || "No description."}
													</p>
												</div>

												<div className="flex flex-wrap items-center gap-2">
													<StatusPill status={currentStatus} />
													<Badge variant="outline">
														{Number.isFinite(priceNumber) && priceNumber >= 0
															? `${priceNumber.toFixed(2)} ${normalizedCurrency}`
															: "Invalid price"}
													</Badge>
													{selectedCategory && (
														<Badge variant="secondary">
															{selectedCategory.label}
														</Badge>
													)}
													{selectedContentWarningCount > 0 && (
														<Badge variant="destructive">
															{selectedContentWarningCount} CW
														</Badge>
													)}
												</div>

												<div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
													<SidebarInfoRow
														label="Category ID"
														value={categoryId || "—"}
													/>
													<SidebarInfoRow
														label="Currency"
														value={normalizedCurrency || "—"}
													/>
													<SidebarInfoRow
														label="Tags"
														value={selectedTags.length || "—"}
													/>
													<SidebarInfoRow
														label="Content warnings"
														value={selectedContentWarningCount || "—"}
													/>
													<SidebarInfoRow
														label="Files"
														value={uploads.length}
													/>
													<SidebarInfoRow
														label="Uploaded"
														value={`${doneCount}/${uploads.length}`}
													/>
													<SidebarInfoRow
														label="Form template"
														value={selectedTemplateId ? "Assigned" : "None"}
													/>
												</div>

												{createdCommission?.id && (
													<div className="rounded-2xl border bg-muted/30 px-4 py-3">
														<div className="flex items-start gap-3">
															<CheckCircle2 className="mt-0.5 size-5 shrink-0" />
															<div className="flex flex-col gap-1">
																<p className="text-sm font-semibold">
																	Commission created
																</p>
																<p className="text-xs text-muted-foreground">
																	ID: {createdCommission.id}
																</p>
															</div>
														</div>
													</div>
												)}
											</div>
										</FlatSection>
									</div>
								)}
							</div>
						</div>
					</main>
				</SidebarProvider>
			</DialogContent>
		</Dialog>
	);
}
