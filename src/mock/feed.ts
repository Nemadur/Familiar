export const MOCK_PINNED_FEEDS = [
	{
		id: "1",
		feedId: "following",
		name: "Following",
		description: "Posts from people you follow",
		type: "system" as const,
	},
	{
		id: "2",
		feedId: "discover",
		name: "Discover",
		description: "Discover new content",
		type: "system" as const,
	},
	{
		id: "3",
		feedId: "mutuals",
		name: "Mutuals",
		description: "Posts from mutual connections",
		type: "system" as const,
	},
];
