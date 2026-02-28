import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import type { CommissionItem, LicenseOption, Review } from "@/types/commission";
import type { User } from "@/types/user";

// Database Types
interface DbMediaAsset {
	path: string;
}

interface DbCommissionMedia {
	sort_order: number;
	asset: DbMediaAsset;
}

interface DbReviewAuthor {
	display_name?: string;
	username: string;
	avatar_path?: string;
}

interface DbReview {
	review_id: string;
	rating: number;
	body?: string;
	created_at: string;
	author?: DbReviewAuthor;
}

interface DbArtistTerm {
	version: number;
	tos_md: string;
	is_active: boolean;
}

interface DbBadge {
	badge_id: string;
	label: string;
	description?: string;
	color?: string;
	icon_path?: string;
}

interface DbUserBadge {
	awarded_at: string;
	badge: DbBadge;
}

interface DbUserLink {
	label: string;
	url: string;
}

interface DbUserSpokenLanguage {
	locale: string;
	experience: string;
}

interface DbProfile {
	user_id: string;
	username: string;
	display_name: string;
	bio?: string;
	avatar_path?: string;
	cover_path?: string;
	accent_color?: string;
	is_premium: boolean;
	is_verified: boolean;
	is_private: boolean;
	created_at: string;
	timezone?: string;
	pronouns?: string;
	terms?: DbArtistTerm[];
	badges?: DbUserBadge[];
	user_links?: DbUserLink[];
	spoken_languages?: DbUserSpokenLanguage[];
}

interface DbCommissionListing {
	listing_id: string;
	title: string;
	description_md?: string;
	base_price_usd: number;
	discount_rate?: number;
	status: string;
	artist_note?: string;
	tags?: string[];
	content_warnings?: string[];
	service_type?: string;
	communication_type?: string;
	requesting_process?: string;
	created_at: string;
	updated_at: string;
	artist?: DbProfile;
	media?: DbCommissionMedia[];
	reviews?: DbReview[];
}

interface DbCommissionLicense {
	license_id: string;
	license_key?: string;
	key?: string;
	id?: string;
	label?: string;
	description?: string;
	add_fixed_usd?: number;
	price?: number;
	add_percent?: number;
	price_percentage?: number;
	included: boolean;
	is_included?: boolean;
	sort_order: number;
}

interface DbLicenseDefinition {
	license_id: string;
	key: string;
	label: string;
	description?: string;
	id?: string;
	uuid?: string;
}

const GetCommissionSchema = z.object({
	id: z.string(),
});

