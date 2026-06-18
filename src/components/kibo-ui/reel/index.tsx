import { useControllableState } from "@radix-ui/react-use-controllable-state";
import {
	ChevronLeft,
	ChevronRight,
	Pause,
	Play,
	Volume2,
	VolumeX,
} from "lucide-react";
import type {
	ComponentProps,
	Dispatch,
	HTMLAttributes,
	MouseEventHandler,
	ReactNode,
	SetStateAction,
	VideoHTMLAttributes,
} from "react";
import {
	createContext,
	useCallback,
	use,
	useEffect,
	useRef,
	useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "framer-motion";

export type ReelItem = {
	id: string | number;
	type: "video" | "image";
	src: string;
	duration: number;
	alt?: string;
	title?: string;
	description?: string;
};

type ReelContextType = {
	currentIndex: number;
	setCurrentIndex: Dispatch<SetStateAction<number>>;
	isPlaying: boolean;
	setIsPlaying: Dispatch<SetStateAction<boolean>>;
	isMuted: boolean;
	setIsMuted: Dispatch<SetStateAction<boolean>>;
	progress: number;
	setProgress: Dispatch<SetStateAction<number>>;
	data: ReelItem[];
	currentItem: ReelItem;
	isNavigating: boolean;
	setIsNavigating: Dispatch<SetStateAction<boolean>>;
	isTransitioning: boolean;
	setIsTransitioning: Dispatch<SetStateAction<boolean>>;
	resetOnPause?: boolean;
};

const ReelContext = createContext<ReelContextType | undefined>(undefined);

const useReelContext = () => {
	const context = use(ReelContext);

	if (!context) {
		throw new Error("useReelContext must be used within a Reel");
	}

	return context;
};

export type ReelProps = HTMLAttributes<HTMLDivElement> & {
	data: ReelItem[];
	defaultIndex?: number;
	index?: number;
	onIndexChange?: (index: number) => void;
	defaultPlaying?: boolean;
	playing?: boolean;
	onPlayingChange?: (playing: boolean) => void;
	defaultMuted?: boolean;
	muted?: boolean;
	onMutedChange?: (muted: boolean) => void;
	autoPlay?: boolean;
	resetOnPause?: boolean;
};

export const Reel = ({
	className,
	data,
	defaultIndex = 0,
	index: controlledIndex,
	onIndexChange: controlledOnIndexChange,
	defaultPlaying,
	playing: controlledPlaying,
	onPlayingChange: controlledOnPlayingChange,
	defaultMuted = true,
	muted: controlledMuted,
	onMutedChange: controlledOnMutedChange,
	autoPlay = true,
	resetOnPause = false,
	...props
}: ReelProps) => {
	const shouldReduceMotion = useReducedMotion();

	const [currentIndex, setCurrentIndexState] = useControllableState({
		defaultProp: defaultIndex,
		prop: controlledIndex,
		onChange: controlledOnIndexChange,
	});

	const [isPlaying, setIsPlaying] = useControllableState({
		defaultProp: defaultPlaying ?? (shouldReduceMotion ? false : autoPlay),
		prop: controlledPlaying,
		onChange: controlledOnPlayingChange,
	});

	const [isMuted, setIsMuted] = useControllableState({
		defaultProp: defaultMuted,
		prop: controlledMuted,
		onChange: controlledOnMutedChange,
	});

	const [progress, setProgress] = useState(0);
	const [isNavigating, setIsNavigating] = useState(false);
	const [isTransitioning, setIsTransitioning] = useState(false);

	const safeCurrentIndex = currentIndex ?? 0;
	const safeIsPlaying = shouldReduceMotion ? false : (isPlaying ?? false);
	const safeIsMuted = isMuted ?? defaultMuted;

	const setCurrentIndex = useCallback(
		(nextIndex: SetStateAction<number>) => {
			setIsTransitioning(true);
			setProgress(0);
			setCurrentIndexState(nextIndex);
		},
		[setCurrentIndexState],
	);

	const currentItem = data[safeCurrentIndex] ?? data[0];

	if (!currentItem) {
		return (
			<div
				className={cn(
					"relative isolate h-full w-auto overflow-hidden transform-[translateZ(0)]",
					"aspect-9/16",
					className,
				)}
				{...props}
			/>
		);
	}

	return (
		<ReelContext.Provider
			value={{
				currentIndex: safeCurrentIndex,
				setCurrentIndex,
				isPlaying: safeIsPlaying,
				setIsPlaying,
				isMuted: safeIsMuted,
				setIsMuted,
				progress,
				setProgress,
				data,
				currentItem,
				isNavigating,
				setIsNavigating,
				isTransitioning,
				setIsTransitioning,
				resetOnPause,
			}}
		>
			<div
				className={cn(
					"relative isolate h-full w-auto overflow-hidden transform-[translateZ(0)]",
					"aspect-9/16",
					className,
				)}
				{...props}
			/>
		</ReelContext.Provider>
	);
};

export type ReelContentProps = Omit<
	HTMLAttributes<HTMLDivElement>,
	"children"
> & {
	children: (item: ReelItem, index: number) => ReactNode;
};

export const ReelContent = ({
	className,
	children,
	...props
}: ReelContentProps) => {
	const { currentIndex, currentItem, setIsTransitioning } = useReelContext();
	const shouldReduceMotion = useReducedMotion();

	return (
		<div
			className={cn("relative size-full overflow-hidden", className)}
			data-reel-content
			{...props}
		>
			<div
				key={currentIndex}
				className={cn(
					"absolute inset-0 overflow-hidden fill-mode-forwards",
					!shouldReduceMotion && "animate-in fade-in duration-300",
				)}
				onAnimationEnd={() => setIsTransitioning(false)}
			>
				<ReelContentItem currentItem={currentItem} currentIndex={currentIndex}>
					{children}
				</ReelContentItem>
			</div>
		</div>
	);
};

const ReelContentItem = ({
	children,
	currentItem,
	currentIndex,
}: {
	children: ReelContentProps["children"];
	currentItem: ReelItem;
	currentIndex: number;
}) => {
	if (typeof children === "function") {
		return <>{children(currentItem, currentIndex)}</>;
	}

	const childrenArray = Array.isArray(children) ? children : [children];

	return <>{childrenArray[currentIndex]}</>;
};

export type ReelItemProps = HTMLAttributes<HTMLDivElement>;

export const ReelItem = ({ className, ...props }: ReelItemProps) => (
	<div
		className={cn("relative size-full overflow-hidden", className)}
		data-reel-item
		{...props}
	/>
);

export type ReelVideoProps = VideoHTMLAttributes<HTMLVideoElement>;

const MS_TO_SECONDS = 3000;
const PERCENTAGE = 100;

export const ReelVideo = ({ className, ...props }: ReelVideoProps) => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const {
		isPlaying,
		isMuted,
		setProgress,
		setCurrentIndex,
		data,
		progress,
		currentItem,
		isTransitioning,
		resetOnPause,
	} = useReelContext();
	const animationFrameRef = useRef<number | undefined>(undefined);
	const startTimeRef = useRef<number | undefined>(undefined);
	const pausedProgressRef = useRef<number>(0);
	const duration = currentItem.duration;

	useEffect(() => {
		if (!isTransitioning) {
			pausedProgressRef.current = 0;
		}
	}, [isTransitioning]);

	useEffect(() => {
		if (!isPlaying) {
			if (resetOnPause) {
				pausedProgressRef.current = 0;
				setProgress(0);
			} else {
				pausedProgressRef.current = progress;
			}
		}
	}, [isPlaying, progress, resetOnPause, setProgress]);

	useEffect(() => {
		const video = videoRef.current;

		if (!video) {
			return;
		}

		if (isPlaying && !isTransitioning) {
			video.play().catch(() => {
				// Ignore autoplay errors.
			});

			const elapsedTime = (pausedProgressRef.current * duration) / PERCENTAGE;
			startTimeRef.current = performance.now() - elapsedTime * MS_TO_SECONDS;

			const updateProgress = (currentTime: number) => {
				const elapsed =
					(currentTime - (startTimeRef.current || 0)) / MS_TO_SECONDS;
				const nextProgress = (elapsed / duration) * PERCENTAGE;

				if (nextProgress >= PERCENTAGE) {
					const totalItems = data?.length || 0;
					setCurrentIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
				} else {
					setProgress(nextProgress);
					pausedProgressRef.current = nextProgress;
					animationFrameRef.current = requestAnimationFrame(updateProgress);
				}
			};

			animationFrameRef.current = requestAnimationFrame(updateProgress);
		} else if (!isTransitioning) {
			video.pause();
		}

		return () => {
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
			}
		};
	}, [
		isPlaying,
		duration,
		setProgress,
		setCurrentIndex,
		data,
		isTransitioning,
	]);

	return (
		<video
			className={cn("absolute inset-0 size-full object-cover", className)}
			loop
			muted={isMuted}
			playsInline
			ref={videoRef}
			{...props}
		/>
	);
};

