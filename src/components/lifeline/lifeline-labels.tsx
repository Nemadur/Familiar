import {
	createContext,
	type ReactNode,
	useContext,
} from "react";

export const LIFELINE_LABEL_COLUMN_WIDTH = 56;
export const LIFELINE_LABEL_GAP = 16;
export const LIFELINE_STICKY_SHIELD_WIDTH =
	LIFELINE_LABEL_COLUMN_WIDTH + LIFELINE_LABEL_GAP;
export const LIFELINE_STICKY_LEFT = 20;

export interface LifelineAxisLabels {
	top?: string;
	bottom?: string;
}

const DEFAULT_LABELS: LifelineAxisLabels = {
	top: "Age",
	bottom: "Years",
};

const LifelineAxisLabelsContext =
	createContext<LifelineAxisLabels>(DEFAULT_LABELS);

export function LifelineAxisLabelsProvider({
	labels,
	children,
}: {
	labels: LifelineAxisLabels;
	children: ReactNode;
}) {
	return (
		<LifelineAxisLabelsContext.Provider value={labels}>
			{children}
		</LifelineAxisLabelsContext.Provider>
	);
}

export function useLifelineAxisLabels() {
	return useContext(LifelineAxisLabelsContext);
}

export function LifelineStickyLabels() {
	const labels = useLifelineAxisLabels();

	return (
		<div
			className="relative"
			style={{ width: LIFELINE_LABEL_COLUMN_WIDTH }}
			aria-hidden="true"
		>
			<div className="flex flex-col items-start text-left">
				<p className="mb-5 h-4 text-[11px] font-medium uppercase leading-4 tracking-[0.08em] text-muted-foreground transition-colors duration-300">
					{labels.top}
				</p>
				<p className="mb-6 h-5 text-[11px] font-medium uppercase leading-5 tracking-[0.08em] text-muted-foreground transition-colors duration-300">
					{labels.bottom}
				</p>
			</div>
		</div>
	);
}