import { Typography } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { cn, dateFormat } from "@/lib/utils";
import type {
	TRoadmapInput,
	TRoadmapItem,
	TRoadmapStatus,
} from "@/types/roadmap";
import { Badge } from "../ui/badge";
import { MarkdownDisplay } from "../ui/markdown-display";

const STATUS_STYLES = {
	Planned:
		"bg-indigo-500/12 text-indigo-700 dark:text-indigo-400 dark:selection:text-indigo-200! dark:selection:bg-indigo-200/12! selection:text-indigo-900! selection:bg-indigo-900/12!",
	InProgress:
		"bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 dark:selection:text-emerald-200! dark:selection:bg-emerald-200/12! selection:text-emerald-900! selection:bg-emerald-900/12!",
	Exploring:
		"bg-amber-500/12 text-amber-700 dark:text-amber-400 dark:selection:text-amber-200! dark:selection:bg-amber-200/12! selection:text-amber-900! selection:bg-amber-900/12!",
} as const satisfies Record<TRoadmapStatus, string>;

const roadmapModules = import.meta.glob<TRoadmapInput>("/src/roadmap/*.ts", {
	eager: true,
	import: "default",
});

const ROADMAP_ITEMS: TRoadmapItem[] = Object.values(roadmapModules).sort(
	(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
);

function getRoadmapTranslationKey(id: string) {
	return id.replaceAll("-", "_");
}

export function Roadmap() {
	const { t } = useTranslation();

	return (
		<main className="px-4 py-10 sm:px-6 sm:py-12">
			<section aria-labelledby="roadmap-title" className="mx-auto max-w-3xl">
				<header className="flex flex-col gap-2">
					<Typography.Paragraph
						size="xs"
						className="font-mono text-muted-foreground uppercase tracking-[0.3em]"
					>
						{t("roadmap.eyebrow", "Roadmap")}
					</Typography.Paragraph>

					<Typography.Heading id="roadmap-title" level={2}>
						{t("roadmap.title", "Coming next to Familiar")}
					</Typography.Heading>

					<Typography.Paragraph size="sm" className="text-muted-foreground">
						{t(
							"roadmap.description",
							"A simple look at planned features and what we are working on next.",
						)}
					</Typography.Paragraph>
				</header>

				<ol
					className="mt-8 flex flex-col"
					aria-label={t("roadmap.eyebrow", "Roadmap")}
				>
					{ROADMAP_ITEMS.map((item) => (
						<RoadmapItem key={item.id} item={item} />
					))}
				</ol>
			</section>
		</main>
	);
}

function RoadmapItem({ item }: { item: TRoadmapItem }) {
	const { t, i18n } = useTranslation();

	const title = t(`roadmap.items.${item.id}.title`, item.id);

	const description = t(`roadmap.items.${item.id}.description`, {
		defaultValue: "",
	});

	const details = t(`roadmap.items.${item.id}.details`, {
		returnObjects: true,
		defaultValue: [],
	}) as string[];

	return (
		<li>
			<article className="grid gap-5 py-8 sm:py-10 md:grid-cols-[150px_minmax(0,1fr)] md:gap-8">
				<header className="md:sticky md:top-20 md:self-start">
					<time
						dateTime={item.date}
						className="font-mono text-[11px] text-muted-foreground uppercase tracking-[0.25em]"
					>
						{dateFormat(item.date, i18n.language)}
					</time>

					<div className="mt-2">
						<Badge size="sm" className={cn(STATUS_STYLES[item.status])}>
							{t(`roadmap.status.${item.status}`, item.status)}
						</Badge>
					</div>
				</header>

				<div className="min-w-0 space-y-3">
					<Typography.Prose className="prose max-w-none prose-neutral dark:prose-invert prose-headings:font-heading prose-p:text-muted-foreground">
						<Typography.Heading level={3}>{title}</Typography.Heading>

						{description && <MarkdownDisplay content={description} />}

						{details.length && (
							<ul>
								{details.map((detail) => (
									<li key={detail}>
										<MarkdownDisplay content={detail} />
									</li>
								))}
							</ul>
						)}
					</Typography.Prose>
				</div>
			</article>
		</li>
	);
}
