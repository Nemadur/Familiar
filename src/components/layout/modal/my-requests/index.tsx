import { Surface } from "@heroui/react";
import {
	AlertTriangle,
	Archive,
	BadgeCheck,
	Check,
	ChevronDown,
	ChevronUp,
	Circle,
	Download,
	Link2,
	MessageSquare,
	Plus,
	Sparkles,
	Star,
	ThumbsUp,
	X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Markdown from "react-markdown";
import { MarkdownDisplay } from "@/components/common/markdown-display";
import {
	OutlineChat,
	OutlineCircle,
	OutlineQestionMarkCrFr,
} from "@/components/icons/icons";
import { StatusBadge } from "@/components/layout/my-requests/badges";
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
} from "@/components/layout/my-requests/helpers";
import { Stepper } from "@/components/reui/stepper";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useCommission } from "@/hooks/use-commisions";
import { useUserById } from "@/hooks/use-user";
import { cn } from "@/lib/utils";
import {
	type TCommission,
	TCommissionRequestStatus,
} from "@/types/commissions";
import { TPaymentStatus } from "@/types/payment";
import type { TUserProfile } from "@/types/user";
import { RequestStatusStepper } from "../../my-requests/stepper";
import UserAvatar from "../../profile/avatar";
import { ProfileBadge } from "../../profile/badge";

interface RequestDetailsModalProps {
	request: RequestItem | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
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
		<Surface className="p-3 rounded-3xl">
			<h3 className="mb-3 text-lg font-bold text-foreground">{title}</h3>
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
			<span
				className={cn("text-xs font-medium text-foreground", valueClassName)}
			>
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
}: {
	activeTab: DetailTab;
	setActiveTab: (tab: DetailTab) => void;
}) {
	return (
		<div className="flex items-center justify-between border-b border-border/70 px-6">
			<div className="flex">
				{(["details", "delivery", "review"] as const).map((tab) => (
					<button
						key={tab}
						onClick={() => setActiveTab(tab)}
						className={cn(
							"relative px-5 py-4 text-sm font-medium transition-colors",
							activeTab === tab
								? "text-foreground"
								: "text-muted-foreground hover:text-foreground",
						)}
					>
						{tab === "details"
							? "Details"
							: tab === "delivery"
								? "Final delivery"
								: "Review"}
						{activeTab === tab && (
							<div className="absolute inset-x-0 bottom-0 h-0.5 bg-foreground" />
						)}
					</button>
				))}
			</div>
			<Button variant="ghost">
				<OutlineQestionMarkCrFr />
				Help
			</Button>
			{/* <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
				<Circle className="size-3.5" />
				Help
			</button> */}
		</div>
	);
}

