import { ScrollArea as ScrollAreaPrimitive } from "radix-ui";
import {
	type ComponentProps,
	type PointerEvent,
	type ReactNode,
	useCallback,
	useEffect,
	useEffectEvent,
	useRef,
	useState,
} from "react";
import { useDataGrid } from "src/components/reui/data-grid/data-grid";

import { cn } from "src/lib/utils";

const MIN_THUMB_SIZE = 24;
const FALLBACK_SCROLLBAR_SIZE = 12;

const INITIAL_METRICS = {
	hasVerticalOverflow: false,
	headerHeight: 0,
	horizontalScrollbarSize: 0,
	thumbHeight: 0,
	thumbTop: 0,
	trackHeight: 0,
} as const;

type DataGridScrollAreaOrientation = "horizontal" | "vertical" | "both";

type ScrollbarMetrics = {
	hasVerticalOverflow: boolean;
	headerHeight: number;
	horizontalScrollbarSize: number;
	thumbHeight: number;
	thumbTop: number;
	trackHeight: number;
};

type ObservedElements = {
	header: HTMLElement | null;
	horizontalScrollbar: HTMLElement | null;
	table: HTMLElement | null;
	tableViewport: HTMLElement | null;
};

type DragState = {
	pointerId: number;
	startScrollTop: number;
	startY: number;
};

type DataGridScrollAreaProps = Omit<
	ComponentProps<typeof ScrollAreaPrimitive.Root>,
	"children"
> & {
	children: ReactNode;
	orientation?: DataGridScrollAreaOrientation;
};

type UseCustomVerticalScrollbarArgs = {
	showHorizontal: boolean;
	usesCustomVerticalScrollbar: boolean;
};

type CustomVerticalScrollbarApi = {
	containerRef: React.RefObject<HTMLDivElement | null>;
	viewportRef: React.RefObject<HTMLDivElement | null>;
	hasCustomVerticalOverflow: boolean;
	clearDragState: () => void;
	handleThumbPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
	handleThumbPointerMove: (event: PointerEvent<HTMLDivElement>) => void;
	handleThumbPointerUp: (event: PointerEvent<HTMLDivElement>) => void;
	handleTrackPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
};

function clamp(value: number, min: number, max: number) {
	return Math.min(max, Math.max(min, value));
}

function areMetricsEqual(next: ScrollbarMetrics, prev: ScrollbarMetrics) {
	return (
		next.hasVerticalOverflow === prev.hasVerticalOverflow &&
		next.headerHeight === prev.headerHeight &&
		next.horizontalScrollbarSize === prev.horizontalScrollbarSize &&
		next.thumbHeight === prev.thumbHeight &&
		next.thumbTop === prev.thumbTop &&
		next.trackHeight === prev.trackHeight
	);
}

function applyMetrics(element: HTMLElement, metrics: ScrollbarMetrics) {
	element.style.setProperty(
		"--data-grid-scrollbar-header-height",
		`${metrics.headerHeight}px`,
	);
	element.style.setProperty(
		"--data-grid-scrollbar-thumb-height",
		`${metrics.thumbHeight}px`,
	);
	element.style.setProperty(
		"--data-grid-scrollbar-thumb-top",
		`${metrics.thumbTop}px`,
	);
	element.style.setProperty(
		"--data-grid-scrollbar-track-height",
		`${metrics.trackHeight}px`,
	);
}

function getObservedElements(container: HTMLElement): ObservedElements {
	return {
		header: container.querySelector(
			'[data-slot="data-grid-table"] thead',
		) as HTMLElement | null,
		horizontalScrollbar: container.querySelector(
			'[data-slot="data-grid-scrollbar"][data-orientation="horizontal"]',
		) as HTMLElement | null,
		table: container.querySelector(
			'[data-slot="data-grid-table"]',
		) as HTMLElement | null,
		tableViewport: container.querySelector(
			'[data-slot="data-grid-table-viewport"]',
		) as HTMLElement | null,
	};
}

