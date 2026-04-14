import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { OutlineWarning } from "@/components/icons/icons";

type StatusCardProps = {
	icon: React.ReactNode;
	title: string;
	description?: string;
	meta?: string;
	tone?: "default" | "success" | "warning" | "danger" | "accent";
	action?: {
		label: string;
		onClick?: () => void;
		variant?: "default" | "outline" | "secondary";
	};
};

export function StatusCard({
	icon: Icon,
	title,
	description,
	meta,
	tone = "default",
	action,
}: StatusCardProps) {
	const toneStyles = {
		default: {
			wrap: "border-border",
			iconWrap: "bg-muted text-muted-foreground",
			meta: "text-muted-foreground",
		},
		success: {
			wrap: "border-emerald-200/60 dark:border-emerald-900/40",
			iconWrap: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
			meta: "text-emerald-600 dark:text-emerald-400",
		},
		warning: {
			wrap: "border-border",
			iconWrap: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
			meta: "text-violet-600 dark:text-violet-400",
		},
		danger: {
			wrap: "border-red-200/60 dark:border-red-900/40",
			iconWrap: "bg-red-500/10 text-red-600 dark:text-red-400",
			meta: "text-red-600 dark:text-red-400",
		},
		accent: {
			wrap: "border-border",
			iconWrap: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
			meta: "text-sky-600 dark:text-sky-400",
		},
	}[tone];

	return (
		<div className={cn("rounded-[20px] border px-3 py-3", toneStyles.wrap)}>
			<div className="flex items-start gap-3">
				<div
					className={cn(
						"flex size-9 shrink-0 items-center justify-center rounded-xl",
						toneStyles.iconWrap,
					)}
				>
					<Icon className="size-4" />
				</div>

				<div className="min-w-0 flex-1">
					<div className="flex items-start justify-between gap-3">
						<div className="min-w-0">
							<h6 className="text-sm font-semibold text-foreground">{title}</h6>
							{description ? (
								<p className="mt-1 text-xs leading-relaxed text-muted-foreground">
									{description}
								</p>
							) : null}
						</div>

						{meta ? (
							<span
								className={cn(
									"shrink-0 text-[11px] font-medium",
									toneStyles.meta,
								)}
							>
								{meta}
							</span>
						) : null}
					</div>

					{action ? (
						<Button
							className="mt-3 w-full"
							size="xl"
							variant={action.variant ?? "default"}
							onClick={action.onClick}
						>
							{action.label}
						</Button>
					) : null}
				</div>
			</div>
		</div>
	);
}

export function DangerActionCard({
	title,
	description,
	action,
}: {
	title: string;
	description: string;
	action: React.ReactNode;
}) {
	return (
		<div className="rounded-[20px] border border-destructive/20 bg-card px-3 py-3">
			<div className="flex items-start gap-3">
				<div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
					<OutlineWarning className="size-4" />
				</div>

				<div className="min-w-0 flex-1">
					<h6 className="text-sm font-semibold text-foreground">{title}</h6>
					<p className="mt-1 text-xs leading-relaxed text-muted-foreground">
						{description}
					</p>

					<div className="mt-3">{action}</div>
				</div>
			</div>
		</div>
	);
}
