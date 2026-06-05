import type { ReactNode } from "react";

export function TypographyLead({ children }: { children: ReactNode }) {
	return <p className="text-xl text-muted-foreground">{children}</p>;
}
