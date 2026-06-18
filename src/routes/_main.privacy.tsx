import { PrivacyPolicy } from "@/components/layout/privacy-policy";
import i18n from "@/lib/i18n";
import { seo } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_main/privacy")({
	head: () => ({
		meta: seo({
			title: i18n.t("seo.privacy-policy.title", "Privacy Policy"),
			description: i18n.t(
				"seo.privacy-policy.description",
				"Read Familiar's Privacy Policy.",
			),
		}),
	}),
	component: RouteComponent,
});

function RouteComponent() {
	return <PrivacyPolicy />;
}
