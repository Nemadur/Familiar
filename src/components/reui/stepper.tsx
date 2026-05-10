import {
	Children,
	createContext,
	type HTMLAttributes,
	isValidElement,
	type ReactElement,
	useCallback,
	use,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";

import { cn } from "@/lib/utils";

type StepperOrientation = "horizontal" | "vertical";
type StepState = "active" | "completed" | "inactive" | "loading";
type StepIndicators = {
	active?: React.ReactNode;
	completed?: React.ReactNode;
	inactive?: React.ReactNode;
	loading?: React.ReactNode;
};

interface StepperContextValue {
	activeStep: number;
	setActiveStep: (step: number) => void;
	stepsCount: number;
	orientation: StepperOrientation;
	registerTrigger: (node: HTMLButtonElement) => void;
	unregisterTrigger: (node: HTMLButtonElement) => void;
	triggerNodes: HTMLButtonElement[];
	focusNext: (currentIdx: number) => void;
	focusPrev: (currentIdx: number) => void;
	focusFirst: () => void;
	focusLast: () => void;
	indicators: StepIndicators;
}

interface StepItemContextValue {
	step: number;
	state: StepState;
	isDisabled: boolean;
	isLoading: boolean;
}

const StepperContext = createContext<StepperContextValue | undefined>(
	undefined,
);
const StepItemContext = createContext<StepItemContextValue | undefined>(
	undefined,
);

function useStepper() {
	const ctx = use(StepperContext);

	if (!ctx) throw new Error("useStepper must be used within a Stepper");

	return ctx;
}

function useStepItem() {
	const ctx = use(StepItemContext);

	if (!ctx) throw new Error("useStepItem must be used within a StepperItem");

	return ctx;
}

interface StepperProps extends HTMLAttributes<HTMLDivElement> {
	defaultValue?: number;
	value?: number;
	onValueChange?: (value: number) => void;
	orientation?: StepperOrientation;
	indicators?: StepIndicators;
}

const DEFAULT_INDICATORS: StepIndicators = {};

function Stepper({
	defaultValue = 1,
	value,
	onValueChange,
	orientation = "horizontal",
	className,
	children,
	indicators = DEFAULT_INDICATORS,
	...props
}: StepperProps) {
	const [selectedStep, setSelectedStep] = useState<number | null>(null);
	const [triggerNodes, setTriggerNodes] = useState<HTMLButtonElement[]>([]);

	const currentStep = value ?? selectedStep ?? defaultValue;

	const registerTrigger = useCallback((node: HTMLButtonElement) => {
		setTriggerNodes((prev) => {
			if (node && !prev.includes(node)) {
				return [...prev, node];
			}

			return prev;
		});
	}, []);

	const unregisterTrigger = useCallback((node: HTMLButtonElement) => {
		setTriggerNodes((prev) => prev.filter((n) => n !== node));
	}, []);

	const handleSetActiveStep = useCallback(
		(step: number) => {
			if (value === undefined) {
				setSelectedStep(step);
			}

			onValueChange?.(step);
		},
		[value, onValueChange],
	);

	const focusTrigger = useCallback(
		(idx: number) => {
			triggerNodes[idx]?.focus();
		},
		[triggerNodes],
	);

	const focusNext = useCallback(
		(currentIdx: number) =>
			focusTrigger((currentIdx + 1) % triggerNodes.length),
		[focusTrigger, triggerNodes.length],
	);

	const focusPrev = useCallback(
		(currentIdx: number) =>
			focusTrigger(
				(currentIdx - 1 + triggerNodes.length) % triggerNodes.length,
			),
		[focusTrigger, triggerNodes.length],
	);

	const focusFirst = useCallback(() => focusTrigger(0), [focusTrigger]);

	const focusLast = useCallback(
		() => focusTrigger(triggerNodes.length - 1),
		[focusTrigger, triggerNodes.length],
	);

	const stepsCount = useMemo(
		() =>
			Children.toArray(children).filter(
				(child): child is ReactElement =>
					isValidElement(child) &&
					(child.type as { displayName?: string }).displayName ===
						"StepperItem",
			).length,
		[children],
	);

	const contextValue = useMemo<StepperContextValue>(
		() => ({
			activeStep: currentStep,
			setActiveStep: handleSetActiveStep,
			stepsCount,
			orientation,
			registerTrigger,
			unregisterTrigger,
			focusNext,
			focusPrev,
			focusFirst,
			focusLast,
			triggerNodes,
			indicators,
		}),
		[
			currentStep,
			handleSetActiveStep,
			stepsCount,
			orientation,
			registerTrigger,
			unregisterTrigger,
			focusNext,
			focusPrev,
			focusFirst,
			focusLast,
			triggerNodes,
			indicators,
		],
	);

	return (
		<StepperContext.Provider value={contextValue}>
			<div
				role="tablist"
				aria-orientation={orientation}
				data-slot="stepper"
				className={cn("w-full", className)}
				data-orientation={orientation}
				{...props}
			>
				{children}
			</div>
		</StepperContext.Provider>
	);
}

interface StepperItemProps extends React.HTMLAttributes<HTMLDivElement> {
	step: number;
	completed?: boolean;
	disabled?: boolean;
	loading?: boolean;
}

function StepperItem({
	step,
	completed = false,
	disabled = false,
	loading = false,
	className,
	children,
	...props
}: StepperItemProps) {
	const { activeStep } = useStepper();

	const state: StepState =
		completed || step < activeStep
			? "completed"
			: activeStep === step
				? "active"
				: "inactive";

	const isLoading = loading && step === activeStep;

	return (
		<StepItemContext.Provider
			value={{ step, state, isDisabled: disabled, isLoading }}
		>
			<div
				data-slot="stepper-item"
				className={cn(
					"group/step flex items-center justify-center not-last:flex-1 group-data-[orientation=horizontal]/stepper-nav:flex-row group-data-[orientation=vertical]/stepper-nav:flex-col",
					className,
				)}
				data-state={state}
				{...(isLoading ? { "data-loading": true } : {})}
				{...props}
			>
				{children}
			</div>
		</StepItemContext.Provider>
	);
}

StepperItem.displayName = "StepperItem";

interface StepperTriggerProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	asChild?: boolean;
}

