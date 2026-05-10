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
	useCallback,
	useMemo,
	useReducer,
} from "react";
import { toast } from "sonner";
import { OutlineClose } from "@/components/icons/icons";
import CurrencySelect from "@/components/layout/select/currency";
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

interface CommissionFormState {
	activeTab: EditorTab;
	title: string;
	description: string;
	categoryId: string;
	basePrice: number;
	currencyCode: string;
	selectedTagIds: string[];
	selectedTemplateId: string | null;
	uploads: UploadQueueItem[];
	createdCommission: TCommissionResponse | null;
	isUploading: boolean;
	isDragging: boolean;
	hasTriedSubmit: boolean;
}

type CommissionFormAction =
	| {
			type: "patch";
			payload: Partial<CommissionFormState>;
	  }
	| {
			type: "addUploads";
			items: UploadQueueItem[];
	  }
	| {
			type: "removeUpload";
			id: string;
	  }
	| {
			type: "updateUploads";
			ids: string[];
			next: Partial<UploadQueueItem>;
	  };

type SetCommissionFormState = (payload: Partial<CommissionFormState>) => void;

interface CommissionFieldErrors {
	title?: string;
	category?: string;
	price?: string;
	currency?: string;
	description?: string;
	media?: string;
}

interface DetailsTabData {
	flatCategories: FlatCategory[];
	normalizedCurrency: string;
	normalizedTags: TTagResponse[];
	regularTags: TTagResponse[];
	contentWarningTags: TTagResponse[];
	selectedContentWarningCount: number;
	isCategoriesPending: boolean;
	isTagsPending: boolean;
	categoriesError: unknown;
}

interface PublishSummaryData {
	priceNumber: number;
	normalizedCurrency: string;
	selectedCategory?: FlatCategory;
	selectedTags: TTagResponse[];
	selectedContentWarningCount: number;
	doneCount: number;
	currentStatus: TCommissionStatus;
}

interface PublishButtonState {
	canSubmit: boolean;
	hasCreated: boolean;
	isBusy: boolean;
	isCreating: boolean;
	isUploading: boolean;
	isUploadingMedia: boolean;
}

interface CommissionLookups {
	formTemplates: Array<{ id: string; name: string }> | undefined;
	isFormTemplatesPending: boolean;
	categories: TCommissionCategoryResponse[];
	isCategoriesPending: boolean;
	categoriesError: unknown;
	tags: TTagResponse[];
	isTagsPending: boolean;
}

interface CommissionMutations {
	assignTemplateMutation: ReturnType<typeof useAssignFormTemplate>;
	createCommissionMutation: ReturnType<typeof useCreateCommission>;
	publishCommissionMutation: ReturnType<typeof usePublishCommission>;
	uploadMediaMutation: ReturnType<typeof useUploadCommissionMedia>;
}

interface CommissionDerivedData {
	detailsData: DetailsTabData;
	summaryData: PublishSummaryData;
	fieldErrors: CommissionFieldErrors;
	formInput: {
		title: string;
		description: string;
		categoryId: string;
		basePrice: number;
		currencyCode: string;
		tagIds: string[];
		templateId?: string;
		mediaFiles: File[];
	};
	detailsReady: boolean;
	requestFormReady: boolean;
	hasInvalidUploads: boolean;
	hasCreated: boolean;
	totalProgress: number;
	currentTabLabel: string;
}

interface CommissionController {
	state: CommissionFormState;
	setFormState: SetCommissionFormState;
	setActiveTab: (activeTab: EditorTab) => void;
	updateUploads: (ids: string[], next: Partial<UploadQueueItem>) => void;
	removeUpload: (id: string) => void;
	addFiles: (files: File[]) => void;
	toggleTag: (tagId: string) => void;
	handleFilesChange: (event: ChangeEvent<HTMLInputElement>) => void;
	handleDrop: (event: DragEvent<HTMLLabelElement>) => void;
}

interface CommissionBusyState {
	isBusy: boolean;
	canSubmit: boolean;
	publishState: PublishButtonState;
}

