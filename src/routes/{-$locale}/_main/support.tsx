import { createFileRoute } from "@tanstack/react-router";

import { SupportPage } from "@/components/layout/support/support-page";
import i18n from "@/lib/i18n";
import { getSeoLinks, seo } from "@/lib/seo";

export const Route = createFileRoute("/{-$locale}/_main/support")({
    head: ({ params }) => ({
        meta: seo({
            title: i18n.t("seo.support.title", "Support Familiar"),
            description: i18n.t(
                "seo.support.description",
                "Support the independent development of Familiar with a one-time lifetime contribution.",
            ),
            pathname: "/support",
            locale: params.locale,
        }),
        links: getSeoLinks("/support", params.locale),
    }),
    component: SupportRoute,
});

function SupportRoute() {
    return <SupportPage />;
}