export type ReelImageProps = Omit<ComponentProps<"img">, "alt"> & {
	alt: string;
	duration?: number;
	width?: number | string;
	height?: number | string;
};

const DEFAULT_IMAGE_DURATION = 5;

export const ReelImage = ({
	className,
	alt,
	duration = DEFAULT_IMAGE_DURATION,
	width,
	height,
	...props
}: ReelImageProps) => {
	const {
		isPlaying,
		setProgress,
		setCurrentIndex,
		data,
		progress,
		isTransitioning,
		resetOnPause,
	} = useReelContext();
	const animationFrameRef = useRef<number | undefined>(undefined);
	const startTimeRef = useRef<number | undefined>(undefined);
	const pausedProgressRef = useRef<number>(0);

	useEffect(() => {
		if (!isTransitioning) {
			pausedProgressRef.current = 0;
		}
	}, [isTransitioning]);

	useEffect(() => {
		if (!isPlaying && !isTransitioning) {
			if (resetOnPause) {
				pausedProgressRef.current = 0;
				setProgress(0);
			} else {
				pausedProgressRef.current = progress;
			}
		}
	}, [isPlaying, isTransitioning, progress, resetOnPause, setProgress]);

	useEffect(() => {
		if (isPlaying && !isTransitioning) {
			const elapsedTime = (pausedProgressRef.current * duration) / PERCENTAGE;
			startTimeRef.current = performance.now() - elapsedTime * MS_TO_SECONDS;

			const updateProgress = (currentTime: number) => {
				const elapsed =
					(currentTime - (startTimeRef.current || 0)) / MS_TO_SECONDS;
				const nextProgress = (elapsed / duration) * PERCENTAGE;

				if (nextProgress >= PERCENTAGE) {
					const totalItems = data?.length || 0;
					setCurrentIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
				} else {
					setProgress(nextProgress);
					pausedProgressRef.current = nextProgress;
					animationFrameRef.current = requestAnimationFrame(updateProgress);
				}
			};

			animationFrameRef.current = requestAnimationFrame(updateProgress);
		}

		return () => {
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
			}
		};
	}, [
		isPlaying,
		duration,
		setProgress,
		setCurrentIndex,
		data,
		isTransitioning,
	]);

	return (
		<img
			alt={alt}
			className={cn("absolute inset-0 size-full object-cover", className)}
			height={height}
			width={width}
			{...props}
		/>
	);
};

