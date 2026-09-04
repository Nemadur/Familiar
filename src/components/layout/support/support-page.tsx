import { Typography } from "@heroui/react";
import {
    BadgeCheck,
    Film,
    Folder,
    HeartHandshake,
    Image as ImageIcon,
    LayoutGrid,
    Palette,
    Shapes,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { OutlineCheckmarkSeal, OutlineHeart, SolidCheckmarkSeal } from "@/components/icons/icons";

export function SupportPage() {
    const { t } = useTranslation();

    const visualFeatures = [
        {
            icon: Film,
            status: "confirmed" as const,
            title: t("support.features.animated_avatar.title", "Animated avatars"),
            description: t(
                "support.features.animated_avatar.description",
                "Use a GIF or animated image as your avatar and bring your identity to life across Familiar.",
            ),
        },
        {
            icon: ImageIcon,
            status: "confirmed" as const,
            title: t("support.features.animated_cover.title", "Animated profile covers"),
            description: t(
                "support.features.animated_cover.description",
                "Add movement to your profile header with an animated cover that matches your style.",
            ),
        },
        {
            icon: Folder,
            status: "confirmed" as const,
            title: t("support.features.colored_folders.title", "Colored folders"),
            description: t(
                "support.features.colored_folders.description",
                "Give each portfolio folder its own color so collections are easier to recognize and organize.",
            ),
        },
        {
            icon: Palette,
            status: "planned" as const,
            title: t("support.features.profile_palettes.title", "Profile palettes"),
            description: t(
                "support.features.profile_palettes.description",
                "Apply coordinated accent palettes to profile controls, highlights, and small interface details.",
            ),
        },
        {
            icon: Shapes,
            status: "planned" as const,
            title: t("support.features.folder_icons.title", "Folder icons"),
            description: t(
                "support.features.folder_icons.description",
                "Choose a small symbol for each folder to give portfolio collections more personality.",
            ),
        },
        {
            icon: LayoutGrid,
            status: "planned" as const,
            title: t("support.features.portfolio_accents.title", "Portfolio accents"),
            description: t(
                "support.features.portfolio_accents.description",
                "Add subtle visual accents to featured work without changing how the portfolio itself functions.",
            ),
        },
    ];

    const questions = [
        {
            question: t(
                "support.faq.subscription.question",
                "How do the payment options work?",
            ),
            answer: t(
                "support.faq.subscription.answer",
                "Monthly and yearly support renew automatically. Lifetime support is a single payment with no renewal.",
            ),
        },
        {
            question: t(
                "support.faq.access.question",
                "Will regular Familiar features become paid?",
            ),
            answer: t(
                "support.faq.access.answer",
                "No. Functional features remain available to everyone. Supporter unlocks are limited to visual customization.",
            ),
        },
        {
            question: t(
                "support.faq.features.question",
                "Which visual features are confirmed?",
            ),
            answer: t(
                "support.faq.features.answer",
                "Animated avatars, animated profile covers, and colored folders are confirmed. Other items shown here are ideas for later releases.",
            ),
        },
    ];

    const supportPlans = [
        {
            value: "monthly",
            label: t("support.plans.monthly.label", "Monthly"),
            price: "€3",
            interval: t("support.plans.monthly.interval", "/ month"),
            description: t(
                "support.plans.monthly.description",
                "Flexible recurring support with access to supporter visuals while your plan is active.",
            ),
            action: t("support.plans.monthly.action", "Support monthly"),
        },
        {
            value: "yearly",
            label: t("support.plans.yearly.label", "Yearly"),
            price: "€29",
            interval: t("support.plans.yearly.interval", "/ year"),
            description: t(
                "support.plans.yearly.description",
                "One annual renewal with the same visual extras and a lower effective monthly price.",
            ),
            action: t("support.plans.yearly.action", "Support yearly"),
        },
        {
            value: "lifetime",
            label: t("support.plans.lifetime.label", "Lifetime"),
            price: "€49",
            interval: t("support.plans.lifetime.interval", "once"),
            description: t(
                "support.plans.lifetime.description",
                "A single payment that keeps supporter visual customization on your account permanently.",
            ),
            action: t("support.plans.lifetime.action", "Support for life"),
        },
    ];

    const handleMockCheckout = () => {
        toast.info(
            t(
                "support.checkout.mock",
                "Checkout is not available in this mockup yet.",
            ),
        );
    };

    return (
        <div className="flex w-full flex-col gap-12 px-4 py-6 sm:gap-16 lg:px-6 lg:gap-20 lg:py-10">
            <section className="rounded-3xl bg-surface-2 p-6 sm:p-8 lg:p-10">
                <div className="flex max-w-3xl flex-col items-start gap-5">
                    <Typography.Paragraph size="sm" className="inline-flex items-center gap-2 font-medium text-muted-foreground!">
                        <OutlineHeart className="size-5" aria-hidden="true" />
                        {t("support.eyebrow", "Support Familiar")}
                    </Typography.Paragraph>

                    <div className="flex flex-col gap-4">
                        <Typography.Heading level={2} className="m-0">
                            {t(
                                "support.hero.title",
                                "Help us build a better home for artists.",
                            )}
                        </Typography.Heading>
                        <Typography.Paragraph
                            size="base"
                            className="m-0 max-w-2xl text-pretty"
                        >
                            {t(
                                "support.hero.description",
                                "Familiar is built to make sharing art and working with clients feel more human. Your support helps us keep developing it independently.",
                            )}
                        </Typography.Paragraph>
                    </div>

                    <Button size="xl" asChild>
                        <a href="#plans">
                            {t(
                                "support.hero.cta",
                                "Explore support options",
                            )}
                        </a>
                    </Button>
                </div>
            </section>

            <section
                id="features"
                aria-labelledby="features-heading"
                className="flex scroll-mt-24 flex-col gap-8"
            >
                <div className="flex max-w-2xl flex-col gap-3">
                    <Typography.Paragraph size={"sm"} className="text-muted-foreground!">
                        {t("support.features.eyebrow", "Visual customization")}
                    </Typography.Paragraph>
                    <Typography.Heading level={2}
                        id="features-heading"
                        className="font-semibold tracking-tight"
                    >
                        {t(
                            "support.features.title",
                            "More ways to make Familiar yours.",
                        )}
                    </Typography.Heading>
                    <Typography.Paragraph
                        size="base"
                        className="max-w-xl leading-7 text-muted-foreground!">
                        {t(
                            "support.features.description",
                            "Supporter features are cosmetic only. Portfolios, commissions, chat, discovery, and every functional part of Familiar remain available to everyone.",
                        )}
                    </Typography.Paragraph>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {visualFeatures.map((feature) => {
                        const Icon = feature.icon;
                        const isConfirmed = feature.status === "confirmed";

                        return (
                            <article
                                key={feature.title}
                                className="flex h-full flex-col justify-between gap-5 rounded-2xl bg-surface-2 p-5 sm:p-6"
                            >
                                <div className="flex flex-col gap-5">
                                    {/* <div className="flex size-10 items-center justify-center rounded-full bg-surface-1"> */}
                                        <Icon
                                            className="size-8"
                                            aria-hidden="true"
                                        />
                                    {/* </div> */}
                                    <div className="flex flex-col gap-2">
                                        <Typography.Heading level={5} className="font-medium">
                                            {feature.title}
                                        </Typography.Heading>
                                        <Typography.Paragraph
                                            size="sm"
                                            className="text-sm leading-6 text-muted-foreground!">
                                            {feature.description}
                                        </Typography.Paragraph>
                                    </div>
                                </div>

                                <Badge
                                    variant={
                                        isConfirmed ? "default" : "secondary"
                                    }
                                    className={cn("w-fit", isConfirmed && "hidden")}
                                >
                                    {isConfirmed
                                        ? t(
                                              "support.features.status.confirmed",
                                              "Confirmed",
                                          )
                                        : t(
                                              "support.features.status.soon",
                                              "Soon",
                                          )}
                                </Badge>
                            </article>
                        );
                    })}
                </div>
            </section>

            <section
                id="plans"
                aria-labelledby="plans-heading"
                className="scroll-mt-24 rounded-3xl bg-surface-2 p-6 sm:p-8 lg:p-10"
            >
                <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
                    <div className="flex min-w-0 flex-1 flex-col gap-7">
                        <div className="flex flex-col gap-3">
                            <Typography.Paragraph size="sm" className="flex items-center gap-2 font-medium text-muted-foreground!">
                                <OutlineHeart
                                    className="size-5"
                                    aria-hidden="true"
                                />
                                {t("support.plans.eyebrow", "Support options")}
                            </Typography.Paragraph>
                            <Typography.Heading level={2}
                                id="plans-heading"
                                className="font-semibold tracking-tight"
                            >
                                {t(
                                    "support.plans.title",
                                    "Choose how you want to support Familiar",
                                )}
                            </Typography.Heading>
                            <Typography.Paragraph
                                size="sm"
                                className="max-w-xl leading-7 text-muted-foreground!">
                                {t(
                                    "support.plans.description",
                                    "Every option unlocks the same visual customization. Choose recurring support or make one lifetime contribution.",
                                )}
                            </Typography.Paragraph>
                        </div>

                        <Typography.Paragraph
                            size="xs"
                            className="leading-5 text-muted-foreground!">
                            {t(
                                "support.plans.disclaimer",
                                "This is an early mockup. Prices and planned visual ideas may change before checkout launches.",
                            )}
                        </Typography.Paragraph>
                    </div>

                    <aside className="flex min-w-0 flex-1 flex-col gap-5">
                        <Typography.Paragraph size={'sm'} className="flex items-center gap-2 font-medium">
                            <OutlineCheckmarkSeal
                                className="size-5"
                                aria-hidden="true"
                            />
                            {t("support.plans.label", "Supporter access")}
                        </Typography.Paragraph>

                        <Tabs
                            defaultValue="lifetime"
                            className="flex w-full flex-col gap-6"
                        >
                            <TabsList className="w-full">
                                {supportPlans.map((plan) => (
                                    <TabsTrigger
                                        key={plan.value}
                                        value={plan.value}
                                        className="py-2"
                                    >
                                        {plan.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            {supportPlans.map((plan) => (
                                <TabsContent
                                    key={plan.value}
                                    value={plan.value}
                                    className="m-0"
                                >
                                    <div className="flex flex-col gap-5">
                                        <div className="flex items-end gap-2">
                                            <Typography.Heading level={1} className="font-semibold tracking-tight">
                                                {plan.price}
                                            </Typography.Heading>
                                            <Typography.Paragraph
                                                size={'sm'}
                                                className="pb-1 text-sm text-muted-foreground!">
                                                {plan.interval}
                                            </Typography.Paragraph>
                                        </div>

                                        <Typography.Paragraph
                                            size={'sm'}
                                            className="leading-6 text-muted-foreground!">
                                            {plan.description}
                                        </Typography.Paragraph>

                                        <div className="flex flex-col gap-3">
                                            <Button
                                                type="button"
                                                size="2xl"
                                                className="w-full"
                                                onClick={handleMockCheckout}
                                            >
                                                {plan.action}
                                            </Button>
                                        </div>
                                    </div>
                                </TabsContent>
                            ))}
                        </Tabs>
                    </aside>
                </div>
            </section>

            <section
                aria-labelledby="faq-heading"
                className="mx-auto flex w-full max-w-3xl flex-col gap-6 pb-10 sm:pb-16 lg:pb-20"
            >
                <Typography.Heading level={2}
                    id="faq-heading"
                    className="font-semibold tracking-tight"
                >
                    {t("support.faq.title", "Questions about support")}
                </Typography.Heading>

                <Accordion
                    type="single"
                    collapsible
                    className="flex flex-col gap-2"
                >
                    {questions.map((item, index) => (
                        <AccordionItem
                            key={item.question}
                            value={`support-question-${index}`}
                            className="rounded-2xl border-0 bg-surface-2 px-5 sm:px-6"
                        >
                            <AccordionTrigger className="py-4 text-left font-medium hover:no-underline">
                                {item.question}
                            </AccordionTrigger>
                            <AccordionContent className="max-w-2xl pb-5 text-sm leading-6 text-muted-foreground sm:text-base">
                                {item.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </section>
        </div>
    );
}
