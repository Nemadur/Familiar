import { Badge } from "../ui/badge";
import { cn, dateFormat } from "@/lib/utils";
import { OutlineStar, SolidStar } from "../icons/icons";
import type { TRelease, TReleaseInput } from "@/types/release-notes";

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

const releaseModules = import.meta.glob<TRelease>("/src/release-notes/*.ts", {
	eager: true,
	import: "default",
});

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

// TODO: put this to modal and show on eveery new update (cookie based tracking)
export function TimelinesReleaseNotes() {
	return (
		<main className="min-h-svh px-6 py-12">
			<section
				aria-labelledby="release-notes-title"
				className="mx-auto max-w-3xl"
			>
				<header className="flex flex-col gap-1">
					<p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
						Changelog
					</p>

					<h1
						id="release-notes-title"
						className="font-heading text-3xl text-primary tracking-tight"
					>
						What's new with Familiar
					</h1>
				</header>

				<ol className="mt-6 flex flex-col" aria-label="Release history">
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

	return (
		<li className="border-border/40 border-b last:border-b-0">
			<article
				aria-labelledby={titleId}
				className="grid grid-cols-[140px_1fr] gap-8 py-10"
			>
				<header className="sticky top-20 self-start">
					<time
						dateTime={release.date}
						className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]"
					>
						{dateFormat(new Date(release.date))}
					</time>

					<div className="mt-1 flex items-center gap-2">
						<h2
							id={titleId}
							className="font-heading text-xl text-primary tracking-tight"
						>
							v{release.version}
						</h2>

						{release.highlight ? (
							<Badge size="sm" aria-label="Latest release">
								<SolidStar aria-hidden="true" />
								Latest
							</Badge>
						) : null}
					</div>
				</header>

				<div className="flex flex-col gap-5">
					<ReleaseMedia release={release} />

					<div className="flex flex-col gap-5">
						{release.groups.map((group) => (
							<ReleaseChangeGroup
								key={group.tag}
								releaseId={releaseId}
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
			aria-label="Latest release"
			className="aspect-16/7 w-full overflow-hidden rounded-xl border border-border/60 bg-linear-to-br from-neutral-900/10 to-neutral-100/10"
		>
			<div className="grid size-full place-items-center">
				<figcaption className="text-center dark:mix-blend-difference bg-clip-text">
					<OutlineStar
						aria-hidden="true"
						className="mx-auto text-neutral-700 opacity-50 dark:text-neutral-300"
					/>

					<span className="mt-2 block font-heading text-lg text-neutral-700 dark:text-neutral-300">
						Latest release
					</span>
				</figcaption>
			</div>
		</figure>
	);
}

function ReleaseChangeGroup({
	releaseId,
	group,
}: {
	releaseId: string;
	group: TRelease["groups"][number];
}) {
	const headingId = `${releaseId}-${group.tag.toLowerCase()}-changes`;

	return (
		<section aria-labelledby={headingId} className="flex flex-col gap-2">
			<h3 id={headingId}>
				<Badge size="sm" className={cn(TAG_STYLES[group.tag])}>
					{group.tag}
				</Badge>
			</h3>

			<ul className="flex flex-col prose">
				{group.items.map((item) => (
					<li
						key={item}
						className="flex gap-2 text-sm text-foreground leading-relaxed"
					>
						<span
							aria-hidden="true"
							className="mt-2.5 size-1 shrink-0 rounded-full bg-muted-foreground"
						/>
						<span>{item}</span>
					</li>
				))}
			</ul>
		</section>
	);
}
