import {
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import type { PortfolioPostResponse } from "@/api/portfolio/posts/post-types";
import {
	bucketFromDimensions,
	type TileBucket as BentoTileBucket,
} from "@/lib/bento";

export interface TileBucket
	extends BentoTileBucket {
	imageWidth: number;
	imageHeight: number;
}

interface PostImageSource {
	postId: string;
	path: string | null;
}

const FALLBACK_BUCKET: TileBucket = {
	widthUnit: 1,
	heightUnit: 1,
	imageWidth: 800,
	imageHeight: 800,
};

const MEASUREMENT_TIMEOUT = 10_000;

const bucketCache = new Map<
	string,
	Promise<TileBucket>
>();

function getFirstImagePath(
	post: PortfolioPostResponse,
): string | null {
	const image = [
		...(post.images ?? []),
	]
		.sort(
			(a, b) =>
				(a.position ??
					Number.MAX_SAFE_INTEGER) -
				(b.position ??
					Number.MAX_SAFE_INTEGER),
		)
		.find(
			(item) =>
				Boolean(
					item.fullSize?.path,
				) ||
				Boolean(
					item.thumbnail?.path,
				),
		);

	if (!image) {
		return null;
	}

	/*
	 * Prefer the original image. Thumbnails may be square-cropped and produce
	 * an incorrect 1x1 bucket.
	 */
	return (
		image.fullSize?.path ??
		image.thumbnail?.path ??
		null
	);
}

function measureImageBucket(
	path: string,
): Promise<TileBucket> {
	const cached = bucketCache.get(path);

	if (cached) {
		return cached;
	}

	const measurement =
		new Promise<TileBucket>(
			(resolve) => {
				const image =
					new Image();

				let finished = false;

				const finish = (
					bucket: TileBucket,
					keepCached: boolean,
				) => {
					if (finished) {
						return;
					}

					finished = true;

					window.clearTimeout(
						timeoutId,
					);

					image.onload = null;
					image.onerror = null;

					if (!keepCached) {
						bucketCache.delete(
							path,
						);
					}

					resolve(bucket);
				};

				const timeoutId =
					window.setTimeout(
						() => {
							finish(
								FALLBACK_BUCKET,
								false,
							);
						},
						MEASUREMENT_TIMEOUT,
					);

				image.onload = () => {
					const imageWidth =
						image.naturalWidth;

					const imageHeight =
						image.naturalHeight;

					if (
						imageWidth <= 0 ||
						imageHeight <= 0
					) {
						finish(
							FALLBACK_BUCKET,
							false,
						);

						return;
					}

					finish(
						{
							...bucketFromDimensions(
								imageWidth,
								imageHeight,
							),
							imageWidth,
							imageHeight,
						},
						true,
					);
				};

				image.onerror = () => {
					finish(
						FALLBACK_BUCKET,
						false,
					);
				};

				image.decoding = "async";
				image.src = path;
			},
		);

	bucketCache.set(path, measurement);

	return measurement;
}

export function usePortfolioImageBuckets(
	posts: PortfolioPostResponse[],
): {
	buckets: ReadonlyMap<
		string,
		TileBucket
	>;
	isMeasuring: boolean;
} {
	const imageSources =
		useMemo<PostImageSource[]>(
			() =>
				posts.flatMap(
					(post) => {
						if (!post.id) {
							return [];
						}

						return [
							{
								postId:
									post.id,
								path: getFirstImagePath(
									post,
								),
							},
						];
					},
				),
			[posts],
		);

	const sourceSignature = useMemo(
		() =>
			imageSources
				.map(
					({
						postId,
						path,
					}) =>
						`${postId}\u0000${path ?? ""}`,
				)
				.join("\u0001"),
		[imageSources],
	);

	const imageSourcesRef =
		useRef(imageSources);

	imageSourcesRef.current =
		imageSources;

	const [buckets, setBuckets] =
		useState<
			ReadonlyMap<
				string,
				TileBucket
			>
		>(() => new Map());

	const [
		isMeasuring,
		setIsMeasuring,
	] = useState(
		imageSources.length > 0,
	);

	useEffect(() => {
		let cancelled = false;

		const sources =
			imageSourcesRef.current;

		if (sources.length === 0) {
			setBuckets(new Map());
			setIsMeasuring(false);

			return () => {
				cancelled = true;
			};
		}

		setIsMeasuring(true);

		void Promise.all(
			sources.map(
				async ({
					postId,
					path,
				}) => {
					const bucket = path
						? await measureImageBucket(
								path,
							)
						: FALLBACK_BUCKET;

					return [
						postId,
						bucket,
					] as const;
				},
			),
		).then((entries) => {
			if (cancelled) {
				return;
			}

			setBuckets(
				new Map(entries),
			);

			setIsMeasuring(false);
		});

		return () => {
			cancelled = true;
		};
	}, [sourceSignature]);

	return {
		buckets,
		isMeasuring,
	};
}