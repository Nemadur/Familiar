import { DialogDescription, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { OutlineArrowLeft, OutlineClose } from "@/components/icons/icons";

interface CommissionRequestHeaderProps {
	onBack: () => void;
	artistName: string;
}

export function CommissionRequestHeader({
	onBack,
	artistName,
}: CommissionRequestHeaderProps) {
	return (
		<div className="z-20 flex shrink-0 items-center justify-between border-b bg-background px-6 py-4">
			<div className="flex items-center gap-2">
				<Button
					variant="ghost"
					size="icon"
					className="-ml-2"
					onClick={onBack}
					type="button"
				>
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
