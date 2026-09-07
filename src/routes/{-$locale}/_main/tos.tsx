import { createFileRoute } from "@tanstack/react-router";
import { TermsOfService } from "@/components/layout/terms-of-service";
import i18n from "@/lib/i18n";
import { getSeoLinks, seo } from "@/lib/seo";

export const Route = createFileRoute("/{-$locale}/_main/tos")({
	head: ({ params }) => ({
		meta: seo({
			title: i18n.t("seo.terms_of_service.title", "Terms of Service"),
			description: i18n.t(
				"seo.terms_of_service.description",
				"Read Familiar's Terms of Service.",
			),
			pathname: "/tos",
			locale: params.locale,
		}),
		links: getSeoLinks("/tos", params.locale),
	}),
	component: RouteComponent,
});

function RouteComponent() {
	return <TermsOfService />;
}
