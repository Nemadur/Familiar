import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserAccentStylesFromHex } from "@/lib/colors";
import type { User } from "@/types/user";

const imageCache = new Map<string, Promise<void> | true>();

function useImagePreload(src?: string | null) {
	if (!src) return;

	const status = imageCache.get(src);

	if (status === true) return;

	if (status instanceof Promise) throw status;

	const promise = new Promise<void>((resolve, reject) => {
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

function ProfileCover({ user }: { user: User }) {
	useImagePreload(user.media.cover);

	const { coverBgStyle } = useMemo(() => {
		if (user.accent_color) return getUserAccentStylesFromHex(user.accent_color);
		return getUserAccentStylesFromHex(user.accent_color);
	}, [user.accent_color]);

	return (
		<div
			className={
				"relative w-full md:rounded-3xl ring-1 ring-ring/30 h-48 md:h-72"
			}
			style={coverBgStyle}
		>
			{/* TODO: add webm (animated) support */}
			{user.media.cover && (
				<img
					src={user.media.cover}
					alt={`${user.username} Cover`}
					className={"h-full w-full rounded-3xl object-cover"}
				/>
			)}
		</div>
	);
}

function ProfileCoverSkeleton() {
	return <Skeleton className="h-48 w-full lg:rounded-3xl md:h-72" />;
}

export { ProfileCover, ProfileCoverSkeleton };
