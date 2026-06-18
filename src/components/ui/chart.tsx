import { cn } from "@/lib/utils";
import { createContext, lazy, memo, Suspense, use, useId } from "react";

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = {
	[k in string]: {
		label?: React.ReactNode;
		icon?: React.ComponentType;
	} & (
		| { color?: string; theme?: never }
		| { color?: never; theme: Record<keyof typeof THEMES, string> }
	);
};

type ChartConfigItem = ChartConfig[string];

type ChartContextProps = {
	config: ChartConfig;
};

type ChartLegendPayloadItem = {
	value?: string | number;
	dataKey?: string | number;
	type?: string;
	color?: string;
	payload?: unknown;
};

type ChartLegendVerticalAlign = "top" | "middle" | "bottom";

type ChartTooltipPayloadItem = {
	dataKey?: string | number;
	name?: string | number;
	value?: string | number | Array<string | number> | null;
	type?: string;
	color?: string;
	payload?: {
		fill?: string;
		[key: string]: unknown;
	};
};

type ChartTooltipContentProps = Omit<
	React.ComponentProps<"div">,
	"color" | "name"
> & {
	active?: boolean;
	payload?: ChartTooltipPayloadItem[];
	label?: React.ReactNode;
	labelFormatter?: (
		label: React.ReactNode,
		payload: ChartTooltipPayloadItem[],
	) => React.ReactNode;
	formatter?: (
		value: NonNullable<ChartTooltipPayloadItem["value"]>,
		name: NonNullable<ChartTooltipPayloadItem["name"]>,
		item: ChartTooltipPayloadItem,
		index: number,
		payload: ChartTooltipPayloadItem["payload"],
	) => React.ReactNode;
	color?: string;
	hideLabel?: boolean;
	hideIndicator?: boolean;
	indicator?: "line" | "dot" | "dashed";
	nameKey?: string;
	labelKey?: string;
	labelClassName?: string;
};

function hasTooltipFormatterValue(
	item: ChartTooltipPayloadItem,
): item is ChartTooltipPayloadItem & {
	value: NonNullable<ChartTooltipPayloadItem["value"]>;
	name: NonNullable<ChartTooltipPayloadItem["name"]>;
} {
	return (
		item.value !== undefined &&
		item.value !== null &&
		item.name !== undefined &&
		item.name !== null
	);
}

const ChartContext = createContext<ChartContextProps | null>(null);

function useChart() {
	const context = use(ChartContext);

	if (!context) {
		throw new Error("useChart must be used within a <ChartContainer />");
	}

	return context;
}

const ResponsiveContainer = lazy(() =>
	import("recharts").then((module) => ({
		default: module.ResponsiveContainer,
	})),
);

const Tooltip = lazy(() =>
	import("recharts").then((module) => ({ default: module.Tooltip })),
);

const Legend = lazy(() =>
	import("recharts").then((module) => ({ default: module.Legend })),
);

function ChartContainer({
	id,
	className,
	children,
	config,
	...props
}: React.ComponentProps<"div"> & {
	config: ChartConfig;
	children: React.ComponentProps<typeof ResponsiveContainer>["children"];
}) {
	const uniqueId = useId();
	const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

	return (
		<ChartContext.Provider value={{ config }}>
			<div
				data-slot="chart"
				data-chart={chartId}
				className={cn(
					"[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex aspect-video justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
					className,
				)}
				{...props}
			>
				<ChartStyle id={chartId} config={config} />
				<Suspense fallback={null}>
					<ResponsiveContainer>{children}</ResponsiveContainer>
				</Suspense>
			</div>
		</ChartContext.Provider>
	);
}

function getColorConfig(config: ChartConfig): Array<[string, ChartConfigItem]> {
	const colorConfig: Array<[string, ChartConfigItem]> = [];

	for (const [key, itemConfig] of Object.entries(config)) {
		if (itemConfig.theme || itemConfig.color) {
			colorConfig.push([key, itemConfig]);
		}
	}

	return colorConfig;
}

function getThemeCssVariables(
	colorConfig: Array<[string, ChartConfigItem]>,
	theme: keyof typeof THEMES,
) {
	const variables: string[] = [];

	for (const [key, itemConfig] of colorConfig) {
		const color = itemConfig.theme?.[theme] || itemConfig.color;

		if (color) {
			variables.push(`  --color-${key}: ${color};`);
		}
	}

	return variables.join("\n");
}

