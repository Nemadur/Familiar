import { getAccessToken } from "./supabase";

export type BackendMeResponse = {
	userId: string;
	username: string;
	displayName: string;
	pronouns?: string | null;
	bio?: string | null;
	avatarPath?: string | null;
	coverPath?: string | null;
	accentColor?: string | null;
	isVerified?: boolean;
	isPremium?: boolean;
	isPrivate?: boolean;
	createdAt: string;
	roles?: string[];
};

export function getApiBaseUrl() {
	const apiUrl = import.meta.env.VITE_API_URL as string | undefined;

	if (apiUrl && apiUrl.trim().length > 0) {
		return apiUrl.replace(/\/$/, "");
	}

	// if backend is on the same domain behind reverse proxy, relative path is fine
	return "";
}

export async function apiFetch<T>(path: string, init: RequestInit = {}) {
	const accessToken = await getAccessToken();

	const normalizedPath = path.startsWith("/") ? path : `/${path}`;
	const baseUrl = getApiBaseUrl();
	const url = baseUrl ? `${baseUrl}${normalizedPath}` : normalizedPath;

	const response = await fetch(url, {
		...init,
		headers: {
			Accept: "application/json",
			...(init.headers ?? {}),
			...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
		},
	});

	if (!response.ok) {
		const contentType = response.headers.get("content-type") ?? "";
		const bodyText = await response.text();

		console.error("apiFetch failed", {
			url,
			status: response.status,
			statusText: response.statusText,
			contentType,
			hasToken: Boolean(accessToken),
			body: bodyText,
		});

		throw new Error(
			`Request failed: ${response.status} ${response.statusText}${
				bodyText ? ` - ${bodyText}` : ""
			}`,
		);
	}

	return response.json() as Promise<T>;
}
