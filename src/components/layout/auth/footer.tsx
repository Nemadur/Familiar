import { Button } from "@/components/ui/button";
import { Typography } from "@heroui/react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export function AuthLegalFooter() {
	const { t } = useTranslation();

	return (
		<footer className="mt-auto flex flex-col gap-4 pt-6 text-center text-sm">
			<Typography.Paragraph size="sm" className="text-muted-foreground">
				{t("auth.terms_agree.label")}{" "}
				<Button asChild variant="link" className="h-auto p-0">
					<Link to="/">{t("auth.terms_agree.terms")}</Link>
				</Button>{" "}
				{t("auth.terms_agree.and")}{" "}
				<Button asChild variant="link" className="h-auto p-0">
					<Link to="/">{t("auth.terms_agree.privacy")}</Link>
				</Button>
				.
			</Typography.Paragraph>
		</footer>
	);
}