function getChartStyleContent(id: string, config: ChartConfig) {
	const colorConfig = getColorConfig(config);

	if (!colorConfig.length) {
		return "";
	}

	const rules: string[] = [];

	for (const [theme, prefix] of Object.entries(THEMES)) {
		rules.push(`
${prefix} [data-chart=${id}] {
${getThemeCssVariables(colorConfig, theme as keyof typeof THEMES)}
}
`);
	}

	return rules.join("\n");
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
	const styleContent = getChartStyleContent(id, config);

	if (!styleContent) {
		return null;
	}

	return <style>{styleContent}</style>;
};

const ChartTooltip = Tooltip;

const ChartTooltipLabel = memo(function ChartTooltipLabel({
	hideLabel,
	payload,
	label,
	labelFormatter,
	labelClassName,
	config,
	labelKey,
}: {
	hideLabel: boolean;
	payload: ChartTooltipPayloadItem[];
	label?: React.ReactNode;
	labelFormatter?: (
		label: React.ReactNode,
		payload: ChartTooltipPayloadItem[],
	) => React.ReactNode;
	labelClassName?: string;
	config: ChartConfig;
	labelKey?: string;
}) {
	if (hideLabel || !payload.length) {
		return null;
	}

	const [item] = payload;
	const key = `${labelKey || item?.dataKey || item?.name || "value"}`;
	const itemConfig = getPayloadConfigFromPayload(config, item, key);

	const value =
		!labelKey && typeof label === "string"
			? config[label as keyof typeof config]?.label || label
			: itemConfig?.label;

	if (labelFormatter) {
		return (
			<div className={cn("font-medium", labelClassName)}>
				{labelFormatter(value, payload)}
			</div>
		);
	}

	if (!value) {
		return null;
	}

	return <div className={cn("font-medium", labelClassName)}>{value}</div>;
});

function ChartTooltipContent({
	active,
	payload,
	className,
	indicator = "dot",
	hideLabel = false,
	hideIndicator = false,
	label,
	labelFormatter,
	labelClassName,
	formatter,
	color,
	nameKey,
	labelKey,
}: ChartTooltipContentProps) {
	const { config } = useChart();

	if (!active || !payload?.length) {
		return null;
	}

	const nestLabel = payload.length === 1 && indicator !== "dot";

	const tooltipLabel = (
		<ChartTooltipLabel
			hideLabel={hideLabel}
			payload={payload}
			label={label}
			labelFormatter={labelFormatter}
			labelClassName={labelClassName}
			config={config}
			labelKey={labelKey}
		/>
	);

	const tooltipItems = getTooltipItems({
		payload,
		config,
		nameKey,
		color,
		formatter,
		hideIndicator,
		indicator,
		nestLabel,
		tooltipLabel,
	});

	return (
		<div
			className={cn(
				"border-border/50 bg-background grid min-w-32 items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl",
				className,
			)}
		>
			{!nestLabel ? tooltipLabel : null}

			<div className="grid gap-1.5">{tooltipItems}</div>
		</div>
	);
}

function getTooltipItems({
	payload,
	config,
	nameKey,
	color,
	formatter,
	hideIndicator,
	indicator,
	nestLabel,
	tooltipLabel,
}: {
	payload: ChartTooltipPayloadItem[];
	config: ChartConfig;
	nameKey?: string;
	color?: string;
	formatter?: ChartTooltipContentProps["formatter"];
	hideIndicator: boolean;
	indicator: NonNullable<ChartTooltipContentProps["indicator"]>;
	nestLabel: boolean;
	tooltipLabel: React.ReactNode;
}) {
	const items: React.ReactNode[] = [];

	for (const [index, item] of payload.entries()) {
		if (item.type === "none") {
			continue;
		}

		const key = `${nameKey || item.name || item.dataKey || "value"}`;
		const itemConfig = getPayloadConfigFromPayload(config, item, key);
		const indicatorColor = color || item.payload?.fill || item.color;
		const hasFormatterValue = hasTooltipFormatterValue(item);

		items.push(
			<div
				key={item.dataKey ?? `${key}-${index}`}
				className={cn(
					"[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:size-2.5",
					indicator === "dot" && "items-center",
				)}
			>
				{formatter && hasFormatterValue ? (
					formatter(item.value, item.name, item, index, item.payload)
				) : (
					<>
						<TooltipIndicator
							itemConfig={itemConfig}
							hideIndicator={hideIndicator}
							indicator={indicator}
							indicatorColor={indicatorColor}
							nestLabel={nestLabel}
						/>

						<div
							className={cn(
								"flex flex-1 justify-between leading-none",
								nestLabel ? "items-end" : "items-center",
							)}
						>
							<div className="grid gap-1.5">
								{nestLabel ? tooltipLabel : null}
								<span className="text-muted-foreground">
									{itemConfig?.label || item.name}
								</span>
							</div>

							<TooltipValue value={item.value} />
						</div>
					</>
				)}
			</div>,
		);
	}

	return items;
}

