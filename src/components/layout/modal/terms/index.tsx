import { format } from "date-fns";
import { useSyncExternalStore } from "react";
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

type FormattedDateSnapshot = {
	formattedDate: string;
	dateTime: string;
} | null;

const formattedDateCache = new Map<string, FormattedDateSnapshot>();

function subscribeToFormattedDateStore() {
	return () => {};
}

function getClientFormattedDateSnapshot(value: string): FormattedDateSnapshot {
	const cached = formattedDateCache.get(value);

	if (cached !== undefined) {
		return cached;
	}

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		formattedDateCache.set(value, null);
		return null;
	}

	const snapshot = {
		formattedDate: format(date, "PPP"),
		dateTime: date.toISOString(),
	};

	formattedDateCache.set(value, snapshot);

	return snapshot;
}

function getServerFormattedDateSnapshot(): FormattedDateSnapshot {
	return null;
}

function useClientFormattedDate(value: string) {
	return useSyncExternalStore(
		subscribeToFormattedDateStore,
		() => getClientFormattedDateSnapshot(value),
		getServerFormattedDateSnapshot,
	);
}

function ClientFormattedDate({ value }: { value: string }) {
	const snapshot = useClientFormattedDate(value);

	if (!snapshot) {
		return null;
	}

	return <time dateTime={snapshot.dateTime}>{snapshot.formattedDate}</time>;
}

export function TermsModal({ open, onOpenChange, artistId }: TermsModalProps) {
	const { t } = useTranslation();
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
								date: "",
								defaultValue: "Updated",
							}).trim()}{" "}
							<ClientFormattedDate value={tosData.updatedAt} />
						</p>
					)}
				</DialogHeader>

				<div className="flex-1 overflow-y-auto p-6">
					{isTosPending ? (
						<p className="text-sm text-muted-foreground">
							{t("components.profile.terms_of_service.loading", "Loading...")}
						</p>
					) : tosError ? (
						<p className="text-sm text-destructive">
							{tosError instanceof Error
								? tosError.message
								: t(
										"components.profile.terms_of_service.error",
										"Failed to load terms of service.",
									)}
						</p>
					) : (
						<MarkdownDisplay content={tosData?.tosText || ""} />
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
