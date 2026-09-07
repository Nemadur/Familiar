import { ArrowUpRightIcon, ImageIcon, PinIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { TChatCommissionReferenceSummary } from "@/hooks/chat/types";
import { cn } from "@/lib/utils";

// TODO: get and display commission info like image, title ect.

type ChatCommissionPinProps = {
	commissionRequestId?: string | null;
	commissionId?: string | null;
	reference?: TChatCommissionReferenceSummary | null;
	requestHref?: string;
	getRequestHref?: (requestId: string) => string;
	onOpenRequest?: (requestId: string) => void;
	showDebugBadges?: boolean;
	className?: string;
};

function formatPrice(amount?: number | null, currencyCode?: string | null) {
	if (amount == null || !currencyCode) return null;

	return new Intl.NumberFormat(undefined, {
		style: "currency",
		currency: currencyCode,
	}).format(amount);
}

function statusLabel(status?: string | null) {
	if (!status) return null;
	return status.replaceAll("_", " ").toLowerCase();
}

function CommissionPinAction({
	requestId,
	requestHref,
	getRequestHref,
	onOpenRequest,
}: {
	requestId: string;
	requestHref?: string;
	getRequestHref?: (requestId: string) => string;
	onOpenRequest?: (requestId: string) => void;
}) {
	const href = requestHref ?? getRequestHref?.(requestId);

	if (href) {
		return (
			<Button
				asChild
				variant="ghost"
				size="icon"
				aria-label="Open commission request"
			>
				<a href={href}>
					<ArrowUpRightIcon data-icon="inline-start" />
				</a>
			</Button>
		);
	}

	if (onOpenRequest) {
		return (
			<Button
				variant="ghost"
				size="icon"
				aria-label="Open commission request"
				onClick={() => onOpenRequest(requestId)}
			>
				<ArrowUpRightIcon data-icon="inline-start" />
			</Button>
		);
	}

	return null;
}

export function ChatCommissionPin({
	commissionRequestId,
	commissionId,
	reference,
	requestHref,
	getRequestHref,
	onOpenRequest,
	showDebugBadges = false,
	className,
}: ChatCommissionPinProps) {
	const { data, isLoading, isError, requestNotFound } =
		useChatCommissionReference({
			commissionRequestId,
			commissionId,
			reference,
		});

	const requestId = commissionRequestId ?? reference?.requestId ?? null;

	if (!requestId) return null;

	if (isLoading) {
		return (
			<div
				className={cn(
					"border-border bg-background flex items-center gap-3 border-b px-4 py-2",
					className,
				)}
			>
				<Skeleton className="size-14 rounded-md" />
				<div className="flex min-w-0 flex-1 flex-col gap-2">
					<Skeleton className="h-3 w-32" />
					<Skeleton className="h-4 w-56" />
					<Skeleton className="h-3 w-40" />
				</div>
				<Skeleton className="size-9 rounded-md" />
			</div>
		);
	}

	if (isError || !data) {
		return (
			<div
				className={cn(
					"border-border bg-background text-muted-foreground flex items-center gap-3 border-b px-4 py-2 text-sm",
					className,
				)}
			>
				<PinIcon aria-hidden="true" className="shrink-0" />
				<span className="truncate">Commission request #{srequestId}</span>
				<CommissionPinAction
					requestId={requestId}
					requestHref={requestHref}
					getRequestHref={getRequestHref}
					onOpenRequest={onOpenRequest}
				/>
			</div>
		);
	}

	const price = formatPrice(data.price, data.currencyCode);
	const label = statusLabel(data.status);

	return (
		<div
			className={cn(
				"border-border bg-background flex items-center gap-3 border-b px-4 py-2",
				className,
			)}
		>
			<div className="bg-muted border-border flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md border">
				{data.thumbnailUrl ? (
					<img
						src={data.thumbnailUrl}
						alt=""
						className="size-full object-cover"
						loading="lazy"
					/>
				) : (
					<ImageIcon aria-hidden="true" className="text-muted-foreground" />
				)}
			</div>

			<div className="flex min-w-0 flex-1 flex-col gap-1">
				<div className="text-muted-foreground flex min-w-0 items-center gap-2 text-xs">
					<PinIcon aria-hidden="true" className="shrink-0" />
					<span className="truncate">Commission request</span>
					{label ? <Badge variant="secondary">{label}</Badge> : null}
					{showDebugBadges && requestNotFound ? (
						<Badge variant="outline">request lookup failed</Badge>
					) : null}
				</div>

				<div className="text-foreground truncate text-sm font-medium">
					{data.title}
				</div>

				<div className="text-muted-foreground flex min-w-0 items-center gap-2 text-xs">
					<span className="shrink-0">#{requestId}</span>
					{price ? <span className="truncate">{price}</span> : null}
				</div>
			</div>

			<CommissionPinAction
				requestId={data.requestId}
				requestHref={requestHref}
				getRequestHref={getRequestHref}
				onOpenRequest={onOpenRequest}
			/>
		</div>
	);
}