function TooltipIndicator({
	itemConfig,
	hideIndicator,
	indicator,
	indicatorColor,
	nestLabel,
}: {
	itemConfig: ReturnType<typeof getPayloadConfigFromPayload>;
	hideIndicator: boolean;
	indicator: NonNullable<ChartTooltipContentProps["indicator"]>;
	indicatorColor?: string;
	nestLabel: boolean;
}) {
	if (itemConfig?.icon) {
		return <itemConfig.icon />;
	}

	if (hideIndicator) {
		return null;
	}

	return (
		<div
			className={cn(
				"shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)",
				{
					"size-2.5": indicator === "dot",
					"w-1": indicator === "line",
					"w-0 border-[1.5px] border-dashed bg-transparent":
						indicator === "dashed",
					"my-0.5": nestLabel && indicator === "dashed",
				},
			)}
			style={
				{
					"--color-bg": indicatorColor,
					"--color-border": indicatorColor,
				} as React.CSSProperties
			}
		/>
	);
}

function TooltipValue({ value }: { value: ChartTooltipPayloadItem["value"] }) {
	if (value === undefined || value === null) {
		return null;
	}

	return (
		<span className="text-foreground font-mono font-medium tabular-nums">
			{Array.isArray(value) ? value.join(", ") : value.toLocaleString()}
		</span>
	);
}

const ChartLegend = Legend;

function ChartLegendContent({
	className,
	hideIcon = false,
	payload,
	verticalAlign = "bottom",
	nameKey,
}: React.ComponentProps<"div"> & {
	payload?: ChartLegendPayloadItem[];
	verticalAlign?: ChartLegendVerticalAlign;
	hideIcon?: boolean;
	nameKey?: string;
}) {
	const { config } = useChart();

	if (!payload?.length) {
		return null;
	}

	return (
		<div
			className={cn(
				"flex items-center justify-center gap-4",
				verticalAlign === "top" ? "pb-3" : "pt-3",
				className,
			)}
		>
			{getLegendItems({
				payload,
				config,
				hideIcon,
				nameKey,
			})}
		</div>
	);
}

function getLegendItems({
	payload,
	config,
	hideIcon,
	nameKey,
}: {
	payload: ChartLegendPayloadItem[];
	config: ChartConfig;
	hideIcon: boolean;
	nameKey?: string;
}) {
	const items: React.ReactNode[] = [];

	for (const item of payload) {
		if (item.type === "none") {
			continue;
		}

		const key = `${nameKey || item.dataKey || "value"}`;
		const itemConfig = getPayloadConfigFromPayload(config, item, key);

		items.push(
			<div
				key={item.value ?? key}
				className={cn(
					"[&>svg]:text-muted-foreground flex items-center gap-1.5 [&>svg]:size-3",
				)}
			>
				{itemConfig?.icon && !hideIcon ? (
					<itemConfig.icon />
				) : (
					<div
						className="size-2 shrink-0 rounded-[2px]"
						style={{
							backgroundColor: item.color,
						}}
					/>
				)}

				{itemConfig?.label}
			</div>,
		);
	}

	return items;
}

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(
	config: ChartConfig,
	payload: unknown,
	key: string,
) {
	if (typeof payload !== "object" || payload === null) {
		return undefined;
	}

	const payloadPayload =
		"payload" in payload &&
		typeof payload.payload === "object" &&
		payload.payload !== null
			? payload.payload
			: undefined;

	let configLabelKey: string = key;

	if (
		key in payload &&
		typeof payload[key as keyof typeof payload] === "string"
	) {
		configLabelKey = payload[key as keyof typeof payload] as string;
	} else if (
		payloadPayload &&
		key in payloadPayload &&
		typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
	) {
		configLabelKey = payloadPayload[
			key as keyof typeof payloadPayload
		] as string;
	}

	return configLabelKey in config
		? config[configLabelKey]
		: config[key as keyof typeof config];
}

export {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	ChartLegend,
	ChartLegendContent,
	ChartStyle,
};
