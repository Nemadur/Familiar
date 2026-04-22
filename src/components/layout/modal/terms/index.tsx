import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { MarkdownDisplay } from "@/components/common/markdown-display";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useProfileTermsOfService } from "@/hooks/use-tos";

interface TermsModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	artistId: string;
}

export function TermsModal({ open, onOpenChange, artistId }: TermsModalProps) {
	const { t } = useTranslation();

	//Fetch artist Tos
	const { tosData, isTosPending, tosError } =
		useProfileTermsOfService(artistId);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
				<DialogHeader className="p-6 border-b shrink-0">
					<DialogTitle className="text-2xl font-bold">
						{t("components.profile.terms_of_service.title", {
							artistId,
						})}
					</DialogTitle>
					{tosData?.updatedAt && (
						<p className="text-sm text-muted-foreground">
							{t("components.profile.terms_of_service.updated", {
								date: format(new Date(tosData?.updatedAt || ""), "PPP"),
							})}
						</p>
					)}
				</DialogHeader>

				<div className="flex-1 overflow-y-auto p-6">
					<MarkdownDisplay content={tosData?.tosText || ""} />
				</div>
			</DialogContent>
		</Dialog>
	);
}
