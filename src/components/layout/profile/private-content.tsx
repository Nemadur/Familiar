import { useTranslation } from "react-i18next";
import { OutlineLock } from "@/components/icons/icons";

export function PrivateContent() {
	const { t } = useTranslation();

	return (
		<div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
			<OutlineLock className="mb-4 size-16 opacity-50" />
			<h3 className="mb-2 text-lg font-medium">
				{t("components.profile.private_content.title")}
			</h3>
			<p className="text-sm">
				{t("components.profile.private_content.description")}
			</p>
		</div>
	);
}