function StepperTrigger({
	asChild = false,
	className,
	children,
	tabIndex,
	...props
}: StepperTriggerProps) {
	const { state, isLoading } = useStepItem();
	const stepperCtx = useStepper();
	const {
		setActiveStep,
		activeStep,
		registerTrigger,
		unregisterTrigger,
		triggerNodes,
		focusNext,
		focusPrev,
		focusFirst,
		focusLast,
	} = stepperCtx;
	const { step, isDisabled } = useStepItem();
	const isSelected = activeStep === step;
	const id = `stepper-tab-${step}`;
	const panelId = `stepper-panel-${step}`;
	const btnRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		const node = btnRef.current;

		if (!node) {
			return;
		}

		registerTrigger(node);

		return () => unregisterTrigger(node);
	}, [registerTrigger, unregisterTrigger]);

	const myIdx = useMemo(
		() =>
			triggerNodes.findIndex((n: HTMLButtonElement) => n === btnRef.current),
		[triggerNodes],
	);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
		switch (e.key) {
			case "ArrowRight":
			case "ArrowDown":
				e.preventDefault();
				if (myIdx !== -1) focusNext(myIdx);
				break;
			case "ArrowLeft":
			case "ArrowUp":
				e.preventDefault();
				if (myIdx !== -1) focusPrev(myIdx);
				break;
			case "Home":
				e.preventDefault();
				focusFirst();
				break;
			case "End":
				e.preventDefault();
				focusLast();
				break;
			case "Enter":
			case " ":
				e.preventDefault();
				setActiveStep(step);
				break;
		}
	};

	if (asChild) {
		return (
			<span
				data-slot="stepper-trigger"
				data-state={state}
				className={className}
			>
				{children}
			</span>
		);
	}

	return (
		<button
			ref={btnRef}
			role="tab"
			id={id}
			aria-selected={isSelected}
			aria-controls={panelId}
			tabIndex={typeof tabIndex === "number" ? tabIndex : isSelected ? 0 : -1}
			data-slot="stepper-trigger"
			data-state={state}
			data-loading={isLoading}
			className={cn(
				"focus-visible:border-ring focus-visible:ring-ring/50 inline-flex cursor-pointer items-center outline-none focus-visible:z-10 focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-60",
				"gap-2.5 rounded-full",
				className,
			)}
			type="button"
			onClick={() => setActiveStep(step)}
			onKeyDown={handleKeyDown}
			disabled={isDisabled}
			{...props}
		>
			{children}
		</button>
	);
}

