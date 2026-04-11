import { Archive, AlertTriangle } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HoldToConfirmButton({
	children,
	onComplete,
	holdMs = 1200,
	className,
}: {
	children: React.ReactNode;
	onComplete?: () => void;
	holdMs?: number;
	className?: string;
}) {
	const [progress, setProgress] = useState(0);
	const [holding, setHolding] = useState(false);

	const frameRef = useRef<number | null>(null);
	const startRef = useRef<number | null>(null);
	const doneRef = useRef(false);

	function reset() {
		if (frameRef.current) {
			cancelAnimationFrame(frameRef.current);
		}
		frameRef.current = null;
		startRef.current = null;
		doneRef.current = false;
		setHolding(false);
		setProgress(0);
	}

	function tick(timestamp: number) {
		if (startRef.current === null) {
			startRef.current = timestamp;
		}

		const elapsed = timestamp - startRef.current;
		const nextProgress = Math.min(elapsed / holdMs, 1);

		setProgress(nextProgress);

		if (nextProgress >= 1) {
			doneRef.current = true;
			setHolding(false);
			onComplete?.();
			return;
		}

		frameRef.current = requestAnimationFrame(tick);
	}

	function startHold() {
		reset();
		setHolding(true);
		frameRef.current = requestAnimationFrame(tick);
	}

	function endHold() {
		if (!doneRef.current) {
			reset();
		}
	}

	return (
		<div className={cn("relative overflow-hidden rounded-xl", className)}>
			<div
				className="pointer-events-none absolute inset-y-0 left-0 bg-white/10 transition-[width]"
				style={{ width: `${progress * 100}%` }}
			/>

			<Button
				type="button"
				variant="destructive"
				size="lg"
				className="relative z-10 w-full"
				onPointerDown={startHold}
				onPointerUp={endHold}
				onPointerLeave={endHold}
				onPointerCancel={endHold}
				onContextMenu={(e) => e.preventDefault()}
			>
				{children}
			</Button>
		</div>
	);
}
