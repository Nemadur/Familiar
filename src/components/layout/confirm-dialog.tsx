import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ReactNode } from "react";
import { OutlineClose } from "../icons/icons";

export interface ConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: ReactNode;
	description: ReactNode;
	onConfirm: () => void;
	confirmText?: string;
	cancelText?: string;
	isPending?: boolean;
	variant?:
		| "default"
		| "destructive"
		| "outline"
		| "secondary"
		| "ghost"
		| "link";
}

export function ConfirmDialog({
	open,
	onOpenChange,
	title,
	description,
	onConfirm,
	confirmText = "Confirm",
	cancelText = "Cancel",
	isPending = false,
	variant = "destructive",
}: ConfirmDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent showCloseButton={false} className="max-w-md p-3">
				<DialogHeader className="gap-2">
					<div className="flex items-center justify-between">
						<DialogTitle className="text-xl">{title}</DialogTitle>
						<Button
							size={"icon-lg"}
							variant="ghost"
							onClick={() => onOpenChange(false)}
							disabled={isPending}
						>
							<OutlineClose />
						</Button>
					</div>
					<DialogDescription className="text-base">
						{description}
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="mt-4 gap-2">
					<Button
						size="xl"
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isPending}
					>
						{cancelText}
					</Button>
					<Button
						size="xl"
						variant={variant}
						onClick={onConfirm}
						disabled={isPending}
					>
						{isPending ? (
							<>
								<Loader2 className="animate-spin" />
								{confirmText}
							</>
						) : (
							confirmText
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
