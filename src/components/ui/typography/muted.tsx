import type { ReactNode } from "react";

export function TypographyMuted({ children }: { children: ReactNode }) {
	return <p className="text-sm text-muted-foreground">{children}</p>;
}
