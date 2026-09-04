import { useMutation } from "@tanstack/react-query";

import { registerAccount } from "@/api/auth/auth";
import type {
	AuthResponse,
	RegisterAccountInput,
} from "@/api/auth/auth-types";

export function useRegisterAccount() {
	return useMutation<AuthResponse, Error, RegisterAccountInput>({
		mutationFn: registerAccount,
	});
}
