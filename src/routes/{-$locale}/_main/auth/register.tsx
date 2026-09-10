import { Typography } from "@heroui/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
	REGISTER_ARTWORK_BY_STAGE,
	useSetAuthArtwork,
} from "@/components/layout/auth/artwork";
import { AuthLegalFooter } from "@/components/layout/auth/footer";
import RegisterForm from "@/components/layout/auth/form/register";
import type { RegisterStage } from "@/types/auth/form/register";

export const Route = createFileRoute("/{-$locale}/_main/auth/register")({
	component: RegisterPage,
});

function RegisterPage() {
	const { locale } = Route.useParams();
	const navigate = useNavigate();
	const { t } = useTranslation();
	const [stage, setStage] = useState<RegisterStage>("account");

	useSetAuthArtwork(REGISTER_ARTWORK_BY_STAGE[stage]);

	return (
		<article className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
			{stage !== "verify" ? (
				<header className="flex flex-col py-3">
					<Typography.Heading level={3}>
						{t("auth.register.title", "Register")}
					</Typography.Heading>

					<Typography.Paragraph size="sm" className="text-muted-foreground">
						{t("auth.register.description", "Register to Familiar")}
					</Typography.Paragraph>
				</header>
			) : null}

			<section
				aria-labelledby="auth-page-title"
				className="mt-4 min-h-0 min-w-0 flex-1"
			>
				<RegisterForm
					onStageChange={setStage}
					onSuccess={() => navigate({ to: "/{-$locale}", params: { locale } })}
					onModeChange={() =>
						navigate({ to: "/{-$locale}/auth/login", params: { locale } })
					}
				/>
			</section>

			<AuthLegalFooter />
		</article>
	);
}
