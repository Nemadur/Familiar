import { apiFetch } from "@/lib/fetch";
import type { TUserResponse } from "@/types/user";

export async function getUsersByFilter({
	page,
	pageSize,
}: {
	page: number;
	pageSize: number;
}) {
	return apiFetch<TUserResponse[]>(`users?page=${page}&pageSize=${pageSize}`);
}

export async function getUserById(userId: string) {
	return apiFetch<TUserResponse>(`users/id/${userId}`);
}

export async function getUserByUsername(username: string) {
	return apiFetch<TUserResponse>(`users/${username}`);
}

export async function getCurrentUser() {
	return apiFetch<TUserResponse>(`users/me`);
}
