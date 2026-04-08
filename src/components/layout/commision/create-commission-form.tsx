"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
	AlertCircle,
	Check,
	CheckCircle2,
	ClipboardList,
	CloudUpload,
	DollarSign,
	ExternalLink,
	FileImage,
	Loader2,
	MessageCircle,
	Send,
	Settings2,
	Sparkles,
	Tag,
	Type,
	X,
} from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import { toast } from "sonner";
import { OutlineClose } from "@/components/icons/icons";
import { Badge } from "@/components/ui/badge";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
	Select,
	SelectContent,
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

type UploadStatus = "pending" | "uploading" | "done" | "error";
type EditorTab = "details" | "workflow" | "request-form" | "publish";

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

interface CreateCommissionResponse {
	id?: string;
	listingId?: string;
	commissionId?: string;
	data?: {
		id?: string;
		listingId?: string;
		commissionId?: string;
	};
}

const splitCsv = (value: string) =>
	value
		.split(",")
		.map((item) => item.trim())
		.filter(Boolean);

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

const statusConfig = {
	open: {
		label: "Published",
		color:
			"border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400",
	},
	waitlist: {
		label: "Waitlist",
		color:
			"border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400",
	},
	closed: {
		label: "Closed",
		color:
			"border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-400",
	},
} as const;

const navItems = [
	{ key: "details", name: "Details", icon: ClipboardList },
	{ key: "workflow", name: "Workflow", icon: Settings2 },
	{ key: "request-form", name: "Request Form", icon: MessageCircle },
	{ key: "publish", name: "Publish", icon: Send },
] as const satisfies ReadonlyArray<{
	key: EditorTab;
	name: string;
	icon: React.ComponentType<{ className?: string }>;
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
		<section className="space-y-5">
			<div className="space-y-1">
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
	children,
}: {
	label: string;
	htmlFor?: string;
	hint?: string;
	children: ReactNode;
}) {
	return (
		<div className="space-y-2.5">
			<div className="flex items-center justify-between gap-3">
				<Label htmlFor={htmlFor} className="text-sm font-medium">
					{label}
				</Label>
				{hint && (
					<span className="text-[11px] text-muted-foreground">{hint}</span>
				)}
			</div>
			{children}
		</div>
	);
}

