import { createFileRoute } from "@tanstack/react-router";
import { PrivacyPolicy } from "@/components/layout/privacy-policy";
import i18n from "@/lib/i18n";
import { getSeoLinks, seo } from "@/lib/seo";

export const Route = createFileRoute("/{-$locale}/_main/privacy")({
	head: ({ params }) => ({
		meta: seo({
			title: i18n.t("seo.privacy-policy.title", "Privacy Policy"),
			description: i18n.t(
				"seo.privacy-policy.description",
				"Read Familiar's Privacy Policy.",
			),
			pathname: "/privacy",
			locale: params.locale,
		}),
		links: getSeoLinks("/privacy", params.locale),
	}),
	component: RouteComponent,
});

function RouteComponent() {
	return <PrivacyPolicy />;
}
