import { createClient } from "@supabase/supabase-js";
import { createServerFn } from "@tanstack/react-start";
import {
	supabase,
	supabaseAdmin,
	supabaseAnonKey,
	supabaseUrl,
} from "@/lib/supabase";
import { slugify } from "@/lib/utils";
import type { Folder } from "@/types/folder";

// Helper to create an authenticated client if token is present, or fallback
const getAuthenticatedClient = (token?: string) => {
	// If we have admin, use it (bypasses RLS)
	// if (supabaseAdmin) return supabaseAdmin;

	// If we have a user token, create a scoped client
	if (token && supabaseUrl && supabaseAnonKey) {
		return createClient(supabaseUrl, supabaseAnonKey, {
			global: {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			},
		});
	}

	// Fallback to anon client
	return supabase;
};

export const getProfileContent = createServerFn({
	method: "GET",
})
	.inputValidator(
		(data: {
			userId: string;
			type?: "commissions" | "portfolio" | "characters" | "saved" | "liked";
			token?: string;
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

			const client = getAuthenticatedClient(data.token);
			console.log(
				`[getProfileContent] Admin available: ${!!supabaseAdmin}, Token provided: ${!!data.token}`,
			);
			const type = data.type;

			// Fetch data in parallel based on type
			const [
				listingsResult,
				postsResult,
				sonasResult,
				foldersResult,
				simpleFoldersResult,
			] = await Promise.all([
				// 1. Listings (to group into categories)
				type === "commissions"
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
				type === "portfolio"
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
				type === "characters"
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
				type === "portfolio"
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
					: Promise.resolve({ data: [], error: null }),

				// 5. Simple Folders (Debug)
				type === "portfolio"
					? client
							.schema("familiar")
							.from("folders")
							.select("*")
							.eq("owner_id", data.userId)
					: Promise.resolve({ data: [], error: null }),
			]);

			const listings = listingsResult.data || [];
			const userPosts = postsResult.data || [];
			const userCharacters = sonasResult.data || [];
			// 4. Folders
			const userFolders =
				foldersResult.data ||
				(foldersResult.error
					? (console.error(
							"Error fetching folders with posts:",
							foldersResult.error,
						) as any) ||
						simpleFoldersResult.data ||
						[]
					: []);

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
						status: cat.status, // Use category status from DB
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
				.map(({ sortOrder, ...cat }) => {
					// Calculate status from items if not present on category
					// If category has no status in DB, derive it from items
					if (!cat.status) {
						const hasOpen = cat.items.some((i: any) => i.status === "open");
						const hasWaitlist = cat.items.some(
							(i: any) => i.status === "waitlist",
						);
						// Priority: Open > Waitlist > Closed
						cat.status = hasOpen ? "open" : hasWaitlist ? "waitlist" : "closed";
					}
					return cat;
				});

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

				// Calculate subfolders count
				const subfoldersCount = userFolders.filter(
					(f: any) => f.parent_id === folder.folder_id,
				).length;

				return {
					id: folder.folder_id,
					parentId: folder.parent_id,
					slug: folder.slug || slugify(folder.name || ""),
					name: folder.name,
					count: folder.posts?.length || 0,
					images: images,
					hasSubfolders: subfoldersCount > 0,
					color: undefined, // Ensure type consistency for fake data
				};
			});

			// Fake data for testing premium features
			if (type === "portfolio") {
				mappedFolders.push({
					id: "fake-premium-1",
					parentId: null,
					slug: "premium-showcase",
					name: "Premium Showcase",
					count: 12,
					images: [],
					hasSubfolders: true,
					color: "#f43f5e", // Rose
				});
				mappedFolders.push({
					id: "fake-featured-1",
					parentId: null,
					slug: "featured",
					name: "Featured Works",
					count: 5,
					images: [],
					hasSubfolders: true,
					color: "#8b5cf6", // Violet
				});
			}

			return {
				categories: mappedCategories,
				posts: mappedPosts,
				characters: mappedCharacters,
				folders: mappedFolders,
				_debug: {
					adminAvailable: !!supabaseAdmin,
					simpleFolders: simpleFoldersResult.data,
					simpleFoldersError: simpleFoldersResult.error,
					foldersError: foldersResult.error,
					userId: data.userId,
				},
			};
		} catch (error) {
			console.error("Error fetching profile content:", error);
			throw error;
		}
	});
