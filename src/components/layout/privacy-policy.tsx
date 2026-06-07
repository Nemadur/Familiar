import { Typography } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { Badge } from "../ui/badge";
import { dateFormat } from "@/lib/utils";
import { MarkdownDisplay } from "../ui/markdown-display";

type PrivacyPolicySection = {
	title: string;
	body?: string[];
	items?: string[];
};

export function PrivacyPolicy() {
	const { t, i18n } = useTranslation();

	const effectiveDate = t("privacyPolicy.effectiveDate", {
		defaultValue: "2026-06-07",
	});

	const sections = t("privacyPolicy.sections", {
		returnObjects: true,
		defaultValue: [],
	}) as PrivacyPolicySection[];

	return (
		<main className="px-6 py-12">
			<section
				aria-labelledby="privacy-policy-title"
				className="mx-auto"
			>
				<header className="flex flex-col gap-3">
					<div className="flex flex-col gap-1">
						<Typography.Paragraph
							size="xs"
							className="font-mono text-muted-foreground uppercase tracking-[0.3em]"
						>
							{t("privacyPolicy.eyebrow", "Legal")}
						</Typography.Paragraph>

						<Typography.Heading id="privacy-policy-title" level={2}>
							{t("privacyPolicy.title", "Privacy Policy")}
						</Typography.Heading>
					</div>

					<Typography.Paragraph
						size="sm"
						className="text-muted-foreground"
					>
						{t(
							"privacyPolicy.description",
							"Learn how Familiar collects, uses, and protects your information.",
						)}
					</Typography.Paragraph>

					<div className="flex flex-wrap items-center gap-2">
						<Badge size="sm" variant="secondary">
							{t("privacyPolicy.effectiveDateLabel", "Effective date")}
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
					<Typography.Prose className="prose max-w-none prose-neutral dark:prose-invert prose-headings:font-heading prose-h2:mt-10 prose-h2:scroll-m-20 prose-p:text-foreground prose-li:text-muted-foreground">
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