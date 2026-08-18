import { Facehash } from "facehash";
import { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUserAccentStylesFromHex } from "@/lib/colors";
import { cn } from "@/lib/utils";
import type { TUserProfile } from "@/types/user";

export default function UserAvatar({
	user = undefined,
	isHuge = false,
	hasOutline = false,
	size = "default",
	isOnline = false,
	badgeClassName,
}: {
	user?: TUserProfile | undefined;
	isHuge?: boolean;
	hasOutline?: boolean;
	size?: "sm" | "default" | "lg" | "xl";
	isOnline?: boolean;
	badgeClassName?: string;
}) {
	const { avatarBgStyle, avatarForegroundStyle } = useMemo(
		() => getUserAccentStylesFromHex(user?.accentColor),
		[user?.accentColor],
	);

	const altText = user?.displayName || user?.username;

	let sizeClasses = "size-9";
	let hashSize = 36;
	if (isHuge) {
		sizeClasses = "size-24 md:size-32";
		hashSize = 128;
	} else if (size === "sm") {
		sizeClasses = "size-8";
		hashSize = 32;
	} else if (size === "lg") {
		sizeClasses = "size-12";
		hashSize = 48;
	} else if (size === "xl") {
		sizeClasses = "size-16";
		hashSize = 64;
	}

	return (
		<div className="relative inline-flex shrink-0">
			<Avatar
				className={cn(sizeClasses, hasOutline && "ring-6 ring-background")}
			>
				<AvatarImage src={user?.avatarPath || undefined} alt={altText} />
				<AvatarFallback>
					<Facehash
						aria-label={altText}
						intensity3d={"none"}
						enableBlink
						style={{ ...avatarBgStyle, ...avatarForegroundStyle }}
						variant={"solid"}
						name={altText || ""}
						size={hashSize}
					/>
				</AvatarFallback>
			</Avatar>
			{isOnline && (
				<span
					className={cn(
						"absolute bottom-0 transition-all duration-75 right-0 size-4 rounded-full border-3 border-background bg-green-500 z-10 translate-x-0.5 translate-y-0.5",
						badgeClassName,
					)}
				/>
			)}
		</div>
	);
}
