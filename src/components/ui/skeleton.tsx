import { motion } from "motion/react";
import type * as React from "react";
import { cn } from "src/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="skeleton"
			aria-hidden="true"
			className={cn(
				"relative isolate overflow-hidden rounded-md bg-neutral-200 dark:bg-neutral-800",
				className,
			)}
			{...props}
		>
			<motion.div
				className="pointer-events-none absolute inset-y-0 left-0 w-[35%]"
				initial={{ x: "-100%" }}
				animate={{ x: "385%" }}
				transition={{
					duration: 1.2,
					repeat: Infinity,
					ease: "linear",
					repeatDelay: 0.4,
				}}
			>
				<div className="h-full w-full [transform:skewX(-20deg)] bg-gradient-to-r from-transparent via-black/10 to-transparent dark:via-white/10" />
			</motion.div>
		</div>
	);
}

export { Skeleton };
