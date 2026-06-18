import { OutlineArrowLeft, OutlineClose } from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import {
	DialogClose,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog";

interface CommissionRequestHeaderProps {
	onBack: () => void;
	artistName: string;
	isPreview?: boolean;
}

export function CommissionRequestHeader({
	onBack,
	artistName,
	isPreview = false,
}: CommissionRequestHeaderProps) {
	return (
		<div className="z-20 flex shrink-0 items-center justify-between border-b bg-background p-4">
			<div className="flex items-center gap-2">
				<Button variant="ghost" size="icon" onClick={onBack} type="button">
					<OutlineArrowLeft />
				</Button>
				<DialogTitle className="flex items-center gap-2">
					Commission Request
					{isPreview && (
						<span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary uppercase tracking-wider">
							Preview
						</span>
					)}
				</DialogTitle>
				<DialogDescription className="sr-only">
					Fill out the form to request a commission from {artistName}
				</DialogDescription>
			</div>
			<DialogClose asChild>
				<Button variant={"ghost"} size={"icon"} type="button">
					<OutlineClose />
				</Button>
			</DialogClose>
		</div>
	);
}
