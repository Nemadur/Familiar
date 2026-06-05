import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import LoginForm from "@/components/layout/auth/form/login";
import { TypographyH3 } from "@/components/ui/typography/h3";
import { TypographyMuted } from "@/components/ui/typography/muted";
import { AuthLegalFooter } from "@/components/layout/auth/footer";

export const Route = createFileRoute("/_main/auth/login/")({
	component: LoginPage,
});

function LoginPage() {
	const navigate = useNavigate();
	const { t } = useTranslation();

	return (
		<article className="flex h-full flex-1 flex-col">
			<header className="flex flex-col gap-2 py-8">
				<TypographyH3>{t("auth.login.title", "Login")}</TypographyH3>
				<TypographyMuted>
					{t("auth.login.description", "Login to Familiar")}
				</TypographyMuted>
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
