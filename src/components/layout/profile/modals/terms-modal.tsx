import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { MarkdownDisplay } from "@/components/common/markdown-display";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface TermsModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	artistName: string;
	tosMd: string;
	lastUpdated?: number;
}

export function TermsModal({
	open,
	onOpenChange,
	artistName,
	tosMd,
	lastUpdated,
}: TermsModalProps) {
	const { t } = useTranslation();

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
				<DialogHeader className="p-6 border-b shrink-0">
					<DialogTitle className="text-2xl font-bold">
						{artistName}'s Terms of Service
					</DialogTitle>
					{lastUpdated && (
						<p className="text-sm text-muted-foreground">
							Updated {format(new Date(lastUpdated), "PPP")}
						</p>
					)}
				</DialogHeader>

				<div className="flex-1 overflow-y-auto p-6">
					<MarkdownDisplay content={tosMd} />
				</div>
			</DialogContent>
		</Dialog>
	);
}
