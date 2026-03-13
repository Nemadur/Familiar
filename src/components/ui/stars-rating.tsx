import { cn } from "@/lib/utils";
import { OutlineStar, SolidStar } from "../icons/icons";

interface StarsRatingProps {
	rating: number;
	max?: number;
	size?: number;
	className?: string;
}

export function StarsRating({
	rating,
	max = 5,
	size = 16,
	className,
}: StarsRatingProps) {
	return (
		<div className={cn("flex items-center gap-0.5", className)}>
			{Array.from({ length: max }).map((_, i) => {
				const fullStar = i < Math.floor(rating);

				return (
					<div key={rating} className="relative">
						{fullStar && <SolidStar size={size} className={"text-amber-400"} />}
						{!fullStar && (
							<OutlineStar size={size} className={"text-muted-foreground/40"} />
						)}
					</div>
				);
			})}
		</div>
	);
}
