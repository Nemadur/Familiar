import { Typography } from "@heroui/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { AuthLegalFooter } from "@/components/layout/auth/footer";
import RegisterForm from "@/components/layout/auth/form/register";

export const Route = createFileRoute("/{-$locale}/_main/auth/register")({
	component: RegisterPage,
});

function RegisterPage() {
	const { locale } = Route.useParams();
	const navigate = useNavigate();
	const { t } = useTranslation();

	return (
		<article className="flex h-full flex-1 flex-col">
			<header className="flex flex-col py-3">
				<Typography.Heading level={3}>
					{t("auth.register.title", "Register")}
				</Typography.Heading>

				<Typography.Paragraph size="sm" className="text-muted-foreground">
					{t("auth.register.description", "Register to Familiar")}
				</Typography.Paragraph>
			</header>

			<section aria-labelledby="auth-page-title" className="mt-4 h-full">
				<RegisterForm
					onSuccess={() =>
						navigate({ to: "/{-$locale}", params: { locale } })
					}
					onModeChange={() =>
						navigate({ to: "/{-$locale}/auth/login", params: { locale } })
					}
				/>
			</section>

			<AuthLegalFooter />
		</article>
	);
}
