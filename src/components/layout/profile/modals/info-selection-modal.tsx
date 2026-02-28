import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export interface InfoOption {
	id: string;
	label: string;
	description: string;
	icon?: LucideIcon;
	tooltip?: string;
}

interface InfoSelectionModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string;
	options: InfoOption[];
	selectedId: string;
}

export function InfoSelectionModal({
	open,
	onOpenChange,
	title,
	description,
	options,
	selectedId,
}: InfoSelectionModalProps) {
	const { t } = useTranslation();

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md overflow-hidden flex flex-col">
				<DialogHeader>
					<DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
					<p className="text-sm text-muted-foreground">{description}</p>
				</DialogHeader>

				<div className="flex flex-col gap-3 py-4">
					{options.map((option) => {
						const isSelected = option.id === selectedId;
						const Icon = option.icon;

						return (
							<div
								key={option.id}
								className={cn(
									"relative flex items-center gap-4 rounded-2xl border p-4 transition-all",
									isSelected
										? "border-primary/20 bg-primary/5"
										: "bg-card hover:bg-secondary/50",
								)}
							>
								{Icon && (
									<div
										className={cn(
											"flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
											isSelected
												? "bg-primary/10 text-primary"
												: "bg-secondary text-muted-foreground",
										)}
									>
										<Icon className="h-5 w-5" />
									</div>
								)}

								<div className="flex-1 space-y-0.5">
									<h4 className="font-semibold text-base">{option.label}</h4>
									<p className="text-muted-foreground text-sm">
										{option.description}
									</p>
								</div>

								{isSelected && (
									<div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
										<Check className="h-3 w-3" />
									</div>
								)}
							</div>
						);
					})}
				</div>
			</DialogContent>
		</Dialog>
	);
}
