import { createContextualCan } from "@casl/react";
import { createContext, useContext, useMemo } from "react";
import {
	type AppAbility,
	createAbility,
	getUserPermissions,
} from "@/lib/permissions";
import { useAuth } from "@/providers/auth";

export const AbilityContext = createContext<AppAbility>(createAbility());

export const Can = createContextualCan(AbilityContext.Consumer);

export function AbilityProvider({ children }: { children: React.ReactNode }) {
	const { user } = useAuth();

	// Re-create ability when user changes
	// In a more complex app, we might update an existing ability instance
	// but rebuilding is cheap and safe for this scale.
	const ability = useMemo(() => getUserPermissions(user), [user]);

	return (
		<AbilityContext.Provider value={ability}>
			{children}
		</AbilityContext.Provider>
	);
}

export function useAbility() {
	return useContext(AbilityContext);
}
