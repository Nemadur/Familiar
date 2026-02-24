import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { commissionListings } from "@/db/schema";
import type { CommissionItem } from "@/types/commission";

export const getCommission = createServerFn({
	method: "GET",
})
	.inputValidator((data: { id: string }) => data)
	.handler(async ({ data }) => {
		const commission = await db.query.commissionListings.findFirst({
			where: eq(commissionListings.id, data.id),
			with: {
				artist: true,
				media: {
					with: {
						asset: true,
					},
					orderBy: (media, { asc }) => [asc(media.sortOrder)],
				},
			},
		});

		if (!commission) return null;

		// Map to CommissionItem interface
		const item: CommissionItem & { artist: any } = {
			id: commission.id,
			title: commission.title,
			description: commission.description || undefined,
			price: commission.basePrice || 0,
			discountRate: commission.discountRate || 0,
			status: commission.status as "open" | "closed" | "waitlist",
			artistNote: commission.artistNote || undefined,
			tags: commission.tags || [],
			contentWarnings: commission.contentWarnings || [],
			imageUrls: commission.media.map((m) => m.asset.path),
			// Stubs for fields not in DB yet
			reviews: [],
			licenseOptions: [],
			artist: commission.artist,
		};

		return item;
	});
