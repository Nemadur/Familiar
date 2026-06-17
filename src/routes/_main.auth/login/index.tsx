import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import LoginForm from "@/components/layout/auth/form/login";
import { AuthLegalFooter } from "@/components/layout/auth/footer";
import { Typography } from "@heroui/react";

export const Route = createFileRoute("/_main/auth/login/")({
	component: LoginPage,
});

function LoginPage() {
	const navigate = useNavigate();
	const { t } = useTranslation();

	return (
		<article className="flex h-full flex-1 flex-col">
			<header className="flex flex-col py-6">
				<Typography.Heading level={3}>{t("auth.login.title", "Login")}</Typography.Heading>
				<Typography.Paragraph size="sm" className="text-muted-foreground">
					{t("auth.login.description", "Login to Familiar")}
				</Typography.Paragraph>
			</header>

			<section aria-labelledby="auth-page-title" className="mt-4 h-full">
				<LoginForm
					onSuccess={() => navigate({ to: "/" })}
					onModeChange={() => navigate({ to: "/auth/register" })}
					onForgot={() => navigate({ to: "/auth/forgot" })}
				/>
			</section>

			<AuthLegalFooter />
		</article>
	);
}
