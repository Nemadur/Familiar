import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { commissions, posts, characters, folders } from "@/db/schema";

export const getProfileContent = createServerFn({
	method: "GET",
})
	.inputValidator((data: { userId: string }) => data)
	.handler(async ({ data }) => {
		const [userCommissions, userPosts, userCharacters, userFolders] =
			await Promise.all([
				db.query.commissions.findMany({
					where: eq(commissions.artistId, data.userId),
					orderBy: (commissions, { desc }) => [desc(commissions.createdAt)],
				}),
				db.query.posts.findMany({
					where: eq(posts.authorId, data.userId),
					orderBy: (posts, { desc }) => [desc(posts.createdAt)],
				}),
				db.query.characters.findMany({
					where: eq(characters.ownerId, data.userId),
					orderBy: (characters, { desc }) => [desc(characters.createdAt)],
				}),
				db.query.folders.findMany({
					where: eq(folders.ownerId, data.userId),
					orderBy: (folders, { desc }) => [desc(folders.createdAt)],
				}),
			]);

		return {
			commissions: userCommissions,
			posts: userPosts,
			characters: userCharacters,
			folders: userFolders,
		};
	});
