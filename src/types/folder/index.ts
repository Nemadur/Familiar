export type UUID = string;

export type FolderVisibility = "private" | "public" | "url_only";

export type Folder = {
	folder_id: UUID;
	owner_id: UUID;
	parent_id: UUID | null;
	name: string;
	description: string | null;
	sort_order: number;
	is_archived: boolean;
	visibility: FolderVisibility;
	share_token: string | null;
	share_expires_at: Date | null;
	created_at: Date;
	updated_at: Date;
};

export type FolderItemKind = "post" | "commission_listing" | "shop_item";

export type FolderItemRef =
	| { kind: "post"; post_id: UUID; added_at: Date }
	| { kind: "commission_listing"; listing_id: UUID; added_at: Date }
	| { kind: "shop_item"; item_id: UUID; added_at: Date };
