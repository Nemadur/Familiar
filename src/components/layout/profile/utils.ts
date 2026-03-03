import type { Folder as FolderType } from "@/data/folders";
import type { CommissionItem } from "@/types/commission";
import type { PostImage, PostWithAuthor } from "@/types/post";
import type { User } from "@/types/user";

export function mapCommissionToCommissionItem(commission: any): CommissionItem {
	return {
		id: commission.id || commission.listingId,
		title: commission.title,
		description:
			commission.description ||
			commission.descriptionMd ||
			commission.content ||
			"",
		price: Number(commission.price ?? commission.basePrice ?? commission.basePriceUsd ?? 0),
		discountRate: Number(commission.discountRate || 0),
		imageUrls: (commission.imageUrls || []).map((url: string) => url),
		status: commission.status || "open",
		artistNote: commission.artistNote,
		reviews: (commission.reviews || []).map((r: any) => ({
			id: r.reviewId,
			authorName: r.author?.displayName || "Anonymous",
			authorAvatar: r.author?.avatarPath,
			rating: r.rating,
			comment: r.body,
			createdAt: r.createdAt,
			itemName: commission.title,
		})),
		tags: commission.tags || [],
		contentWarnings: commission.contentWarnings || [],
	};
}

export function mapPostToPostWithAuthor(post: any, user: User): PostWithAuthor {
	return {
		// Map ID
		id: post.id || post.post_id || post.postId,
		authorId: user.uuid,

		// Map content
		title: post.title || "Untitled",
		description: post.content || post.description || post.body_md || "",

		// Map images
		images: (post.media || post.images || post.imageUrls || []).map(
			(img: any, i: number): PostImage => {
				if (typeof img === "string") {
					return {
						id: `img-${post.id}-${i}`,
						assetId: `asset-${post.id}-${i}`,
						path: img,
						width: 1000,
						height: 1000,
						alt: "",
						type: "image",
						mime: "image/jpeg",
					};
				}
				if (img.asset) {
					return {
						id: `media-${post.id}-${i}`,
						assetId: img.assetId,
						path: img.asset.path,
						width: img.asset.width || 1000,
						height: img.asset.height || 1000,
						alt: img.asset.alt || "",
						type: img.asset.type || "image",
						mime: img.asset.mime || "image/jpeg",
					};
				}
				return {
					id: img.id || `img-${post.id}-${i}`,
					assetId: img.assetId || `asset-${post.id}-${i}`,
					path: img.path,
					width: img.width || 1000,
					height: img.height || 1000,
					alt: img.alt || "",
					type: img.type || "image",
					mime: img.mime || "image/jpeg",
				};
			},
		),

		// Metrics
		likeCount: post.likes_count || post.likeCount || 0,
		viewCount: post.views_count || post.viewCount || 0,

		// Status
		isLiked: post.isLiked || false,
		isBookmarked: post.isBookmarked || false,
		isReposted: post.isReposted || false,
		isCommented: post.isCommented || false,

		// Timestamps
		createdAt: post.created_at || post.createdAt || new Date().toISOString(),
		updatedAt: post.updated_at || post.updatedAt || new Date().toISOString(),

		// Metadata
		tags: post.tags || [],
		visibility: post.visibility || "public",
		contentWarnings: post.content_warnings || post.contentWarnings || [],

		folderIds: (post.folders || []).map((f: any) => f.folderId),

		// Linked Content (Mock for now, should map from DB)
		linkedCharacters: post.linkedCharacters || post.characters || [],
		featuredReview: post.featuredReview || post.review || undefined,

		isCommission: false,
		author: user,
	};
}

export function mapCommissionToPostWithAuthor(
	commission: any,
	user: User,
): PostWithAuthor {
	return {
		id: commission.id || commission.listingId,
		authorId: user.uuid,
		title: commission.title || "Commission",
		description:
			commission.content ||
			commission.description ||
			commission.descriptionMd ||
			"",
		images: (commission.imageUrls || []).map(
			(url: string, i: number): PostImage => ({
				id: `comm-img-${commission.id}-${i}`,
				assetId: `comm-asset-${commission.id}-${i}`,
				path: url,
				width: 1000,
				height: 1000,
				alt: "",
				type: "image",
				mime: "image/jpeg",
			}),
		),
		likeCount: 0,
		viewCount: 0,
		repostCount: 0,
		commentCount: 0,
		bookmarkCount: 0,
		createdAt: commission.createdAt,
		updatedAt: commission.updatedAt,
		isLiked: false,
		isBookmarked: false,
		isReposted: false,
		isCommented: false,
		tags: commission.tags || [],
		visibility: "public",
		contentWarnings: [],
		isCommission: true,
		author: user,
	};
}

import { slugify } from "@/lib/utils";

export function mapFolderToFolderType(
	folder: any,
	allPosts: any[] = [],
): FolderType {
	const imagesFromPosts = (folder.posts || [])
		.map((fp: any) => fp.post?.media?.[0]?.asset?.path) // Take only the first image of each post
		.filter(Boolean);

	const images =
		imagesFromPosts.length > 0 ? imagesFromPosts : folder.imageUrls || [];

	const targetId = folder.folderId || folder.id;

	const postCount =
		allPosts.length > 0
			? allPosts.filter(
					(p) =>
						p.folders?.some((f: any) => f.folderId === targetId) ||
						p.folderIds?.includes(targetId),
				).length
			: folder.posts?.length || 0;

	return {
		id: targetId,
		parentId: folder.parentId || null,
		slug: slugify(folder.name || ""),
		name: folder.name,
		count: postCount,
		images: images,
	};
}