export type ReelProgressProps = HTMLAttributes<HTMLDivElement> & {
	children?: (
		item: ReelItem,
		index: number,
		isActive: boolean,
		progress: number,
	) => ReactNode;
};

export const ReelProgress = ({
	className,
	children,
	...props
}: ReelProgressProps) => {
	const { progress, currentIndex, data } = useReelContext();
	const FULL_PROGRESS = 100;

	const calculateProgress = (index: number) => {
		if (index < currentIndex) {
			return FULL_PROGRESS;
		}

		if (index === currentIndex) {
			return progress;
		}

		return 0;
	};

	if (typeof children === "function") {
		return (
			<div
				className={cn(
					"absolute top-0 right-0 left-0 z-40 flex gap-1 p-2",
					className,
				)}
				{...props}
			>
				{data.map((item, index) => (
					<div className="relative flex-1" key={`${item.id}-progress`}>
						{children(
							item,
							index,
							index === currentIndex,
							calculateProgress(index),
						)}
					</div>
				))}
			</div>
		);
	}

	return (
		<div
			className={cn(
				"absolute top-0 right-0 left-0 z-40 flex gap-1 p-2",
				className,
			)}
			{...props}
		>
			{data.map((item, index) => (
				<Progress
					className="h-0.5 flex-1 bg-white/30 [&>div]:bg-white [&>div]:transition-none"
					key={`${item.id}-progress`}
					value={calculateProgress(index)}
				/>
			))}
		</div>
	);
};

