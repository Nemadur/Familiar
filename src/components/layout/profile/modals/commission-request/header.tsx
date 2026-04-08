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
}

export function CommissionRequestHeader({
	onBack,
	artistName,
}: CommissionRequestHeaderProps) {
	return (
		<div className="z-20 flex shrink-0 items-center justify-between border-b bg-background p-4">
			<div className="flex items-center gap-2">
				<Button variant="ghost" size="icon" onClick={onBack} type="button">
					<OutlineArrowLeft />
				</Button>
				<DialogTitle>Commission Request</DialogTitle>
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
