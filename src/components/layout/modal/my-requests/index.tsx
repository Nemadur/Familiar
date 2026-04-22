import { Surface } from "@heroui/react";
import {
	AlertTriangle,
	Check,
	ChevronDown,
	CircleDollarSign,
	Download,
	Plus,
	Star,
	ThumbsUp,
	X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { MarkdownDisplay } from "@/components/common/markdown-display";
import {
	OutlineAI,
	OutlineChat,
	OutlineCheck,
	OutlineClock03,
	OutlineClose,
	OutlineFileArchive,
	OutlineLink,
	OutlineQestionMarkCrFr,
} from "@/components/icons/icons";
import { StatusBadge } from "@/components/layout/requests/my/badges";
import {
	type DetailTab,
	formatDetailedDate,
	formatShortDate,
	getPaymentStatus,
	getRequestTimeline,
	paymentLabel,
	paymentTone,
	type RequestItem,
	shortId,
	stageLabel,
} from "@/components/layout/requests/my/helpers";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useCommission } from "@/hooks/use-commisions";
import { useUserById } from "@/hooks/use-user";
import { cn } from "@/lib/utils";
import {
	type TCommission,
	type TCommissionRequest,
	TCommissionRequestStatus,
} from "@/types/commissions";
import { TPaymentStatus } from "@/types/payment";
import type { TUserProfile } from "@/types/user";
import { RequestStatusStepper } from "../../requests/my/stepper";
import UserAvatar from "../../profile/avatar";
import { ProfileBadge } from "../../profile/badge";
import { DangerActionCard, StatusCard } from "./status-card";
import { HoldToConfirmButton } from "./confim-button";
import { RequestSectionCard } from "./tabs/request";
import { DeliveryTab } from "./tabs/delivery";
import {
	type TabItem,
	TabSelector,
} from "@/components/layout/profile/feed/selector";
import { Link } from "@tanstack/react-router";
import User from "../../profile/user";

interface RequestDetailsModalProps {
	request: RequestItem | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	viewType?: "client" | "artist";
}

function getRecordString(
	record: Record<string, unknown> | undefined,
	keys: string[],
) {
	if (!record) return undefined;
	for (const key of keys) {
		const value = record[key];
		if (typeof value === "string" && value.trim()) return value;
	}
	return undefined;
}

function getRecordNumber(
	record: Record<string, unknown> | undefined,
	keys: string[],
) {
	if (!record) return undefined;
	for (const key of keys) {
		const value = record[key];
		if (typeof value === "number" && Number.isFinite(value)) return value;
	}
	return undefined;
}

function SidebarSection({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col gap-3 px-6 pb-6">
			<span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
				{title}
			</span>
			{children}
		</div>
	);
}

function CardSection({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<Surface className="p-3 rounded-2xl">
			<h3 className="mb-3 text-lg font-bold text-prmiary">{title}</h3>
			{children}
		</Surface>
	);
}

function InfoRow({
	label,
	value,
	valueClassName,
}: {
	label: string;
	value: string;
	valueClassName?: string;
}) {
	return (
		<div className="flex items-center justify-between gap-3 px-4">
			<span className="text-xs text-muted-foreground">{label}</span>
			<span className={cn("text-xs font-medium text-prmiary", valueClassName)}>
				{value}
			</span>
		</div>
	);
}

function DeliveryFilesPlaceholder() {
	return (
		<div className="rounded-2xl border border-border/70 bg-muted/40 p-4 text-sm text-muted-foreground">
			No delivery files were attached yet.
		</div>
	);
}

function ReviewPlaceholder({
	title,
	description,
}: {
	title: string;
	description: string;
}) {
	return (
		<CardSection title={title}>
			<p className="text-xs text-muted-foreground">{description}</p>
			<div className="mt-4 rounded-2xl bg-muted/35 p-4">
				<p className="text-sm text-muted-foreground">
					No review data available yet.
				</p>
			</div>
		</CardSection>
	);
}

