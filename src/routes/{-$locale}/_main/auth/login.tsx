import { Typography } from "@heroui/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { AuthLegalFooter } from "@/components/layout/auth/footer";
import LoginForm from "@/components/layout/auth/form/login";

export const Route = createFileRoute("/{-$locale}/_main/auth/login")({
	component: LoginPage,
});

function LoginPage() {
	const { locale } = Route.useParams();
	const navigate = useNavigate();
	const { t } = useTranslation();

	return (
		<article className="flex h-full flex-1 flex-col">
			<header className="flex flex-col py-3">
				<Typography.Heading level={3}>
					{t("auth.login.title", "Login")}
				</Typography.Heading>
				<Typography.Paragraph size="sm" className="text-muted-foreground">
					{t("auth.login.description", "Login to Familiar")}
				</Typography.Paragraph>
			</header>

			<section aria-labelledby="auth-page-title" className="mt-4 h-full">
				<LoginForm
					onSuccess={() =>
						navigate({ to: "/{-$locale}", params: { locale } })
					}
					onModeChange={() =>
						navigate({ to: "/{-$locale}/auth/register", params: { locale } })
					}
					onForgot={() =>
						navigate({ to: "/{-$locale}/auth/forgot", params: { locale } })
					}
				/>
			</section>

			<AuthLegalFooter />
		</article>
	);
}
