import type { ReactNode } from "react";

export function TypographySmall({ children }: { children: ReactNode }) {
	return <small className="text-sm leading-none font-medium">{children}</small>;
}
