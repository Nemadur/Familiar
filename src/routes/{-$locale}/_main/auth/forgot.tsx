import { Typography } from "@heroui/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import ForgotForm from "@/components/layout/auth/form/forgot";

export const Route = createFileRoute("/{-$locale}/_main/auth/forgot")({
	component: ForgotPage,
});

function ForgotPage() {
	const { locale } = Route.useParams();
	const navigate = useNavigate();
	const { t } = useTranslation();

	return (
		<article className="flex h-full flex-1 flex-col">
			<header className="flex flex-col py-6">
				<Typography.Heading level={3}>
					{t("auth.forgot.title")}
				</Typography.Heading>

				<Typography.Paragraph size="sm" className="text-muted-foreground">
					{t("auth.forgot.description")}
				</Typography.Paragraph>
			</header>

			<section aria-labelledby="auth-page-title" className="mt-4 h-full">
				<ForgotForm
					onSuccess={() =>
						navigate({ to: "/{-$locale}/auth/login", params: { locale } })
					}
					onModeChange={() =>
						navigate({ to: "/{-$locale}/auth/login", params: { locale } })
					}
				/>
			</section>
		</article>
	);
}
