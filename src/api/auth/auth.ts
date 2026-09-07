import { apiFetch } from "@/lib/fetch";

import type { AuthResponse, RegisterAccountInput } from "./auth-types";
import { createRegisterFormData } from "./register-form-data";

export { createRegisterFormData } from "./register-form-data";

export async function registerAccount(input: RegisterAccountInput) {
	return apiFetch<AuthResponse>("auth/register", {
		method: "POST",
		body: createRegisterFormData(input),
		withAuth: false,
	});
}
