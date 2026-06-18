import { cn } from "@/lib/utils";
import { OutlineBookmark } from "../icons/icons";
import { Button } from "../ui/button";

export function BookmarkButton({ className }: { className?: string }) {
	return (
		<Button
			size="icon-xl"
			className={cn(
				"shrink-0 bg-transparent text-primary shadow-none before:absolute before:bottom-0 before:backdrop-blur-md before:-z-10 before:h-16 before:w-full before:rounded-b-full before:bg-primary-foreground/80 before:transition-all hover:bg-transparent hover:before:translate-y-1.5 hover:before:bg-primary-foreground/90 hover:[&>svg]:translate-y-1.5 [&>svg]:transition-transform",
				className,
			)}
			onClick={(event) => event.stopPropagation()}
		>
			<OutlineBookmark />
		</Button>
	);
}
