import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Chip } from "@heroui/react";
import {
	AlertTriangle,
	ArrowLeft,
	Check,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	ChevronsUpDown,
	Circle,
	DollarSign,
	Eye,
	FileImage,
	FileText,
	Globe,
	GripVertical,
	ImageIcon,
	Layers,
	Loader2,
	MessageCircle,
	Plus,
	Search,
	Send,
	Sparkles,
	TagIcon,
	Trash2,
	Type,
	Upload,
	X,
} from "lucide-react";
import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { toast } from "sonner";
import {
	OutlineChevronRight,
	OutlineClose,
	OutlineTrash,
} from "@/components/icons/icons";
import CurrencySelect from "@/components/layout/select/currency";
import {
	Stepper,
	StepperContent,
	StepperDescription,
	StepperIndicator,
	StepperItem,
	StepperNav,
	StepperPanel,
	StepperSeparator,
	StepperTitle,
	StepperTrigger,
} from "@/components/reui/stepper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
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
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
	useCommission,
	useCommissionCategories,
	useCreateCommission,
	usePublishCommission,
	useTags,
	useUpdateCommission,
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
	toCreateCommissionRequest,
} from "@/schemas/commissions";
import type {
	TCommissionCategoryResponse,
	TCommissionDetailResponse,
	TCommissionResponse,
	TTagResponse,
	TUpdateCommissionRequest,
} from "@/types/commissions";
import { TCommissionStatus } from "@/types/commissions";
import { FormTemplateModal } from "./form-template-modal";

type EditorTab = "details" | "media" | "review";

interface CommissionFormProps {
	username: string;
	tab: string;
	artistId: string;
	commissionId?: string;
	onClose: () => void;
}

type MediaQueueItem = {
	id: string;
	file?: File;
	fileName: string;
	fileSizeLabel?: string;
	previewUrl?: string;
	existingMediaId?: string;
	status: "pending" | "uploading" | "done" | "error";
	progress: number;
	error?: string;
};

type FormState = {
	activeTab: EditorTab;
	title: string;
	description: string;
	categoryId: string;
	basePrice: number;
	currencyCode: string;
	selectedTagIds: string[];
	selectedTemplateId: string | null;
	uploads: MediaQueueItem[];
	status: TCommissionStatus;
};

const NAV_ITEMS: Array<{
	key: EditorTab;
	label: string;
	description: string;
	icon: React.ElementType;
}> = [
	{
		key: "details",
		label: "Details",
		description: "Title, pricing, category & forms",
		icon: FileText,
	},
	{
		key: "media",
		label: "Media",
		description: "Showcase your work",
		icon: ImageIcon,
	},
	{
		key: "review",
		label: "Review",
		description: "Review and publish",
		icon: Eye,
	},
];

const INITIAL_STATE: FormState = {
	activeTab: "details",
	title: "",
	description: "",
	categoryId: "",
	basePrice: 50,
	currencyCode: "USD",
	selectedTagIds: [],
	selectedTemplateId: null,
	uploads: [],
	status: TCommissionStatus.Draft,
};