export const getCommission = createServerFn({
	method: "GET",
})
	.inputValidator((data: unknown) => {
		console.log("[getCommission] Validating input:", data);
		return GetCommissionSchema.parse(data);
	})
	.handler(async ({ data }) => {
		console.log(`[getCommission] Fetching listingId: ${data.id}`);
		try {
			const { data: commissionData, error } = await supabase
				.schema("familiar")
				.from("commission_listings")
				.select(`
					*,
					artist:profiles!commission_listings_artist_id_fkey (
						*,
						terms:artist_terms(
							*
						),
						badges:user_badges(
							*,
							badge:badges(*)
						),
						user_links(*),
						spoken_languages:user_spoken_languages(*)
					),
					media:commission_listing_media(
						*,
						asset:media_assets(*)
					),
					reviews:reviews(
						*,
						author:profiles!reviews_client_id_fkey(*)
					)
				`)
				.eq("listing_id", data.id)
				.single();

			if (error) {
				console.error("[getCommission] Supabase error:", error);
				throw new Error(error.message);
			}

			if (!commissionData) {
				console.log(`[getCommission] Listing not found for id: ${data.id}`);
				return null;
			}

			// Cast to our defined type
			const commission = commissionData as unknown as DbCommissionListing;

			console.log(`[getCommission] Found listing: ${commission.title}`);

			// Fetch licenses separately to avoid permission/relationship issues
			const { data: licensesResult, error: licensesError } = await supabase
				.schema("familiar")
				.from("commission_listing_licenses")
				.select("*")
				.eq("listing_id", data.id);

			if (licensesError) {
				console.error(
					"[getCommission] Error fetching commission licenses:",
					licensesError,
				);
				// If permission denied, we might just have empty licenses for now
			}

			const licensesData = (licensesResult ||
				[]) as unknown as DbCommissionLicense[];

			// Sort nested arrays manually since Supabase select ordering is limited in single query
			if (commission.media) {
				commission.media.sort(
					(a, b) => (a.sort_order || 0) - (b.sort_order || 0),
				);
			}
			if (licensesData) {
				licensesData.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
			}
			if (commission.reviews) {
				commission.reviews.sort(
					(a, b) =>
						new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
				);
			}
			if (commission.artist?.terms) {
				// Filter for active terms and sort by version descending
				commission.artist.terms = commission.artist.terms
					.filter((t) => t.is_active)
					.sort((a, b) => b.version - a.version);
			}

			console.log(
				`[getCommission] Licenses count (DB): ${licensesData?.length || 0}`,
			);

			// Manually fetch license definitions
			let licenseOptions: LicenseOption[] = [];
			if (licensesData && licensesData.length > 0) {
				// The DB seems to use license_key (text) instead of license_id (uuid) based on recent errors
				// even though v0_2_9.sql specifies license_id. We handle both for robustness.
				const licenseKeys = licensesData
					.map((l) => l.license_key || l.license_id)
					.filter((k): k is string => !!k);

				if (licenseKeys.length > 0) {
					// Fetch all license definitions to handle both key and license_id lookups safely
					const { data: licenseDefsResult, error: licenseError } =
						await supabase
							.schema("familiar")
							.from("license_definitions")
							.select("*");

					const licenseDefs = (licenseDefsResult ||
						[]) as unknown as DbLicenseDefinition[];

					if (licenseError) {
						console.error(
							"[getCommission] Error fetching license definitions:",
							licenseError,
						);
					} else {
						// Map by both key and id to be safe
						const defsMap = new Map<string, DbLicenseDefinition>();
						licenseDefs?.forEach((d) => {
							if (d.key) defsMap.set(d.key, d);
							if (d.license_id) defsMap.set(d.license_id, d);
							// Also handle potential case where DB column is just 'id' or 'uuid'
							if (d.id) defsMap.set(d.id, d);
							if (d.uuid) defsMap.set(d.uuid, d);
						});

						licenseOptions = licensesData.map((l) => {
							// Try all possible lookup keys from the listing_license record
							const lookupKey = l.license_key || l.license_id || l.key || l.id;
							const def = lookupKey ? defsMap.get(lookupKey) : undefined;

							// Map fields with fallbacks for different naming conventions (DB vs Schema vs Log observations)
							// Priorities: Local record > Definition record
							const label =
								l.label || def?.label || lookupKey || "Unknown License";
							const description = l.description || def?.description;

							// Handle price variations: price (log) vs add_fixed_usd (schema)
							let price: number | undefined;
							if (l.price !== undefined && l.price !== null)
								price = Number(l.price);
							else if (
								l.add_fixed_usd !== undefined &&
								l.add_fixed_usd !== null
							)
								price = Number(l.add_fixed_usd);

							// Handle percentage variations: price_percentage (log) vs add_percent (schema)
							let pricePercentage: number | undefined;
							if (
								l.price_percentage !== undefined &&
								l.price_percentage !== null
							)
								pricePercentage = Number(l.price_percentage);
							else if (l.add_percent !== undefined && l.add_percent !== null)
								pricePercentage = Number(l.add_percent);

							// Handle included variations: is_included (log) vs included (schema)
							const included =
								l.is_included !== undefined ? l.is_included : l.included;

							return {
								id: def?.key || lookupKey || "unknown",
								label,
								price,
								pricePercentage,
								included,
								description,
							};
						});
					}
				}
			}

			const reviews: Review[] = (commission.reviews || []).map((r) => ({
				id: r.review_id,
				authorName: r.author?.display_name || r.author?.username || "Unknown",
				authorAvatar: r.author?.avatar_path || undefined,
				rating: r.rating,
				comment: r.body || undefined,
				createdAt: r.created_at,
				itemName: commission.title,
			}));

			// Map artist to User type (partial)
			const artistData = commission.artist;
			const artistUser: User | undefined = artistData
				? {
						uuid: artistData.user_id,
						username: artistData.username,
						display_name: artistData.display_name,
						bio: artistData.bio || null,
						media: {
							avatar: artistData.avatar_path || null,
							cover: artistData.cover_path || null,
						},
						accent_color: artistData.accent_color || null,
						is_premium: artistData.is_premium,
						is_verified: artistData.is_verified,
						is_private: artistData.is_private,
						created_at: new Date(artistData.created_at),
						timezone: artistData.timezone || null,
						pronouns: artistData.pronouns || null,
						social_links: (artistData.user_links || []).map((l) => ({
							label: l.label,
							url: l.url,
						})),
						spoken_languages: (artistData.spoken_languages || []).map((l) => ({
							locale: l.locale,
							experience: l.experience as any, // Cast experience string to enum if needed
						})),
						badges: (artistData.badges || []).map((b) => ({
							uuid: b.badge.badge_id,
							label: b.badge.label,
							description: b.badge.description || null,
							color: b.badge.color || null,
							icon: b.badge.icon_path || null,
							awarded_at: new Date(b.awarded_at),
						})),
						roles: [], // Not fetching roles yet
						followers_count: 0,
						following_count: 0,
						works_count: 0,
						ban: null,
						banned_until: null,
						tos: null,
					}
				: undefined;

			console.log(
				`[getCommission] Mapped License Options: ${licenseOptions.length}`,
			);

			// Map to CommissionItem interface
			const item: CommissionItem = {
				id: commission.listing_id,
				title: commission.title,
				description: commission.description_md || undefined,
					price: Number(commission.base_price_usd ?? 0),
				discountRate: Number(commission.discount_rate ?? 0),
				status: commission.status as CommissionItem["status"],
				artistNote: commission.artist_note || undefined,
				tags: commission.tags || [],
				contentWarnings: commission.content_warnings || [],
				imageUrls: (commission.media || []).map((m) => m.asset.path),
				serviceType: commission.service_type as CommissionItem["serviceType"],
				communicationType:
					commission.communication_type as CommissionItem["communicationType"],
				requestingProcess:
					commission.requesting_process as CommissionItem["requestingProcess"],
				artistTerms: artistData?.terms?.[0]
					? {
							version: artistData.terms[0].version,
							tosMd: artistData.terms[0].tos_md,
							isActive: artistData.terms[0].is_active,
							createdAt: new Date(), // Terms date not in DbArtistTerm interface, using now as fallback
						}
					: undefined,
				reviews: reviews,
				licenseOptions: licenseOptions,
				artist: artistUser,
			};

			return item;
		} catch (error) {
			console.error("[getCommission] Error fetching commission:", error);
			throw error;
		}
	});
