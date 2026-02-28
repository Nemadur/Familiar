import {
	AbilityBuilder,
	createMongoAbility,
	type MongoAbility,
} from "@casl/ability";
import type { User } from "@/types/user";

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
	| "Sona"
	| "Ban";

export type AppActions = "create" | "read" | "update" | "delete" | "manage";

export type AppAbility = MongoAbility<[AppActions, AppSubjects]>;

export const createAbility = createMongoAbility as unknown as () => AppAbility;

// Role hierarchy rank
const ROLE_RANK: Record<string, number> = {
	client: 0,
	artist: 1,
	moderator: 2,
	admin: 3,
};

function hasRole(userRoles: string[], minimum: string): boolean {
	const maxRank = Math.max(
		...userRoles.map((r) => ROLE_RANK[r] ?? 0),
		ROLE_RANK.client,
	);
	return maxRank >= (ROLE_RANK[minimum] ?? 999);
}

export function getUserPermissions(user: User | null | undefined) {
	const { can, cannot, build } = new AbilityBuilder<AppAbility>(
		createMongoAbility,
	);

	// ─── Unauthenticated ────────────────────────────────────────────────
	can("read", "Post", { visibility: "public" });
	can("read", "Listing", { status: "open" });
	can("read", "ShopItem"); // Assuming public by default or handle logic
	can("read", "Sona", { isPrivate: false });
	can("read", "Profile", { isPrivate: false });

	if (!user) {
		return build();
	}

	// ─── Authenticated (Client) ─────────────────────────────────────────
	// Users can manage their own content
	can("manage", "Profile", { userId: user.uuid });
	can("manage", "Post", { artistId: user.uuid });
	can("manage", "Listing", { artistId: user.uuid });
	can("manage", "ShopItem", { sellerId: user.uuid });
	can("manage", "Folder", { ownerId: user.uuid });
	can("manage", "Sona", { ownerId: user.uuid });

	// Users can read their own private content
	can("read", "Post", { artistId: user.uuid });
	can("read", "Sona", { ownerId: user.uuid });
	can("read", "Profile", { userId: user.uuid });
	can("read", "Folder", { ownerId: user.uuid });

	// ─── Artist ──────────────────────────────────────────────────────────
	if (hasRole(user.roles, "artist")) {
		can("create", "Post");
		can("create", "Listing");
		can("create", "ShopItem");
		can("create", "Folder");
		can("create", "Sona");
	}

	// ─── Moderator ───────────────────────────────────────────────────────
	if (hasRole(user.roles, "moderator")) {
		can("read", "all");
		can("manage", "Ban");
	}

	// ─── Admin ───────────────────────────────────────────────────────────
	if (hasRole(user.roles, "admin")) {
		can("manage", "all");
	}

	return build();
}
