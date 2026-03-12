import { createServerFn } from "@tanstack/react-start";
import { supabase, supabaseAdmin } from "@/lib/supabase";

const getClient = () => supabaseAdmin || supabase;

export const getPostDetails = createServerFn({
	method: "GET",
})
	.inputValidator((data: { postId: string }) => data)
	.handler(async ({ data }) => {
		if (!data.postId) return null;
		const client = getClient();

		try {
			const [reviewResult, charactersResult] = await Promise.all([
				// Fetch featured review
				client
					.schema("familiar")
					.from("post_featured_review")
					.select(`
            review:reviews(
              *,
              author:profiles!reviews_client_id_fkey(*)
            )
          `)
					.eq("post_id", data.postId)
					.maybeSingle(),

				// Fetch linked characters
				client
					.schema("familiar")
					.from("post_character_refs")
					.select("character_id")
					.eq("post_id", data.postId),
			]);

			let linkedCharacters: any[] = [];
			if (charactersResult.data && charactersResult.data.length > 0) {
				const characterIds = charactersResult.data.map(
					(r: any) => r.character_id,
				);
				// Fetch character details from 'characters' table
				const sonasResult = await client
					.schema("familiar")
					.from("characters")
					.select("*, avatar:media_assets!avatar_asset_id(*)")
					.in("character_id", characterIds);

				if (sonasResult.data) {
					linkedCharacters = sonasResult.data.map((char: any) => ({
						id: char.character_id,
						name: char.name,
						slug: char.slug,
						avatarUrl: char.avatar?.path,
						accent_color: null, // Characters don't have accent color
					}));
				}
			}

			const featuredReview = reviewResult.data?.review
				? {
						id: (reviewResult.data.review as any).review_id,
						rating: (reviewResult.data.review as any).rating,
						comment: (reviewResult.data.review as any).body,
						createdAt: (reviewResult.data.review as any).created_at,
						highlights: [], // TODO: Populate if available
					}
				: undefined;

			return {
				linkedCharacters,
				featuredReview,
			};
		} catch (error) {
			console.error("Error fetching post details:", error);
			return { linkedCharacters: [], featuredReview: undefined };
		}
	});
