import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

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
  className 
}: StarsRatingProps) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: max }).map((_, i) => {
        const fullStar = i < Math.floor(rating);
        const halfStar = i === Math.floor(rating) && rating % 1 >= 0.5;
        
        return (
          <div key={i} className="relative">
            <Star 
              size={size} 
              className={cn(
                "text-muted-foreground/30",
                fullStar && "text-amber-400 fill-amber-400",
                !fullStar && !halfStar && "text-muted-foreground/30"
              )} 
            />
            {halfStar && (
              <div className="absolute inset-0 overflow-hidden w-1/2">
                <Star 
                  size={size} 
                  className="text-amber-400 fill-amber-400" 
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