export function RequestDetailsModal({
	request,
	open,
	onOpenChange,
}: RequestDetailsModalProps) {
	const [activeTab, setActiveTab] = useState<DetailTab>("details");
	const [termsExpanded, setTermsExpanded] = useState(false);
	const [descExpanded, setDescExpanded] = useState(false);

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
			setTermsExpanded(false);
			setDescExpanded(false);
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

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="!w-[min(96vw,1480px)] !max-w-[1480px] overflow-hidden bg-secondary border-border p-0 text-foreground shadow-2xl sm:rounded-[28px] [&>button]:hidden">
				<DialogTitle className="sr-only">Request details</DialogTitle>

				<div className="flex h-[90vh] w-full overflow-hidden">
					<div className="hidden w-sm shrink-0 flex-col border-r border-border xl:flex">
						<div className="flex flex-col gap-4 p-6">
							{/* <StatusBadge status={request.status} className="w-fit" /> */}
							{/* TODO: stepper */}
							{/* <RequestStatusStepper status={request.status} /> */}
							<div className="flex flex-col gap-1.5">
								{/* <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
									COM#{request.id}
								</span> */}
								<h2 className="text-2xl font-bold leading-tight text-foreground">
									{/* TODO: get client displayName */}
									{client?.displayName?.trim() || "Unknown client"}'s{" "}
									{commissionTitle}
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

						<div className="flex flex-col gap-2 px-6 pb-6">
							<Button className="w-full" variant={"secondary"} size={"xl"}>
								Download invoices
							</Button>
							{/* TODO: for danger add (hold to confirm) */}
							<Button className="w-full" variant={"destructive"} size={"xl"}>
								Archive (hold to confirm)
							</Button>
						</div>

						<div className="flex-1 overflow-y-auto">
							<SidebarSection title="Overview">
								{/* TODO: TIP artist */}
								<Surface
									variant={"default"}
									className="p-4 rounded-3xl gap-4 flex flex-col"
								>
									{request.status === TCommissionRequestStatus.Accepted && (
										<div className="relative flex flex-col gap-2.5">
											<div className="flex flex-col">
												<h6 className="text-md font-semibold text-foreground">
													Love your commission?
												</h6>
												<span className="text-xs leading-relaxed text-muted-foreground">
													Show your support and leave a TIP!
												</span>
											</div>

											<Button className="w-full" size={"xl"}>
												Leave a TIP
											</Button>
											{/* <Button
												className="w-full"
												variant={"outline"}
												size={"xl"}
											>
												How TIP works
											</Button> */}
										</div>
									)}
									<div className="flex flex-col gap-3 rounded-2xl border border-border bg-card py-4">
										<InfoRow
											label="Payment"
											value={paymentLabel(payment)}
											valueClassName={paymentClass}
										/>
										<InfoRow
											label="Total paid"
											value={formatMoney(totalPaid)}
											valueClassName="text-sm font-bold text-foreground"
										/>
										<Separator />
										<InfoRow
											label="Estimated start"
											value={stageLabel(request.status)}
										/>
										{timeline && (
											<InfoRow
												label="Guaranteed by"
												value={timeline.primary} //TODO: get finish date
											/>
										)}
									</div>
								</Surface>

								{/* <div className="flex flex-col gap-3 rounded-[24px] border border-border/70 bg-card p-4 shadow-sm">
									<InfoRow
										label="Payment"
										value={paymentLabel(payment)}
										valueClassName={paymentClass}
									/>
									<InfoRow
										label="Total paid"
										value={formatMoney(totalPaid)}
										valueClassName="text-sm font-bold text-foreground"
									/>
									<div className="h-px bg-border/70" />
									<InfoRow
										label="Current stage"
										value={stageLabel(request.status)}
									/>
									{timeline && (
										<InfoRow label="Timeline" value={timeline.primary} />
									)}
								</div> */}
							</SidebarSection>

							<SidebarSection title="Artist">
								<Surface className="flex items-start gap-3 p-1 rounded-3xl">
									{/* TODO: make layout component with avatar and user info */}
									<UserAvatar user={artist as TUserProfile} />
									<div className="flex flex-1 flex-col">
										<h3 className="inline-flex w-full gap-2 font-bold text-sm">
											{/* TODO: make auto slide text if too more than 12 characters */}
											<span className="truncate">{artist?.displayName}</span>
											<ProfileBadge user={artist as TUserProfile} />
										</h3>
										<p className="text-xs text-muted-foreground">
											@{artist?.username}
										</p>
									</div>
									<Button
										variant="secondary"
										size={"icon-lg"}
										aria-haspopup="false"
									>
										<OutlineChat />
									</Button>{" "}
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
									<AccordionTrigger>Accepted Terms</AccordionTrigger>
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
								className="flex items-center justify-between px-6 py-4 text-sm text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
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
								className="flex items-center justify-between px-6 py-4 text-sm text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
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
									<h2 className="mt-1 text-lg font-bold text-foreground">
										{commissionTitle}
									</h2>
									<p className="mt-1 text-sm text-muted-foreground">
										Submitted {formatDetailedDate(request.createdAt)}
									</p>
								</div>
							</div>
						</div>

						<ModalTabs activeTab={activeTab} setActiveTab={setActiveTab} />

						<div className="min-w-0 flex-1 overflow-y-auto">
							{activeTab === "details" && (
								<div className="mx-auto flex w-full flex-col gap-8 p-5">
									{/* TODO: put here all commision request data client selected in request form */}
									<CardSection title="Request">
										<Surface
											variant={"secondary"}
											className="mb-6 flex items-center gap-4 rounded-2xl p-1 pr-4"
										>
											<div className="flex h-full items-center justify-center overflow-hidden rounded-xl border border-border text-sm font-semibold text-foreground">
												<img
													src={
														commission?.multimedia[0]?.sizes?.thumbnail || ""
													}
													alt={commissionTitle}
													className="size-full object-cover"
												/>
											</div>
											<div className="flex min-w-0 flex-1 flex-col">
												<h4 className="font-semibold">{commission?.title}</h4>
											</div>
											{listingPrice > 0 && (
												<span className="text-sm text-muted-foreground">
													From {formatMoney(listingPrice)}
												</span>
											)}
										</Surface>

										<div className="mb-5">
											<span className="mb-3 block text-xs text-muted-foreground">
												How will you be using this commission?
											</span>
											<div className="flex flex-col gap-2.5">
												{/* TODO: we can re-use components from form component  but disabled inputs*/}
												<label className="flex items-center gap-3 rounded-xl border border-border/70 bg-background/70 px-3 py-3">
													<div className="flex size-5 items-center justify-center rounded-full border-2 border-foreground bg-foreground">
														<div className="size-2 rounded-full bg-background" />
													</div>
													<span className="text-sm text-foreground">
														Personal
													</span>
													<span className="ml-auto text-xs text-muted-foreground">
														Included
													</span>
												</label>
											</div>
										</div>

										{/* <div className="mb-5">
											<span className="mb-3 block text-xs text-muted-foreground">
												Quantity
											</span>
											<div className="flex items-center gap-3">
												<button className="flex size-9 items-center justify-center rounded-xl border border-border/70 bg-background text-muted-foreground shadow-sm">
													-
												</button>
												<span className="w-8 text-center text-lg font-semibold text-foreground">
													1
												</span>
												<button className="flex size-9 items-center justify-center rounded-xl border border-border/70 bg-background text-muted-foreground shadow-sm">
													+
												</button>
											</div>
										</div> */}

										<div>
											<span className="mb-3 block text-xs text-muted-foreground">
												References and Files
											</span>
											{request.multimedia?.length ? (
												<div className="flex flex-col gap-2">
													{request.multimedia.map((media) => {
														const url =
															media.sizes.thumbnail ||
															media.sizes.half ||
															media.sizes.full;
														return (
															<div
																key={media.id}
																className="flex items-center gap-3 rounded-2xl border border-border/70 bg-muted/40 px-3 py-3"
															>
																<Link2 className="size-4 text-violet-500" />
																<div className="flex min-w-0 flex-1 flex-col">
																	<span className="truncate text-sm font-medium text-foreground">
																		Attachment {shortId(media.id, 3, 3)}
																	</span>
																	{url && (
																		<span className="truncate text-[11px] text-muted-foreground">
																			{url}
																		</span>
																	)}
																</div>
																<button className="text-muted-foreground hover:text-foreground">
																	&times;
																</button>
															</div>
														);
													})}
												</div>
											) : (
												<div className="rounded-2xl border border-border/70 bg-muted/40 px-4 py-4 text-sm text-muted-foreground">
													No references attached.
												</div>
											)}
										</div>
									</CardSection>

									<CardSection title="Proposal">
										<div className="mb-5">
											<span className="mb-2 block text-xs text-muted-foreground">
												Scope
											</span>
											<div className="rounded-2xl border border-border/70 bg-muted/40 p-4">
												<p className="text-sm leading-relaxed text-foreground/90">
													{request.description}
												</p>
											</div>
										</div>

										{/* <div className="mb-5">
											<span className="mb-3 block text-xs text-muted-foreground">
												Timeline
											</span>
											<div className="flex flex-col gap-3">
												<div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background/65 px-4 py-3">
													<div className="mt-1 size-2 rounded-full bg-emerald-500" />
													<div className="flex flex-col">
														<span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
															Current stage
														</span>
														<span className="text-[11px] text-muted-foreground">
															Latest request progress on the platform.
														</span>
													</div>
													<span className="ml-auto text-sm text-foreground">
														{stageLabel(request.status)}
													</span>
												</div>
												{timeline && (
													<div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background/65 px-4 py-3">
														<div className="mt-1 size-2 rounded-full bg-amber-500" />
														<div className="flex flex-col">
															<span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
																Timeline note
															</span>
															<span className="text-[11px] text-muted-foreground">
																Derived from the latest request status.
															</span>
														</div>
														<span className="ml-auto text-sm text-foreground">
															{timeline.secondary}
														</span>
													</div>
												)}
											</div>
										</div> */}

										<div>
											<span className="mb-3 block text-xs text-muted-foreground">
												Payment
											</span>
											<div className="rounded-2xl border border-border/70 bg-muted/40 p-4">
												<div className="mb-3 flex items-center justify-between">
													<span className="text-xs text-muted-foreground">
														Project subtotal
													</span>
													<span className="text-sm text-foreground">
														{formatMoney(listingPrice)}
													</span>
												</div>
												{payment !== TPaymentStatus.Completed && (
													<div className="mb-3 flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2.5">
														<div className="size-2 rounded-full bg-amber-500" />
														<span className="text-xs font-medium text-amber-700 dark:text-amber-400">
															Payment pending or incomplete
														</span>
														<span className="ml-auto text-xs text-muted-foreground">
															{formatShortDate(request.createdAt)}
														</span>
														<button className="rounded-md border border-border/70 bg-background px-2 py-1 text-[10px] font-medium text-foreground shadow-sm">
															Invoice
														</button>
													</div>
												)}
												<div className="flex items-center justify-between border-t border-border/70 pt-3">
													<span className="text-xs text-muted-foreground">
														Total paid
													</span>
													<span className="text-lg font-bold text-foreground">
														{formatMoney(totalPaid)}
													</span>
												</div>
											</div>
										</div>
									</CardSection>
								</div>
							)}

							{activeTab === "delivery" && (
								<div className="mx-auto flex w-full max-w-[980px] flex-col gap-6 p-5 md:p-6 xl:p-8">
									<CardSection title="Final Delivery">
										<div className="mb-1 flex items-center justify-between gap-4">
											<h4 className="text-lg font-bold text-foreground">
												Delivery update
											</h4>
											<span className="text-xs text-muted-foreground">
												Latest update {formatDetailedDate(request.updatedAt)}
											</span>
										</div>

										<div className="mb-6 rounded-2xl border border-border/70 bg-muted/40 p-4">
											<p className="text-sm leading-relaxed text-foreground/90">
												{request.status ===
													TCommissionRequestStatus.Delivered ||
												request.status === TCommissionRequestStatus.Completed
													? "Your commission has a delivery-stage update. Review the attached files and contact the artist if anything needs correction."
													: "There is no final delivery message attached yet. This section can be used later for files and delivery instructions."}
											</p>
											<div className="mt-3 flex flex-col gap-1 text-xs text-muted-foreground">
												<span>{artist?.displayName}</span>
												<span>@{artist?.username}</span>
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
																	? "text-foreground"
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
															<button className="flex size-9 items-center justify-center rounded-xl border border-border/70 bg-background text-muted-foreground shadow-sm hover:bg-muted hover:text-foreground">
																<Download className="size-4" />
															</button>
														</div>
													))}
												</div>
												<button className="mt-3 w-full rounded-2xl border border-border/70 bg-background py-3 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground">
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
												Please report if the media misrepresents the work
												completed.
											</span>
										</div>

										<button className="w-full rounded-2xl border border-border/70 bg-background py-3 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground">
											Report issue
										</button>
									</CardSection>

									<CardSection title="Tagged Characters">
										<p className="mb-4 text-xs leading-relaxed text-muted-foreground">
											Your commission&apos;s verified media may be publicly
											featured in the gallery of the characters you tag.
										</p>
										<button className="flex items-center gap-2 rounded-xl border border-border/70 bg-background px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted">
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
								<div className="mx-auto flex w-full max-w-[980px] flex-col gap-6 p-5 md:p-6 xl:p-8">
									<CardSection title={`${artist?.username} left you a review`}>
										<p className="mb-5 text-xs text-muted-foreground">
											This review is now visible to artists when you submit a
											commission request.
										</p>
										<div className="rounded-2xl border border-border/70 bg-muted/40 p-4">
											<div className="mb-3 flex items-center gap-3">
												<div className="flex size-8 items-center justify-center overflow-hidden rounded-full border border-border/70 bg-background shadow-sm">
													<UserAvatar user={artist as TUserProfile} />
												</div>
												<div className="flex items-center gap-2">
													<ThumbsUp className="size-4 text-emerald-600 dark:text-emerald-400" />
													<span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
														Recommend
													</span>
												</div>
												<span className="ml-auto text-xs text-muted-foreground">
													Recent
												</span>
											</div>
											<div className="mb-3 flex flex-wrap gap-1.5">
												{[
													"Respectful",
													"Clear requirements",
													"Helpful feedback",
													"Very responsive",
												].map((tag) => (
													<span
														key={tag}
														className="rounded-lg border border-border/70 bg-background px-2.5 py-1 text-xs text-foreground shadow-sm"
													>
														{tag}
													</span>
												))}
											</div>
											<button className="text-xs text-violet-600 hover:underline dark:text-violet-400">
												Difficulties:
											</button>
											<p className="mt-3 text-xs text-muted-foreground">
												Anonymize semi-public review
											</p>
										</div>
									</CardSection>

									<CardSection
										title={`Thanks for leaving a review for ${artist?.username}`}
									>
										<p className="mb-5 text-xs text-muted-foreground">
											Your feedback helps make the platform safer for everyone.
										</p>
										<div className="rounded-2xl border border-border/70 bg-muted/40 p-4">
											<div className="mb-3 flex items-center gap-2">
												<div className="flex items-center gap-0.5">
													{[1, 2, 3, 4, 5].map((star) => (
														<Star
															key={star}
															className="size-4 fill-amber-400 text-amber-400"
														/>
													))}
												</div>
												<span className="text-xs text-muted-foreground">
													Recent
												</span>
												<button className="ml-auto text-muted-foreground hover:text-foreground">
													<ChevronDown className="size-4" />
												</button>
											</div>
											<div className="mb-3 flex flex-wrap gap-1.5">
												{["Professional", "Clear communication"].map((tag) => (
													<span
														key={tag}
														className="rounded-lg border border-border/70 bg-background px-2.5 py-1 text-xs text-foreground shadow-sm"
													>
														{tag}
													</span>
												))}
											</div>
											<p className="text-xs text-muted-foreground">
												Anonymize semi-public review
											</p>
										</div>
									</CardSection>
								</div>
							)}
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
