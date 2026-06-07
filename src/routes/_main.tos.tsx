import { TermsOfService } from "@/components/layout/terms-of-service";
import i18n from "@/lib/i18n";
import { seo } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_main/tos")({
	head: () => ({
		meta: seo({
			title: i18n.t("seo.terms_of_service.title", "Terms of Service"),
			description: i18n.t(
				"seo.terms_of_service.description",
				"Read Familiar's Terms of Service.",
			),
		}),
	}),
	component: RouteComponent,
});

function RouteComponent() {
	return <TermsOfService />;
}
