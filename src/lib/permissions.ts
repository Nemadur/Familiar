import {
	AbilityBuilder,
	createMongoAbility,
	type MongoAbility,
} from "@casl/ability";
import type { TUserProfile } from "@/types/user";
import { TRoles } from "@/types/user/roles";

// Define subjects using local interfaces to avoid Drizzle dependency
interface ProfileSubject {
	userId: string;
	isPrivate: boolean;
}

interface PostSubject {
	artistId: string;
	visibility: "public" | "unlisted" | "private";
}

interface ListingSubject {
	artistId: string;
	status: "open" | "closed" | "waitlist" | "draft";
}

interface ShopItemSubject {
	sellerId: string;
}

interface FolderSubject {
	ownerId: string;
}

interface SonaSubject {
	ownerId: string;
	isPrivate: boolean;
}

interface BanSubject {
	userId: string;
}

type UserSubject = "User"; // Generic user management subject

export type AppSubjects =
	| ProfileSubject
	| PostSubject
	| ListingSubject
	| ShopItemSubject
	| FolderSubject
	| SonaSubject
	| BanSubject
	| UserSubject
	| "all"
	| "Profile"
	| "Post"
	| "Listing"
	| "ShopItem"
	| "Folder"
	| "Charater"
	| "Ban";

export type AppActions = "create" | "read" | "update" | "delete" | "manage";

export type AppAbility = MongoAbility<[AppActions, AppSubjects]>;

export const createAbility = createMongoAbility as unknown as () => AppAbility;

// Role hierarchy rank
const ROLE_RANK: Record<string, number> = {
	[TRoles.Guest]: 0,
	[TRoles.User]: 1,
	[TRoles.Artist]: 2,
	[TRoles.Moderator]: 3,
	[TRoles.Admin]: 4,
};

function hasRole(userRoles: string[] | undefined, minimum: TRoles): boolean {
	const roles = userRoles || [];
	const maxRank = Math.max(
		...roles.map((r) => ROLE_RANK[r] ?? 0),
		ROLE_RANK[TRoles.Guest],
	);
	return maxRank >= (ROLE_RANK[minimum] ?? 999);
}

export function getUserPermissions(user: TUserProfile | null | undefined) {
	const { can, cannot, build } = new AbilityBuilder<AppAbility>(
		createMongoAbility,
	);

	// ─── Unauthenticated ────────────────────────────────────────────────
	can("read", "Post", { visibility: "public" });
	can("read", "Listing", { status: "open" });
	can("read", "ShopItem"); // Assuming public by default or handle logic
	can("read", "Charater", { isPrivate: false });
	can("read", "Profile", { isPrivate: false });

	if (!user) {
		return build();
	}

	// ─── Authenticated (Client/User) ────────────────────────────────────
	if (hasRole(user.roles, TRoles.User)) {
		// Users can manage their own content
		can("manage", "Profile", { userId: user.userId });
		can("manage", "Post", { artistId: user.userId });
		can("manage", "Listing", { artistId: user.userId });
		can("manage", "ShopItem", { sellerId: user.userId });
		can("manage", "Folder", { ownerId: user.userId });
		can("manage", "Charater", { ownerId: user.userId });

		// Users can read their own private content
		can("read", "Post", { artistId: user.userId });
		can("read", "Charater", { ownerId: user.userId });
		can("read", "Profile", { userId: user.userId });
		can("read", "Folder", { ownerId: user.userId });
	}

	// ─── Artist ──────────────────────────────────────────────────────────
	if (hasRole(user.roles, TRoles.Artist)) {
		can("create", "Post");
		can("create", "Listing");
		can("create", "ShopItem");
		can("create", "Folder");
		can("create", "Charater");
	}

	// ─── Moderator ───────────────────────────────────────────────────────
	if (hasRole(user.roles, TRoles.Moderator)) {
		can("read", "all");
		can("manage", "Ban");
	}

	// ─── Admin ───────────────────────────────────────────────────────────
	if (hasRole(user.roles, TRoles.Admin)) {
		can("manage", "all");
	}

	return build();
}
