import { Typography } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { cn, dateFormat, getReleaseTranslationKey } from "@/lib/utils";
import type { TRelease, TReleaseInput } from "@/types/release-notes";
import { OutlineStar, SolidStar } from "../icons/icons";
import { Badge } from "../ui/badge";

export const TAG_STYLES = {
	Added:
		"bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 dark:selection:text-emerald-200! dark:selection:bg-emerald-200/12! selection:text-emerald-900! selection:bg-emerald-900/12!",
	Improved:
		"bg-indigo-500/12 text-indigo-700 dark:text-indigo-400 dark:selection:text-indigo-200! dark:selection:bg-indigo-200/12! selection:text-indigo-900! selection:bg-indigo-900/12!",
	Fixed:
		"bg-amber-500/12 text-amber-700 dark:text-amber-400 dark:selection:text-amber-200! dark:selection:bg-amber-200/12! selection:text-amber-900! selection:bg-amber-900/12!",
	Deprecated:
		"bg-orange-500/12 text-orange-700 dark:text-orange-400 dark:selection:text-orange-200! dark:selection:bg-orange-200/12! selection:text-orange-900! selection:bg-orange-900/12!",
	Removed:
		"bg-rose-500/12 text-rose-700 dark:text-rose-400 dark:selection:text-rose-200! dark:selection:bg-rose-200/12! selection:text-rose-900! selection:bg-rose-900/12!",
	Security:
		"bg-purple-500/12 text-purple-700 dark:text-purple-400 dark:selection:text-purple-200! dark:selection:bg-purple-200/12! selection:text-purple-900! selection:bg-purple-900/12!",
	Breaking:
		"bg-red-500/12 text-red-700 dark:text-red-400 dark:selection:text-red-200! dark:selection:bg-red-200/12! selection:text-red-900! selection:bg-red-900/12!",
} as const satisfies Record<string, string>;

const releaseModules = import.meta.glob<TReleaseInput>(
	"/src/release-notes/*.ts",
	{
		eager: true,
		import: "default",
	},
);

const RELEASES: TRelease[] = markLatestRelease(
	Object.values(releaseModules).sort((a, b) =>
		compareVersionsDesc(a.version, b.version),
	),
);

function getReleaseId(version: string) {
	return `release-${version.replaceAll(".", "-")}`;
}

function markLatestRelease(releases: TReleaseInput[]): TRelease[] {
	return releases.map((release, index) => ({
		...release,
		highlight: index === 0,
	}));
}

function compareVersionsDesc(a: string, b: string) {
	const pa = a.split(".").map(Number);
	const pb = b.split(".").map(Number);

	for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
		const av = pa[i] ?? 0;
		const bv = pb[i] ?? 0;

		if (av !== bv) return bv - av;
	}

	return 0;
}

export function TimelinesReleaseNotes() {
	const { t } = useTranslation();

	return (
		<main className="min-h-svh px-6 py-12">
			<section
				aria-labelledby="release-notes-title"
				className="mx-auto max-w-3xl"
			>
				<header className="flex flex-col gap-1">
					<p className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em]">
						{t("releaseNotes.eyebrow", "Changelog")}
					</p>

					<Typography.Heading level={2}>
						{t("releaseNotes.title", "What's new with Familiar")}
					</Typography.Heading>
				</header>

				<ol
					className="mt-6 flex flex-col"
					aria-label={t("releaseNotes.eyebrow", "Changelog")}
				>
					{RELEASES.map((release) => (
						<ReleaseNoteItem key={release.version} release={release} />
					))}
				</ol>
			</section>
		</main>
	);
}

function ReleaseNoteItem({ release }: { release: TRelease }) {
	const releaseId = getReleaseId(release.version);
	const titleId = `${releaseId}-title`;
	const { t, i18n } = useTranslation();

	return (
		<li>
			<article
				aria-labelledby={titleId}
				className="grid grid-cols-[150px_1fr] gap-8 py-10"
			>
				<header className="sticky top-20 self-start">
					<time
						dateTime={release.date}
						className="font-mono text-[11px] text-muted-foreground uppercase tracking-[0.25em]"
					>
						{dateFormat(release.date, i18n.language)}
					</time>

					<div className="mt-1 flex items-center gap-2">
						<Typography.Heading level={4}>
							v{release.version}
						</Typography.Heading>

						{release.highlight ? (
							<Badge size="sm" aria-label={t("releaseNotes.latest", "Latest")}>
								<SolidStar aria-hidden="true" />
								{t("releaseNotes.latest", "Latest")}
							</Badge>
						) : null}
					</div>
				</header>

				<div className="flex flex-col gap-5">
					<ReleaseMedia release={release} />

					<div className="flex flex-col gap-5">
						{release.groups.map((group) => (
							<ReleaseChangeGroup
								key={group}
								releaseId={releaseId}
								release={release}
								group={group}
							/>
						))}
					</div>
				</div>
			</article>
		</li>
	);
}

function ReleaseMedia({ release }: { release: TRelease }) {
	const { t } = useTranslation();

	if (release.image) {
		return (
			<figure className="aspect-16/7 w-full overflow-hidden rounded-xl border border-border/60">
				<img
					src={release.image.src}
					alt={release.image.alt}
					className="size-full object-cover"
					loading="lazy"
					decoding="async"
				/>
			</figure>
		);
	}

	if (!release.highlight) {
		return null;
	}

	return (
		<figure
			aria-label={t("releaseNotes.latestRelease", "Latest release")}
			className="aspect-16/7 w-full overflow-hidden rounded-xl border border-border/60 bg-linear-to-br from-neutral-900/10 to-neutral-100/10"
		>
			<div className="grid size-full place-items-center">
				<figcaption className="text-center dark:mix-blend-difference bg-clip-text">
					<OutlineStar
						aria-hidden="true"
						className="mx-auto text-neutral-700 opacity-50 dark:text-neutral-300"
					/>

					<span className="mt-2 block font-heading text-lg text-neutral-700 dark:text-neutral-300">
						{t("releaseNotes.latestRelease", "Latest release")}
					</span>
				</figcaption>
			</div>
		</figure>
	);
}

function ReleaseChangeGroup({
	releaseId,
	release,
	group,
}: {
	releaseId: string;
	release: TRelease;
	group: TRelease["groups"][number];
}) {
	const { t } = useTranslation();
	const releaseKey = getReleaseTranslationKey(release.version);
	const headingId = `${releaseId}-${group.toLowerCase()}-changes`;

	const items = t(`releaseNotes.releases.${releaseKey}.${group}`, {
		returnObjects: true,
		defaultValue: [],
	}) as string[];

	return (
		<section aria-labelledby={headingId} className="flex flex-col gap-2">
			<Typography.Prose>
				<Typography.Heading level={6} id={headingId}>
					<Badge size="sm" className={cn(TAG_STYLES[group])}>
						{t(`releaseNotes.tags.${group}`, group)}
					</Badge>
				</Typography.Heading>

				<ul className="prose">
					{items.map((item) => (
						<li key={item} className="text-sm leading-relaxed text-foreground">
							{item}
						</li>
					))}
				</ul>
			</Typography.Prose>
		</section>
	);
}
