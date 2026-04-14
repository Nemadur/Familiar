import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
	AlertCircle,
	ArrowRight,
	CheckCircle2,
	ChevronLeft,
	CloudUpload,
	DollarSign,
	ExternalLink,
	FileImage,
	Loader2,
	Sparkles,
	Tag,
	X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

type UploadStatus = "pending" | "uploading" | "done" | "error";

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
		.filter((item) => item.length > 0);

const toUploadId = () =>
	typeof crypto !== "undefined" && "randomUUID" in crypto
		? crypto.randomUUID()
		: `upload-${Date.now()}-${Math.random().toString(16).slice(2)}`;

type FormStep = 0 | 1;

function FieldGroup({
	label,
	htmlFor,
	hint,
	children,
	className,
}: {
	label: string;
	htmlFor?: string;
	hint?: string;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div className={cn("space-y-1.5", className)}>
			<div className="flex items-baseline justify-between gap-2">
				<Label
					htmlFor={htmlFor}
					className="text-sm font-medium text-foreground"
				>
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

function SectionCard({
	icon,
	title,
	description,
	children,
}: {
	icon?: React.ReactNode;
	title: string;
	description?: string;
	children?: React.ReactNode;
}) {
	return (
		<div className="rounded-xl border bg-card">
			<div className="flex items-start gap-3 border-b px-4 py-3">
				{icon && (
					<div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
						{icon}
					</div>
				)}
				<div>
					<p className="text-sm font-semibold leading-tight">{title}</p>
					{description && (
						<p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
					)}
				</div>
			</div>
			{children && <div className="p-4">{children}</div>}
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
	const [step, setStep] = useState<FormStep>(0);
	const [isDragging, setIsDragging] = useState(false);

	const doneCount = useMemo(
		() => uploads.filter((item) => item.status === "done").length,
		[uploads],
	);
	const errorCount = useMemo(
		() => uploads.filter((item) => item.status === "error").length,
		[uploads],
	);
	const apiBaseUrl = import.meta.env.VITE_API_URL as string | undefined;
	const createCommissionUrl = import.meta.env.VITE_COMMISSIONS_CREATE_URL as
		| string
		| undefined;
	const uploadCommissionUrlTemplate = import.meta.env
		.VITE_COMMISSIONS_UPLOAD_URL_TEMPLATE as string | undefined;

	const isBusy = isCreating || isUploading;
	const totalProgress = useMemo(() => {
		if (uploads.length === 0) return 0;
		const sum = uploads.reduce((acc, item) => acc + item.progress, 0);
		return Math.round(sum / uploads.length);
	}, [uploads]);
	const canSubmit =
		title.trim().length >= 3 &&
		description.trim().length >= 10 &&
		Number(basePriceUsd) >= 0 &&
		!isBusy;
	const canProceedToFiles =
		title.trim().length >= 3 &&
		description.trim().length >= 10 &&
		Number(basePriceUsd) >= 0;

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
		if (uploadCommissionUrlTemplate)
			return uploadCommissionUrlTemplate.replace("{listingId}", listingId);
		if (apiBaseUrl)
			return `${apiBaseUrl.replace(/\/$/, "")}/commissions/${listingId}/files`;
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
		setUploads((prev) => [
			...prev,
			...files.map((file) => ({
				id: toUploadId(),
				file,
				progress: 0,
				status: "pending" as const,
			})),
		]);
	};

	const startUploadQueue = async (listingId: string, token?: string) => {
		if (uploads.length === 0) return;
		setIsUploading(true);
		for (const item of uploads) {
			updateUpload(item.id, { status: "uploading", progress: 20, error: undefined });
			try {
				updateUpload(item.id, { progress: 60 });
				const formData = new FormData();
				formData.append("file", item.file);
				formData.append("listingId", listingId);
				formData.append("fileName", item.file.name);
				formData.append("mimeType", item.file.type || "application/octet-stream");
				formData.append("sizeBytes", String(item.file.size));
				const response = await fetch(resolveUploadUrl(listingId), {
					method: "POST",
					headers: getAuthHeaders(token),
					body: formData,
				});
				if (!response.ok) {
					const message = await response.text();
					updateUpload(item.id, { status: "error", progress: 100, error: message || "Upload failed" });
				} else {
					updateUpload(item.id, { status: "done", progress: 100 });
				}
			} catch (error) {
				updateUpload(item.id, {
					status: "error",
					progress: 100,
					error: error instanceof Error ? error.message : "Upload failed",
				});
			}
		}
		setIsUploading(false);
		queryClient.invalidateQueries({ queryKey: ["profile-content", artistId, "commissions"] });
	};

	const handleCreate = async () => {
		if (!canSubmit) return;
		try {
			setIsCreating(true);
			const { data: { session } } = await supabase.auth.getSession();
			const headers = getAuthHeaders(session?.access_token);
			headers.set("Content-Type", "application/json");
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
					tags: splitCsv(tagsInput),
					contentWarnings: splitCsv(contentWarningsInput),
					filesCount: uploads.length,
				}),
			});
			if (!response.ok) {
				const message = await response.text();
				throw new Error(message || "Failed to create commission");
			}
			const createdPayload = (await response.json()) as CreateCommissionResponse;
			const listingId = extractListingId(createdPayload);
			if (!listingId) throw new Error("Create response does not contain commission ID");

			setCreatedListingId(listingId);
			if (uploads.length > 0) {
				await startUploadQueue(listingId, session?.access_token);
				toast.success("Commission created and files uploaded");
			} else {
				toast.success("Commission created successfully");
			}
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to create commission");
		} finally {
			setIsCreating(false);
		}
	};

	const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		addFiles(Array.from(event.target.files || []));
		event.currentTarget.value = "";
	};

	const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		setIsDragging(false);
		addFiles(Array.from(event.dataTransfer.files));
	};

	const statusConfig = {
		open: { label: "Open", color: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400" },
		waitlist: { label: "Waitlist", color: "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-400" },
		closed: { label: "Closed", color: "text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-400" },
	} as const;

	return (
		<Dialog open={true} onOpenChange={(open) => !open && onClose()}>
			<DialogContent
				showCloseButton={false}
				className="flex max-h-[90vh] w-full max-w-lg flex-col gap-0 overflow-hidden rounded-2xl p-0 shadow-2xl"
			>
				{/* ── Header ── */}
				<DialogHeader className="shrink-0 px-6 pt-5 pb-0 text-left">
					<div className="flex items-start justify-between gap-3">
						<div>
							<div className="mb-1 flex items-center gap-2">
								<div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
									<Sparkles className="size-4" />
								</div>
								<DialogTitle className="text-lg font-semibold">
									New Commission
								</DialogTitle>
							</div>
							<DialogDescription className="text-xs text-muted-foreground">
								Fill in the details, then optionally attach reference files.
							</DialogDescription>
						</div>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							onClick={onClose}
							disabled={isBusy}
							className="shrink-0 rounded-lg text-muted-foreground hover:text-foreground"
						>
							<X className="size-4" />
						</Button>
					</div>

					{/* ── Step indicator ── */}
					<div className="mt-4 flex items-center gap-3">
						{(["Details", "Files & Review"] as const).map((label, i) => (
							<div key={label} className="flex items-center gap-2">
								{i > 0 && (
									<div
										className={cn(
											"h-px w-8 transition-colors",
											step >= i ? "bg-primary" : "bg-border",
										)}
									/>
								)}
								<button
									type="button"
									onClick={() => i < step && setStep(i as FormStep)}
									disabled={i >= step || isBusy}
									className="flex items-center gap-1.5 disabled:pointer-events-none"
								>
									<div
										className={cn(
											"flex size-5 items-center justify-center rounded-full text-[11px] font-semibold transition-all",
											step === i
												? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
												: step > i
													? "bg-primary/20 text-primary"
													: "bg-muted text-muted-foreground",
										)}
									>
										{step > i ? <CheckCircle2 className="size-3" /> : i + 1}
									</div>
									<span
										className={cn(
											"text-xs font-medium transition-colors",
											step === i
												? "text-foreground"
												: step > i
													? "text-primary"
													: "text-muted-foreground",
										)}
									>
										{label}
									</span>
								</button>
							</div>
						))}
					</div>
					<Separator className="mt-4" />
				</DialogHeader>

				{/* ── Body ── */}
				<div className="flex-1 overflow-y-auto px-6 py-5">
					{step === 0 && (
						<div className="space-y-5">
							{/* Core info */}
							<SectionCard
								icon={<Sparkles className="size-3.5" />}
								title="Listing info"
								description="Give your commission a clear title and description."
							>
								<div className="space-y-4">
									<FieldGroup label="Title" htmlFor="commission-title">
										<Input
											id="commission-title"
											value={title}
											onChange={(e) => setTitle(e.target.value)}
											placeholder="e.g. Stylized portrait commission"
											disabled={isBusy}
											className="rounded-lg"
										/>
									</FieldGroup>
									<FieldGroup label="Description" htmlFor="commission-description" hint="min. 10 chars">
										<Textarea
											id="commission-description"
											value={description}
											onChange={(e) => setDescription(e.target.value)}
											placeholder="Describe what's included, your process, turnaround time…"
											className="min-h-28 resize-none rounded-lg text-sm leading-relaxed"
											disabled={isBusy}
										/>
									</FieldGroup>
								</div>
							</SectionCard>

							{/* Pricing & status */}
							<SectionCard
								icon={<DollarSign className="size-3.5" />}
								title="Pricing & availability"
							>
								<div className="grid grid-cols-2 gap-4">
									<FieldGroup label="Base price (USD)" htmlFor="commission-price" className="col-span-1">
										<div className="relative">
											<DollarSign className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
											<Input
												id="commission-price"
												type="number"
												min={0}
												step={1}
												value={basePriceUsd}
												onChange={(e) => setBasePriceUsd(e.target.value)}
												disabled={isBusy}
												className="rounded-lg pl-8"
											/>
										</div>
									</FieldGroup>
									<FieldGroup label="Status" className="col-span-1">
										<Select
											value={status}
											onValueChange={(v) => setStatus(v as typeof status)}
											disabled={isBusy}
										>
											<SelectTrigger className="w-full rounded-lg">
												<div className="flex items-center gap-2">
													<span
														className={cn(
															"inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border",
															statusConfig[status].color,
														)}
													>
														{statusConfig[status].label}
													</span>
												</div>
											</SelectTrigger>
											<SelectContent>
												{(["open", "waitlist", "closed"] as const).map((s) => (
													<SelectItem key={s} value={s}>
														<span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border", statusConfig[s].color)}>
															{statusConfig[s].label}
														</span>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</FieldGroup>
								</div>
							</SectionCard>

							{/* Options */}
							<SectionCard
								icon={<ArrowRight className="size-3.5" />}
								title="Commission options"
								description="Define how clients interact with this listing."
							>
								<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
									<FieldGroup label="Service type">
										<Select
											value={serviceType}
											onValueChange={(v) => setServiceType(v as typeof serviceType)}
											disabled={isBusy}
										>
											<SelectTrigger className="w-full rounded-lg text-xs">
												<SelectValue placeholder="Select…" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="custom_service">Custom service</SelectItem>
												<SelectItem value="personalized_ych">Personalized YCH</SelectItem>
											</SelectContent>
										</Select>
									</FieldGroup>
									<FieldGroup label="Communication">
										<Select
											value={communicationType}
											onValueChange={(v) => setCommunicationType(v as typeof communicationType)}
											disabled={isBusy}
										>
											<SelectTrigger className="w-full rounded-lg text-xs">
												<SelectValue placeholder="Select…" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="open_communication">Open comm.</SelectItem>
												<SelectItem value="surprise_me">Surprise me</SelectItem>
											</SelectContent>
										</Select>
									</FieldGroup>
									<FieldGroup label="Process">
										<Select
											value={requestingProcess}
											onValueChange={(v) => setRequestingProcess(v as typeof requestingProcess)}
											disabled={isBusy}
										>
											<SelectTrigger className="w-full rounded-lg text-xs">
												<SelectValue placeholder="Select…" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="custom_proposal">Custom proposal</SelectItem>
												<SelectItem value="instant_order">Instant order</SelectItem>
											</SelectContent>
										</Select>
									</FieldGroup>
								</div>
							</SectionCard>

							{/* Tags */}
							<SectionCard
								icon={<Tag className="size-3.5" />}
								title="Tags & content warnings"
								description="Help clients discover and filter your work."
							>
								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
									<FieldGroup label="Tags" htmlFor="commission-tags" hint="comma separated">
										<Input
											id="commission-tags"
											value={tagsInput}
											onChange={(e) => setTagsInput(e.target.value)}
											placeholder="portrait, fantasy, sfw"
											disabled={isBusy}
											className="rounded-lg text-sm"
										/>
										{tagsInput && (
											<div className="mt-2 flex flex-wrap gap-1">
												{splitCsv(tagsInput).map((tag) => (
													<span
														key={tag}
														className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
													>
														{tag}
													</span>
												))}
											</div>
										)}
									</FieldGroup>
									<FieldGroup label="Content warnings" htmlFor="commission-cw" hint="comma separated">
										<Input
											id="commission-cw"
											value={contentWarningsInput}
											onChange={(e) => setContentWarningsInput(e.target.value)}
											placeholder="nsfw, blood"
											disabled={isBusy}
											className="rounded-lg text-sm"
										/>
										{contentWarningsInput && (
											<div className="mt-2 flex flex-wrap gap-1">
												{splitCsv(contentWarningsInput).map((cw) => (
													<span
														key={cw}
														className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive"
													>
														{cw}
													</span>
												))}
											</div>
										)}
									</FieldGroup>
								</div>
							</SectionCard>
						</div>
					)}

					{step === 1 && (
						<div className="space-y-5">
							{/* Summary card */}
							<div className="rounded-xl border bg-card p-4">
								<div className="flex items-start justify-between gap-3">
									<div className="min-w-0">
										<div className="flex items-center gap-2">
											<CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
											<p className="text-sm font-semibold">Details saved</p>
										</div>
										<p className="mt-0.5 truncate text-sm text-muted-foreground">{title}</p>
										{createdListingId && (
											<p className="mt-1 font-mono text-[11px] text-muted-foreground">
												ID: {createdListingId}
											</p>
										)}
									</div>
									<div className="shrink-0 text-right">
										<p className="text-lg font-bold">${basePriceUsd}</p>
										<span
											className={cn(
												"inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium",
												statusConfig[status].color,
											)}
										>
											{statusConfig[status].label}
										</span>
									</div>
								</div>

								{uploads.length > 0 && (
									<>
										<Separator className="my-3" />
										<div className="space-y-1.5">
											<div className="flex items-center justify-between text-xs">
												<span className="text-muted-foreground">Upload progress</span>
												<span className="font-medium tabular-nums">
													{doneCount}/{uploads.length} done
													{errorCount > 0 && (
														<span className="ml-2 text-destructive">
															· {errorCount} failed
														</span>
													)}
												</span>
											</div>
											<Progress value={totalProgress} className="h-1.5 rounded-full" />
										</div>
									</>
								)}
							</div>

							{/* Drop zone */}
							<SectionCard
								icon={<CloudUpload className="size-3.5" />}
								title="Reference files"
								description="Attach images or documents clients should see."
							>
								<div
									onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
									onDragLeave={() => setIsDragging(false)}
									onDrop={handleDrop}
									className={cn(
										"relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 transition-colors",
										isDragging
											? "border-primary bg-primary/5"
											: "border-border hover:border-primary/50 hover:bg-muted/30",
										isBusy && "pointer-events-none opacity-50",
									)}
								>
									<input
										id="commission-files"
										type="file"
										multiple
										onChange={handleFilesChange}
										disabled={isBusy}
										className="absolute inset-0 cursor-pointer opacity-0"
									/>
									<div className="flex size-10 items-center justify-center rounded-xl bg-muted">
										<FileImage className="size-5 text-muted-foreground" />
									</div>
									<div className="text-center">
										<p className="text-sm font-medium">
											{isDragging ? "Drop files here" : "Drag & drop or click to browse"}
										</p>
										<p className="mt-0.5 text-xs text-muted-foreground">
											PNG, JPG, GIF, PDF and more
										</p>
									</div>
									{uploads.length > 0 && (
										<Badge variant="secondary" className="mt-1">
											{uploads.length} file{uploads.length !== 1 ? "s" : ""} queued
										</Badge>
									)}
								</div>

								{uploads.length > 0 && (
									<div className="mt-4 space-y-2">
										{uploads.map((item) => (
											<div
												key={item.id}
												className={cn(
													"flex items-center gap-3 rounded-xl border p-3 transition-colors",
													item.status === "done" && "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20",
													item.status === "error" && "border-destructive/30 bg-destructive/5",
												)}
											>
												<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
													<FileImage className="size-4 text-muted-foreground" />
												</div>
												<div className="min-w-0 flex-1 space-y-1">
													<div className="flex items-center justify-between gap-2">
														<p className="truncate text-sm font-medium leading-none">
															{item.file.name}
														</p>
														<div className="flex shrink-0 items-center gap-1.5">
															{item.status === "done" && (
																<CheckCircle2 className="size-3.5 text-emerald-500" />
															)}
															{item.status === "error" && (
																<AlertCircle className="size-3.5 text-destructive" />
															)}
															{item.status === "uploading" && (
																<Loader2 className="size-3.5 animate-spin text-primary" />
															)}
															<Button
																type="button"
																variant="ghost"
																size="icon"
																className="size-6 rounded-md text-muted-foreground hover:text-destructive"
																onClick={() => removeUpload(item.id)}
																disabled={isUploading}
															>
																<X className="size-3" />
															</Button>
														</div>
													</div>
													<p className="text-[11px] text-muted-foreground">
														{(item.file.size / 1024 / 1024).toFixed(2)} MB
													</p>
													{item.status !== "pending" && (
														<Progress
															value={item.progress}
															className={cn(
																"h-1 rounded-full",
																item.status === "error" && "[&>div]:bg-destructive",
																item.status === "done" && "[&>div]:bg-emerald-500",
															)}
														/>
													)}
													{item.error && (
														<p className="text-[11px] text-destructive">{item.error}</p>
													)}
												</div>
											</div>
										))}
									</div>
								)}
							</SectionCard>
						</div>
					)}
				</div>

				{/* ── Footer ── */}
				<div className="shrink-0 border-t bg-muted/30 px-6 py-4">
					<div className="flex items-center justify-between gap-3">
						<Button
							variant="ghost"
							onClick={() => {
								if (step === 0) { onClose(); return; }
								setStep(0);
							}}
							disabled={isBusy}
							className="gap-1.5 text-muted-foreground hover:text-foreground"
						>
							{step === 0 ? (
								<>Cancel</>
							) : (
								<>
									<ChevronLeft className="size-4" />
									Back
								</>
							)}
						</Button>

						<div className="flex items-center gap-2">
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
									className="gap-1.5"
								>
									<ExternalLink className="size-3.5" />
									Open listing
								</Button>
							)}

							{step === 0 ? (
								<Button
									onClick={() => setStep(1)}
									disabled={!canProceedToFiles || isBusy}
									className="gap-1.5 px-5"
								>
									Continue
									<ArrowRight className="size-4" />
								</Button>
							) : (
								<Button
									onClick={handleCreate}
									disabled={!canSubmit}
									className="gap-1.5 px-5"
								>
									{isBusy ? (
										<Loader2 className="size-4 animate-spin" />
									) : (
										<CheckCircle2 className="size-4" />
									)}
									{isBusy
										? isCreating
											? "Creating…"
											: "Uploading…"
										: uploads.length > 0
											? "Create & upload"
											: "Create commission"}
								</Button>
							)}
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