function createScrollbarMetrics({
	headerHeight,
	horizontalScrollbarSize,
	scrollHeight,
	scrollTop,
	trackHeight,
	viewportHeight,
}: {
	headerHeight: number;
	horizontalScrollbarSize: number;
	scrollHeight: number;
	scrollTop: number;
	trackHeight: number;
	viewportHeight: number;
}): ScrollbarMetrics {
	const maxScroll = Math.max(0, scrollHeight - viewportHeight);

	if (trackHeight === 0 || maxScroll === 0) {
		return {
			hasVerticalOverflow: false,
			headerHeight,
			horizontalScrollbarSize,
			thumbHeight: trackHeight,
			thumbTop: 0,
			trackHeight,
		};
	}

	const bodyContentHeight = Math.max(trackHeight, scrollHeight - headerHeight);
	const thumbHeight = clamp(
		trackHeight * (trackHeight / bodyContentHeight),
		MIN_THUMB_SIZE,
		trackHeight,
	);
	const maxThumbTop = Math.max(0, trackHeight - thumbHeight);
	const thumbTop = maxThumbTop > 0 ? (scrollTop / maxScroll) * maxThumbTop : 0;

	return {
		hasVerticalOverflow: true,
		headerHeight,
		horizontalScrollbarSize,
		thumbHeight,
		thumbTop,
		trackHeight,
	};
}

function calculateCurrentMetrics({
	viewport,
	observedElements,
	showHorizontal,
}: {
	viewport: HTMLDivElement;
	observedElements: ObservedElements;
	showHorizontal: boolean;
}): ScrollbarMetrics {
	const { header, horizontalScrollbar } = observedElements;
	const headerHeight = header?.getBoundingClientRect().height ?? 0;
	const viewportHeight = viewport.clientHeight;
	const viewportWidth = viewport.clientWidth;
	const scrollHeight = viewport.scrollHeight;
	const scrollWidth = viewport.scrollWidth;
	const hasHorizontalOverflow =
		showHorizontal && scrollWidth > viewportWidth + 0.5;
	const horizontalScrollbarSize = hasHorizontalOverflow
		? horizontalScrollbar?.offsetHeight || FALLBACK_SCROLLBAR_SIZE
		: 0;
	const trackHeight = Math.max(
		0,
		viewportHeight - headerHeight - horizontalScrollbarSize,
	);

	return createScrollbarMetrics({
		headerHeight,
		horizontalScrollbarSize,
		scrollHeight,
		scrollTop: viewport.scrollTop,
		trackHeight,
		viewportHeight,
	});
}

function observeElement(
	observer: ResizeObserver | null,
	element: HTMLElement | null,
) {
	if (element) {
		observer?.observe(element);
	}
}

function observeTrackedElements(
	observer: ResizeObserver | null,
	viewport: HTMLElement,
	observedElements: ObservedElements,
) {
	observeElement(observer, viewport);
	observeElement(observer, observedElements.header);
	observeElement(observer, observedElements.table);
	observeElement(observer, observedElements.tableViewport);
}

