import { createServerFn } from "@tanstack/react-start";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import type { Folder } from "@/types/folder";

// Helper to choose the right client (prefer admin if available for RLS bypass)
const getClient = () => supabaseAdmin || supabase;

export const getProfileContent = createServerFn({
	method: "GET",
})
	.inputValidator(
		(data: {
			userId: string;
			type?: "commissions" | "portfolio" | "characters";
		}) => data,
	)
	.handler(async ({ data }) => {
		try {
			if (!data?.userId) {
				console.error("getProfileContent called with invalid data:", data);
				return {
					categories: [],
					posts: [],
					characters: [],
					folders: [],
				};
			}

			const client = getClient();
			const type = data.type;

			// Fetch data in parallel based on type
			const [listingsResult, postsResult, sonasResult, foldersResult] =
				await Promise.all([
					// 1. Listings (to group into categories)
					!type || type === "commissions"
						? client
								.schema("familiar")
								.from("commission_listings")
								.select(`
							*,
							media:commission_listing_media(
								*,
								asset:media_assets(*)
							),
							reviews:reviews(
								*,
								author:profiles!reviews_client_id_fkey(*)
							),
							category:commission_categories(*)
						`)
								.eq("artist_id", data.userId)
								// Removed status filter as requested
								.order("created_at", { ascending: false })
						: Promise.resolve({ data: [] }),

					// 2. Posts
					!type || type === "portfolio"
						? client
								.schema("familiar")
								.from("posts")
								.select(`
							*,
							media:post_media(
								*,
								asset:media_assets(*)
							)
						`)
								.eq("artist_id", data.userId)
								.order("created_at", { ascending: false })
						: Promise.resolve({ data: [] }),

					// 3. Sonas (Characters)
					!type || type === "characters"
						? client
								.schema("familiar")
								.from("sonas")
								.select(`
							*,
							avatar:media_assets!avatar_asset_id(*),
							cover:media_assets!cover_asset_id(*)
						`)
								.eq("owner_id", data.userId)
								.order("created_at", { ascending: false })
						: Promise.resolve({ data: [] }),

					// 4. Folders
					!type || type === "portfolio"
						? client
								.schema("familiar")
								.from("folders")
								.select(`
							*,
							posts:folder_posts(
								*,
								post:posts(
									*,
									media:post_media(
										*,
										asset:media_assets(*)
									)
								)
							)
						`)
								.eq("owner_id", data.userId)
								.order("created_at", { ascending: false })
						: Promise.resolve({ data: [] }),
				]);

			const listings = listingsResult.data || [];
			const userPosts = postsResult.data || [];
			const userCharacters = sonasResult.data || [];
			const userFolders = foldersResult.data || [];

			// Group listings by category
			const categoryMap = new Map<string, any>();

			console.log(`[getProfileContent] Processing ${listings.length} listings`);

			listings.forEach((listing: any) => {
				const cat = listing.category;
				if (!cat) return;

				if (!categoryMap.has(cat.category_id)) {
					console.log(
						`[getProfileContent] New category found: ${cat.label} (${cat.category_id})`,
					);
					categoryMap.set(cat.category_id, {
						id: cat.category_id,
						title: cat.label,
						sortOrder: cat.sort_order,
						status: "open",
						items: [],
					});
				}

				const category = categoryMap.get(cat.category_id);
				category.items.push({
					id: listing.listing_id,
					title: listing.title,
					description: listing.description_md || undefined,
					price: Number(listing.base_price_usd ?? listing.basePriceUsd ?? 0),
					discountRate: Number(
						listing.discount_rate ?? listing.discountRate ?? 0,
					),
					status: listing.status,
					artistNote: listing.artist_note || listing.artistNote || undefined,
					tags: listing.tags || [],
					contentWarnings:
						listing.content_warnings || listing.contentWarnings || [],
					imageUrls: (listing.media || [])
						.sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
						.map((m: any) => m.asset?.path)
						.filter(Boolean),
					serviceType: listing.service_type || listing.serviceType,
					communicationType:
						listing.communication_type || listing.communicationType,
					requestingProcess:
						listing.requesting_process || listing.requestingProcess,
					reviews: (listing.reviews || []).map((r: any) => ({
						id: r.review_id,
						author: {
							username: r.author?.username || "Unknown",
							display_name: r.author?.display_name || "Unknown",
							media: {
								avatar: r.author?.avatar_path || null,
								cover: null,
							},
						},
						rating: r.rating,
						comment: r.body,
						createdAt: r.created_at,
					})),
					artist: {
						username: data.userId, // We know the artist ID, but username/display_name might be missing here if not joined.
						// However, the UI likely passes the artist object separately or we can rely on what we have.
						// The listing has artist_id.
					} as any, // casting as any to avoid full User object construction if not needed
				});
			});

			const mappedCategories = Array.from(categoryMap.values())
				.sort((a, b) => a.sortOrder - b.sortOrder)
				.map(({ sortOrder, ...cat }) => cat); // Remove internal sortOrder

			// Map posts
			const mappedPosts = userPosts.map((post: any) => ({
				id: post.post_id,
				authorId: post.artist_id,
				title: post.title,
				description: post.body_md,
				images: (post.media || [])
					.sort((a: any, b: any) => a.sort_order - b.sort_order)
					.map((m: any) => ({
						id: m.media_id,
						assetId: m.asset?.asset_id,
						path: m.asset?.path,
						width: m.asset?.width || 0,
						height: m.asset?.height || 0,
						type: m.asset?.type || "image",
						mime: m.asset?.mime || "image/jpeg",
					})),
				likeCount: post.likes_count || 0,
				viewCount: post.views_count || 0,
				isLiked: false, // User context needed
				isBookmarked: false, // User context needed
				createdAt: post.created_at,
				updatedAt: post.updated_at,
				visibility: post.visibility,
				tags: post.tags || [],
				contentWarnings: post.content_warnings || [],
			}));

			// Map characters
			const mappedCharacters = userCharacters.map((char: any) => ({
				id: char.sona_id,
				name: char.name,
				imageUrl: char.avatar?.path || char.cover?.path || "",
				imagesCount: 0, // Drizzle code had 0
				starsCount: 0, // Drizzle code had 0
			}));

			// Map folders (if needed, or pass as is)
			// The original code passed userFolders as is, but Drizzle result might be different from Supabase result (camelCase vs snake_case).
			// We should probably map keys if the UI expects camelCase.
			// However, types for Folder might need adjustment.
			// Let's look at `src/types/folder/index.ts` if I can?
			// But for now I'll map snake_case to expected properties if I can infer them.
			// Drizzle: `folders` table.
			// Supabase: `folders` table.
			// Result: `folder_id`, `owner_id`, etc.
			// Original code: `return { folders: userFolders }`.
			// If `userFolders` are used in UI, they might expect `id` or `folderId`.
			// `src/data/folders.ts` defined `Folder` interface with `id`, `parentId`, `slug`, `name`, `count`, `images`.

			const mappedFolders = userFolders.map((folder: any) => {
				// We need to extract images from posts in the folder
				// posts: folder_posts -> post -> media -> asset
				const images = (folder.posts || [])
					.flatMap((fp: any) => fp.post?.media || [])
					.map((m: any) => m.asset?.path)
					.filter(Boolean)
					.slice(0, 4); // limit 4

				return {
					id: folder.folder_id,
					parentId: folder.parent_id,
					slug: folder.slug || folder.folder_id, // folders might not have slug? Schema has 'name', no 'slug'?
					// Schema `folders`: folder_id, owner_id, parent_id, name, description, sort_order, is_archived, visibility, share_token.
					// NO SLUG.
					// But `src/data/folders.ts` interface has `slug`.
					// Maybe it uses `folder_id` as slug or name?
					name: folder.name,
					count: folder.posts?.length || 0, // This is count of posts fetched, not total count.
					// To get total count, we'd need aggregation.
					// But original code: `with: { posts: { limit: 4 } }`.
					// So original count was also just length of fetched (max 4)?
					// No, Drizzle `findMany` returns array.
					// If we want real count, we need separate query or aggregation.
					// For now, use length.
					images: images,
					hasSubfolders: false, // Drizzle didn't fetch subfolders
				};
			});

			return {
				categories: mappedCategories,
				posts: mappedPosts,
				characters: mappedCharacters,
				folders: mappedFolders,
			};
		} catch (error) {
			console.error("Error fetching profile content:", error);
			throw error;
		}
	});
