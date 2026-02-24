import {
	OutlineFaceSmilling,
	OutlineImage,
	SolidStar,
} from "@/components/icons/icons";
import { EmptyPage } from "@/components/layout/empty-page";
import { Card } from "@/components/ui/card";
import type { Character } from "@/types/character";

interface ProfileCharactersProps {
	characters: Character[];
}

export function ProfileCharacters({ characters }: ProfileCharactersProps) {
	if (characters.length === 0) {
		return (
			<div className="flex h-full flex-1 flex-col items-center justify-center">
				<EmptyPage
					icon={OutlineFaceSmilling}
					title="No characters found"
					description="This user hasn't added any characters yet."
				/>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
			{characters.map((character) => (
				<Card
					key={character.id}
					className="group relative aspect-3/4 cursor-pointer overflow-hidden bg-muted p-0 transition-all"
				>
					<img
						src={character.imageUrl}
						alt={character.name}
						className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
					/>

					{/* Gradient Overlay */}
					<div className="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-black/90 via-black/20 to-transparent p-4">
						<h3 className="truncate font-bold text-lg text-white drop-shadow-md">
							{character.name}
						</h3>

						{/* Stats */}
						<div className="mt-1 mb-2 flex items-center gap-3 text-white/90">
							<div className="flex items-center gap-1.5 font-medium text-xs">
								<OutlineImage size={14} />
								<span>{character.imagesCount}</span>
							</div>
							<div className="flex items-center gap-1.5 font-medium text-xs">
								<SolidStar size={14} className="text-yellow-400" />
								<span>{character.starsCount}</span>
							</div>
						</div>
					</div>
				</Card>
			))}
		</div>
	);
}
