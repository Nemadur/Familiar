import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
	commissionCategories,
	commissionListings,
	folders,
	posts,
	sonas,
} from "@/db/schema";

export const getProfileContent = createServerFn({
	method: "GET",
})
	.inputValidator((data: { userId: string }) => data)
	.handler(async ({ data }) => {
		try {
			// Fetch data in parallel
			const [userCategories, userPosts, userCharacters, userFolders] =
				await Promise.all([
					db.query.commissionCategories.findMany({
						orderBy: (cats, { asc }) => [asc(cats.sortOrder)],
						with: {
							listings: {
								where: eq(commissionListings.artistId, data.userId),
								orderBy: (listings, { desc }) => [desc(listings.createdAt)],
								with: {
									media: {
										with: {
											asset: true,
										},
										orderBy: (media, { asc }) => [asc(media.sortOrder)],
									},
									reviews: {
										with: {
											author: true,
										},
									},
								},
							},
						},
					}),
					db.query.posts.findMany({
						where: eq(posts.artistId, data.userId),
						orderBy: (posts, { desc }) => [desc(posts.createdAt)],
						with: {
							media: {
								with: {
									asset: true,
								},
								orderBy: (media, { asc }) => [asc(media.sortOrder)],
							},
							folders: true,
						},
					}),
					db.query.sonas.findMany({
						where: eq(sonas.ownerId, data.userId),
						orderBy: (sonas, { desc }) => [desc(sonas.createdAt)],
						with: {
							avatar: true,
							cover: true,
						},
					}),
					// Try to fetch folders, but fail gracefully if table is missing
					db.query.folders
						.findMany({
							where: eq(folders.ownerId, data.userId),
							orderBy: (folders, { desc }) => [desc(folders.createdAt)],
							with: {
								posts: {
									limit: 4,
									orderBy: (fp, { desc }) => [desc(fp.addedAt)],
									with: {
										post: {
											with: {
												media: {
													with: {
														asset: true,
													},
													orderBy: (media, { asc }) => [asc(media.sortOrder)],
												},
											},
										},
									},
								},
							},
						})
						.catch(() => []),
				]);

			// Map to backward-compatible structure
			const mappedPosts = userPosts.map((post) => ({
				...post,
				content: post.bodyMd,
				imageUrls: post.media.map((m) => m.asset.path),
			}));

			// Map categories and listings
			const mappedCategories = userCategories
				.map((cat) => ({
					id: cat.categoryId,
					title: cat.label,
					status: "open",
					items: cat.listings.map((comm) => ({
						...comm,
						content: comm.descriptionMd || "",
						imageUrls: comm.media.map((m) => m.asset.path),
						reviews: comm.reviews || [],
					})),
				}))
				.filter((cat) => cat.items.length > 0);

			const mappedCharacters = userCharacters.map((char) => ({
				id: char.sonaId,
				name: char.name,
				imageUrl: char.avatar?.path || char.cover?.path || "",
				imagesCount: 0,
				starsCount: 0,
			}));

			return {
				// FIXME: replace categories with "commisions" same chracters with "sonas"
				categories: mappedCategories,
				posts: mappedPosts,
				characters: mappedCharacters,
				folders: userFolders,
			};
		} catch (error) {
			console.error("Error fetching profile content:", error);
			throw error;
		}
	});