function useCustomVerticalScrollbar({
	showHorizontal,
	usesCustomVerticalScrollbar,
}: UseCustomVerticalScrollbarArgs): CustomVerticalScrollbarApi {
	const containerRef = useRef<HTMLDivElement>(null);
	const viewportRef = useRef<HTMLDivElement | null>(null);
	const dragRef = useRef<DragState | null>(null);
	const metricsRef = useRef<ScrollbarMetrics>(INITIAL_METRICS);
	const observedElementsRef = useRef<ObservedElements>({
		header: null,
		horizontalScrollbar: null,
		table: null,
		tableViewport: null,
	});
	const [hasCustomVerticalOverflow, setHasCustomVerticalOverflow] =
		useState(false);

	const clearDragState = useCallback(() => {
		dragRef.current = null;
		document.body.style.userSelect = "";
	}, []);

	const resetMetrics = useCallback(() => {
		const container = containerRef.current;

		if (container && !areMetricsEqual(INITIAL_METRICS, metricsRef.current)) {
			applyMetrics(container, INITIAL_METRICS);
			metricsRef.current = INITIAL_METRICS;
		}

		setHasCustomVerticalOverflow((prev) => (prev ? false : prev));
	}, []);

	const syncCustomVerticalScrollbar = useCallback(() => {
		const container = containerRef.current;
		const viewport = viewportRef.current;

		if (!container || !viewport || !usesCustomVerticalScrollbar) {
			resetMetrics();
			return;
		}

		const nextMetrics = calculateCurrentMetrics({
			viewport,
			observedElements: observedElementsRef.current,
			showHorizontal,
		});

		if (!areMetricsEqual(nextMetrics, metricsRef.current)) {
			applyMetrics(container, nextMetrics);
			metricsRef.current = nextMetrics;
		}

		setHasCustomVerticalOverflow((prev) =>
			prev === nextMetrics.hasVerticalOverflow
				? prev
				: nextMetrics.hasVerticalOverflow,
		);
	}, [resetMetrics, showHorizontal, usesCustomVerticalScrollbar]);

	const syncCustomVerticalScrollbarEvent = useEffectEvent(() => {
		syncCustomVerticalScrollbar();
	});

	useEffect(() => {
		const container = containerRef.current;
		const viewport = viewportRef.current;

		if (!container || !viewport) return;

		if (!usesCustomVerticalScrollbar) {
			resetMetrics();
			return;
		}

		observedElementsRef.current = getObservedElements(container);

		let frame = 0;

		const scheduleSync = () => {
			cancelAnimationFrame(frame);
			frame = window.requestAnimationFrame(syncCustomVerticalScrollbarEvent);
		};

		scheduleSync();

		viewport.addEventListener("scroll", scheduleSync, { passive: true });

		const observer =
			typeof ResizeObserver === "undefined"
				? null
				: new ResizeObserver(scheduleSync);

		observeTrackedElements(observer, viewport, observedElementsRef.current);

		return () => {
			cancelAnimationFrame(frame);
			observer?.disconnect();
			viewport.removeEventListener("scroll", scheduleSync);
			clearDragState();
		};
	}, [clearDragState, resetMetrics, usesCustomVerticalScrollbar]);

	const scrollToThumbOffset = useCallback((nextThumbTop: number) => {
		const viewport = viewportRef.current;
		const { thumbHeight, trackHeight } = metricsRef.current;

		if (!viewport) return;

		const maxScroll = Math.max(
			0,
			viewport.scrollHeight - viewport.clientHeight,
		);
		const maxThumbTop = Math.max(0, trackHeight - thumbHeight);

		if (maxScroll === 0 || maxThumbTop === 0) {
			viewport.scrollTop = 0;
			return;
		}

		const ratio = clamp(nextThumbTop, 0, maxThumbTop) / maxThumbTop;
		viewport.scrollTop = ratio * maxScroll;
	}, []);

	const handleThumbPointerDown = useCallback(
		(event: PointerEvent<HTMLDivElement>) => {
			const viewport = viewportRef.current;

			if (!viewport) return;

			event.preventDefault();
			event.stopPropagation();
			event.currentTarget.setPointerCapture(event.pointerId);

			dragRef.current = {
				pointerId: event.pointerId,
				startScrollTop: viewport.scrollTop,
				startY: event.clientY,
			};

			document.body.style.userSelect = "none";
		},
		[],
	);

	const handleThumbPointerMove = useCallback(
		(event: PointerEvent<HTMLDivElement>) => {
			const viewport = viewportRef.current;
			const dragState = dragRef.current;
			const { thumbHeight, trackHeight } = metricsRef.current;

			if (!viewport || !dragState || dragState.pointerId !== event.pointerId) {
				return;
			}

			const maxThumbTop = Math.max(0, trackHeight - thumbHeight);
			const maxScroll = Math.max(
				0,
				viewport.scrollHeight - viewport.clientHeight,
			);

			if (maxThumbTop === 0 || maxScroll === 0) return;

			const deltaY = event.clientY - dragState.startY;
			const nextScrollTop =
				dragState.startScrollTop + (deltaY / maxThumbTop) * maxScroll;

			viewport.scrollTop = clamp(nextScrollTop, 0, maxScroll);
		},
		[],
	);

	const handleThumbPointerUp = useCallback(
		(event: PointerEvent<HTMLDivElement>) => {
			if (dragRef.current?.pointerId !== event.pointerId) return;
			clearDragState();
		},
		[clearDragState],
	);

	const handleTrackPointerDown = useCallback(
		(event: PointerEvent<HTMLDivElement>) => {
			const { thumbHeight } = metricsRef.current;

			if (event.target !== event.currentTarget) return;

			event.preventDefault();
			event.stopPropagation();

			const rect = event.currentTarget.getBoundingClientRect();
			const offsetY = event.clientY - rect.top - thumbHeight / 2;

			scrollToThumbOffset(offsetY);
		},
		[scrollToThumbOffset],
	);

	return {
		containerRef,
		viewportRef,
		hasCustomVerticalOverflow,
		clearDragState,
		handleThumbPointerDown,
		handleThumbPointerMove,
		handleThumbPointerUp,
		handleTrackPointerDown,
	};
}

