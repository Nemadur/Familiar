export function Container({
	children,
	className,
	maxWidth = "7xl",
}: {
	children: React.ReactNode;
	className?: string;
	maxWidth?: "lg" | "7xl";
}) {
	const maxWidthClass = maxWidth === "lg" ? "max-w-xl" : "max-w-7xl";
	return (
		<div className={`mx-auto w-full ${maxWidthClass} px-0 ${className || ""}`}>
			{children}
		</div>
	);
}
