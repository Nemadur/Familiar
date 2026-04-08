import { Surface } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import type { TCommission } from "@/types/commissions";
import type { TUserProfile, TUserResponse } from "@/types/user";
import UserAvatar from "../../avatar";

interface CommissionRequestIntroBoxProps {
	artist: TUserResponse;
	commission: TCommission;
	basePrice: number;
	originalPrice: number;
}

export function CommissionRequestIntroBox({
	artist,
	commission,
	basePrice,
	originalPrice,
}: CommissionRequestIntroBoxProps) {
	const { t } = useTranslation();

	return (
		<div className="flex flex-col gap-4">
			<div className="flex gap-4">
				<UserAvatar user={artist as TUserProfile} />
				<Surface
					variant={"secondary"}
					className="flex flex-col gap-2 rounded-xl border border-secondary p-3 text-sm leading-relaxed"
				>
					<div className="flex flex-col pb-2">
						{/* TODO: add discount badge */}
						{/* <div className="flex items-center gap-2">
							<span className="rounded-md bg-primary/10 px-2 py-0.5 font-medium text-primary text-xs">
								50% off
							</span>
						</div> */}
						<h4 className="font-semibold text-lg">{commission.title}</h4>
						<div className="flex gap-2 text-sm">
							{/* TODO: add translate */}
							<span className="text-muted-foreground">
								{t("commission_request_from", "From")}
							</span>
							<span className="font-semibold">
								{commission.currencyCode} {basePrice.toFixed(2)}
							</span>
							{/* TODO: if has discount, show original price */}
							{/* <span className="text-muted-foreground line-through opacity-70">
								{commission.currencyCode} {originalPrice.toFixed(2)}
							</span> */}
						</div>
					</div>
					{/* TODO: add Artist note */}
					{/* <div className="text-muted-foreground text-sm">
						Once you submit your request, I'll review it to determine if I'm the
						right fit for your needs. If so, I'll send you a proposal with your
						exact pricing and timing before we move forward. Please provide as
						much detail upfront as possible!
					</div> */}
				</Surface>
			</div>
		</div>
	);
}
