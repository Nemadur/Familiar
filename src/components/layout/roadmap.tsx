import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Lifeline } from "@/components/lifeline";
import {
	LifelineAxisLabelsProvider,
} from "@/components/lifeline/lifeline-labels";
import {
	LifelineFooter,
	LifelineShell,
	LifelineStage,
} from "@/components/lifeline-shell";
import { createRoadmapLifeline } from "@/roadmap/lifetime";

export function Roadmap() {
	const { t, i18n } = useTranslation();

	const roadmap = useMemo(
		() =>
			createRoadmapLifeline(
				i18n.language,
			),
		[i18n.language],
	);

	// useLifelineMediaDebug(roadmap.markers);

	return (
		<div className="relative left-1/2 w-dvw -translate-x-1/2">
			<LifelineAxisLabelsProvider
				labels={{
					// top: t(
					// 	"roadmap.axis.status",
					// 	"Status",
					// ),
					bottom: t(
						"roadmap.axis.year",
						"Year",
					),
				}}
			>
				<LifelineShell>
					<LifelineStage>
						<Lifeline
							markers={
								roadmap.markers
							}
							birthYear={
								roadmap.birthYear
							}
							title={roadmap.name}
							className="h-full"
							mode="page"
						/>
					</LifelineStage>

					{/* <LifelineFooter>
						<div
							aria-label={t(
								"roadmap.statusLegend",
								"Roadmap status legend",
							)}
							className="flex flex-wrap items-center gap-x-5 gap-y-2 px-6 text-xs text-muted-foreground"
						>
							<span>
								<strong className="text-foreground">
									WIP
								</strong>
								{" — "}
								{t(
									"roadmap.status.InProgress",
									"In progress",
								)}
							</span>

							<span>
								<strong className="text-foreground">
									PLAN
								</strong>
								{" — "}
								{t(
									"roadmap.status.Planned",
									"Planned",
								)}
							</span>

							<span>
								<strong className="text-foreground">
									R&D
								</strong>
								{" — "}
								{t(
									"roadmap.status.Exploring",
									"Exploring",
								)}
							</span>
						</div>
					</LifelineFooter> */}
				</LifelineShell>
			</LifelineAxisLabelsProvider>
		</div>
	);
}