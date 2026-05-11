import { MotionConfig, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export function MotionProvider({ children }: { children: ReactNode }) {
	const shouldReduceMotion = useReducedMotion();

	return (
		<MotionConfig reducedMotion={shouldReduceMotion ? "always" : "user"}>
			{children}
		</MotionConfig>
	);
}
