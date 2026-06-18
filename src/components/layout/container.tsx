export function Container({
	children,
	className,
	maxWidth = "5xl",
}: {
	children: React.ReactNode;
	className?: string;
	maxWidth?: "lg" | "5xl";
}) {
	const maxWidthClass = maxWidth === "lg" ? "max-w-xl" : "max-w-5xl";
	return (
		<div className={`mx-auto w-full ${maxWidthClass} px-0 ${className || ""}`}>
			{children}
		</div>
	);
}
