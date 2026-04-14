import { apiFetch } from "@/lib/fetch";
import type { TRoles } from "@/types/user/roles";

export async function getMyRoles() {
	return apiFetch<TRoles[]>(`roles/my`);
}