function formatBytes(bytes: number) {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function toUploadId() {
	return typeof crypto !== "undefined" && "randomUUID" in crypto
		? crypto.randomUUID()
		: `upload-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function fileKey(file: File) {
	return `${file.name}-${file.size}-${file.lastModified}`;
}

function getCategoryLabelById(
	categories: TCommissionCategoryResponse[],
	categoryId: string,
): string | null {
	for (const category of categories) {
		if (category.id === categoryId) return category.name;

		if (category.subcategories?.length) {
			const nestedLabel = getCategoryLabelById(
				category.subcategories,
				categoryId,
			);

			if (nestedLabel) return nestedLabel;
		}
	}

	return null;
}

function getCategoryPathById(
	categories: TCommissionCategoryResponse[],
	categoryId: string,
	ancestors: string[] = [],
): string[] | null {
	for (const category of categories) {
		const nextAncestors = [...ancestors, category.name];
		if (category.id === categoryId) return nextAncestors;

		if (category.subcategories?.length) {
			const nestedPath = getCategoryPathById(
				category.subcategories,
				categoryId,
				nextAncestors,
			);
			if (nestedPath) return nestedPath;
		}
	}

	return null;
}

type CategoryOption = {
	id: string;
	name: string;
	pathLabel: string;
	children: CategoryOption[];
};

function buildCategoryTree(
	categories: TCommissionCategoryResponse[],
	ancestors: string[] = [],
): CategoryOption[] {
	return categories.map((category) => {
		const path = [...ancestors, category.name];
		return {
			id: category.id,
			name: category.name,
			pathLabel: path.join(" / "),
			children: buildCategoryTree(category.subcategories ?? [], path),
		};
	});
}

function getCategoryNodeById(
	nodes: CategoryOption[],
	targetId: string,
): CategoryOption | null {
	for (const node of nodes) {
		if (node.id === targetId) return node;
		const nestedNode = getCategoryNodeById(node.children, targetId);
		if (nestedNode) return nestedNode;
	}
	return null;
}

function toCommissionResponse(
	commission: TCommissionDetailResponse,
): TCommissionResponse {
	return {
		id: commission.id,
		title: commission.title,
		description: commission.description,
		categoryId: commission.category.id,
		basePrice: commission.basePrice,
		currencyCode: commission.currencyCode,
		commissionStatus: commission.commissionStatus,
		artistId: commission.artistId,
		version: commission.version,
		createdAt: commission.createdAt,
		updatedAt: commission.updatedAt,
	};
}

function toUpdateCommissionRequest(state: FormState): TUpdateCommissionRequest {
	const multimediaIds = state.uploads.reduce<string[]>((acc, item) => {
		if (item.existingMediaId) acc.push(item.existingMediaId);
		return acc;
	}, []);

	return {
		title: state.title,
		description: state.description || undefined,
		categoryId: state.categoryId,
		basePrice: state.basePrice,
		currencyCode: state.currencyCode.toUpperCase(),
		commissionStatus: state.status,
		multimediaIds: multimediaIds.length ? multimediaIds : undefined,
	};
}

function CommissionFormSidebar({
	isEditMode,
	state,
	uiState,
	patchState,
	stepStatus,
}: {
	isEditMode: boolean;
	state: FormState;
	uiState: UIState;
	patchState: (patch: Partial<FormState>) => void;
	stepStatus: Record<string, boolean>;
}) {
	return (
		<aside className="flex w-72 shrink-0 flex-col border-r bg-muted/20">
			<div className="border-b p-5">
				<h2 className="text-base font-semibold text-foreground">
					{isEditMode ? "Edit commission" : "New commission"}
				</h2>
				<p className="mt-1 text-xs text-muted-foreground">
					{isEditMode
						? "Update your offering details"
						: "Set up a new offering"}
				</p>
				<div className="mt-4 flex items-center gap-2">
					<Select
						value={state.status}
						onValueChange={(value) =>
							patchState({ status: value as TCommissionStatus })
						}
					>
						<SelectTrigger className="h-7 border-none bg-transparent hover:bg-muted/50 w-auto px-2 focus:ring-0">
							<Badge
								variant={
									state.status === "ACTIVE"
										? "success_ghost"
										: state.status === "PAUSED"
											? "warning_ghost"
											: "danger_ghost"
								}
								className="text-[10px] font-semibold uppercase tracking-wider cursor-pointer"
							>
								{state.status}
							</Badge>
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="ACTIVE">Active</SelectItem>
							<SelectItem value="PAUSED">Paused</SelectItem>
							<SelectItem value="DRAFT">Draft</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto p-5">
				<StepperNav>
					{NAV_ITEMS.map((item, index) => {
						const isComplete =
							uiState.savedSteps.has(item.key) &&
							stepStatus[item.key as keyof typeof stepStatus] === true;

						return (
							<StepperItem
								key={item.key}
								step={index + 1}
								completed={isComplete}
								className="relative items-start not-last:flex-1"
							>
								<StepperTrigger className="items-start gap-3 pb-8 last:pb-0">
									<StepperIndicator className="data-[state=completed]:bg-emerald-500 data-[state=completed]:text-white">
										{index + 1}
									</StepperIndicator>
									<div className="mt-0.5 text-left">
										<StepperTitle>{item.label}</StepperTitle>
										<StepperDescription>{item.description}</StepperDescription>
									</div>
								</StepperTrigger>
								{index < NAV_ITEMS.length - 1 && (
									<StepperSeparator className="group-data-[state=completed]/step:bg-emerald-500 absolute inset-y-0 top-7 left-3 -order-1 m-0 -translate-x-1/2 group-data-[orientation=vertical]/stepper-nav:h-[calc(100%-2rem)]" />
								)}
							</StepperItem>
						);
					})}
				</StepperNav>
			</div>

			<div className="border-t p-5">
				{isEditMode && (
					<Button
						type="button"
						variant={"destructive"}
						size={"lg"}
						className="w-full"
					>
						<OutlineTrash />
						Delete commission
					</Button>
				)}
			</div>
		</aside>
	);
}

function MediaCard({
	item,
	index,
	disabled,
	onRemove,
}: {
	item: MediaQueueItem;
	index: number;
	disabled: boolean;
	onRemove: (id: string) => void;
}) {
	return (
		<div className="group relative aspect-video overflow-hidden rounded-xl bg-muted border">
			{item.previewUrl ? (
				<img
					src={item.previewUrl}
					alt={item.fileName}
					className="h-full w-full object-cover"
				/>
			) : (
				<div className="flex h-full w-full items-center justify-center bg-muted">
					<FileImage className="size-8 text-muted-foreground opacity-50" />
				</div>
			)}

			{/* Overlay */}
			<div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

			{/* Index badge */}
			<div className="absolute left-2 top-2 flex size-6 items-center justify-center rounded-md bg-black/60 text-xs font-medium text-white backdrop-blur-md">
				{index + 1}
			</div>

			{/* Actions */}
			<div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
				<button
					type="button"
					disabled={disabled}
					onClick={(e) => {
						e.preventDefault();
						onRemove(item.id);
					}}
					className="flex size-7 items-center justify-center rounded-md bg-destructive/80 text-white backdrop-blur-md transition-colors hover:bg-destructive disabled:opacity-50"
				>
					<Trash2 className="size-3.5" />
				</button>
			</div>

			{/* Info */}
			<div className="absolute inset-x-0 bottom-0 p-2 opacity-0 transition-opacity group-hover:opacity-100">
				<p className="truncate text-xs font-medium text-white">
					{item.fileName}
				</p>
				<p className="text-[10px] text-white/70">
					{item.fileSizeLabel ?? "Existing media"}
				</p>
				{item.error ? (
					<p className="text-[10px] text-destructive font-medium">
						{item.error}
					</p>
				) : null}
			</div>

			{/* Progress */}
			{item.status !== "pending" && item.progress < 100 ? (
				<div className="absolute inset-x-2 bottom-2">
					<div className="h-1 overflow-hidden rounded-full bg-black/40">
						<div
							className="h-full rounded-full bg-white transition-all"
							style={{ width: `${item.progress}%` }}
						/>
					</div>
				</div>
			) : null}
		</div>
	);
}

type UIState = {
	isCategoryOpen: boolean;
	categoryPathStack: string[];
	isTemplateModalOpen: boolean;
	savedSteps: Set<EditorTab>;
};

export function CommissionForm({
	username,
	tab,
	artistId,
	commissionId,
	onClose,
}: CommissionFormProps) {
	const isEditMode = Boolean(commissionId);
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [state, setState] = useState<FormState>(INITIAL_STATE);
	const createdCommission = useRef<TCommissionResponse | null>(null);
	const hasInitializedEditState = useRef(false);
	const [uiState, dispatchUi] = useReducer(
		(state: UIState, action: Partial<UIState>) => ({ ...state, ...action }),
		{
			isCategoryOpen: false,
			categoryPathStack: [] as string[],
			isTemplateModalOpen: false,
			savedSteps: new Set<EditorTab>(isEditMode ? ["details", "media"] : []),
		},
	);
	const { data: commissionData } = useCommission(commissionId ?? "");
	const { data: categories = [], isPending: isCategoriesPending } =
		useCommissionCategories();
	const { data: tags = [] } = useTags(true);
	const { data: formTemplates, isPending: isTemplatesPending } =
		useFormTemplates();

	const createCommissionMutation = useCreateCommission();
	const updateCommissionMutation = useUpdateCommission();
	const publishCommissionMutation = usePublishCommission();
	const uploadMediaMutation = useUploadCommissionMedia();
	const assignTemplateMutation = useAssignFormTemplate();

	const isBusy =
		createCommissionMutation.isPending ||
		updateCommissionMutation.isPending ||
		publishCommissionMutation.isPending ||
		uploadMediaMutation.isPending ||
		assignTemplateMutation.isPending;

	useEffect(() => {
		if (!commissionData || hasInitializedEditState.current) return;

		setState({
			activeTab: "details",
			title: commissionData.title,
			description: commissionData.description ?? "",
			categoryId: commissionData.category.id,
			basePrice: commissionData.basePrice,
			currencyCode: commissionData.currencyCode,
			selectedTagIds: commissionData.tags.map((tag) => tag.id),
			selectedTemplateId: commissionData.formTemplateId ?? null,
			status: commissionData.commissionStatus ?? TCommissionStatus.Draft,
			uploads: commissionData.multimedia.map((media) => ({
				id: `existing-${media.id}`,
				fileName: media.fileName,
				fileSizeLabel: `${media.widthPx} x ${media.heightPx}`,
				previewUrl:
					media.sizes.thumbnail || media.sizes.half || media.sizes.full,
				existingMediaId: media.id,
				status: "done",
				progress: 100,
			})),
		});
		createdCommission.current = toCommissionResponse(commissionData);
		hasInitializedEditState.current = true;
	}, [commissionData]);

	const mediaFiles = useMemo(
		() =>
			state.uploads.reduce<File[]>((acc, item) => {
				if (item.file) acc.push(item.file);
				return acc;
			}, []),
		[state.uploads],
	);

	const currentStatus =
		createdCommission.current?.commissionStatus ??
		commissionData?.commissionStatus ??
		TCommissionStatus.Draft;

	const selectedCategoryLabel = state.categoryId
		? getCategoryPathById(categories, state.categoryId)?.join(" / ") ||
			getCategoryLabelById(categories, state.categoryId)
		: null;
	const categoryTree = useMemo(
		() => buildCategoryTree(categories),
		[categories],
	);
	const visibleCategoryOptions = useMemo(() => {
		if (uiState.categoryPathStack.length === 0) return categoryTree;
		const activeCategoryId =
			uiState.categoryPathStack[uiState.categoryPathStack.length - 1];
		const activeCategory = getCategoryNodeById(categoryTree, activeCategoryId);
		return activeCategory?.children ?? [];
	}, [categoryTree, uiState.categoryPathStack]);
	const activeCategoryLabel = useMemo(() => {
		if (uiState.categoryPathStack.length === 0) return null;
		const activeCategoryId =
			uiState.categoryPathStack[uiState.categoryPathStack.length - 1];
		return getCategoryNodeById(categoryTree, activeCategoryId)?.name ?? null;
	}, [categoryTree, uiState.categoryPathStack]);

	const handleCategoryOpenChange = (open: boolean) => {
		dispatchUi({ isCategoryOpen: open });
		if (!open && uiState.categoryPathStack.length > 0) {
			dispatchUi({ categoryPathStack: [] });
		}
	};

	useEffect(() => {
		if (!state.categoryId) return;
		const categoryPath = getCategoryPathById(categories, state.categoryId);
		if (!categoryPath?.length) return;

		let nodes = categoryTree;
		const nextStack: string[] = [];
		for (const segment of categoryPath.slice(0, -1)) {
			const nodesMap = new Map(nodes.map((n) => [n.name, n]));
			const matched = nodesMap.get(segment);
			if (!matched) break;
			nextStack.push(matched.id);
			nodes = matched.children;
		}
		dispatchUi({ categoryPathStack: nextStack });
	}, [state.categoryId, categories, categoryTree]);

	const totalProgress = useMemo(() => {
		if (state.uploads.length === 0) return 0;

		const total = state.uploads.reduce((sum, item) => sum + item.progress, 0);
		return Math.round(total / state.uploads.length);
	}, [state.uploads]);

	const regularTags = useMemo(
		() => tags.filter((tag: TTagResponse) => !tag.hasContentWarning),
		[tags],
	);

	const contentWarningTags = useMemo(
		() => tags.filter((tag: TTagResponse) => tag.hasContentWarning),
		[tags],
	);

	function patchState(patch: Partial<FormState>) {
		setState((current) => ({ ...current, ...patch }));
	}

	function toggleTag(tagId: string) {
		setState((current) => ({
			...current,
			selectedTagIds: current.selectedTagIds.includes(tagId)
				? current.selectedTagIds.filter((id) => id !== tagId)
				: [...current.selectedTagIds, tagId],
		}));
	}

	function removeUpload(id: string) {
		setState((current) => ({
			...current,
			uploads: current.uploads.filter((item) => item.id !== id),
		}));
	}

	function addFiles(files: File[]) {
		if (files.length === 0) return;

		const existingKeys = new Set(
			state.uploads.reduce<string[]>((acc, item) => {
				if (item.file) acc.push(fileKey(item.file));
				return acc;
			}, []),
		);

		const nextItems: MediaQueueItem[] = [];

		for (const file of files) {
			const key = fileKey(file);
			if (existingKeys.has(key)) continue;
			existingKeys.add(key);

			const validation = commissionMediaFileSchema.safeParse(file);
			nextItems.push({
				id: toUploadId(),
				file,
				fileName: file.name,
				fileSizeLabel: formatBytes(file.size),
				previewUrl: file.type.startsWith("image/")
					? URL.createObjectURL(file)
					: undefined,
				status: validation.success ? "pending" : "error",
				progress: validation.success ? 0 : 100,
				error: validation.success
					? undefined
					: validation.error.issues[0]?.message || "Unsupported file.",
			});
		}

		if (nextItems.length) {
			setState((current) => ({
				...current,
				uploads: [...current.uploads, ...nextItems],
			}));
		}
	}

	async function uploadNewFiles(targetCommissionId: string) {
		const queuedItems = state.uploads.filter(
			(item): item is MediaQueueItem & { file: File } => Boolean(item.file),
		);

		if (!queuedItems.length) return;

		const ids = queuedItems.map((item) => item.id);
		setState((current) => ({
			...current,
			uploads: current.uploads.map((item) =>
				ids.includes(item.id)
					? { ...item, status: "uploading", progress: 25, error: undefined }
					: item,
			),
		}));

		try {
			await uploadMediaMutation.mutateAsync({
				commissionId: targetCommissionId,
				files: queuedItems.map((item) => item.file),
			});
			setState((current) => ({
				...current,
				uploads: current.uploads.map((item) =>
					ids.includes(item.id)
						? { ...item, status: "done", progress: 100 }
						: item,
				),
			}));
		} catch (error) {
			const message = error instanceof Error ? error.message : "Upload failed";
			setState((current) => ({
				...current,
				uploads: current.uploads.map((item) =>
					ids.includes(item.id)
						? { ...item, status: "error", progress: 100, error: message }
						: item,
				),
			}));
			throw error;
		}
	}

	async function handleSubmit() {
		const parsed = createCommissionFormSchema.safeParse({
			title: state.title,
			description: state.description,
			categoryId: state.categoryId,
			basePrice: state.basePrice,
			currencyCode: state.currencyCode,
			tagIds: state.selectedTagIds,
			templateId: state.selectedTemplateId ?? undefined,
			mediaFiles,
			commissionStatus: state.status,
		});

		if (!parsed.success) {
			toast.error(
				parsed.error.issues[0]?.message || "Fill the required fields.",
			);
			setState((current) => ({ ...current, activeTab: "details" }));
			return;
		}

		try {
			if (isEditMode && commissionId) {
				const [updated] = await Promise.all([
					updateCommissionMutation.mutateAsync({
						commissionId,
						data: toUpdateCommissionRequest(state),
					}),
					assignTemplateMutation.mutateAsync({
						commissionId,
						templateId: state.selectedTemplateId ?? null,
					}),
					uploadNewFiles(commissionId),
				]);
				createdCommission.current = updated;

				await Promise.all([
					queryClient.invalidateQueries({ queryKey: ["commissions", "me"] }),
					queryClient.invalidateQueries({
						queryKey: ["commissions", commissionId],
					}),
				]);

				toast.success("Commission updated successfully.");
				setState((current) => ({ ...current, activeTab: "review" }));
				return;
			}

			const [created] = await Promise.all([
				createCommissionMutation.mutateAsync(
					toCreateCommissionRequest(parsed.data),
				),
				// We can't run these in parallel with create because they need created.id
			]);
			createdCommission.current = created;

			const subsequentTasks = [
				assignTemplateMutation.mutateAsync({
					commissionId: created.id,
					templateId: state.selectedTemplateId ?? null,
				}),
				uploadNewFiles(created.id),
			];

			if (state.status === TCommissionStatus.Active) {
				subsequentTasks.push(
					publishCommissionMutation
						.mutateAsync(created.id)
						.then((published) => {
							createdCommission.current = published;
						}),
				);
			}

			await Promise.all(subsequentTasks);

			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ["commissions", "me"] }),
				queryClient.invalidateQueries({
					queryKey: ["commissions", created.id],
				}),
			]);

			toast.success("Commission created and published.");
			setState((current) => ({ ...current, activeTab: "review" }));
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to save commission",
			);
		}
	}

	const stepStatus = useMemo(() => {
		return {
			details:
				state.title.trim().length > 0 &&
				state.basePrice > 0 &&
				!!state.categoryId,
			media: state.uploads.length > 0,
			review: false,
		};
	}, [state]);

	const completionPct = useMemo(() => {
		const checks = [stepStatus.details, stepStatus.media];
		return Math.round((checks.filter(Boolean).length / checks.length) * 100);
	}, [stepStatus]);

	const canPublish = stepStatus.details && stepStatus.media;

	const currentStepIndex = NAV_ITEMS.findIndex(
		(s) => s.key === state.activeTab,
	);
	const currentStep = NAV_ITEMS[currentStepIndex];

	const goNext = () => {
		dispatchUi({
			savedSteps: new Set(uiState.savedSteps).add(state.activeTab),
		});
		if (currentStepIndex < NAV_ITEMS.length - 1) {
			patchState({ activeTab: NAV_ITEMS[currentStepIndex + 1].key });
		}
	};

	const goPrev = () => {
		if (currentStepIndex > 0) {
			patchState({ activeTab: NAV_ITEMS[currentStepIndex - 1].key });
		}
	};

	return (
		<Dialog open={true} onOpenChange={(open) => !open && !isBusy && onClose()}>
			<DialogContent
				showCloseButton={false}
				className="flex flex-col overflow-hidden rounded-2xl p-0 md:h-[65vh] md:max-w-5xl border bg-background shadow-2xl"
			>
				<DialogTitle className="sr-only">
					{isEditMode ? "Edit commission" : "Create commission"}
				</DialogTitle>
				<DialogDescription className="sr-only">
					{isEditMode
						? "Edit your commission offering."
						: "Create and publish a commission offering."}
				</DialogDescription>

				<Stepper
					value={currentStepIndex + 1}
					onValueChange={(v) => patchState({ activeTab: NAV_ITEMS[v - 1].key })}
					orientation="vertical"
					indicators={{
						completed: <Check className="size-3.5" />,
						loading: <Loader2 className="size-3.5 animate-spin" />,
					}}
					className="flex flex-1 overflow-hidden w-full flex-row"
				>
					<CommissionFormSidebar
						isEditMode={isEditMode}
						state={state}
						uiState={uiState}
						patchState={patchState}
						stepStatus={stepStatus}
					/>

					<div className="flex flex-1 flex-col overflow-hidden bg-background">
						<header className="flex shrink-0 items-center justify-between border-b p-5">
							<div className="flex flex-col">
								<h3 className="text-base font-semibold text-foreground">
									{currentStep?.label}
								</h3>
								<p className="text-xs text-muted-foreground">
									Step {currentStepIndex + 1} of {NAV_ITEMS.length} -{" "}
									{currentStep?.description}
								</p>
							</div>

							<div className="flex items-center gap-2">
								{/* {currentStatus === "ACTIVE" && (
									<Button type="button">Pause</Button>
								)}
								{currentStatus === "PAUSED" && (
									<Button type="button">Resume</Button>
								)}
								{createdCommission?.id ? (
									<Button
										type="button"
										variant="outline"
										onClick={() =>
											navigate({
												to: `/${username}/${tab}/${createdCommission.id}`,
												replace: true,
											})
										}
									>
										Open
									</Button>
								) : null} */}
								<Button
									type="button"
									variant="ghost"
									size={"icon"}
									onClick={onClose}
									aria-label="Close"
									disabled={isBusy}
								>
									<OutlineClose />
								</Button>
							</div>
						</header>

						<div className="flex-1 overflow-y-auto bg-muted/10">
							<div className="p-5">
								{state.activeTab === "details" ? (
									<div className="flex flex-col gap-8">
										<div className="space-y-6">
											<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
												<div className="space-y-2">
													<Label htmlFor="commission-title">Title</Label>
													<InputGroup>
														<InputGroupAddon>
															<Type className="size-4" />
														</InputGroupAddon>
														<InputGroupInput
															id="commission-title"
															value={state.title}
															onChange={(event) =>
																patchState({ title: event.target.value })
															}
															placeholder="Portrait commission"
															disabled={isBusy}
														/>
													</InputGroup>
												</div>

												<div className="space-y-2">
													<Label>Category</Label>
													<Popover
														open={uiState.isCategoryOpen}
														onOpenChange={handleCategoryOpenChange}
													>
														<PopoverTrigger asChild>
															<Button
																type="button"
																variant="secondary"
																size="xl"
																className="w-full justify-between font-normal"
																disabled={isBusy || isCategoriesPending}
															>
																<span
																	className={cn(
																		"truncate text-left",
																		!selectedCategoryLabel &&
																			"text-muted-foreground",
																	)}
																>
																	{selectedCategoryLabel || "Select category"}
																</span>
																<OutlineChevronRight className="rotate-90 text-muted-foreground" />
															</Button>
														</PopoverTrigger>
														<PopoverContent
															align="start"
															side="bottom"
															sideOffset={8}
															collisionPadding={16}
															onWheel={(event) => event.stopPropagation()}
															onTouchMove={(event) => event.stopPropagation()}
															className="w-(--radix-popover-trigger-width) min-w-[320px] overflow-hidden rounded-(--command-content-radius) p-0"
														>
															<Command className="max-h-[min(420px,var(--radix-popover-content-available-height))]">
																<CommandInput placeholder="Search category..." />
																<CommandList className="max-h-[min(360px,calc(var(--radix-popover-content-available-height)-3rem))] overflow-y-auto overscroll-contain touch-pan-y">
																	<CommandEmpty>
																		No category found.
																	</CommandEmpty>
																	{uiState.categoryPathStack.length > 0 && (
																		<CommandGroup>
																			<CommandItem
																				onSelect={() =>
																					dispatchUi({
																						categoryPathStack:
																							uiState.categoryPathStack.slice(
																								0,
																								-1,
																							),
																					})
																				}
																				className="cursor-pointer font-medium text-muted-foreground"
																			>
																				<ChevronLeft className="mr-2 size-4" />
																				{activeCategoryLabel
																					? `Back from ${activeCategoryLabel}`
																					: "Back"}
																			</CommandItem>
																			<CommandItem
																				onSelect={() => {
																					const currentFolderId =
																						uiState.categoryPathStack[
																							uiState.categoryPathStack.length -
																								1
																						];
																					if (currentFolderId) {
																						patchState({
																							categoryId: currentFolderId,
																						});
																						dispatchUi({
																							isCategoryOpen: false,
																						});
																					}
																				}}
																				className="cursor-pointer font-medium"
																			>
																				<div className="flex min-w-0 flex-1 flex-col">
																					<span className="truncate">
																						{activeCategoryLabel}
																					</span>
																					<span className="text-muted-foreground text-xs">
																						Main category
																					</span>
																				</div>
																				<div className="ml-2 flex items-center gap-1">
																					<Check
																						className={cn(
																							"size-4",
																							state.categoryId ===
																								uiState.categoryPathStack[
																									uiState.categoryPathStack
																										.length - 1
																								]
																								? "opacity-100"
																								: "opacity-0",
																						)}
																					/>
																				</div>
																			</CommandItem>
																		</CommandGroup>
																	)}
																	<CommandGroup
																		heading={
																			uiState.categoryPathStack.length === 0
																				? "Main categories"
																				: "Subcategories"
																		}
																	>
																		{visibleCategoryOptions.map((option) => {
																			const selected =
																				state.categoryId === option.id;
																			return (
																				<CommandItem
																					key={option.id}
																					onSelect={() => {
																						if (option.children.length > 0) {
																							dispatchUi({
																								categoryPathStack: [
																									...uiState.categoryPathStack,
																									option.id,
																								],
																							});
																						} else {
																							patchState({
																								categoryId: option.id,
																							});
																							dispatchUi({
																								isCategoryOpen: false,
																							});
																						}
																					}}
																					className="group"
																				>
																					<div className="flex min-w-0 flex-1 flex-col">
																						<span className="truncate">
																							{option.name}
																						</span>
																						<span className="text-muted-foreground text-xs">
																							{option.pathLabel}
																						</span>
																					</div>
																					<div className="ml-2 flex items-center gap-1">
																						<Check
																							className={cn(
																								"size-4",
																								selected
																									? "opacity-100"
																									: "opacity-0",
																							)}
																						/>
																						{option.children.length > 0 ? (
																							<ChevronRight className="size-4 text-muted-foreground" />
																						) : null}
																					</div>
																				</CommandItem>
																			);
																		})}
																	</CommandGroup>
																</CommandList>
															</Command>
														</PopoverContent>
													</Popover>
												</div>
											</div>

											<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
												<div className="space-y-2">
													<Label>Base price</Label>
													<InputGroup>
														<InputGroupAddon>
															{state.currencyCode.toUpperCase()}
														</InputGroupAddon>
														<InputGroupNumberInput
															min={0}
															stepper={0.01}
															value={state.basePrice}
															onChange={(event) =>
																patchState({
																	basePrice: Number(event.target.value || 0),
																})
															}
															disabled={isBusy}
														/>
													</InputGroup>
												</div>

												<div className="space-y-2">
													<Label>Currency</Label>
													<CurrencySelect
														value={state.currencyCode}
														onValueChange={(currencyCode) =>
															patchState({ currencyCode })
														}
														disabled={isBusy}
														display="field"
													/>
												</div>
											</div>

											<div className="space-y-3">
												<div className="flex items-start justify-between gap-4">
													<div className="space-y-1">
														<Label className="text-sm font-medium">
															Form Template
														</Label>
														<p className="text-xs text-muted-foreground">
															Choose a form template that clients will fill out
															when requesting this commission.
														</p>
													</div>
													{state.selectedTemplateId &&
														state.selectedTemplateId !== "none" && (
															<Button
																variant="outline"
																size="sm"
																type="button"
																onClick={() =>
																	dispatchUi({ isTemplateModalOpen: true })
																}
															>
																Edit template
															</Button>
														)}
												</div>

												{isTemplatesPending ? (
													<div className="flex items-center justify-center p-4">
														<Loader2 className="size-5 animate-spin text-muted-foreground" />
													</div>
												) : (
													<Select
														value={state.selectedTemplateId || "none"}
														onValueChange={(value) =>
															patchState({
																selectedTemplateId:
																	value === "none" ? null : value,
															})
														}
														disabled={isBusy}
													>
														<SelectTrigger className="w-full">
															<SelectValue placeholder="Select a form template" />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="none">None</SelectItem>
															{formTemplates?.map((template) => (
																<SelectItem
																	key={template.id}
																	value={template.id}
																>
																	{template.name}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												)}
											</div>
										</div>

										<Separator />

										<div className="space-y-2">
											<Label htmlFor="commission-description">
												Description
											</Label>
											<Textarea
												id="commission-description"
												value={state.description}
												onChange={(event) =>
													patchState({ description: event.target.value })
												}
												className="min-h-40"
												disabled={isBusy}
											/>
										</div>

										<div className="space-y-3">
											<Label>Tags</Label>
											<div className="space-y-4">
												<div className="space-y-2">
													<p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">
														General tags
													</p>
													<div className="flex flex-wrap gap-2">
														{regularTags.map((tag: TTagResponse) => {
															const selected = state.selectedTagIds.includes(
																tag.id,
															);
															return (
																<Button
																	key={tag.id}
																	type="button"
																	onClick={() => toggleTag(tag.id)}
																	disabled={isBusy}
																	variant={selected ? "default" : "outline"}
																	size={"sm"}
																>
																	{tag.name}
																</Button>
															);
														})}
													</div>
												</div>

												<div className="space-y-2">
													<p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">
														Content warnings
													</p>
													<div className="flex flex-wrap gap-2">
														{contentWarningTags.map((tag: TTagResponse) => {
															const selected = state.selectedTagIds.includes(
																tag.id,
															);
															return (
																<Button
																	key={tag.id}
																	type="button"
																	onClick={() => toggleTag(tag.id)}
																	disabled={isBusy}
																	variant={
																		selected
																			? "destructive"
																			: "destructive_ghost"
																	}
																	size={"sm"}
																	// className={cn(
																	// 	selected
																	// 		? "border-destructive bg-destructive text-white"
																	// 		: "border-destructive/30 bg-background text-destructive/70 hover:bg-destructive/5",
																	// )}
																>
																	CW: {tag.name}
																</Button>
															);
														})}
													</div>
												</div>
											</div>
										</div>
									</div>
								) : null}

								{state.activeTab === "media" ? (
									<div className="flex flex-col gap-6">
										<div className="flex items-start gap-3 rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
											<div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sky-500/15">
												<ImageIcon className="size-4 text-sky-600 dark:text-sky-400" />
											</div>
											<div>
												<h4 className="text-sm font-medium text-sky-700 dark:text-sky-100">
													Show your best work
												</h4>
												<p className="mt-0.5 text-xs leading-relaxed text-sky-600/80 dark:text-sky-200/60">
													The first image is used as the gallery thumbnail.
													Upload up to 10 images - drag to reorder. Existing
													media is loaded here in edit mode.
												</p>
											</div>
										</div>

										<div className="space-y-2">
											<label
												htmlFor="commission-files"
												className={cn(
													"flex min-h-44 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors",
													"border-border bg-muted/20 hover:border-primary/40 hover:bg-muted/40",
													isBusy && "pointer-events-none opacity-50",
												)}
											>
												<input
													id="commission-files"
													type="file"
													multiple
													accept="image/*,video/*,.gif"
													className="sr-only"
													disabled={isBusy}
													onChange={(event) => {
														addFiles(Array.from(event.target.files || []));
														event.currentTarget.value = "";
													}}
												/>
												<div className="flex size-12 items-center justify-center rounded-2xl border bg-background">
													<FileImage className="size-5 text-muted-foreground" />
												</div>
												<div>
													<p className="font-medium text-sm">
														Drag and drop or click to upload
													</p>
													<p className="mt-1 text-muted-foreground text-sm">
														Existing media is loaded here in edit mode.
													</p>
												</div>
											</label>
										</div>

										{state.uploads.length ? (
											<div className="space-y-3">
												<div className="flex items-center justify-between">
													<span className="font-medium text-sm">
														Media items ({state.uploads.length})
													</span>
													<span className="text-muted-foreground text-xs">
														Drag to reorder
													</span>
												</div>
												<div className="grid grid-cols-3 gap-3">
													{state.uploads.map((item, index) => (
														<MediaCard
															key={item.id}
															item={item}
															index={index}
															disabled={isBusy}
															onRemove={removeUpload}
														/>
													))}
													<label
														htmlFor="commission-files-add"
														className={cn(
															"flex aspect-video cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground",
															isBusy && "pointer-events-none opacity-50",
														)}
													>
														<input
															id="commission-files-add"
															type="file"
															multiple
															accept="image/*,video/*,.gif"
															className="sr-only"
															disabled={isBusy}
															onChange={(event) => {
																addFiles(Array.from(event.target.files || []));
																event.currentTarget.value = "";
															}}
														/>
														<Plus className="mb-1 size-5" />
														<span className="text-xs">Add more</span>
													</label>
												</div>
											</div>
										) : null}
									</div>
								) : null}

								{state.activeTab === "review" ? (
									<div className="space-y-6">
										<div className="rounded-2xl border p-5">
											<p className="font-medium text-sm">Summary</p>
											<div className="mt-4 space-y-3 text-sm">
												<div className="flex items-center justify-between border-b border-border/60 pb-3 last:border-0 last:pb-0">
													<span className="text-muted-foreground">Title</span>
													<span className="font-medium">
														{state.title || "—"}
													</span>
												</div>
												<div className="flex items-center justify-between border-b border-border/60 pb-3 last:border-0 last:pb-0">
													<span className="text-muted-foreground">
														Category
													</span>
													<span className="font-medium">
														{selectedCategoryLabel || "—"}
													</span>
												</div>
												<div className="flex items-center justify-between border-b border-border/60 pb-3 last:border-0 last:pb-0">
													<span className="text-muted-foreground">Price</span>
													<span className="font-medium">
														{state.basePrice} {state.currencyCode.toUpperCase()}
													</span>
												</div>
												<div className="flex items-center justify-between border-b border-border/60 pb-3 last:border-0 last:pb-0">
													<span className="text-muted-foreground">Media</span>
													<span className="font-medium">
														{state.uploads.length} items
													</span>
												</div>
												<div className="flex items-center justify-between border-b border-border/60 pb-3 last:border-0 last:pb-0">
													<span className="text-muted-foreground">
														Template
													</span>
													<span className="font-medium">
														{state.selectedTemplateId ? "Assigned" : "None"}
													</span>
												</div>
											</div>
										</div>

										<div className="rounded-2xl border p-5">
											<p className="font-medium text-sm">Before publishing</p>
											<div className="mt-4 space-y-3">
												{[
													{
														label: "Title and description are complete",
														done:
															state.title.length > 0 &&
															state.description.length > 0,
													},
													{
														label: "At least one media item uploaded",
														done: state.uploads.length > 0,
													},
													{ label: "Price is set", done: state.basePrice > 0 },
												].map((item) => (
													<div
														key={item.label}
														className="flex items-center gap-3"
													>
														<div
															className={cn(
																"flex size-5 items-center justify-center rounded-full",
																item.done
																	? "bg-success/20 text-success"
																	: "bg-muted",
															)}
														>
															{item.done ? (
																<Check className="size-3" />
															) : (
																<div className="size-1.5 rounded-full bg-muted-foreground/50" />
															)}
														</div>
														<span
															className={cn(
																"text-sm",
																item.done
																	? "text-foreground"
																	: "text-muted-foreground",
															)}
														>
															{item.label}
														</span>
													</div>
												))}
											</div>
										</div>

										<div className="flex items-start gap-3 rounded-xl bg-warning/10 p-4">
											<AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
											<div>
												<p className="font-medium text-sm text-warning">
													Review before publishing
												</p>
												<p className="mt-0.5 text-xs text-warning/80">
													Once published, your listing will be visible to all
													users. You can pause or edit it anytime.
												</p>
											</div>
										</div>
									</div>
								) : null}
							</div>
						</div>

						<footer className="flex shrink-0 items-center justify-between border-t border-border bg-background p-5">
							<Button
								type="button"
								variant={"ghost"}
								onClick={goPrev}
								disabled={currentStepIndex === 0 || isBusy}
							>
								<ArrowLeft className="size-4" />
								Back
							</Button>

							{state.activeTab !== "review" ? (
								<Button
									type="button"
									size={"lg"}
									onClick={goNext}
									disabled={isBusy}
								>
									Continue
									<ChevronRight />
								</Button>
							) : (
								<Button
									type="button"
									size={"lg"}
									variant={"success"}
									onClick={handleSubmit}
									disabled={!canPublish || isBusy}
								>
									{isBusy ? <Loader2 className="animate-spin" /> : <Globe />}
									{isEditMode ? "Save changes" : "Publish commission"}
								</Button>
							)}
						</footer>
					</div>
				</Stepper>
			</DialogContent>

			<FormTemplateModal
				open={uiState.isTemplateModalOpen}
				onClose={() => dispatchUi({ isTemplateModalOpen: false })}
				template={formTemplates?.find((t) => t.id === state.selectedTemplateId)}
			/>
		</Dialog>
	);
}
