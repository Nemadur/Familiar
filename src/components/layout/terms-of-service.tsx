import { Typography } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { dateFormat } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { MarkdownDisplay } from "../ui/markdown-display";

type TermsOfServiceSection = {
	title: string;
	body?: string[];
	items?: string[];
};

export function TermsOfService() {
	const { t, i18n } = useTranslation();

	const effectiveDate = t("termsOfService.effectiveDate", {
		defaultValue: "2026-06-07",
	});

	const sections = t("termsOfService.sections", {
		returnObjects: true,
		defaultValue: [],
	}) as TermsOfServiceSection[];

	return (
		<main className="px-6 py-12">
			<section
				aria-labelledby="terms-of-service-title"
				className="mx-auto max-w-3xl"
			>
				<header className="flex flex-col gap-3">
					<div className="flex flex-col gap-1">
						<Typography.Paragraph
							size={"xs"}
							className="font-mono text-muted-foreground uppercase tracking-[0.3em]"
						>
							{t("termsOfService.eyebrow", "Legal")}
						</Typography.Paragraph>

						<Typography.Heading level={2}>
							{t("termsOfService.title", "Terms of Service")}
						</Typography.Heading>
					</div>

					<Typography.Paragraph size={"sm"} className="text-muted-foreground">
						{t(
							"termsOfService.description",
							"Please read these terms carefully before using Familiar.",
						)}
					</Typography.Paragraph>

					<div className="flex flex-wrap items-center gap-2">
						<Badge size="sm" variant="secondary">
							{t("termsOfService.effectiveDateLabel", "Effective date")}
						</Badge>

						<time
							dateTime={effectiveDate}
							className="font-mono text-xs text-muted-foreground uppercase tracking-[0.2em]"
						>
							{dateFormat(effectiveDate, i18n.language)}
						</time>
					</div>
				</header>

				<article className="mt-10">
					<Typography.Prose className="prose max-w-none prose-neutral dark:prose-invert prose-headings:font-heading prose-li:text-muted-foreground">
						{sections.map((section) => (
							<section key={section.title}>
								<Typography.Heading level={3}>
									{section.title}
								</Typography.Heading>

								{section.body?.map((paragraph) => (
									<MarkdownDisplay
										key={paragraph}
										className="not-first:mt-6"
										content={paragraph}
									/>
								))}

								{section.items?.length && (
									<ul>
										{section.items.map((item) => (
											<li key={item}>
												<MarkdownDisplay
													content={item}
													className="text-primary"
												/>
											</li>
										))}
									</ul>
								)}
							</section>
						))}
					</Typography.Prose>
				</article>
			</section>
		</main>
	);
}
