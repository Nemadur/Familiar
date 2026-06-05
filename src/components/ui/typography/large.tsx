import type { ReactNode } from "react";

export function TypographyLarge({ children }: { children: ReactNode }) {
	return <div className="text-lg font-semibold">{children}</div>;
}