export type ReelControlsProps = HTMLAttributes<HTMLDivElement>;

export const ReelControls = ({ className, ...props }: ReelControlsProps) => (
	<div
		className={cn(
			"absolute right-0 bottom-0 left-0 z-20 flex items-center justify-between p-4",
			"bg-linear-to-t from-black/60 to-transparent",
			className,
		)}
		{...props}
	/>
);

export type ReelPreviousButtonProps = ComponentProps<typeof Button>;

export const ReelPreviousButton = ({
	className,
	children,
	...props
}: ReelPreviousButtonProps) => {
	const { currentIndex, setCurrentIndex, setIsNavigating } = useReelContext();
	const NAVIGATION_RESET_DELAY = 50;

	const moveToPreviousReelItem = () => {
		if (currentIndex > 0) {
			setIsNavigating(true);
			setCurrentIndex((prev) => Math.max(prev - 1, 0));
			setTimeout(() => setIsNavigating(false), NAVIGATION_RESET_DELAY);
		}
	};

	return (
		<Button
			aria-label="Previous"
			className={cn(
				"rounded-full text-white hover:bg-white/10 hover:text-white",
				className,
			)}
			disabled={currentIndex === 0}
			onClick={moveToPreviousReelItem}
			size="icon"
			type="button"
			variant="ghost"
			{...props}
		>
			{children || <ChevronLeft className="size-4" />}
		</Button>
	);
};

export type ReelNextButtonProps = ComponentProps<typeof Button>;

export const ReelNextButton = ({
	className,
	children,
	...props
}: ReelNextButtonProps) => {
	const { currentIndex, setCurrentIndex, data, setIsNavigating } =
		useReelContext();
	const totalItems = data?.length || 0;
	const NAVIGATION_RESET_DELAY = 50;

	const moveToNextReelItem = () => {
		if (currentIndex < totalItems - 1) {
			setIsNavigating(true);
			setCurrentIndex((prev) => Math.min(prev + 1, totalItems - 1));
			setTimeout(() => setIsNavigating(false), NAVIGATION_RESET_DELAY);
		}
	};

	return (
		<Button
			aria-label="Next"
			className={cn(
				"rounded-full text-white hover:bg-white/10 hover:text-white",
				className,
			)}
			disabled={currentIndex === totalItems - 1}
			onClick={moveToNextReelItem}
			size="icon"
			type="button"
			variant="ghost"
			{...props}
		>
			{children || <ChevronRight className="size-4" />}
		</Button>
	);
};

export type ReelPlayButtonProps = ComponentProps<typeof Button>;