function StatusPill({ status }: { status: "open" | "closed" | "waitlist" }) {
	return (
		<Badge className={cn("text-[11px]", statusConfig[status].color)}>
			{statusConfig[status].label}
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
		<div className="flex items-start gap-3 rounded-xl border border-border/70 px-3 py-3">
			<div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
				<FileImage className="size-4 text-muted-foreground" />
			</div>

			<div className="min-w-0 flex-1 space-y-1.5">
				<div className="flex items-start justify-between gap-3">
					<div className="min-w-0">
						<p className="truncate text-sm font-medium">{item.file.name}</p>
						<p className="text-[11px] text-muted-foreground">
							{formatBytes(item.file.size)}
						</p>
					</div>

					<div className="flex shrink-0 items-center gap-1">
						{item.status === "done" && (
							<CheckCircle2 className="size-4 text-emerald-500" />
						)}
						{item.status === "error" && (
							<AlertCircle className="size-4 text-destructive" />
						)}
						{item.status === "uploading" && (
							<Loader2 className="size-4 animate-spin text-primary" />
						)}

						<Button
							type="button"
							variant="ghost"
							size="icon"
							className="size-7 rounded-lg"
							onClick={() => onRemove(item.id)}
							disabled={disabled}
						>
							<X className="size-3.5" />
						</Button>
					</div>
				</div>

				{item.status !== "pending" && (
					<Progress value={item.progress} className="h-1.5 rounded-full" />
				)}

				{item.error && (
					<p className="text-[11px] text-destructive">{item.error}</p>
				)}
			</div>
		</div>
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

	const [activeTab, setActiveTab] = useState<EditorTab>("details");

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [basePriceUsd, setBasePriceUsd] = useState("50");
	const [status, setStatus] = useState<"open" | "closed" | "waitlist">("open");
	const [serviceType, setServiceType] = useState<
		"custom_service" | "personalized_ych" | ""
	>("custom_service");
	const [communicationType, setCommunicationType] = useState<
		"open_communication" | "surprise_me" | ""
	>("open_communication");
	const [requestingProcess, setRequestingProcess] = useState<
		"custom_proposal" | "instant_order" | ""
	>("custom_proposal");
	const [tagsInput, setTagsInput] = useState("");
	const [contentWarningsInput, setContentWarningsInput] = useState("");
	const [uploads, setUploads] = useState<UploadQueueItem[]>([]);
	const [createdListingId, setCreatedListingId] = useState<string | null>(null);
	const [isCreating, setIsCreating] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [isDragging, setIsDragging] = useState(false);

	const [linkCommissionService, setLinkCommissionService] = useState(false);
	const [markAsMature, setMarkAsMature] = useState(false);

	const apiBaseUrl = import.meta.env.VITE_API_URL as string | undefined;
	const createCommissionUrl = import.meta.env.VITE_COMMISSIONS_CREATE_URL as
		| string
		| undefined;
	const uploadCommissionUrlTemplate = import.meta.env
		.VITE_COMMISSIONS_UPLOAD_URL_TEMPLATE as string | undefined;

	const parsedTags = useMemo(() => splitCsv(tagsInput), [tagsInput]);
	const parsedWarnings = useMemo(
		() => splitCsv(contentWarningsInput),
		[contentWarningsInput],
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

	const isBusy = isCreating || isUploading;
	const hasCreated = Boolean(createdListingId);

	const numericPrice = Number(basePriceUsd);
	const isPriceValid =
		basePriceUsd.trim().length > 0 &&
		Number.isFinite(numericPrice) &&
		numericPrice >= 0;

	const detailsReady =
		title.trim().length >= 3 && description.trim().length >= 10 && isPriceValid;

	const workflowReady =
		Boolean(serviceType) &&
		Boolean(communicationType) &&
		Boolean(requestingProcess);

	const canPublish = detailsReady && workflowReady && !isBusy && !hasCreated;

	const updateUpload = (id: string, next: Partial<UploadQueueItem>) => {
		setUploads((prev) =>
			prev.map((item) => (item.id === id ? { ...item, ...next } : item)),
		);
	};

	const removeUpload = (id: string) => {
		if (isUploading) return;
		setUploads((prev) => prev.filter((item) => item.id !== id));
	};

	const getAuthHeaders = (token?: string): Headers => {
		const headers = new Headers();
		if (token) headers.set("Authorization", `Bearer ${token}`);
		return headers;
	};

	const resolveCreateUrl = () => {
		if (createCommissionUrl) return createCommissionUrl;
		if (apiBaseUrl) return `${apiBaseUrl.replace(/\/$/, "")}/commissions`;
		throw new Error("Missing API URL.");
	};

	const resolveUploadUrl = (listingId: string) => {
		if (uploadCommissionUrlTemplate) {
			return uploadCommissionUrlTemplate.replace("{listingId}", listingId);
		}
		if (apiBaseUrl) {
			return `${apiBaseUrl.replace(/\/$/, "")}/commissions/${listingId}/files`;
		}
		throw new Error("Missing upload URL.");
	};

	const extractListingId = (response: CreateCommissionResponse) =>
		response.listingId ||
		response.id ||
		response.commissionId ||
		response.data?.listingId ||
		response.data?.id ||
		response.data?.commissionId ||
		null;

	const addFiles = (files: File[]) => {
		if (files.length === 0) return;

		setUploads((prev) => {
			const existing = new Set(prev.map((item) => fileKey(item.file)));
			const next: UploadQueueItem[] = [];

			for (const file of files) {
				const key = fileKey(file);
				if (existing.has(key)) continue;
				existing.add(key);

				next.push({
					id: toUploadId(),
					file,
					progress: 0,
					status: "pending",
				});
			}

			return [...prev, ...next];
		});
	};

	const startUploadQueue = async (
		listingId: string,
		items: UploadQueueItem[],
		token?: string,
	) => {
		if (items.length === 0) {
			return { successCount: 0, failureCount: 0 };
		}

		let successCount = 0;
		let failureCount = 0;

		setIsUploading(true);

		try {
			for (const item of items) {
				updateUpload(item.id, {
					status: "uploading",
					progress: 20,
					error: undefined,
				});

				try {
					updateUpload(item.id, { progress: 60 });

					const formData = new FormData();
					formData.append("file", item.file);
					formData.append("listingId", listingId);
					formData.append("fileName", item.file.name);
					formData.append(
						"mimeType",
						item.file.type || "application/octet-stream",
					);
					formData.append("sizeBytes", String(item.file.size));

					const response = await fetch(resolveUploadUrl(listingId), {
						method: "POST",
						headers: getAuthHeaders(token),
						body: formData,
					});

					if (!response.ok) {
						const message = await response.text();
						failureCount += 1;
						updateUpload(item.id, {
							status: "error",
							progress: 100,
							error: message || "Upload failed",
						});
					} else {
						successCount += 1;
						updateUpload(item.id, {
							status: "done",
							progress: 100,
						});
					}
				} catch (error) {
					failureCount += 1;
					updateUpload(item.id, {
						status: "error",
						progress: 100,
						error: error instanceof Error ? error.message : "Upload failed",
					});
				}
			}
		} finally {
			setIsUploading(false);
			queryClient.invalidateQueries({
				queryKey: ["profile-content", artistId, "commissions"],
			});
		}

		return { successCount, failureCount };
	};

	const handlePublish = async () => {
		if (!canPublish) {
			if (!detailsReady) {
				toast.error("Fill title, description, and valid base price first.");
				setActiveTab("details");
				return;
			}

			if (!workflowReady) {
				toast.error("Finish the workflow section first.");
				setActiveTab("workflow");
				return;
			}

			return;
		}

		try {
			setIsCreating(true);

			const {
				data: { session },
			} = await supabase.auth.getSession();

			const headers = getAuthHeaders(session?.access_token);
			headers.set("Content-Type", "application/json");

			const queuedFilesSnapshot = [...uploads];

			const response = await fetch(resolveCreateUrl(), {
				method: "POST",
				headers,
				body: JSON.stringify({
					artistId,
					title: title.trim(),
					description: description.trim(),
					basePriceUsd: Number(basePriceUsd),
					status,
					serviceType: serviceType || undefined,
					communicationType: communicationType || undefined,
					requestingProcess: requestingProcess || undefined,
					tags: parsedTags,
					contentWarnings: markAsMature
						? Array.from(new Set([...parsedWarnings, "mature"]))
						: parsedWarnings,
					filesCount: queuedFilesSnapshot.length,
					linkCommissionService,
				}),
			});

			if (!response.ok) {
				const message = await response.text();
				throw new Error(message || "Failed to create commission");
			}

			const payload = (await response.json()) as CreateCommissionResponse;
			const listingId = extractListingId(payload);

			if (!listingId) {
				throw new Error("Create response does not contain commission ID");
			}

			setCreatedListingId(listingId);

			if (queuedFilesSnapshot.length > 0) {
				await startUploadQueue(
					listingId,
					queuedFilesSnapshot,
					session?.access_token,
				);
			}

			toast.success("Commission created successfully.");
			setActiveTab("publish");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to create commission",
			);
		} finally {
			setIsCreating(false);
		}
	};

	const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		addFiles(Array.from(event.target.files || []));
		event.currentTarget.value = "";
	};

	const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
		event.preventDefault();
		setIsDragging(false);
		addFiles(Array.from(event.dataTransfer.files));
	};

	const currentTabLabel =
		navItems.find((item) => item.key === activeTab)?.name ?? "Details";

	return (
		<Dialog open={true} onOpenChange={(open) => !open && !isBusy && onClose()}>
			<DialogContent
				showCloseButton={false}
				className="overflow-hidden rounded-[28px] p-0 md:max-h-[760px] md:max-w-[1180px]"
			>
				<DialogTitle className="sr-only">Create commission</DialogTitle>
				<DialogDescription className="sr-only">
					Create and publish a commission listing.
				</DialogDescription>

				<SidebarProvider className="items-start min-h-full!">
					<Sidebar
						collapsible="none"
						className="hidden border-r bg-background md:flex"
					>
						<SidebarContent>
							<SidebarGroup>
								<SidebarGroupContent className="space-y-6 p-3">
									<div className="space-y-1">
										<p className="text-sm font-semibold">New Commission</p>
										<p className="text-xs text-muted-foreground">
											Unpublished draft
										</p>
									</div>
									{/* <StatusPill status={status} /> */}

									<SidebarMenu>
										{navItems.map((item) => (
											<SidebarMenuItem key={item.key}>
												<SidebarMenuButton
													// asChild
													onClick={() => setActiveTab(item.key)}
													isActive={activeTab === item.key}
												>
													<item.icon />
													{item.name}
													{item.key === "details" && detailsReady && (
														<Check className="ml-auto size-4 text-emerald-500" />
													)}
													{item.key === "workflow" && workflowReady && (
														<Check className="ml-auto size-4 text-emerald-500" />
													)}
												</SidebarMenuButton>
											</SidebarMenuItem>
										))}
									</SidebarMenu>

									{/* <div className="space-y-4">
										<div className="space-y-2">
											<p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
												Status
											</p>
											<Select
												value={status}
												onValueChange={(value) =>
													setStatus(value as typeof status)
												}
												disabled={isBusy}
											>
												<SelectTrigger className="h-10 rounded-xl">
													<StatusPill status={status} />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="open">
														<StatusPill status="open" />
													</SelectItem>
													<SelectItem value="waitlist">
														<StatusPill status="waitlist" />
													</SelectItem>
													<SelectItem value="closed">
														<StatusPill status="closed" />
													</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div> */}

									{/* <Separator /> */}
								</SidebarGroupContent>
							</SidebarGroup>
							<SidebarGroup className="flex-1 h-full justify-end">
								<SidebarGroupContent className="space-y-6 p-3">
									<div className="space-y-4">
										<div className="flex items-start justify-between gap-4">
											<div className="space-y-1">
												<p className="text-sm font-medium">
													Link commission service
												</p>
												<p className="text-xs leading-relaxed text-muted-foreground">
													Link visitors to request this listing.
												</p>
											</div>
											<Switch
												checked={linkCommissionService}
												onCheckedChange={setLinkCommissionService}
												disabled={isBusy}
											/>
										</div>

										<div className="flex items-start justify-between gap-4">
											<div className="space-y-1">
												<p className="text-sm font-medium">
													Mark as Mature Content
												</p>
												<p className="text-xs leading-relaxed text-muted-foreground">
													Not suitable for all audiences.
												</p>
											</div>
											<Switch
												checked={markAsMature}
												onCheckedChange={setMarkAsMature}
												disabled={isBusy}
											/>
										</div>
									</div>
								</SidebarGroupContent>
							</SidebarGroup>
						</SidebarContent>
					</Sidebar>

					<main className="flex h-[720px] flex-1 flex-col overflow-hidden bg-background">
						<header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b pl-6 pr-4">
							<Button onClick={() => onClose()} size={"icon"} variant={"ghost"}>
								<OutlineClose />
							</Button>

							<div className="flex gap-2">
								<StatusPill status={status} />
								{createdListingId && (
									<Button
										variant="outline"
										size="sm"
										onClick={() =>
											navigate({
												to: `/${username}/${tab}/${createdListingId}`,
												replace: true,
											})
										}
										className="gap-2 rounded-full"
									>
										<ExternalLink className="size-4" />
										Open
									</Button>
								)}

								<Button
									size="sm"
									onClick={handlePublish}
									disabled={!canPublish}
									className="rounded-full"
								>
									{isBusy ? (
										<span className="inline-flex items-center gap-2">
											<Loader2 className="size-4 animate-spin" />
											{isCreating ? "Publishing..." : "Uploading..."}
										</span>
									) : hasCreated ? (
										"Published"
									) : (
										"Publish"
									)}
								</Button>
							</div>
						</header>

						<div className="flex-1 overflow-y-auto">
							<div className="mx-auto w-full px-6 py-8">
								{activeTab === "details" && (
									<div className="space-y-8">
										<FlatSection
											title="Basic information"
											description="This is what the client sees first."
										>
											<div className="space-y-6">
												<FieldGroup label="Title" htmlFor="commission-title">
													<InputGroup>
														<InputGroupAddon>
															<Type className="size-4" />
														</InputGroupAddon>
														<InputGroupInput
															id="commission-title"
															value={title}
															onChange={(event) => setTitle(event.target.value)}
															placeholder="New commission"
															disabled={isBusy}
														/>
													</InputGroup>
												</FieldGroup>

												<FieldGroup
													label="Media"
													hint="Max 8 files. JPG, PNG, GIF, WEBP, PDF"
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
															isBusy && "pointer-events-none opacity-50",
														)}
													>
														<input
															id="commission-files"
															type="file"
															multiple
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
																Optional reference files
															</p>
														</div>
													</label>
												</FieldGroup>

												<FieldGroup
													label="Description"
													htmlFor="commission-description"
												>
													<Textarea
														id="commission-description"
														value={description}
														onChange={(event) =>
															setDescription(event.target.value)
														}
														placeholder="Add a backstory, caption, details, or whatever else you'd like to include."
														disabled={isBusy}
														className="min-h-40 resize-none rounded-2xl"
													/>
												</FieldGroup>

												<FieldGroup
													label="Base price"
													htmlFor="commission-price"
												>
													<div className="max-w-xs">
														<InputGroup>
															<InputGroupAddon>
																<DollarSign className="size-4" />
															</InputGroupAddon>
															<InputGroupInput
																id="commission-price"
																type="number"
																min={0}
																step={1}
																value={basePriceUsd}
																onChange={(event) =>
																	setBasePriceUsd(event.target.value)
																}
																disabled={isBusy}
																placeholder="50"
															/>
														</InputGroup>
													</div>
												</FieldGroup>
											</div>
										</FlatSection>

										{uploads.length > 0 && (
											<>
												<Separator />
												<FlatSection
													title="Queued files"
													description="Remove anything you do not want to upload."
												>
													<div className="space-y-2.5">
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

								{activeTab === "workflow" && (
									<div className="space-y-8">
										<FlatSection
											title="Workflow"
											description="Define how the commission works."
										>
											<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
												<FieldGroup label="Service type">
													<Select
														value={serviceType}
														onValueChange={(value) =>
															setServiceType(value as typeof serviceType)
														}
														disabled={isBusy}
													>
														<SelectTrigger className="rounded-xl">
															<SelectValue placeholder="Select..." />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="custom_service">
																Custom service
															</SelectItem>
															<SelectItem value="personalized_ych">
																Personalized YCH
															</SelectItem>
														</SelectContent>
													</Select>
												</FieldGroup>

												<FieldGroup label="Communication">
													<Select
														value={communicationType}
														onValueChange={(value) =>
															setCommunicationType(
																value as typeof communicationType,
															)
														}
														disabled={isBusy}
													>
														<SelectTrigger className="rounded-xl">
															<SelectValue placeholder="Select..." />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="open_communication">
																Open communication
															</SelectItem>
															<SelectItem value="surprise_me">
																Surprise me
															</SelectItem>
														</SelectContent>
													</Select>
												</FieldGroup>

												<FieldGroup label="Request process">
													<Select
														value={requestingProcess}
														onValueChange={(value) =>
															setRequestingProcess(
																value as typeof requestingProcess,
															)
														}
														disabled={isBusy}
													>
														<SelectTrigger className="rounded-xl">
															<SelectValue placeholder="Select..." />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="custom_proposal">
																Custom proposal
															</SelectItem>
															<SelectItem value="instant_order">
																Instant order
															</SelectItem>
														</SelectContent>
													</Select>
												</FieldGroup>
											</div>
										</FlatSection>
									</div>
								)}

								{activeTab === "request-form" && (
									<div className="space-y-8">
										<FlatSection
											title="Request form"
											description="Help clients understand and filter the listing."
										>
											<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
												<FieldGroup
													label="Tags"
													htmlFor="commission-tags"
													hint="comma separated"
												>
													<InputGroup>
														<InputGroupAddon>
															<Tag className="size-4" />
														</InputGroupAddon>
														<InputGroupInput
															id="commission-tags"
															value={tagsInput}
															onChange={(event) =>
																setTagsInput(event.target.value)
															}
															placeholder="portrait, fantasy, sfw"
															disabled={isBusy}
														/>
													</InputGroup>

													{parsedTags.length > 0 && (
														<div className="flex flex-wrap gap-1.5 pt-1">
															{parsedTags.map((tag) => (
																<span
																	key={tag}
																	className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary"
																>
																	{tag}
																</span>
															))}
														</div>
													)}
												</FieldGroup>

												<FieldGroup
													label="Content warnings"
													htmlFor="commission-cw"
													hint="comma separated"
												>
													<InputGroup>
														<InputGroupAddon>
															<AlertCircle className="size-4" />
														</InputGroupAddon>
														<InputGroupInput
															id="commission-cw"
															value={contentWarningsInput}
															onChange={(event) =>
																setContentWarningsInput(event.target.value)
															}
															placeholder="nsfw, blood"
															disabled={isBusy}
														/>
													</InputGroup>

													{parsedWarnings.length > 0 && (
														<div className="flex flex-wrap gap-1.5 pt-1">
															{parsedWarnings.map((warning) => (
																<span
																	key={warning}
																	className="inline-flex items-center rounded-full bg-destructive/10 px-2.5 py-1 text-[11px] font-medium text-destructive"
																>
																	{warning}
																</span>
															))}
														</div>
													)}
												</FieldGroup>
											</div>
										</FlatSection>
									</div>
								)}

								{activeTab === "publish" && (
									<div className="space-y-8">
										<FlatSection
											title="Publish"
											description="Final review before creating the listing."
										>
											<div className="space-y-6">
												<div className="space-y-2">
													<p className="text-sm font-medium">
														{title.trim() || "Untitled commission"}
													</p>
													<p className="text-sm leading-relaxed text-muted-foreground">
														{description.trim() || "No description yet."}
													</p>
												</div>

												<div className="flex flex-wrap items-center gap-2">
													<StatusPill status={status} />
													{markAsMature && (
														<span className="inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium">
															Mature
														</span>
													)}
													<span className="inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium">
														{isPriceValid
															? `$${Number(basePriceUsd)}`
															: "No price"}
													</span>
												</div>

												<div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
													<SidebarInfoRow
														label="Service type"
														value={serviceType || "—"}
													/>
													<SidebarInfoRow
														label="Communication"
														value={communicationType || "—"}
													/>
													<SidebarInfoRow
														label="Process"
														value={requestingProcess || "—"}
													/>
													<SidebarInfoRow
														label="Files"
														value={uploads.length}
													/>
												</div>

												{createdListingId && (
													<div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 dark:border-emerald-900 dark:bg-emerald-950/20">
														<div className="flex items-start gap-3">
															<CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
															<div>
																<p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
																	Commission created
																</p>
																<p className="mt-1 text-xs text-emerald-700/90 dark:text-emerald-300/90">
																	ID: {createdListingId}
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
