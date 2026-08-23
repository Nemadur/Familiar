import { Film, Image as ImageIcon } from "lucide-react";
import { type CSSProperties, forwardRef, type KeyboardEvent } from "react";

import { cn } from "@/lib/utils";

import { LifelineBadges } from "./lifeline-badges";
import { CompanyIcon } from "./company-icon";
import {
	getLifelineEventEffect,
	getLifelineEventImage,
	getLifelineEventKey,
	LifelineEventText,
} from "./lifeline-event";
import { useLifelineFireworks } from "./lifeline-fireworks";
import { useLifelineHoverImage } from "./lifeline-hover-image";
import { aggregateLifelinePeople, LifelinePeople } from "./lifeline-people";
import type { LifelineMarker } from "./types";

interface LifelineMarkerColumnProps {
	marker: LifelineMarker;
	birthYear: number;
	minWidth: number;
	animateIntro?: boolean;
	introDelay?: number;
	introDuration?: number;
}

export const LifelineMarkerColumn = forwardRef<
	HTMLDivElement,
	LifelineMarkerColumnProps
>(function LifelineMarkerColumn(
	{
		marker,
		birthYear,
		minWidth,
		animateIntro = false,
		introDelay = 0,
		introDuration = 420,
	},
	ref,
) {
	const age = marker.age ?? marker.year - birthYear;
	const people = aggregateLifelinePeople(marker);
	const hoverImage = useLifelineHoverImage();
	const fireworks = useLifelineFireworks();

	return (
		<div
			ref={ref}
			className="group relative shrink-0 pr-8 transition-opacity duration-300 ease-out will-change-opacity"
			style={{ width: minWidth }}
			aria-label={marker.label ?? `${marker.year}`}
		>
			<div
				className={cn("relative", animateIntro && "lifeline-marker-intro")}
				style={{
					animationDelay: animateIntro ? `${introDelay}ms` : undefined,
					...(animateIntro
						? ({
								"--lifeline-marker-fade-ms": `${introDuration}ms`,
							} as CSSProperties)
						: {}),
				}}
			>
				<span
					className="absolute left-0 top-(--lifeline-rail) z-10 h-2.5 w-px -translate-y-1/2 bg-zinc-400 transition-colors duration-300 group-hover:bg-zinc-600 dark:bg-zinc-700 dark:group-hover:bg-zinc-400"
					aria-hidden="true"
				/>

				<div className="flex w-full flex-col items-start text-left">
					<p className="mb-5 h-4 text-[11px] font-medium leading-4 tabular-nums text-zinc-500 transition-colors duration-300 group-hover:text-black dark:text-zinc-600 dark:group-hover:text-zinc-400">
						{age}
					</p>

					<p className="mb-6 h-5 whitespace-nowrap text-[15px] font-medium leading-5 tabular-nums text-zinc-500 transition-colors duration-300 group-hover:text-black dark:group-hover:text-white">
						{marker.label ?? marker.year}
					</p>

					<div className="relative w-full pb-10 text-zinc-500 transition-colors duration-300 group-hover:text-black dark:group-hover:text-zinc-300">
						<div
							className={cn(
								"flex w-full flex-col items-start pt-6",
								people.length > 0 && "min-h-(--lifeline-people-top) pb-6",
							)}
						>
							{marker.badges && marker.badges.length > 0 && (
								<LifelineBadges badges={marker.badges} className="mb-3" />
							)}

							{marker.companies && marker.companies.length > 0 && (
								<div className="mb-2 flex items-center justify-start gap-1.5">
									{marker.companies.map((company) => (
										<CompanyIcon
											key={company.id}
											id={company.id}
											label={company.name}
											className="opacity-70 transition-opacity duration-300 group-hover:opacity-100"
										/>
									))}
								</div>
							)}

							<div className="min-h-13 space-y-4">
								{marker.events.map((event, index) => {
									const image = getLifelineEventImage(event);
									const effect = getLifelineEventEffect(event);
									const isInteractive = Boolean(effect && fireworks);

									const launchEffect = () => {
										if (!effect || !fireworks) {
											return;
										}

										if (import.meta.env.DEV) {
											console.debug(
												"[LifelineEffect] launching from desktop event",
												{
													effect,
													markerId: marker.id,
												},
											);
										}

										fireworks.launch(effect);
									};

									const handleKeyDown = (
										keyboardEvent: KeyboardEvent<HTMLParagraphElement>,
									) => {
										if (!isInteractive) {
											return;
										}

										if (
											keyboardEvent.key !== "Enter" &&
											keyboardEvent.key !== " "
										) {
											return;
										}

										keyboardEvent.preventDefault();
										launchEffect();
									};

									return (
										<p
											key={getLifelineEventKey(event, index)}
											className={cn(
												"max-w-[18rem] text-left text-[14px] leading-[1.55] tracking-[-0.01em]",
												isInteractive && "cursor-pointer",
											)}
											data-lifeline-interactive={isInteractive ? "" : undefined}
											role={isInteractive ? "button" : undefined}
											tabIndex={isInteractive ? 0 : undefined}
											onMouseEnter={
												image && hoverImage
													? () => hoverImage.show(image)
													: undefined
											}
											onMouseLeave={
												image && hoverImage ? hoverImage.hide : undefined
											}
											onClick={isInteractive ? launchEffect : undefined}
											onKeyDown={isInteractive ? handleKeyDown : undefined}
										>
											<LifelineEventText event={event} />

											{image && (
												<span className="whitespace-nowrap">
													{" "}
													{image.video ? (
														<Film
															className="ml-0.5 inline-block h-3 w-3 -translate-y-px text-zinc-400 transition-colors duration-300 dark:text-zinc-600"
															strokeWidth={1.75}
															aria-hidden="true"
														/>
													) : (
														<ImageIcon
															className="ml-0.5 inline-block h-3 w-3 -translate-y-px text-zinc-400 transition-colors duration-300 dark:text-zinc-600"
															strokeWidth={1.75}
															aria-hidden="true"
														/>
													)}
												</span>
											)}
										</p>
									);
								})}
							</div>
						</div>

						{people.length > 0 && (
							<div className="w-full">
								<LifelinePeople people={people} />
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
});