function ModalTabs({
	activeTab,
	setActiveTab,
	onOpenChange,
}: {
	activeTab: DetailTab;
	setActiveTab: (tab: DetailTab) => void;
	onOpenChange: (open: boolean) => void;
}) {
	const tabs: TabItem<DetailTab>[] = [
		{ id: "details", label: "Details" },
		{ id: "delivery", label: "Final delivery" },
		{ id: "review", label: "Review" },
	];

	return (
		<div className="flex items-center justify-between border-b border-border/70 px-6 pt-2 pb-[0.15rem]">
			<TabSelector
				items={tabs}
				value={activeTab}
				onValueChange={setActiveTab}
				className="-mb-px"
				size={"default"}
				// size="sm"
			/>
			<div className="flex items-center gap-2">
				<Button variant="ghost">
					<OutlineQestionMarkCrFr />
					Help
				</Button>
				<Button
					variant="ghost"
					size="icon"
					className="hidden lg:flex"
					onClick={() => onOpenChange(false)}
				>
					<OutlineClose />
				</Button>
			</div>
		</div>
	);
}

export function RequestDetailsModal({
	request,
	open,
	onOpenChange,
	viewType = "client",
}: RequestDetailsModalProps) {
	const [activeTab, setActiveTab] = useState<DetailTab>("details");

	const commissionId = request?.commissionId ?? "";
	const { data: commissionData, isError, error } = useCommission(commissionId);
	const { user: client } = useUserById(request?.clientId);
	const { user: artist } = useUserById(request?.artistId);

	useEffect(() => {
		if (isError) {
			console.error("[RequestDetailsModal] Error fetching commission:", error);
		}
	}, [isError, error]);

	useEffect(() => {
		if (!open) {
			setActiveTab("details");
		}
	}, [open]);

	const commission = commissionData as TCommission | undefined;

	const payment = request ? getPaymentStatus(request) : TPaymentStatus.Pending;
	const paymentClass = paymentTone(payment);
	const timeline = request ? getRequestTimeline(request) : null;

	const commissionRecord = (commission ?? undefined) as
		| Record<string, unknown>
		| undefined;

	const commissionTitle = useMemo(() => {
		if (!request) return "Request details";
		return (
			getRecordString(commissionRecord, ["title", "name", "displayName"]) ??
			`Commission request ${commission?.title}`
		);
	}, [commissionRecord, request, commission?.title]);

	const commissionDescription =
		getRecordString(commissionRecord, ["description", "summary", "details"]) ??
		request?.description ??
		"No additional scope details provided.";

	const commissionPrice = getRecordNumber(commissionRecord, [
		"basePrice",
		"basePriceUsd",
		"price",
		"priceUsd",
	]);

	function formatMoney(value: number) {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: commission?.currencyCode || "USD",
			maximumFractionDigits: 2,
		}).format(value);
	}

	const paymentRecord = (request?.payment ?? null) as Record<
		string,
		unknown
	> | null;
	const totalPaid =
		typeof paymentRecord?.["amount"] === "number"
			? (paymentRecord["amount"] as number)
			: (commissionPrice ?? 0);
	const listingPrice = commissionPrice ?? 0;

	if (!request) {
		return null;
	}

	const isAccepted = request.status === TCommissionRequestStatus.Accepted;
	const isPaid = payment === TPaymentStatus.Completed;
	const isCompleted = request.status === TCommissionRequestStatus.Completed;
	const shouldShowPayButton = isAccepted && !isPaid;
	const shouldShowTipButton = isAccepted && isPaid;
	const isCancelled = request.status === TCommissionRequestStatus.Cancelled;
	const isDeliveredAndPaid =
		request.status === TCommissionRequestStatus.Delivered && isPaid;

	const shouldShowArchiveAction = isDeliveredAndPaid || isCancelled;
	const shouldShowInvoiceButton = isPaid && !isCancelled;

	function getOverviewStatus({
		isCancelled,
		shouldShowPayButton,
		shouldShowTipButton,
		requestStatus,
		viewType,
	}: {
		isCancelled: boolean;
		shouldShowPayButton: boolean;
		shouldShowTipButton: boolean;
		requestStatus: TCommissionRequestStatus;
		viewType: "client" | "artist";
	}) {
		if (isCancelled) {
			return {
				icon: OutlineClose,
				tone: "danger" as const,
				title: "Request cancelled",
				description: "This commission request is no longer active.",
				meta: "Closed",
			};
		}

		if (shouldShowPayButton) {
			return {
				icon: CircleDollarSign,
				tone: "warning" as const,
				title: "Payment required",
				description:
					viewType === "artist"
						? "You have accepted this request and are waiting for the client to complete payment before work begins."
						: "This request was accepted and is waiting for payment before work begins.",
				meta: "Pending",
			};
		}

		if (requestStatus === TCommissionRequestStatus.Pending) {
			return {
				icon: OutlineClock03,
				tone: "default" as const,
				title:
					viewType === "artist"
						? "Pending response"
						: "Waiting for artist response",
				description:
					viewType === "artist"
						? "You have a new commission request waiting for your response."
						: "The artist has not responded to this request yet.",
				meta: "Pending",
				action:
					viewType === "artist"
						? {
								label: "Accept request",
								variant: "default" as const,
								onClick: () => {
									// TODO: handle accept request
								},
							}
						: undefined,
			};
		}

		if (requestStatus === TCommissionRequestStatus.Accepted) {
			return {
				icon: OutlineCheck,
				tone: "success" as const,
				title: "Accepted",
				description:
					viewType === "artist"
						? "You have accepted this request."
						: "The artist has accepted this request.",
				meta: "Accepted",
				action:
					viewType === "artist" && isPaid
						? {
								label: "Set to WIP",
								variant: "secondary" as const,
								onClick: () => {
									// TODO: handle set WIP
								},
							}
						: undefined,
			};
		}

		if (requestStatus === TCommissionRequestStatus.In_Progress) {
			return {
				icon: OutlineAI,
				tone: "accent" as const,
				title: "Work in progress",
				description:
					viewType === "artist"
						? "You are currently working on this commission."
						: "The artist is currently working on your commission.",
				meta: "In progress",
				action:
					viewType === "artist"
						? {
								label: "Final Delivery",
								variant: "secondary" as const,
								onClick: () => {
									// TODO: handle final delivery
								},
							}
						: undefined,
			};
		}

		if (requestStatus === TCommissionRequestStatus.Delivered) {
			return {
				icon: OutlineCheck,
				tone: "accent" as const,
				title: viewType === "artist" ? "Delivery sent" : "Delivery ready",
				description:
					viewType === "artist"
						? "You have sent the final delivery to the client for review."
						: "Your files are ready to review in the delivery tab.",
				meta: "Delivered",
			};
		}

		return {
			icon: OutlineClock03,
			tone: "default" as const,
			title: "Request updated",
			description: "Check the latest progress and details below.",
			meta: undefined,
		};
	}

	const overviewStatus = getOverviewStatus({
		isCancelled,
		shouldShowPayButton,
		shouldShowTipButton,
		requestStatus: request.status,
		viewType,
	});

	function SecondaryActionCard({
		title,
		description,
		buttonLabel,
		onClick,
	}: {
		title: string;
		description: string;
		buttonLabel: string;
		onClick?: () => void;
	}) {
		return (
			<div className="flex items-center justify-between gap-3 rounded-[20px] border border-border px-3 py-3">
				<div className="min-w-0">
					<h6 className="text-sm font-semibold text-primary">{title}</h6>
					<p className="text-xs text-muted-foreground">{description}</p>
				</div>

				<Button
					variant="outline"
					size="lg"
					className="shrink-0"
					onClick={onClick}
				>
					{buttonLabel}
				</Button>
			</div>
		);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="w-[min(96vw,1480px)]! max-w-[1480px]! overflow-hidden bg-secondary border-border p-0 text-prmiary shadow-2xl sm:rounded-[28px] [&>button]:hidden">
				<DialogTitle className="sr-only">Request details</DialogTitle>

				<div className="flex h-[90vh] w-full overflow-hidden">
					<div className="hidden w-sm shrink-0 flex-col border-r border-border xl:flex">
						<div className="flex flex-col gap-4 p-6">
							{/* <StatusBadge status={request.status} className="w-fit" /> */}
							{/* TODO: stepper */}
							{/* <RequestStatusStepper status={request.status} /> */}
							<div className="flex flex-col gap-1.5">
								<h2 className="text-2xl font-bold leading-tight text-primary">
									{viewType === "artist" ? (
										<>
											{client?.displayName?.trim() || "Unknown client"}'s{" "}
											{commissionTitle}
										</>
									) : (
										<>{commissionTitle}</>
									)}
								</h2>
								<span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
									COM#{request.id}
								</span>
								{/* TODO: add easy copy commission ID */}
								<span className="text-sm text-muted-foreground">
									Submitted {formatDetailedDate(request.createdAt)}
								</span>
							</div>
							<RequestStatusStepper status={request.status} />
						</div>

						<div className="flex-1 overflow-y-auto">
							<SidebarSection title="Overview">
								<Surface
									variant="default"
									className="flex flex-col gap-3 rounded-3xl p-1"
								>
									<StatusCard
										icon={overviewStatus.icon}
										tone={overviewStatus.tone}
										title={overviewStatus.title}
										description={overviewStatus.description}
										meta={overviewStatus.meta}
										action={
											overviewStatus.action ||
											(shouldShowPayButton && viewType === "client"
												? {
														label: `Pay ${formatMoney(listingPrice)}`,
														variant: "default",
													}
												: undefined)
										}
									/>

									{shouldShowTipButton &&
										!isCancelled &&
										viewType === "client" && (
											<SecondaryActionCard
												title="Enjoyed the result?"
												description="Leave an optional tip for the artist."
												buttonLabel="Leave a tip"
											/>
										)}

									{shouldShowInvoiceButton && viewType === "client" && (
										<SecondaryActionCard
											title="Invoice"
											description="Download a copy of your payment invoice."
											buttonLabel="Download invoice"
											onClick={() => {
												// TODO: download invoice
											}}
										/>
									)}

									{shouldShowArchiveAction && (
										<DangerActionCard
											title="Archive this request"
											description="Hold the button to archive this completed request."
											action={
												<HoldToConfirmButton
													onComplete={() => {
														// TODO: call archive mutation here
													}}
												>
													<OutlineFileArchive className="size-4" />
													Hold to archive
												</HoldToConfirmButton>
											}
										/>
									)}
								</Surface>
							</SidebarSection>

							<SidebarSection
								title={viewType === "artist" ? "Client" : "Artist"}
							>
								<Surface className="flex items-center gap-1 p-1 rounded-3xl">
									{/* TODO: make layout component with avatar and user info */}
									<Link
										to={
											`/${viewType === "artist" ? client?.username : artist?.username}` as string
										}
										className="flex items-start gap-3 w-full hover:bg-muted/50 rounded-2xl transition-colors"
									>
										<User
											user={
												viewType === "artist"
													? (client as TUserProfile)
													: (artist as TUserProfile)
											}
										/>
									</Link>
									{request.status === TCommissionRequestStatus.In_Progress && (
										<Button
											variant="secondary"
											size={"icon-lg"}
											aria-haspopup="false"
											className={"mr-1"}
											onClick={(e) => {
												e.preventDefault();
												// TODO: handle chat
											}}
										>
											<OutlineChat />
										</Button>
									)}
									{/* TODO: Wrap around div and below give social links */}
								</Surface>
							</SidebarSection>
						</div>

						<div className="flex flex-col border-t border-border">
							<Accordion
								type="multiple"
								// defaultValue={[""]}
								className="[&>div]:px-6 mb-2"
							>
								<AccordionItem value="terms">
									<AccordionTrigger>
										{viewType === "artist"
											? "Client Accepted Terms"
											: "Accepted Terms"}
									</AccordionTrigger>
									<AccordionContent>
										<MarkdownDisplay
											content={commission?.artistTos.tosText || ""}
										/>
									</AccordionContent>
								</AccordionItem>
								<AccordionItem value="desc">
									<AccordionTrigger>
										{commissionTitle} description
									</AccordionTrigger>
									<AccordionContent>{commissionDescription}</AccordionContent>
								</AccordionItem>
							</Accordion>
							{/* <button
								onClick={() => setTermsExpanded(!termsExpanded)}
								className="flex items-center justify-between px-6 py-4 text-sm text-muted-foreground transition-colors hover:bg-muted/40 hover:text-prmiary"
							>
								<span>Accepted Terms</span>
								{termsExpanded ? (
									<ChevronUp className="size-4" />
								) : (
									<ChevronDown className="size-4" />
								)}
							</button>
							<button
								onClick={() => setDescExpanded(!descExpanded)}
								className="flex items-center justify-between px-6 py-4 text-sm text-muted-foreground transition-colors hover:bg-muted/40 hover:text-prmiary"
							>
								<span>{commissionTitle} description</span>
								{descExpanded ? (
									<ChevronUp className="size-4" />
								) : (
									<ChevronDown className="size-4" />
								)}
							</button> */}
						</div>
					</div>

					<div className="flex min-w-0 flex-1 flex-col">
						<div className="xl:hidden">
							<div className="border-b border-border px-5 py-4">
								<div className="flex items-center justify-between gap-4">
									<button
										type="button"
										onClick={() => onOpenChange(false)}
										className="text-sm text-muted-foreground hover:text-foreground"
									>
										← Back
									</button>
									<StatusBadge status={request.status} className="w-fit" />
								</div>
								<div className="mt-4">
									<p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
										{request.id}
									</p>
									<h2 className="mt-1 text-lg font-bold text-prmiary">
										{viewType === "artist" ? (
											<>
												{client?.displayName?.trim() || "Unknown client"}'s{" "}
												{commissionTitle}
											</>
										) : (
											<>{commissionTitle}</>
										)}
									</h2>
									<p className="mt-1 text-sm text-muted-foreground">
										Submitted {formatDetailedDate(request.createdAt)}
									</p>
								</div>
							</div>
						</div>

						<ModalTabs
							activeTab={activeTab}
							setActiveTab={setActiveTab}
							onOpenChange={onOpenChange}
						/>

						<div className="min-w-0 flex-1 overflow-y-auto w-full p-6">
							{/* TODO: get all data from form */}
							{activeTab === "details" && (
								<RequestSectionCard
									request={request as TCommissionRequest}
									commission={commission as TCommission}
								/>
							)}

							{activeTab === "delivery" && (
								<div className="mx-auto flex w-full max-w-[980px] flex-col gap-6 p-5 md:p-6 xl:p-8">
									<CardSection title="Final Delivery">
										<div className="mb-1 flex items-center justify-between gap-4">
											<h4 className="text-lg font-bold text-prmiary">
												Delivery update
											</h4>
											<span className="text-xs text-muted-foreground">
												Latest update {formatDetailedDate(request.updatedAt)}
											</span>
										</div>

										<div className="mb-6 rounded-2xl border border-border/70 bg-muted/40 p-4">
											<p className="text-sm leading-relaxed text-prmiary/90">
												{request.status ===
													TCommissionRequestStatus.Delivered ||
												request.status === TCommissionRequestStatus.Completed
													? viewType === "artist"
														? "You have submitted the final delivery. The client is currently reviewing the attached files."
														: "Your commission has a delivery-stage update. Review the attached files and contact the artist if anything needs correction."
													: viewType === "artist"
														? "You haven't attached a final delivery message yet. You can use this section later to upload files and provide delivery instructions to the client."
														: "There is no final delivery message attached yet. This section can be used later for files and delivery instructions."}
											</p>
											<div className="mt-3 flex flex-col gap-1 text-xs text-muted-foreground">
												<span>
													{viewType === "artist"
														? client?.displayName
														: artist?.displayName}
												</span>
												<span>
													@
													{viewType === "artist"
														? client?.username
														: artist?.username}
												</span>
											</div>
										</div>

										<div className="mb-6">
											<span className="mb-3 block text-xs text-muted-foreground">
												Allowed uses
											</span>
											<div className="flex flex-col gap-2">
												{[
													{ label: "Personal", allowed: true },
													{
														label: "Commercial redistribution",
														allowed: false,
													},
													{ label: "Credit required", allowed: true },
												].map((item) => (
													<div
														key={item.label}
														className="flex items-center gap-3"
													>
														{item.allowed ? (
															<Check className="size-4 text-emerald-600 dark:text-emerald-400" />
														) : (
															<X className="size-4 text-muted-foreground" />
														)}
														<span
															className={cn(
																"text-sm",
																item.allowed
																	? "text-prmiary"
																	: "text-muted-foreground line-through",
															)}
														>
															{item.label}
														</span>
													</div>
												))}
											</div>
										</div>

										{request.multimedia?.length ? (
											<div className="mb-6">
												<div className="flex flex-col gap-2">
													{request.multimedia.map((media) => (
														<div
															key={media.id}
															className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/40 px-4 py-3"
														>
															<div className="flex min-w-0 flex-col">
																<span className="text-sm font-medium text-violet-600 dark:text-violet-400">
																	File {shortId(media.id, 3, 3)}
																</span>
																<span className="text-[11px] text-muted-foreground">
																	Attached media · ready to preview
																</span>
															</div>
															<button className="flex size-9 items-center justify-center rounded-xl border border-border/70 bg-background text-muted-foreground shadow-sm hover:bg-muted hover:text-prmiary">
																<Download className="size-4" />
															</button>
														</div>
													))}
												</div>
												<button className="mt-3 w-full rounded-2xl border border-border/70 bg-background py-3 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-prmiary">
													Download all files
												</button>
											</div>
										) : (
											<DeliveryFilesPlaceholder />
										)}
									</CardSection>

									<CardSection title="Verified media">
										<p className="mb-4 text-xs leading-relaxed text-muted-foreground">
											Respecting any applicable privacy arrangements, the artist
											can submit media here to represent your commission.
										</p>

										{request.multimedia?.length ? (
											<div className="mb-4 flex gap-2">
												{request.multimedia.slice(0, 4).map((media, index) => {
													const url =
														media.sizes.thumbnail ||
														media.sizes.half ||
														media.sizes.full;
													if (!url) return null;
													return (
														<div
															key={media.id}
															className="relative size-20 overflow-hidden rounded-xl border border-border/70 bg-muted"
														>
															<img
																src={url}
																alt={`Verified media ${index + 1}`}
																className="size-full object-cover"
															/>
															{index === 0 && (
																<div className="absolute left-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-emerald-500">
																	<Check className="size-3 text-white" />
																</div>
															)}
														</div>
													);
												})}
											</div>
										) : null}

										<div className="mb-4 flex items-center gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3">
											<AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
											<span className="text-xs text-amber-700 dark:text-amber-400">
												{viewType === "artist"
													? "Only upload media that accurately represents the work completed for this client."
													: "Please report if the media misrepresents the work completed."}
											</span>
										</div>

										<button className="w-full rounded-2xl border border-border/70 bg-background py-3 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-prmiary">
											{viewType === "artist" ? "Manage media" : "Report issue"}
										</button>
									</CardSection>

									<CardSection title="Tagged Characters">
										<p className="mb-4 text-xs leading-relaxed text-muted-foreground">
											Your commission&apos;s verified media may be publicly
											featured in the gallery of the characters you tag.
										</p>
										<button className="flex items-center gap-2 rounded-xl border border-border/70 bg-background px-4 py-2.5 text-sm font-medium text-prmiary shadow-sm transition-colors hover:bg-muted">
											<Plus className="size-4" />
											Add
										</button>
										<p className="mt-4 text-[11px] text-muted-foreground">
											You may remove or tag characters whenever you please, as
											long as the character curator allows it.
										</p>
									</CardSection>
								</div>
							)}

							{/* TODO: Add review (client / artist) */}
							{activeTab === "review" && (
								<DeliveryTab artist={artist as TUserProfile} />
							)}
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
