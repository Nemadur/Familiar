import { useQuery } from "@tanstack/react-query";
import type { Character } from "@/types/character";
import type { PostWithAuthor } from "@/types/post";

// import type { Folder } from "@/types/folder";

type Folder = {
	id: string;
	name: string;
};

type ProfileContent = {
	posts: PostWithAuthor[];
	folders: Folder[];
	characters: Character[];
};

export function useProfileContent(userId: string, tab: string) {
	return useQuery<ProfileContent>({
		queryKey: ["profile-content", userId, tab],
		queryFn: async () => {
			// Mocked data for now since we don't have endpoints for posts/folders/characters
			// In the future, this will be replaced with real API calls using apiFetch
			return {
				posts: [],
				folders: [],
				characters: [],
			};
		},
		enabled: !!userId,
	});
}
