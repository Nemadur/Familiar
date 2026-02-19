import { domAnimation, LazyMotion, m, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

function AnimateChangeInHeight(
	props: React.ComponentPropsWithRef<typeof m.div> & {
		children: React.ReactNode;
	},
) {
	const [height, setHeight] = useState<number | "auto">("auto");
	const shouldReduceMotion = useReducedMotion();

	return (
		<LazyMotion features={domAnimation}>
			<m.div
				style={{ height }}
				animate={{ height: shouldReduceMotion ? "auto" : height }}
				transition={{ duration: 0.3 }}
				{...props}
				className={cn(props.className, "overflow-hidden")}
			>
				<div
					ref={(ref) => {
						if (!ref) return;

						const resizeObserver = new ResizeObserver(([entry]) => {
							const observedHeight = entry.contentRect.height;
							setHeight(observedHeight);
						});

						resizeObserver.observe(ref);

						return () => {
							resizeObserver.disconnect();
						};
					}}
				>
					{props.children}
				</div>
			</m.div>
		</LazyMotion>
	);
}

export { AnimateChangeInHeight };
