import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import ForgotForm from "@/components/layout/auth/form/forgot";
import { Typography } from "@heroui/react";

export const Route = createFileRoute("/_main/auth/forgot/")({
	component: ForgotPage,
});

function ForgotPage() {
	const navigate = useNavigate();
	const { t } = useTranslation();

	return (
		<article className="flex h-full flex-1 flex-col">
			<header className="flex flex-col py-6">
				<Typography.Heading level={3}>{t("auth.forgot.title")}</Typography.Heading>

				<Typography.Paragraph size="sm" className="text-muted-foreground">
					{t("auth.forgot.description")}</Typography.Paragraph>
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
