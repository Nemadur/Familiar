import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { CommissionItem } from "@/types/commission";
import type { User } from "@/types/user";

interface CommissionRequestIntroBoxProps {
	artist: User;
	item: CommissionItem;
	basePrice: number;
	originalPrice: number;
}

export function CommissionRequestIntroBox({
	artist,
	item,
	basePrice,
	originalPrice,
}: CommissionRequestIntroBoxProps) {
	return (
		<div className="flex flex-col gap-4">
			<div className="flex gap-4">
				<Avatar className="size-10 shrink-0 border">
					<AvatarImage src={artist.avatar_url ?? undefined} />
					<AvatarFallback>{artist.display_name[0]}</AvatarFallback>
				</Avatar>
				<div className="flex flex-col gap-2 rounded-xl border border-secondary bg-secondary/30 p-4 text-sm leading-relaxed">
					<div className="flex flex-col border-border/50 border-b pb-2">
						<div className="flex items-center gap-2">
							<span className="rounded-md bg-primary/10 px-2 py-0.5 font-medium text-primary text-xs">
								50% off
							</span>
						</div>
						<span className="mt-1 font-semibold text-lg">{item.title}</span>
						<div className="flex items-baseline gap-2 text-sm">
							<span className="text-muted-foreground">From</span>
							<span className="font-semibold text-primary">
								USD {basePrice.toFixed(2)}
							</span>
							<span className="text-muted-foreground line-through opacity-70">
								USD {originalPrice.toFixed(2)}
							</span>
						</div>
					</div>
					<div className="text-muted-foreground">
						Once you submit your request, I'll review it to determine if I'm the
						right fit for your needs. If so, I'll send you a proposal with your
						exact pricing and timing before we move forward. Please provide as
						much detail upfront as possible!
					</div>
				</div>
			</div>
		</div>
	);
}
