import { getAccessToken } from "./supabase";

export function getApiBaseUrl() {
	const apiUrl = import.meta.env.VITE_API_URL as string | undefined;

	if (apiUrl && apiUrl.trim().length > 0) {
		return apiUrl.replace(/\/$/, "");
	}

	return "";
}

export async function apiFetch<T = unknown>(
	path: string,
	init: RequestInit = {},
): Promise<T> {
	const accessToken = await getAccessToken();

	const normalizedPath = path.startsWith("/") ? path : `/${path}`;
	const baseUrl = getApiBaseUrl();
	const url = baseUrl ? `${baseUrl}${normalizedPath}` : normalizedPath;

	const headers = new Headers(init.headers);

	if (!headers.has("Accept")) {
		headers.set("Accept", "application/json");
	}

	if (accessToken) {
		headers.set("Authorization", `Bearer ${accessToken}`);
	}

	const response = await fetch(url, {
		...init,
		headers,
	});

	const contentType = response.headers.get("content-type") ?? "";
	const isJson = contentType.includes("application/json");

	if (!response.ok) {
		let bodyText = "";

		try {
			bodyText = isJson
				? JSON.stringify(await response.json())
				: await response.text();
		} catch {
			bodyText = "";
		}

		console.error("apiFetch failed", {
			url,
			status: response.status,
			statusText: response.statusText,
			contentType,
			hasToken: !!accessToken,
			body: bodyText,
		});

		throw new Error(
			`Request failed: ${response.status} ${response.statusText}${
				bodyText ? ` - ${bodyText}` : ""
			}`,
		);
	}

	if (response.status === 204 || response.status === 205) {
		return undefined as T;
	}

	if (!contentType) {
		return undefined as T;
	}

	if (isJson) {
		return response.json() as Promise<T>;
	}

	return (await response.text()) as T;
}
