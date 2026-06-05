import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import RegisterForm from "@/components/layout/auth/form/register";
import { TypographyMuted } from "@/components/ui/typography/muted";
import { TypographyH3 } from "@/components/ui/typography/h3";
import { AuthLegalFooter } from "@/components/layout/auth/footer";

export const Route = createFileRoute("/_main/auth/register/")({
	component: RegisterPage,
});

function RegisterPage() {
	const navigate = useNavigate();
	const { t } = useTranslation();

	return (
		<article className="flex h-full flex-1 flex-col">
			<header className="flex flex-col gap-2 py-8">
				<TypographyH3>{t("auth.register.title", "Register")}</TypographyH3>

				<TypographyMuted>
					{t("auth.register.description", "Register to Familiar")}
				</TypographyMuted>
			</header>

			<section aria-labelledby="auth-page-title" className="mt-4 h-full">
				<RegisterForm
					onSuccess={() => navigate({ to: "/" })}
					onModeChange={() => navigate({ to: "/auth/login" })}
				/>
			</section>

			<AuthLegalFooter />
		</article>
	);
}
