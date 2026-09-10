import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { OutlineCheckmarkSeal } from "@/components/icons/icons";
import {
	REGISTER_ARTWORK_BY_STAGE,
	useSetAuthArtwork,
} from "@/components/layout/auth/artwork";
import { EmptyPage } from "@/components/layout/empty-page";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/{-$locale}/_main/auth/email-confirmed")({
	component: EmailConfirmedPage,
});

function EmailConfirmedPage() {
	const { locale } = Route.useParams();
	const { t } = useTranslation();

	useSetAuthArtwork(REGISTER_ARTWORK_BY_STAGE.verify);

	return (
		<article className="flex h-full min-w-0 flex-1 overflow-x-hidden">
			<EmptyPage
				icon={OutlineCheckmarkSeal}
				title={t("auth.email_confirmed.title", "Your email has been confirmed")}
				description={t(
					"auth.email_confirmed.description",
					"You can close this tab and return to the registration page. It will update automatically.",
				)}
				className="min-h-112.5 p-0"
				iconContainerClassName="bg-success/12"
				iconClassName="text-success-foreground"
			>
				<Button asChild size="xl">
					<Link to="/{-$locale}" params={{ locale }}>
						{t("auth.email_confirmed.continue", "Continue to Familiar")}
					</Link>
				</Button>
			</EmptyPage>
		</article>
	);
}