const initialCommissionFormState: CommissionFormState = {
	activeTab: "details",
	title: "",
	description: "",
	categoryId: "",
	basePrice: 50,
	currencyCode: "USD",
	selectedTagIds: [],
	selectedTemplateId: null,
	uploads: [],
	createdCommission: null,
	isUploading: false,
	isDragging: false,
	hasTriedSubmit: false,
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

function commissionFormReducer(
	state: CommissionFormState,
	action: CommissionFormAction,
): CommissionFormState {
	switch (action.type) {
		case "patch":
			return {
				...state,
				...action.payload,
			};

		case "addUploads":
			return {
				...state,
				uploads: [...state.uploads, ...action.items],
			};

		case "removeUpload":
			return {
				...state,
				uploads: state.uploads.filter((item) => item.id !== action.id),
			};

		case "updateUploads":
			return {
				...state,
				uploads: state.uploads.map((item) =>
					action.ids.includes(item.id) ? { ...item, ...action.next } : item,
				),
			};

		default:
			return state;
	}
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

function useCommissionFormController(): CommissionController {
	const [state, dispatch] = useReducer(
		commissionFormReducer,
		initialCommissionFormState,
	);

	const setFormState = useCallback<SetCommissionFormState>((payload) => {
		dispatch({ type: "patch", payload });
	}, []);

	const setActiveTab = useCallback(
		(activeTab: EditorTab) => {
			setFormState({ activeTab });
		},
		[setFormState],
	);

	const updateUploads = useCallback(
		(ids: string[], next: Partial<UploadQueueItem>) => {
			dispatch({ type: "updateUploads", ids, next });
		},
		[],
	);

	const removeUpload = useCallback(
		(id: string) => {
			if (state.isUploading) return;

			dispatch({ type: "removeUpload", id });
		},
		[state.isUploading],
	);

	const addFiles = useCallback(
		(files: File[]) => {
			if (files.length === 0) return;

			const existing = new Set(state.uploads.map((item) => fileKey(item.file)));
			const nextItems: UploadQueueItem[] = [];

			for (const file of files) {
				const key = fileKey(file);

				if (existing.has(key)) continue;

				existing.add(key);

				const validation = commissionMediaFileSchema.safeParse(file);

				nextItems.push({
					id: toUploadId(),
					file,
					progress: validation.success ? 0 : 100,
					status: validation.success ? "pending" : "error",
					error: validation.success
						? undefined
						: validation.error.issues[0]?.message || "Unsupported file.",
				});
			}

			if (nextItems.length > 0) {
				dispatch({ type: "addUploads", items: nextItems });
			}
		},
		[state.uploads],
	);

	const toggleTag = useCallback(
		(tagId: string) => {
			if (state.selectedTagIds.includes(tagId)) {
				setFormState({
					selectedTagIds: state.selectedTagIds.filter((id) => id !== tagId),
				});

				return;
			}

			if (state.selectedTagIds.length >= 20) {
				toast.error("You can select up to 20 tags.");
				return;
			}

			setFormState({ selectedTagIds: [...state.selectedTagIds, tagId] });
		},
		[setFormState, state.selectedTagIds],
	);

	const handleFilesChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			addFiles(Array.from(event.target.files || []));
			event.currentTarget.value = "";
		},
		[addFiles],
	);

	const handleDrop = useCallback(
		(event: DragEvent<HTMLLabelElement>) => {
			event.preventDefault();
			setFormState({ isDragging: false });
			addFiles(Array.from(event.dataTransfer.files));
		},
		[addFiles, setFormState],
	);

	return {
		state,
		setFormState,
		setActiveTab,
		updateUploads,
		removeUpload,
		addFiles,
		toggleTag,
		handleFilesChange,
		handleDrop,
	};
}

function useCommissionLookups(): CommissionLookups {
	const { data: formTemplates, isPending: isFormTemplatesPending } =
		useFormTemplates();

	const {
		data: categories,
		isPending: isCategoriesPending,
		error: categoriesError,
	} = useCommissionCategories();

	const { data: tags, isPending: isTagsPending } = useTags(false);

	return {
		formTemplates: formTemplates as
			| Array<{ id: string; name: string }>
			| undefined,
		isFormTemplatesPending,
		categories: (categories ?? []) as TCommissionCategoryResponse[],
		isCategoriesPending,
		categoriesError,
		tags: (tags ?? []) as TTagResponse[],
		isTagsPending,
	};
}

function useCommissionMutations(): CommissionMutations {
	return {
		assignTemplateMutation: useAssignFormTemplate(),
		createCommissionMutation: useCreateCommission(),
		publishCommissionMutation: usePublishCommission(),
		uploadMediaMutation: useUploadCommissionMedia(),
	};
}

