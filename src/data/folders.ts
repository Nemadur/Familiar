export interface Folder {
	id: string;
	parentId: string | null;
	slug: string;
	name: string;
	count: number;
	images: string[];
	hasSubfolders?: boolean;
	// Premium customization
	color?: string;
	icon?: React.ElementType;
}
