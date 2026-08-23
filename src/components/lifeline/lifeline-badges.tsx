import { cn } from "@/lib/utils";

import type { LifelineBadge } from "./types";

export function LifelineBadges({
	badges,
	className,
}: {
	badges: LifelineBadge[];
	className?: string;
}) {
	if (badges.length === 0) {
		return null;
	}

	return (
		<div className={cn("flex items-center justify-start gap-2", className)}>
			{badges.map((badge, index) => {
				const Icon = badge.icon;

				return (
					<span
						key={`${badge.label}-${index}`}
						title={badge.label}
						aria-label={badge.label}
						className={cn(
							"inline-flex size-6 shrink-0 items-center justify-center text-foreground opacity-80 transition-opacity duration-300 group-hover:opacity-100",
							badge.sizeClassName,
						)}
					>
						<Icon className="size-full" />
					</span>
				);
			})}
		</div>
	);
}
