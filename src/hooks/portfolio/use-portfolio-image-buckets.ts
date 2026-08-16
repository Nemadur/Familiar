import { useEffect, useMemo, useRef, useState } from "react";
import type { PortfolioPostResponse } from "@/api/portfolio/posts/post-types";
import { bucketFromDimensions } from "@/lib/bento";

export type TileBucket = {
	widthUnit: 1 | 2;
	heightUnit: 1 | 2;
	imageWidth: number;
	imageHeight: number;
};

type PostImageSource = {
	postId: string;
	path: string | null;
};

const FALLBACK_BUCKET: TileBucket = {
	widthUnit: 1,
	heightUnit: 1,
	imageWidth: 800,
	imageHeight: 800,
};

// Re-visiting a profile should not download and measure the same image again.
const bucketCache = new Map<string, Promise<TileBucket>>();

function getFirstImagePath(post: PortfolioPostResponse): string | null {
	const firstImage = [...(post.images ?? [])].sort(
		(a, b) =>
			(a.position ?? Number.MAX_SAFE_INTEGER) -
			(b.position ?? Number.MAX_SAFE_INTEGER),
	)[0];

	return firstImage?.fullSize?.path ?? firstImage?.thumbnail?.path ?? null;
}

function measureImageBucket(path: string): Promise<TileBucket> {
	const cached = bucketCache.get(path);
	if (cached) return cached;

	const measurement = new Promise<TileBucket>((resolve) => {
		const image = new Image();

		image.onload = () => {
			const imageWidth = image.naturalWidth;
			const imageHeight = image.naturalHeight;

			if (imageWidth <= 0 || imageHeight <= 0) {
				resolve(FALLBACK_BUCKET);
				return;
			}

			resolve({
				...bucketFromDimensions(imageWidth, imageHeight),
				imageWidth,
				imageHeight,
			});
		};
		image.onerror = () => resolve(FALLBACK_BUCKET);
		image.src = path;
	});

	bucketCache.set(path, measurement);
	return measurement;
}

/**
 * Measures the first image of every post before exposing the bucket map.
 * Waiting for the whole batch prevents cards from appearing as 1x1 and then
 * jumping to 2x1/1x2 one at a time.
 */
export function usePortfolioImageBuckets(posts: PortfolioPostResponse[]): {
	buckets: ReadonlyMap<string, TileBucket>;
	isMeasuring: boolean;
} {
	const imageSources = useMemo<PostImageSource[]>(
		() =>
			posts.flatMap((post) =>
				post.id
					? [{ postId: post.id, path: getFirstImagePath(post) }]
					: [],
			),
		[posts],
	);
	const sourceSignature = imageSources
		.map(({ postId, path }) => `${postId}\u0000${path ?? ""}`)
		.join("\u0001");
	const imageSourcesRef = useRef(imageSources);
	imageSourcesRef.current = imageSources;
	const [buckets, setBuckets] = useState<ReadonlyMap<string, TileBucket>>(
		() => new Map(),
	);
	const [isMeasuring, setIsMeasuring] = useState(imageSources.length > 0);

	useEffect(() => {
		let cancelled = false;
		const sources = imageSourcesRef.current;

		if (sources.length === 0) {
			setBuckets(new Map());
			setIsMeasuring(false);
			return () => {
				cancelled = true;
			};
		}

		setIsMeasuring(true);

		void Promise.all(
			sources.map(async ({ postId, path }) => {
				const bucket = path
					? await measureImageBucket(path)
					: FALLBACK_BUCKET;
				return [postId, bucket] as const;
			}),
		).then((entries) => {
			if (cancelled) return;
			setBuckets(new Map(entries));
			setIsMeasuring(false);
		});

		return () => {
			cancelled = true;
		};
	}, []);

	return { buckets, isMeasuring };
}