function NativeScrollbar({
	orientation,
	hidden,
}: {
	orientation: "horizontal" | "vertical";
	hidden?: boolean;
}) {
	return (
		<ScrollAreaPrimitive.ScrollAreaScrollbar
			data-slot="data-grid-scrollbar"
			data-orientation={orientation}
			orientation={orientation}
			className={cn(
				"flex touch-none p-px transition-colors select-none data-[orientation=horizontal]:h-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:border-t data-[orientation=horizontal]:border-t-transparent data-[orientation=vertical]:h-full data-[orientation=vertical]:w-2.5 data-[orientation=vertical]:border-s data-[orientation=vertical]:border-s-transparent",
				hidden && "pointer-events-none opacity-0",
			)}
		>
			<ScrollAreaPrimitive.ScrollAreaThumb
				data-slot="data-grid-thumb"
				className="bg-border rounded-full relative flex-1"
			/>
		</ScrollAreaPrimitive.ScrollAreaScrollbar>
	);
}

function NativeScrollbars({
	showHorizontal,
	showVertical,
	usesCustomVerticalScrollbar,
}: {
	showHorizontal: boolean;
	showVertical: boolean;
	usesCustomVerticalScrollbar: boolean;
}) {
	return (
		<>
			{showHorizontal && <NativeScrollbar orientation="horizontal" />}

			{showVertical && (
				<NativeScrollbar
					orientation="vertical"
					hidden={usesCustomVerticalScrollbar}
				/>
			)}
		</>
	);
}

function CustomVerticalScrollbar({
	api,
}: {
	api: Pick<
		CustomVerticalScrollbarApi,
		| "clearDragState"
		| "handleThumbPointerDown"
		| "handleThumbPointerMove"
		| "handleThumbPointerUp"
		| "handleTrackPointerDown"
	>;
}) {
	return (
		<div
			aria-hidden="true"
			className="pointer-events-none absolute inset-e-0 top-(--data-grid-scrollbar-header-height) z-20 h-(--data-grid-scrollbar-track-height)"
		>
			<div
				className="pointer-events-auto relative h-full w-3 touch-none p-px"
				onPointerDown={api.handleTrackPointerDown}
			>
				<div
					className={cn(
						"bg-border absolute inset-e-px w-2",
						"top-(--data-grid-scrollbar-thumb-top) h-(--data-grid-scrollbar-thumb-height)",
						"rounded-full",
					)}
					onLostPointerCapture={api.clearDragState}
					onPointerCancel={api.handleThumbPointerUp}
					onPointerDown={api.handleThumbPointerDown}
					onPointerMove={api.handleThumbPointerMove}
					onPointerUp={api.handleThumbPointerUp}
				/>
			</div>
		</div>
	);
}

function DataGridScrollArea({
	children,
	className,
	orientation = "both",
	...props
}: DataGridScrollAreaProps) {
	const { props: dataGridProps } = useDataGrid();

	const showHorizontal = orientation !== "vertical";
	const showVertical = orientation !== "horizontal";
	const usesCustomVerticalScrollbar =
		showVertical && !!dataGridProps.tableLayout?.headerSticky;

	const scrollbarApi = useCustomVerticalScrollbar({
		showHorizontal,
		usesCustomVerticalScrollbar,
	});

	return (
		<div ref={scrollbarApi.containerRef} className="relative">
			<ScrollAreaPrimitive.Root
				data-slot="data-grid-scroll-area"
				className={cn("relative", className)}
				{...props}
			>
				<ScrollAreaPrimitive.Viewport
					ref={scrollbarApi.viewportRef}
					data-slot="scroll-area-viewport"
					className="focus-visible:ring-ring/50 rounded-lg size-full transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
				>
					<div data-slot="scroll-area-content">{children}</div>
				</ScrollAreaPrimitive.Viewport>

				<NativeScrollbars
					showHorizontal={showHorizontal}
					showVertical={showVertical}
					usesCustomVerticalScrollbar={usesCustomVerticalScrollbar}
				/>
			</ScrollAreaPrimitive.Root>

			{usesCustomVerticalScrollbar &&
				scrollbarApi.hasCustomVerticalOverflow && (
					<CustomVerticalScrollbar api={scrollbarApi} />
				)}
		</div>
	);
}

export { DataGridScrollArea };
export type { DataGridScrollAreaOrientation, DataGridScrollAreaProps };
