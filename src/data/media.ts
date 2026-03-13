import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";

export const getBlurredImage = createServerFn({ method: "GET" })
	.inputValidator((data: unknown) => {
		return z.object({ assetId: z.string() }).parse(data);
	})
	.handler(async ({ data: { assetId } }) => {
		if (!supabaseAdmin) {
			throw new Error("Server configuration error");
		}

		try {
			const { data: asset, error } = await supabaseAdmin
				.schema("familiar")
				.from("media_assets")
				.select("path, mime")
				.eq("asset_id", assetId)
				.single();

			if (error || !asset) {
				throw new Error("Asset not found");
			}

			// Generate signed URL with transformation
			// We try 'user-content' bucket first as it's standard
			let fetchUrl: string | undefined;

			// Try with transformation
			const { data: signedData } = await supabaseAdmin.storage
				.from("user-content")
				.createSignedUrl(asset.path, 60, {
					transform: {
						width: 16,
						height: 16,
						resize: "cover",
						format: "origin",
					},
				});

			fetchUrl = signedData?.signedUrl;

			if (!fetchUrl) {
				// Fallback: without transform
				const { data: fallback } = await supabaseAdmin.storage
					.from("user-content")
					.createSignedUrl(asset.path, 60);

				fetchUrl = fallback?.signedUrl;

				// Final fallback: if path is already a URL
				if (!fetchUrl && asset.path.startsWith("http")) {
					fetchUrl = asset.path;
				}
			}

			if (!fetchUrl) throw new Error("Could not generate URL");

			const response = await fetch(fetchUrl);
			if (!response.ok) throw new Error("Failed to fetch image");

			const arrayBuffer = await response.arrayBuffer();
			const base64 = Buffer.from(arrayBuffer).toString("base64");

			return {
				data: `data:${asset.mime};base64,${base64}`,
			};
		} catch (error) {
			console.error("Error blurring image:", error);
			throw new Error("Failed to process image");
		}
	});