function StepperIndicator({
	children,
	className,
}: React.ComponentProps<"div">) {
	const { state, isLoading } = useStepItem();
	const { indicators } = useStepper();

	const indicator =
		(isLoading && indicators.loading) ||
		(state === "completed" && indicators.completed) ||
		(state === "active" && indicators.active) ||
		(state === "inactive" && indicators.inactive) ||
		children;

	return (
		<div
			data-slot="stepper-indicator"
			data-state={state}
			className={cn(
				"border border-border bg-secondary text-bg-foreground data-[state=completed]:bg-primary data-[state=completed]:text-primary-foreground data-[state=completed]:border-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary-foreground/30 relative flex size-6 shrink-0 items-center justify-center overflow-hidden",
				"rounded-full text-xs",
				className,
			)}
		>
			<div className="absolute">{indicator}</div>
		</div>
	);
}

function StepperSeparator({ className }: React.ComponentProps<"div">) {
	const { state } = useStepItem();

	return (
		<div
			data-slot="stepper-separator"
			data-state={state}
			className={cn(
				"bg-border rounded-full group-data-[orientation=horizontal]/stepper-nav:h-0.5 group-data-[orientation=vertical]/stepper-nav:h-12 group-data-[orientation=vertical]/stepper-nav:w-0.5 m-0.5 group-data-[orientation=horizontal]/stepper-nav:flex-1",
				className,
			)}
		/>
	);
}

function StepperTitle({ children, className }: React.ComponentProps<"h3">) {
	const { state } = useStepItem();

	return (
		<h3
			data-slot="stepper-title"
			data-state={state}
			className={cn("text-sm leading-none font-medium", className)}
		>
			{children}
		</h3>
	);
}

function StepperDescription({
	children,
	className,
}: React.ComponentProps<"div">) {
	const { state } = useStepItem();

	return (
		<div
			data-slot="stepper-description"
			data-state={state}
			className={cn("text-muted-foreground text-sm", className)}
		>
			{children}
		</div>
	);
}

function StepperNav({ children, className }: React.ComponentProps<"nav">) {
	const { activeStep, orientation } = useStepper();

	return (
		<nav
			data-slot="stepper-nav"
			data-state={activeStep}
			data-orientation={orientation}
			className={cn(
				"group/stepper-nav inline-flex data-[orientation=horizontal]:w-full data-[orientation=horizontal]:flex-row data-[orientation=vertical]:flex-col",
				className,
			)}
		>
			{children}
		</nav>
	);
}

function StepperPanel({ children, className }: React.ComponentProps<"div">) {
	const { activeStep } = useStepper();

	return (
		<div
			data-slot="stepper-panel"
			data-state={activeStep}
			className={cn("w-full", className)}
		>
			{children}
		</div>
	);
}

interface StepperContentProps extends React.ComponentProps<"div"> {
	value: number;
	forceMount?: boolean;
}

function StepperContent({
	value,
	forceMount,
	children,
	className,
}: StepperContentProps) {
	const { activeStep } = useStepper();
	const isActive = value === activeStep;

	if (!forceMount && !isActive) {
		return null;
	}

	return (
		<div
			data-slot="stepper-content"
			data-state={activeStep}
			className={cn("w-full", className, !isActive && forceMount && "hidden")}
			hidden={!isActive && forceMount}
		>
			{children}
		</div>
	);
}

export {
	useStepper,
	useStepItem,
	Stepper,
	StepperItem,
	StepperTrigger,
	StepperIndicator,
	StepperSeparator,
	StepperTitle,
	StepperDescription,
	StepperPanel,
	StepperContent,
	StepperNav,
	type StepperProps,
	type StepperItemProps,
	type StepperTriggerProps,
	type StepperContentProps,
};
