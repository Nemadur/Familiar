import {
	AbilityProvider as CaslAbilityProvider,
	Can,
	useAbility,
} from "@casl/react";
import { useMemo, type ReactNode } from "react";
import {
	type AppAbility,
	createAbility,
	getUserPermissions,
} from "@/lib/permissions";
import { useAuth } from "@/providers/auth";
import type { TUserProfile } from "@/types/user";

export { Can };

export function AbilityProvider({ children }: { children: ReactNode }) {
	const { user } = useAuth();

	const ability = useMemo<AppAbility>(() => {
		if (!user) {
			return createAbility();
		}

		return getUserPermissions(user as TUserProfile);
	}, [user]);

	return (
		<CaslAbilityProvider value={ability}>
			{children}
		</CaslAbilityProvider>
	);
}

export function useAppAbility() {
	return useAbility<AppAbility>();
}