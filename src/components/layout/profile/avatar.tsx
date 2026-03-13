import { Facehash } from "facehash";
import { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUserAccentStylesFromHex } from "@/lib/colors";
import { cn } from "@/lib/utils";
import type { User } from "@/types/user";

/**
 * Avatar Component
 * @param user - user for which the avatar is to be displayed
 * @param isHuge - larger version for user profile
 * @returns Avatar with fallback to Facehash
 */
export default function UserAvatar({
	user,
	isHuge = false,
	hasOutline = false,
}: {
	user: User;
	isHuge?: boolean;
	hasOutline?: boolean;
}) {
	const { avatarBgStyle, avatarForegroundStyle } = useMemo(() => {
		if (user.accent_color) return getUserAccentStylesFromHex(user.accent_color);
		return getUserAccentStylesFromHex(user.accent_color);
	}, [user.accent_color]);

	return (
		<Avatar
			className={cn(
				isHuge ? "size-24 md:size-32" : "size-9",
				hasOutline && "ring-6 ring-background",
			)}
		>
			<AvatarImage
				src={user.media?.avatar || undefined}
				alt={user.display_name}
			/>
			<AvatarFallback>
				<Facehash
					intensity3d={"medium"}
					enableBlink
					style={{ ...avatarBgStyle, ...avatarForegroundStyle }}
					variant={"solid"}
					name={user.display_name}
					size={!isHuge ? 36 : 128}
				/>
			</AvatarFallback>
		</Avatar>
	);
}