function useCommissionDerivedData(
	state: CommissionFormState,
	lookups: CommissionLookups,
): CommissionDerivedData {
	const normalizedTags = useMemo(
		() => (lookups.tags ?? []) as TTagResponse[],
		[lookups.tags],
	);

	const flatCategories = useMemo(
		() => flattenCategories(lookups.categories),
		[lookups.categories],
	);

	const selectedCategory = useMemo(
		() => flatCategories.find((category) => category.id === state.categoryId),
		[state.categoryId, flatCategories],
	);

	const selectedTags = useMemo(
		() => normalizedTags.filter((tag) => state.selectedTagIds.includes(tag.id)),
		[normalizedTags, state.selectedTagIds],
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
			contentWarningTags.filter((tag) => state.selectedTagIds.includes(tag.id))
				.length,
		[contentWarningTags, state.selectedTagIds],
	);

	const doneCount = useMemo(
		() => state.uploads.filter((item) => item.status === "done").length,
		[state.uploads],
	);

	const totalProgress = useMemo(() => {
		if (state.uploads.length === 0) return 0;

		const sum = state.uploads.reduce((acc, item) => acc + item.progress, 0);

		return Math.round(sum / state.uploads.length);
	}, [state.uploads]);

	const priceNumber = Number(state.basePrice);
	const normalizedCurrency = state.currencyCode.trim().toUpperCase();

	const mediaFiles = useMemo(
		() => state.uploads.map((item) => item.file),
		[state.uploads],
	);

	const createRequestInput = useMemo(
		() => ({
			title: state.title,
			description: state.description,
			categoryId: state.categoryId,
			basePrice: state.basePrice,
			currencyCode: normalizedCurrency,
			tagIds:
				state.selectedTagIds.length > 0 ? state.selectedTagIds : undefined,
			commissionStatus: TCommissionStatus.Draft,
		}),
		[
			state.title,
			state.description,
			state.categoryId,
			state.basePrice,
			normalizedCurrency,
			state.selectedTagIds,
		],
	);

	const formInput = useMemo(
		() => ({
			title: state.title,
			description: state.description,
			categoryId: state.categoryId,
			basePrice: state.basePrice,
			currencyCode: normalizedCurrency,
			tagIds: state.selectedTagIds,
			templateId: state.selectedTemplateId ?? undefined,
			mediaFiles,
		}),
		[
			state.title,
			state.description,
			state.categoryId,
			state.basePrice,
			normalizedCurrency,
			state.selectedTagIds,
			state.selectedTemplateId,
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

	const fieldErrors: CommissionFieldErrors = {
		title: state.hasTriedSubmit ? requestFieldErrors.title?.[0] : undefined,
		category: state.hasTriedSubmit
			? requestFieldErrors.categoryId?.[0]
			: undefined,
		price: state.hasTriedSubmit ? requestFieldErrors.basePrice?.[0] : undefined,
		currency: state.hasTriedSubmit
			? requestFieldErrors.currencyCode?.[0]
			: undefined,
		description: state.hasTriedSubmit
			? requestFieldErrors.description?.[0]
			: undefined,
		media: state.hasTriedSubmit ? formFieldErrors.mediaFiles?.[0] : undefined,
	};

	const detailsData: DetailsTabData = {
		flatCategories,
		normalizedCurrency,
		normalizedTags,
		regularTags,
		contentWarningTags,
		selectedContentWarningCount,
		isCategoriesPending: lookups.isCategoriesPending,
		isTagsPending: lookups.isTagsPending,
		categoriesError: lookups.categoriesError,
	};

	const summaryData: PublishSummaryData = {
		priceNumber,
		normalizedCurrency,
		selectedCategory,
		selectedTags,
		selectedContentWarningCount,
		doneCount,
		currentStatus:
			state.createdCommission?.commissionStatus ?? TCommissionStatus.Draft,
	};

	const currentTabLabel =
		navItems.find((item) => item.key === state.activeTab)?.name ?? "Details";

	return {
		detailsData,
		summaryData,
		fieldErrors,
		formInput,
		detailsReady: createRequestValidation.success,
		requestFormReady: Boolean(state.selectedTemplateId),
		hasInvalidUploads: state.uploads.some((item) => item.status === "error"),
		hasCreated: Boolean(state.createdCommission?.id),
		totalProgress,
		currentTabLabel,
	};
}

function useCommissionBusyState(
	state: CommissionFormState,
	mutations: CommissionMutations,
	derived: Pick<CommissionDerivedData, "hasCreated">,
): CommissionBusyState {
	const isBusy =
		mutations.createCommissionMutation.isPending ||
		mutations.publishCommissionMutation.isPending ||
		mutations.uploadMediaMutation.isPending ||
		mutations.assignTemplateMutation.isPending ||
		state.isUploading;

	const canSubmit = !isBusy && !derived.hasCreated;

	return {
		isBusy,
		canSubmit,
		publishState: {
			canSubmit,
			hasCreated: derived.hasCreated,
			isBusy,
			isCreating: mutations.createCommissionMutation.isPending,
			isUploading: state.isUploading,
			isUploadingMedia: mutations.uploadMediaMutation.isPending,
		},
	};
}

function usePublishCommissionAction({
	artistId,
	queryClient,
	state,
	controller,
	mutations,
	derived,
	busy,
}: {
	artistId: string;
	queryClient: ReturnType<typeof useQueryClient>;
	state: CommissionFormState;
	controller: CommissionController;
	mutations: CommissionMutations;
	derived: CommissionDerivedData;
	busy: CommissionBusyState;
}) {
	const uploadQueuedMedia = useCallback(
		async (commissionId: string, items: UploadQueueItem[]) => {
			if (items.length === 0) return;

			const ids = items.map((item) => item.id);

			controller.setFormState({ isUploading: true });
			controller.updateUploads(ids, {
				status: "uploading",
				progress: 25,
				error: undefined,
			});

			try {
				controller.updateUploads(ids, { progress: 60 });
				await mutations.uploadMediaMutation.mutateAsync({
					commissionId,
					files: items.map((item) => item.file),
				});
				controller.updateUploads(ids, { status: "done", progress: 100 });
			} catch (error) {
				const message =
					error instanceof Error ? error.message : "Upload failed";
				controller.updateUploads(ids, {
					status: "error",
					progress: 100,
					error: message,
				});
				throw error;
			} finally {
				controller.setFormState({ isUploading: false });
			}
		},
		[controller, mutations.uploadMediaMutation],
	);

	return useCallback(async () => {
		controller.setFormState({ hasTriedSubmit: true });

		const parsedForm = createCommissionFormSchema.safeParse(derived.formInput);

		if (!parsedForm.success) {
			const flattenedErrors = parsedForm.error.flatten().fieldErrors;
			const firstError = Object.values(flattenedErrors).flat()[0];

			toast.error(firstError || "Fill the required commission fields first.");

			if (flattenedErrors.mediaFiles?.length) {
				controller.setActiveTab("media");
			} else {
				controller.setActiveTab("details");
			}

			return;
		}

		if (derived.hasInvalidUploads) {
			toast.error("Remove invalid media files before publishing.");
			controller.setActiveTab("media");
			return;
		}

		if (!derived.detailsReady) {
			toast.error("Fill the required commission fields first.");
			controller.setActiveTab("details");
			return;
		}

		if (!busy.canSubmit) return;

		try {
			const queuedFilesSnapshot = [...state.uploads];
			const createRequest = toCreateCommissionRequest(parsedForm.data);

			const created =
				await mutations.createCommissionMutation.mutateAsync(createRequest);
			controller.setFormState({ createdCommission: created });

			if (parsedForm.data.templateId) {
				await mutations.assignTemplateMutation.mutateAsync({
					commissionId: created.id,
					templateId: parsedForm.data.templateId,
				});
			}

			await uploadQueuedMedia(created.id, queuedFilesSnapshot);

			const published = await mutations.publishCommissionMutation.mutateAsync(
				created.id,
			);
			controller.setFormState({ createdCommission: published });

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
			controller.setActiveTab("publish");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to create commission",
			);
		}
	}, [
		artistId,
		busy.canSubmit,
		controller,
		derived.detailsReady,
		derived.formInput,
		derived.hasInvalidUploads,
		mutations.assignTemplateMutation,
		mutations.createCommissionMutation,
		mutations.publishCommissionMutation,
		queryClient,
		state.uploads,
		uploadQueuedMedia,
	]);
}

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
				<h3 className="font-semibold text-foreground text-sm">{title}</h3>
				{description && (
					<p className="text-muted-foreground text-sm">{description}</p>
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
				<Label htmlFor={htmlFor} className="font-medium text-sm">
					{label}
				</Label>
				{hint && <span className="text-muted-foreground text-xs">{hint}</span>}
			</div>
			{children}
			{error && <p className="text-destructive text-xs">{error}</p>}
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
		<div className="flex items-start gap-3 rounded-xl border border-border p-3">
			<div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
				<FileImage className="size-4 text-muted-foreground" />
			</div>

			<div className="flex min-w-0 flex-1 flex-col gap-1.5">
				<div className="flex items-start justify-between gap-3">
					<div className="min-w-0">
						<p className="truncate font-medium text-sm">{item.file.name}</p>
						<p className="text-muted-foreground text-xs">
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
				{item.error && <p className="text-destructive text-xs">{item.error}</p>}
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

function CreateCommissionSidebar({
	activeTab,
	onTabChange,
	detailsReady,
	requestFormReady,
	currentStatus,
	hasCreated,
}: {
	activeTab: EditorTab;
	onTabChange: (tab: EditorTab) => void;
	detailsReady: boolean;
	requestFormReady: boolean;
	currentStatus: TCommissionStatus;
	hasCreated: boolean;
}) {
	return (
		<Sidebar
			collapsible="none"
			className="hidden border-r bg-background md:flex"
		>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent className="flex flex-col gap-6 p-3">
						<div className="flex flex-col gap-1">
							<p className="font-semibold text-sm">New Commission</p>
							<p className="text-muted-foreground text-xs">
								{hasCreated ? "Created from API" : "Draft until published"}
							</p>
						</div>

						<StatusPill status={currentStatus} />

						<SidebarMenu>
							{navItems.map((item) => (
								<SidebarMenuItem key={item.key}>
									<SidebarMenuButton
										onClick={() => onTabChange(item.key)}
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
	);
}

function CreateCommissionHeader({
	currentTabLabel,
	currentStatus,
	createdCommission,
	username,
	tab,
	onClose,
	onPublish,
	publishState,
}: {
	currentTabLabel: string;
	currentStatus: TCommissionStatus;
	createdCommission: TCommissionResponse | null;
	username: string;
	tab: string;
	onClose: () => void;
	onPublish: () => void;
	publishState: PublishButtonState;
}) {
	const navigate = useNavigate();

	return (
		<header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b pr-4 pl-6">
			<div className="flex items-center gap-3">
				<Button
					onClick={onClose}
					size="icon"
					variant="ghost"
					disabled={publishState.isBusy}
				>
					<OutlineClose />
				</Button>
				<div className="hidden flex-col md:flex">
					<p className="font-medium text-sm">{currentTabLabel}</p>
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
					onClick={onPublish}
					size="lg"
					disabled={!publishState.canSubmit}
				>
					{publishState.isBusy ? (
						<>
							<Loader2 data-icon="inline-start" className="animate-spin" />
							{publishState.isCreating
								? "Creating..."
								: publishState.isUploading || publishState.isUploadingMedia
									? "Uploading..."
									: "Publishing..."}
						</>
					) : publishState.hasCreated ? (
						"Published"
					) : (
						"Create & publish"
					)}
				</Button>
			</div>
		</header>
	);
}

function DetailsTab({
	state,
	data,
	errors,
	isBusy,
	setFormState,
	toggleTag,
}: {
	state: CommissionFormState;
	data: DetailsTabData;
	errors: CommissionFieldErrors;
	isBusy: boolean;
	setFormState: SetCommissionFormState;
	toggleTag: (tagId: string) => void;
}) {
	return (
		<div className="flex flex-col gap-8">
			<FlatSection
				title="Commission details"
				description="Only fields supported by the commission API are included here."
			>
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
					<TitleField
						value={state.title}
						error={errors.title}
						disabled={isBusy}
						onChange={(title) => setFormState({ title })}
					/>

					<CategoryField
						value={state.categoryId}
						error={errors.category}
						data={data}
						disabled={isBusy}
						onChange={(categoryId) => setFormState({ categoryId })}
					/>

					<PriceField
						value={state.basePrice}
						error={errors.price}
						currency={data.normalizedCurrency}
						disabled={isBusy}
						onChange={(basePrice) => setFormState({ basePrice })}
					/>

					<CurrencyField
						value={data.normalizedCurrency}
						error={errors.currency}
						disabled={isBusy}
						onChange={(currencyCode) => setFormState({ currencyCode })}
					/>
				</div>
			</FlatSection>

			<Separator />

			<DescriptionField
				value={state.description}
				error={errors.description}
				disabled={isBusy}
				onChange={(description) => setFormState({ description })}
			/>

			<TagsSection
				isBusy={isBusy}
				isTagsPending={data.isTagsPending}
				normalizedTags={data.normalizedTags}
				regularTags={data.regularTags}
				contentWarningTags={data.contentWarningTags}
				selectedTagIds={state.selectedTagIds}
				selectedContentWarningCount={data.selectedContentWarningCount}
				toggleTag={toggleTag}
			/>
		</div>
	);
}

function TitleField({
	value,
	error,
	disabled,
	onChange,
}: {
	value: string;
	error?: string;
	disabled: boolean;
	onChange: (value: string) => void;
}) {
	return (
		<FieldGroup label="Title" htmlFor="commission-title" error={error}>
			<InputGroup>
				<InputGroupAddon>
					<Type className="size-4" />
				</InputGroupAddon>
				<InputGroupInput
					id="commission-title"
					value={value}
					onChange={(event) => onChange(event.target.value)}
					placeholder="Portrait commission"
					disabled={disabled}
					aria-invalid={Boolean(error) || undefined}
					maxLength={255}
				/>
			</InputGroup>
		</FieldGroup>
	);
}

function CategoryField({
	value,
	error,
	data,
	disabled,
	onChange,
}: {
	value: string;
	error?: string;
	data: DetailsTabData;
	disabled: boolean;
	onChange: (value: string) => void;
}) {
	return (
		<FieldGroup label="Category" error={error}>
			<Select
				value={value}
				onValueChange={onChange}
				disabled={
					disabled || data.isCategoriesPending || Boolean(data.categoriesError)
				}
			>
				<SelectTrigger
					className="rounded-xl"
					aria-invalid={Boolean(error) || undefined}
				>
					<SelectValue
						placeholder={
							data.isCategoriesPending
								? "Loading categories..."
								: "Select category"
						}
					/>
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						{data.flatCategories.map((category) => (
							<SelectItem key={category.id} value={category.id}>
								{category.label}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
			{data.categoriesError ? (
				<p className="text-destructive text-xs">
					{data.categoriesError instanceof Error
						? data.categoriesError.message
						: "Failed to load categories"}
				</p>
			) : null}
		</FieldGroup>
	);
}

function PriceField({
	value,
	error,
	currency,
	disabled,
	onChange,
}: {
	value: number;
	error?: string;
	currency: string;
	disabled: boolean;
	onChange: (value: number) => void;
}) {
	return (
		<FieldGroup label="Base price" htmlFor="commission-price" error={error}>
			<InputGroup>
				<InputGroupAddon>{currency}</InputGroupAddon>
				<InputGroupNumberInput
					id="commission-price"
					min={0}
					decimalScale={2}
					stepper={0.01}
					value={value}
					onChange={(event) => onChange(event.target.valueAsNumber)}
					disabled={disabled}
					placeholder="50.00"
					aria-invalid={Boolean(error) || undefined}
				/>
			</InputGroup>
		</FieldGroup>
	);
}

function CurrencyField({
	value,
	error,
	disabled,
	onChange,
}: {
	value: string;
	error?: string;
	disabled: boolean;
	onChange: (value: string) => void;
}) {
	return (
		<FieldGroup label="Currency" htmlFor="commission-currency" error={error}>
			<CurrencySelect
				id="commission-currency"
				display="field"
				value={value}
				onValueChange={onChange}
				disabled={disabled}
				aria-invalid={Boolean(error)}
			/>
		</FieldGroup>
	);
}

function DescriptionField({
	value,
	error,
	disabled,
	onChange,
}: {
	value: string;
	error?: string;
	disabled: boolean;
	onChange: (value: string) => void;
}) {
	return (
		<FlatSection
			title="Description"
			description="Optional, up to 5000 characters."
		>
			<FieldGroup
				label="Description"
				htmlFor="commission-description"
				error={error}
			>
				<Textarea
					id="commission-description"
					value={value}
					onChange={(event) => onChange(event.target.value)}
					placeholder="Describe what the client receives, boundaries, turnaround, and notes."
					disabled={disabled}
					className="min-h-40 resize-none rounded-2xl"
					aria-invalid={Boolean(error) || undefined}
					maxLength={5000}
				/>
			</FieldGroup>
		</FlatSection>
	);
}

function TagsSection({
	isBusy,
	isTagsPending,
	normalizedTags,
	regularTags,
	contentWarningTags,
	selectedTagIds,
	selectedContentWarningCount,
	toggleTag,
}: {
	isBusy: boolean;
	isTagsPending: boolean;
	normalizedTags: TTagResponse[];
	regularTags: TTagResponse[];
	contentWarningTags: TTagResponse[];
	selectedTagIds: string[];
	selectedContentWarningCount: number;
	toggleTag: (tagId: string) => void;
}) {
	return (
		<FlatSection
			title="Tags"
			description="Choose regular tags and content warnings separately."
		>
			{isTagsPending ? (
				<p className="text-muted-foreground text-sm">Loading tags&hellip;</p>
			) : normalizedTags.length > 0 ? (
				<div className="flex flex-col gap-6">
					<RegularTagsGroup
						tags={regularTags}
						selectedTagIds={selectedTagIds}
						onToggle={toggleTag}
						disabled={isBusy}
					/>

					<ContentWarningTagsGroup
						tags={contentWarningTags}
						selectedTagIds={selectedTagIds}
						selectedCount={selectedContentWarningCount}
						onToggle={toggleTag}
						disabled={isBusy}
					/>
				</div>
			) : (
				<p className="text-muted-foreground text-sm">No tags configured yet.</p>
			)}
		</FlatSection>
	);
}

function RegularTagsGroup({
	tags,
	selectedTagIds,
	onToggle,
	disabled,
}: {
	tags: TTagResponse[];
	selectedTagIds: string[];
	onToggle: (tagId: string) => void;
	disabled: boolean;
}) {
	if (tags.length === 0) return null;

	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center justify-between gap-3">
				<p className="font-medium text-sm">General tags</p>
				<Badge size="sm" variant="secondary">
					{tags.length}
				</Badge>
			</div>

			<div className="flex flex-wrap gap-2">
				{tags.map((tag) => (
					<TagToggleButton
						key={tag.id}
						tag={tag}
						selected={selectedTagIds.includes(tag.id)}
						onToggle={onToggle}
						disabled={disabled}
					/>
				))}
			</div>
		</div>
	);
}

function ContentWarningTagsGroup({
	tags,
	selectedTagIds,
	selectedCount,
	onToggle,
	disabled,
}: {
	tags: TTagResponse[];
	selectedTagIds: string[];
	selectedCount: number;
	onToggle: (tagId: string) => void;
	disabled: boolean;
}) {
	if (tags.length === 0) return null;

	return (
		<div className="flex flex-col gap-3 rounded-2xl border border-destructive bg-destructive/10 p-4">
			<div className="flex items-start justify-between gap-3">
				<div className="flex items-start gap-2">
					<AlertCircle className="mt-0.5 size-4 text-destructive" />
					<div className="flex flex-col gap-1">
						<p className="font-medium text-destructive text-sm">
							Content warnings
						</p>
						<p className="text-destructive/80 text-xs">
							These tags are shown as warning-sensitive metadata on the listing.
						</p>
					</div>
				</div>

				<Badge size="sm" variant="destructive">
					{selectedCount > 0 ? `${selectedCount} selected` : "CW"}
				</Badge>
			</div>

			<div className="flex flex-wrap gap-2">
				{tags.map((tag) => (
					<TagToggleButton
						key={tag.id}
						tag={tag}
						selected={selectedTagIds.includes(tag.id)}
						onToggle={onToggle}
						disabled={disabled}
					/>
				))}
			</div>
		</div>
	);
}

function MediaTab({
	state,
	mediaError,
	totalProgress,
	isBusy,
	hasInvalidUploads,
	removeUpload,
	handleFilesChange,
	handleDrop,
	setFormState,
}: {
	state: CommissionFormState;
	mediaError?: string;
	totalProgress: number;
	isBusy: boolean;
	hasInvalidUploads: boolean;
	removeUpload: (id: string) => void;
	handleFilesChange: (event: ChangeEvent<HTMLInputElement>) => void;
	handleDrop: (event: DragEvent<HTMLLabelElement>) => void;
	setFormState: SetCommissionFormState;
}) {
	return (
		<div className="flex flex-col gap-8">
			<MediaDropzone
				state={state}
				mediaError={mediaError}
				isBusy={isBusy}
				hasInvalidUploads={hasInvalidUploads}
				handleFilesChange={handleFilesChange}
				handleDrop={handleDrop}
				setFormState={setFormState}
			/>

			{state.uploads.length > 0 && (
				<>
					<Separator />
					<QueuedFilesSection
						uploads={state.uploads}
						isUploading={state.isUploading}
						totalProgress={totalProgress}
						removeUpload={removeUpload}
					/>
				</>
			)}
		</div>
	);
}

function MediaDropzone({
	state,
	mediaError,
	isBusy,
	hasInvalidUploads,
	handleFilesChange,
	handleDrop,
	setFormState,
}: {
	state: CommissionFormState;
	mediaError?: string;
	isBusy: boolean;
	hasInvalidUploads: boolean;
	handleFilesChange: (event: ChangeEvent<HTMLInputElement>) => void;
	handleDrop: (event: DragEvent<HTMLLabelElement>) => void;
	setFormState: SetCommissionFormState;
}) {
	return (
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
						setFormState({ isDragging: true });
					}}
					onDragLeave={() => setFormState({ isDragging: false })}
					onDrop={handleDrop}
					className={cn(
						"flex min-h-44 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-6 py-8 text-center transition-colors",
						state.isDragging
							? "border-primary bg-primary/5"
							: "border-border hover:border-primary/40 hover:bg-muted/20",
						(isBusy || hasInvalidUploads) && "border-destructive/40",
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
						<p className="font-medium text-sm">
							{state.isDragging
								? "Drop files here"
								: "Drag and drop or click to upload"}
						</p>
						<p className="mt-1 text-muted-foreground text-sm">
							Optional gallery media for the commission listing
						</p>
					</div>
				</label>
			</FieldGroup>
		</FlatSection>
	);
}

function QueuedFilesSection({
	uploads,
	isUploading,
	totalProgress,
	removeUpload,
}: {
	uploads: UploadQueueItem[];
	isUploading: boolean;
	totalProgress: number;
	removeUpload: (id: string) => void;
}) {
	return (
		<FlatSection
			title="Queued files"
			description="The API returns processing job IDs after upload, so conversion continues asynchronously."
		>
			<div className="flex flex-col gap-3">
				{isUploading && (
					<div className="flex flex-col gap-2">
						<div className="flex justify-between text-muted-foreground text-xs">
							<span>Uploading</span>
							<span>{totalProgress}%</span>
						</div>
						<Progress value={totalProgress} className="h-1.5 rounded-full" />
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
	);
}

function RequestFormTab({
	selectedTemplateId,
	formTemplates,
	isBusy,
	isFormTemplatesPending,
	setFormState,
}: {
	selectedTemplateId: string | null;
	formTemplates: Array<{ id: string; name: string }> | undefined;
	isBusy: boolean;
	isFormTemplatesPending: boolean;
	setFormState: SetCommissionFormState;
}) {
	return (
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
								setFormState({
									selectedTemplateId: value === "none" ? null : value,
								})
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
										<SelectItem key={template.id} value={template.id}>
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
	);
}

function PublishTab({
	state,
	summary,
}: {
	state: CommissionFormState;
	summary: PublishSummaryData;
}) {
	return (
		<div className="flex flex-col gap-8">
			<FlatSection
				title="Review"
				description="This is the API payload summary before publishing."
			>
				<div className="flex flex-col gap-6">
					<PublishMainSummary state={state} summary={summary} />
					<PublishBadges state={state} summary={summary} />
					<PublishInfoGrid state={state} summary={summary} />
					<CreatedCommissionNotice commission={state.createdCommission} />
				</div>
			</FlatSection>
		</div>
	);
}

function PublishMainSummary({
	state,
}: {
	state: CommissionFormState;
	summary: PublishSummaryData;
}) {
	return (
		<div className="flex flex-col gap-2">
			<p className="font-medium text-sm">
				{state.title.trim() || "Untitled commission"}
			</p>
			<p className="text-muted-foreground text-sm leading-relaxed">
				{state.description.trim() || "No description."}
			</p>
		</div>
	);
}

function PublishBadges({
	state,
	summary,
}: {
	state: CommissionFormState;
	summary: PublishSummaryData;
}) {
	return (
		<div className="flex flex-wrap items-center gap-2">
			<StatusPill status={summary.currentStatus} />
			<Badge variant="outline">
				{Number.isFinite(summary.priceNumber) && summary.priceNumber >= 0
					? `${summary.priceNumber.toFixed(2)} ${summary.normalizedCurrency}`
					: "Invalid price"}
			</Badge>
			{summary.selectedCategory && (
				<Badge variant="secondary">{summary.selectedCategory.label}</Badge>
			)}
			{summary.selectedContentWarningCount > 0 && (
				<Badge variant="destructive">
					{summary.selectedContentWarningCount} CW
				</Badge>
			)}
			{state.uploads.length > 0 && (
				<Badge variant="secondary">{state.uploads.length} file(s)</Badge>
			)}
		</div>
	);
}

function PublishInfoGrid({
	state,
	summary,
}: {
	state: CommissionFormState;
	summary: PublishSummaryData;
}) {
	return (
		<div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
			<SidebarInfoRow label="Category ID" value={state.categoryId || "—"} />
			<SidebarInfoRow
				label="Currency"
				value={summary.normalizedCurrency || "—"}
			/>
			<SidebarInfoRow label="Tags" value={summary.selectedTags.length || "—"} />
			<SidebarInfoRow
				label="Content warnings"
				value={summary.selectedContentWarningCount || "—"}
			/>
			<SidebarInfoRow label="Files" value={state.uploads.length} />
			<SidebarInfoRow
				label="Uploaded"
				value={`${summary.doneCount}/${state.uploads.length}`}
			/>
			<SidebarInfoRow
				label="Form template"
				value={state.selectedTemplateId ? "Assigned" : "None"}
			/>
		</div>
	);
}

function CreatedCommissionNotice({
	commission,
}: {
	commission: TCommissionResponse | null;
}) {
	if (!commission?.id) {
		return null;
	}

	return (
		<div className="rounded-2xl border bg-muted/30 px-4 py-3">
			<div className="flex items-start gap-3">
				<CheckCircle2 className="mt-0.5 size-5 shrink-0" />
				<div className="flex flex-col gap-1">
					<p className="font-semibold text-sm">Commission created</p>
					<p className="text-muted-foreground text-xs">ID: {commission.id}</p>
				</div>
			</div>
		</div>
	);
}

function CommissionEditorTabContent({
	state,
	detailsData,
	summaryData,
	fieldErrors,
	formTemplates,
	isBusy,
	isFormTemplatesPending,
	totalProgress,
	hasInvalidUploads,
	setFormState,
	toggleTag,
	removeUpload,
	handleFilesChange,
	handleDrop,
}: {
	state: CommissionFormState;
	detailsData: DetailsTabData;
	summaryData: PublishSummaryData;
	fieldErrors: CommissionFieldErrors;
	formTemplates: Array<{ id: string; name: string }> | undefined;
	isBusy: boolean;
	isFormTemplatesPending: boolean;
	totalProgress: number;
	hasInvalidUploads: boolean;
	setFormState: SetCommissionFormState;
	toggleTag: (tagId: string) => void;
	removeUpload: (id: string) => void;
	handleFilesChange: (event: ChangeEvent<HTMLInputElement>) => void;
	handleDrop: (event: DragEvent<HTMLLabelElement>) => void;
}) {
	switch (state.activeTab) {
		case "details":
			return (
				<DetailsTab
					state={state}
					data={detailsData}
					errors={fieldErrors}
					isBusy={isBusy}
					setFormState={setFormState}
					toggleTag={toggleTag}
				/>
			);

		case "media":
			return (
				<MediaTab
					state={state}
					mediaError={fieldErrors.media}
					totalProgress={totalProgress}
					isBusy={isBusy}
					hasInvalidUploads={hasInvalidUploads}
					removeUpload={removeUpload}
					handleFilesChange={handleFilesChange}
					handleDrop={handleDrop}
					setFormState={setFormState}
				/>
			);

		case "request-form":
			return (
				<RequestFormTab
					selectedTemplateId={state.selectedTemplateId}
					formTemplates={formTemplates}
					isBusy={isBusy}
					isFormTemplatesPending={isFormTemplatesPending}
					setFormState={setFormState}
				/>
			);

		case "publish":
			return <PublishTab state={state} summary={summaryData} />;

		default:
			return null;
	}
}

function CreateCommissionDialogLayout({
	username,
	tab,
	onClose,
	onPublish,
	controller,
	lookups,
	derived,
	busy,
}: {
	username: string;
	tab: string;
	onClose: () => void;
	onPublish: () => void;
	controller: CommissionController;
	lookups: CommissionLookups;
	derived: CommissionDerivedData;
	busy: CommissionBusyState;
}) {
	const { state } = controller;

	return (
		<Dialog
			open={true}
			onOpenChange={(open) => !open && !busy.isBusy && onClose()}
		>
			<DialogContent
				showCloseButton={false}
				className="overflow-hidden rounded-[28px] p-0 md:max-h-[760px] md:max-w-[1180px]"
			>
				<DialogTitle className="sr-only">Create commission</DialogTitle>
				<DialogDescription className="sr-only">
					Create and publish a commission offering.
				</DialogDescription>

				<SidebarProvider className="min-h-full items-start">
					<CreateCommissionSidebar
						activeTab={state.activeTab}
						onTabChange={controller.setActiveTab}
						detailsReady={derived.detailsReady}
						requestFormReady={derived.requestFormReady}
						currentStatus={derived.summaryData.currentStatus}
						hasCreated={derived.hasCreated}
					/>

					<main className="flex h-[720px] flex-1 flex-col overflow-hidden bg-background">
						<CreateCommissionHeader
							currentTabLabel={derived.currentTabLabel}
							currentStatus={derived.summaryData.currentStatus}
							createdCommission={state.createdCommission}
							username={username}
							tab={tab}
							onClose={onClose}
							onPublish={onPublish}
							publishState={busy.publishState}
						/>

						<div className="flex-1 overflow-y-auto">
							<div className="mx-auto w-full px-6 py-8">
								<CommissionEditorTabContent
									state={state}
									detailsData={derived.detailsData}
									summaryData={derived.summaryData}
									fieldErrors={derived.fieldErrors}
									formTemplates={lookups.formTemplates}
									isBusy={busy.isBusy}
									isFormTemplatesPending={lookups.isFormTemplatesPending}
									totalProgress={derived.totalProgress}
									hasInvalidUploads={derived.hasInvalidUploads}
									setFormState={controller.setFormState}
									toggleTag={controller.toggleTag}
									removeUpload={controller.removeUpload}
									handleFilesChange={controller.handleFilesChange}
									handleDrop={controller.handleDrop}
								/>
							</div>
						</div>
					</main>
				</SidebarProvider>
			</DialogContent>
		</Dialog>
	);
}

export function CreateCommissionForm({
	username,
	tab,
	artistId,
	onClose,
}: CreateCommissionFormProps) {
	const queryClient = useQueryClient();
	const lookups = useCommissionLookups();
	const mutations = useCommissionMutations();
	const controller = useCommissionFormController();
	const derived = useCommissionDerivedData(controller.state, lookups);
	const busy = useCommissionBusyState(controller.state, mutations, derived);
	const handlePublish = usePublishCommissionAction({
		artistId,
		queryClient,
		state: controller.state,
		controller,
		mutations,
		derived,
		busy,
	});

	return (
		<CreateCommissionDialogLayout
			username={username}
			tab={tab}
			onClose={onClose}
			onPublish={handlePublish}
			controller={controller}
			lookups={lookups}
			derived={derived}
			busy={busy}
		/>
	);
}
