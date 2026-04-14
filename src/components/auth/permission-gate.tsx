import type { ReactNode } from "react";
import type { AppActions, AppSubjects } from "@/lib/permissions";
import { Can } from "@/providers/ability";

interface PermissionGateProps {
	action: AppActions;
	subject: AppSubjects;
	children: ReactNode;
	fallback?: ReactNode;
}

export function PermissionGate({
	action,
	subject,
	children,
	fallback = null,
}: PermissionGateProps) {
	return (
		<Can I={action} a={subject} passThrough>
			{(allowed) => (allowed ? children : fallback)}
		</Can>
	);
}