export const ReelPlayButton = ({
	className,
	children,
	...props
}: ReelPlayButtonProps) => {
	const { isPlaying, setIsPlaying } = useReelContext();

	const toggleReelPlayback = () => {
		setIsPlaying((prev) => !prev);
	};

	return (
		<Button
			aria-label={isPlaying ? "Pause" : "Play"}
			className={cn(
				"rounded-full text-white hover:bg-white/10 hover:text-white",
				className,
			)}
			onClick={toggleReelPlayback}
			size="icon"
			variant="ghost"
			{...props}
		>
			{children ||
				(isPlaying ? (
					<Pause className="size-4" />
				) : (
					<Play className="size-4" />
				))}
		</Button>
	);
};

export type ReelMuteButtonProps = ComponentProps<typeof Button>;

export const ReelMuteButton = ({
	className,
	children,
	...props
}: ReelMuteButtonProps) => {
	const { isMuted, setIsMuted } = useReelContext();

	const toggleReelAudio = () => {
		setIsMuted((prev) => !prev);
	};

	return (
		<Button
			aria-label={isMuted ? "Unmute" : "Mute"}
			className={cn(
				"rounded-full text-white hover:bg-white/10 hover:text-white",
				className,
			)}
			onClick={toggleReelAudio}
			size="icon"
			variant="ghost"
			{...props}
		>
			{children ||
				(isMuted ? (
					<VolumeX className="size-4" />
				) : (
					<Volume2 className="size-4" />
				))}
		</Button>
	);
};

export type ReelNavigationProps = HTMLAttributes<HTMLButtonElement>;

export const ReelNavigation = ({
	className,
	...props
}: ReelNavigationProps) => {
	const { setCurrentIndex, currentIndex, data, setIsNavigating } =
		useReelContext();
	const totalItems = data?.length || 0;
	const NAVIGATION_RESET_DELAY = 50;
	const HALF_WIDTH_DIVISOR = 2;

	const navigateByClickPosition: MouseEventHandler<HTMLButtonElement> = (e) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const width = rect.width;

		if (x < width / HALF_WIDTH_DIVISOR) {
			if (currentIndex > 0) {
				setIsNavigating(true);
				setCurrentIndex((prev) => Math.max(prev - 1, 0));
				setTimeout(() => setIsNavigating(false), NAVIGATION_RESET_DELAY);
			}
		} else if (currentIndex < totalItems - 1) {
			setIsNavigating(true);
			setCurrentIndex((prev) => Math.min(prev + 1, totalItems - 1));
			setTimeout(() => setIsNavigating(false), NAVIGATION_RESET_DELAY);
		}
	};

	return (
		<button
			className={cn("absolute inset-0 z-10 flex", className)}
			onClick={navigateByClickPosition}
			type="button"
			{...props}
		>
			<div className="flex-1 cursor-pointer" />
			<div className="flex-1 cursor-pointer" />
		</button>
	);
};

export type ReelOverlayProps = HTMLAttributes<HTMLDivElement>;

export const ReelOverlay = ({ className, ...props }: ReelOverlayProps) => (
	<div
		className={cn("pointer-events-none absolute inset-0 z-30", className)}
		{...props}
	/>
);

export type ReelHeaderProps = HTMLAttributes<HTMLDivElement>;

export const ReelHeader = ({ className, ...props }: ReelHeaderProps) => (
	<div
		className={cn(
			"absolute top-0 right-0 left-0 z-20 p-4 pt-6",
			"bg-linear-to-b from-black/60 to-transparent",
			className,
		)}
		{...props}
	/>
);

export type ReelFooterProps = HTMLAttributes<HTMLDivElement>;

export const ReelFooter = ({ className, ...props }: ReelFooterProps) => (
	<div
		className={cn(
			"absolute right-0 bottom-0 left-0 z-20 p-4",
			"bg-linear-to-t from-black/60 to-transparent",
			className,
		)}
		{...props}
	/>
);
