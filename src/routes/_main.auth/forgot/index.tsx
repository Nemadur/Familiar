import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import ForgotForm from "@/components/layout/auth/form/forgot";
import { TypographyH3 } from "@/components/ui/typography/h3";
import { TypographyMuted } from "@/components/ui/typography/muted";

export const Route = createFileRoute("/_main/auth/forgot/")({
	component: ForgotPage,
});

function ForgotPage() {
	const navigate = useNavigate();
	const { t } = useTranslation();

	return (
		<article className="flex h-full flex-1 flex-col">
			<header className="flex flex-col gap-2 pt-8">
				<TypographyH3>{t("auth.forgot.title")}</TypographyH3>

				<TypographyMuted>{t("auth.forgot.description")}</TypographyMuted>
			</header>

			<section aria-labelledby="auth-page-title" className="mt-4 h-full">
				<ForgotForm
					onSuccess={() => navigate({ to: "/auth/login" })}
					onModeChange={() => navigate({ to: "/auth/login" })}
				/>
			</section>
		</article>
	);
}
