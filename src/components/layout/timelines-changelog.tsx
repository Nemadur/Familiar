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
		<div className="min-h-svh py-12 px-6">
			<div className="mx-auto max-w-3xl">
				<div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
					Changelog
				</div>
				<h1 className="mt-1 text-primary font-heading text-3xl tracking-tight">
					What's new with Familiar
				</h1>
				<div className="flex flex-col">
					{RELEASES.map((r) => (
						<article
							key={r.version}
							className="grid grid-cols-[140px_1fr] gap-8 border-border/40 border-b py-10 last:border-b-0"
						>
							<aside className="sticky top-20 self-start">
								<div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
									{r.date}
								</div>
								<div className="mt-1 flex items-center gap-2">
									<span className="font-heading text-xl tracking-tight text-primary">
										v{r.version}
									</span>
									{r.highlight ? (
										<Badge size={"sm"}>
											<SolidStar />
											Latest
										</Badge>
									) : null}
								</div>
							</aside>
							<div>
								{r.image ? (
									<div className="mb-5 aspect-16/7 w-full overflow-hidden rounded-xl border border-border/60">
										<img
											src={r.image.src}
											alt={r.image.alt}
											className="h-full w-full object-cover"
										/>
									</div>
								) : r.highlight ? (
									<div className="mb-5 aspect-16/7 w-full overflow-hidden rounded-xl border border-border/60 bg-linear-to-br from-indigo-500/10 to-teal-500/10">
										<div className="grid h-full place-items-center">
											<div className="text-center dark:mix-blend-difference bg-clip-text">
												<OutlineStar className="mx-auto opacity-50 dark:text-teal-300 text-teal-700" />
												<div className="mt-2 font-heading text-lg dark:text-teal-300 text-teal-700">
													Latest release
												</div>
											</div>
										</div>
									</div>
								) : null}
								{r.groups.map((g) => (
									<div key={g.tag} className="mt-5 first:mt-0">
										<Badge size={"sm"} className={cn(TAG_STYLES[g.tag])}>
											{g.tag}
										</Badge>
										<ul className="mt-2 space-y-1.5 prose">
											{g.items.map((it) => (
												<li
													key={it}
													className="flex gap-2 text-foreground/85 text-sm leading-relaxed"
												>
													<span className="mt-2 size-1 shrink-0 rounded-full bg-muted-foreground/60" />
													{it}
												</li>
											))}
										</ul>
									</div>
								))}
							</div>
						</article>
					))}
				</div>
			</div>
		</div>
	);
}
