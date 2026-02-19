import { Facehash } from "facehash";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@/types/user";

/**
 * Avatar Component
 * @param user - użytkownik, dla którego ma być wyświetlony avatar
 * @param isHuge - większa wersja dla profilu użytkownika
 * @returns Avatar z fallbackem na Facehash
 */
export default function UserAvatar({
	user,
	isHuge = false,
}: {
	user: User;
	isHuge?: boolean;
}) {
	return (
		<Avatar>
			<AvatarImage
				src={user.media.avatar || undefined}
				alt={user.display_name}
			/>
			<AvatarFallback>
				<Facehash
					intensity3d={"medium"}
					enableBlink
					color={user.accent_color}
					variant={"solid"}
					name={user.display_name}
					size={!isHuge ? 40 : 96}
				/>
			</AvatarFallback>
		</Avatar>
	);
}
