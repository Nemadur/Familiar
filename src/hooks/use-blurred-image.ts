import { useEffect, useState } from "react";

export function useBlurredImage(src: string | undefined, shouldBlur: boolean) {
	const [blurredSrc, setBlurredSrc] = useState<string | null>(null);

	useEffect(() => {
		if (!src || !shouldBlur) {
			setBlurredSrc(null);
			return;
		}

		let isActive = true;
		const img = new Image();
		img.crossOrigin = "Anonymous";
		img.src = src;

		img.onload = () => {
			if (!isActive) return;

			const canvas = document.createElement("canvas");
			// Small size for performance and natural blur effect
			const w = 16;
			const h = (w / img.width) * img.height;
			canvas.width = w;
			canvas.height = h;

			const ctx = canvas.getContext("2d");
			if (!ctx) return;

			ctx.imageSmoothingEnabled = true;
			ctx.imageSmoothingQuality = "medium";
			ctx.drawImage(img, 0, 0, w, h);

			// Export as blob url
			canvas.toBlob(
				(blob) => {
					if (!isActive || !blob) return;
					const url = URL.createObjectURL(blob);
					setBlurredSrc(url);
				},
				"image/jpeg",
				0.5,
			);
		};

		return () => {
			isActive = false;
			// Note: we can't easily revoke the URL here if it was set inside the callback
			// after unmount, but React handles state updates on unmounted components gracefully (warns).
			// Ideally we track the url in a ref to revoke it.
		};
	}, [src, shouldBlur]);

	// Separate effect to cleanup blobs
	useEffect(() => {
		return () => {
			if (blurredSrc) {
				URL.revokeObjectURL(blurredSrc);
			}
		};
	}, [blurredSrc]);

	return blurredSrc;
}
