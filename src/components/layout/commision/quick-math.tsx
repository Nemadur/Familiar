import { OutlineReceipt } from "@/components/icons/icons";
import { cn } from "@/lib/utils";

interface QuickMathItem {
	label: string;
	value: number;
	isDiscount?: boolean;
	discountPercentage?: number;
}

interface QuickMathProps {
	basePrice: number;
	originalPrice?: number;
	items: QuickMathItem[];
	total: number;
	className?: string;
}

export function QuickMath({
	basePrice,
	originalPrice,
	items,
	total,
	className,
}: QuickMathProps) {
	const savings = originalPrice ? originalPrice - basePrice : 0;
	const discountPercentage = originalPrice
		? Math.round(((originalPrice - basePrice) / originalPrice) * 100)
		: 0;

	return (
		<div
			className={cn(
				"absolute bottom-0 left-full ml-4 hidden w-80 rounded-2xl border bg-card p-6 shadow-lg lg:block",
				className,
			)}
		>
			<div className="mb-6 flex items-center gap-2 text-muted-foreground">
				<OutlineReceipt className="size-5" />
				<h3 className="font-semibold">Quick math</h3>
				<span className="ml-auto text-xs opacity-70">
					Internal reference use only
				</span>
			</div>

			<div className="space-y-6">
				{/* Base Price */}
				<div className="flex items-center justify-between border-border/50 border-b pb-4">
					<div className="flex flex-col gap-0.5">
						<span className="font-medium text-sm">Base price</span>
						<span className="text-muted-foreground text-xs">From service</span>
					</div>
					<div className="rounded-lg bg-secondary/30 px-3 py-1.5 font-mono text-sm">
						{originalPrice && (
							<span className="mr-2 text-muted-foreground text-xs line-through opacity-70">
								{originalPrice.toFixed(2)}
							</span>
						)}
						{basePrice.toFixed(2)} USD
					</div>
				</div>

				{/* Savings */}
				{savings > 0 && (
					<div className="flex items-center justify-between border-border/50 border-b pb-4">
						<div className="flex flex-col gap-0.5">
							<span className="font-medium text-sm">Savings</span>
							<div className="flex items-center gap-1 text-primary text-xs">
								<span className="flex size-3.5 items-center justify-center rounded-full bg-primary/20 font-bold text-[10px]">
									%
								</span>
								{discountPercentage}% off
							</div>
						</div>
						<div className="rounded-lg bg-primary/5 px-3 py-1.5 font-mono text-primary text-sm">
							- {savings.toFixed(2)} USD
						</div>
					</div>
				)}

				{/* Dynamic Items */}
				{items.length > 0 && (
					<div className="space-y-3 border-border/50 border-b pb-4">
						{items.map((item) => (
							<div
								key={item.label}
								className="flex items-center justify-between"
							>
								<div className="flex flex-col">
									<span className="font-medium text-sm">{item.label}</span>
								</div>
								<div
									className={cn(
										"rounded-lg px-3 py-1 font-mono text-sm",
										item.isDiscount
											? "bg-primary/10 text-primary"
											: "bg-secondary/30",
									)}
								>
									{item.isDiscount ? "-" : "+"}{" "}
									{Math.abs(item.value).toFixed(2)} USD
								</div>
							</div>
						))}
					</div>
				)}

				{/* Total */}
				<div className="flex items-center justify-between pt-2">
					<div className="flex flex-col gap-0.5">
						<span className="font-medium text-base">Project subtotal</span>
						<span className="text-muted-foreground text-xs">
							For all services
						</span>
					</div>
					{/* TODO: change USD to exchange */}
					<div className="rounded-lg bg-secondary/50 px-4 py-2 font-bold font-mono text-base">
						{total.toFixed(2)} USD
					</div>
				</div>
			</div>

			<div className="mt-6 text-muted-foreground text-xs leading-relaxed">
				<span className="mr-1 inline-block rounded-full border px-1.5 text-[10px]">
					i
				</span>
				Note that this is an auto-generated estimate based on your request and
				should not be considered as the final price.
			</div>
		</div>
	);
}
