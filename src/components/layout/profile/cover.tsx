import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserAccentStylesFromHex } from "@/lib/colors";
import type { TUserResponse } from "@/types/user";

const imageCache = new Map<string, Promise<void> | true>();

function useImagePreload(src?: string | null) {
	if (!src) return;

	const status = imageCache.get(src);

	if (status === true) return;

	if (status instanceof Promise) throw status;

	const promise = new Promise<void>((resolve) => {
		const img = new Image();
		img.src = src;
		img.onload = () => {
			imageCache.set(src, true);
			resolve();
		};
		img.onerror = () => {
			imageCache.set(src, true);
			resolve();
		};
	});

	imageCache.set(src, promise);
	throw promise;
}

function ProfileCover({ user }: { user: TUserResponse }) {
	useImagePreload(user.coverPath);

	const { coverBgStyle } = useMemo(
		() => getUserAccentStylesFromHex(user.accentColor),
		[user.accentColor],
	);

	return (
		<div
			className="relative h-48 w-full overflow-hidden ring-1 ring-ring/30 md:h-72 lg:rounded-3xl"
			style={coverBgStyle}
		>
			{/* TODO: add webm (animated) support */}
			{user.coverPath && (
				<img
					src={user.coverPath}
					alt={`${user.username} cover`}
					className="h-full w-full object-cover"
				/>
			)}
		</div>
	);
}

function ProfileCoverSkeleton() {
	return <Skeleton className="h-48 w-full lg:rounded-3xl md:h-72" />;
}

export { ProfileCover, ProfileCoverSkeleton };
