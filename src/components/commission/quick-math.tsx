import { cn } from "@/lib/utils";

interface QuickMathProps {
  basePrice: number;
  originalPrice: number;
  items: { label: string; value: number }[];
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
  return (
    <div
      className={cn(
        "space-y-4 rounded-xl border bg-card p-6 text-card-foreground shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-sm font-medium">
          Base Price
        </span>
        <div className="flex flex-col items-end">
          <span className="font-medium">${basePrice.toFixed(2)}</span>
          {originalPrice > basePrice && (
            <span className="text-muted-foreground text-xs line-through opacity-70">
              ${originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>

      {items.length > 0 && (
        <div className="space-y-2 border-t pt-4">
          {items.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-medium">+${item.value.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between border-t pt-4">
        <span className="font-semibold">Total Estimated</span>
        <span className="font-bold text-lg text-primary">
          ~USD {total.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
