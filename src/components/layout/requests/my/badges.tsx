import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TCommissionRequestStatus } from "@/types/commissions";
import type { TPaymentStatus } from "@/types/payment";
import { paymentLabel, paymentTone, stageLabel, statusTone } from "./helpers";

export function StatusBadge({
	status,
	className,
}: {
	status: TCommissionRequestStatus;
	className?: string;
}) {
	const tone = statusTone(status);

	return (
		<span
			className={cn(
				"inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
				tone.bg,
				tone.text,
				tone.border,
				className,
			)}
		>
			{stageLabel(status)}
		</span>
	);
}

export function PaymentText({
	status,
	className,
}: {
	status: TPaymentStatus;
	className?: string;
}) {
	return (
		<span className={cn("text-sm font-medium", paymentTone(status), className)}>
			{paymentLabel(status)}
		</span>
	);
}

export function SoftMetaBadge({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<Badge
			variant="outline"
			className={cn(
				"rounded-full border-border/70 bg-muted/50 px-2.5 py-1 text-[11px] font-medium text-muted-foreground shadow-sm",
				className,
			)}
		>
			{children}
		</Badge>
	);
}
