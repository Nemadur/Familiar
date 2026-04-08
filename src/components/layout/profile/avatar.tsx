import { Facehash } from "facehash";
import { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUserAccentStylesFromHex } from "@/lib/colors";
import { cn } from "@/lib/utils";
import type { TUserProfile } from "@/types/user";

export default function UserAvatar({
	user,
	isHuge = false,
	hasOutline = false,
}: {
	user: TUserProfile;
	isHuge?: boolean;
	hasOutline?: boolean;
}) {
	const { avatarBgStyle, avatarForegroundStyle } = useMemo(
		() => getUserAccentStylesFromHex(user?.accentColor),
		[user?.accentColor],
	);

	const facehashName = user?.displayName?.trim();

	const altText = user?.displayName || user?.username || "User avatar";

	return (
		<Avatar
			className={cn(
				isHuge ? "size-24 md:size-32" : "size-9",
				hasOutline && "ring-6 ring-background",
			)}
		>
			<AvatarImage src={user?.avatarPath || undefined} alt={altText} />
			<AvatarFallback>
				<Facehash
					intensity3d={"none"}
					enableBlink
					style={{ ...avatarBgStyle, ...avatarForegroundStyle }}
					variant={"solid"}
					name={facehashName || ""}
					size={isHuge ? 128 : 36}
				/>
			</AvatarFallback>
		</Avatar>
	);
}
