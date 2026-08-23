import { getAccessToken } from "./supabase";

type ApiParamValue = string | number | boolean | undefined | null;

type ApiParams =
	| URLSearchParams
	| Record<string, ApiParamValue | ApiParamValue[]>;

type ApiFetchInit = RequestInit & {
	params?: ApiParams;
};

export function getApiBaseUrl() {
	const apiUrl = import.meta.env.VITE_API_URL as string | undefined;

	if (apiUrl && apiUrl.trim().length > 0) {
		return apiUrl.replace(/\/$/, "");
	}

	return "";
}

function appendParams(url: string, params?: ApiParams) {
	if (!params) {
		return url;
	}

	const separator = url.includes("?") ? "&" : "?";
	const searchParams = new URLSearchParams();

	if (params instanceof URLSearchParams) {
		params.forEach((value, key) => {
			searchParams.append(key, value);
		});
	} else {
		Object.entries(params).forEach(([key, value]) => {
			if (value === undefined || value === null) {
				return;
			}

			if (Array.isArray(value)) {
				value.forEach((item) => {
					if (item !== undefined && item !== null) {
						searchParams.append(key, String(item));
					}
				});

				return;
			}

			searchParams.append(key, String(value));
		});
	}

	const queryString = searchParams.toString();

	if (!queryString) {
		return url;
	}

	return `${url}${separator}${queryString}`;
}

function shouldSetJsonContentType(body: BodyInit | null | undefined) {
	if (!body) {
		return false;
	}

	if (typeof FormData !== "undefined" && body instanceof FormData) {
		return false;
	}

	if (
		typeof URLSearchParams !== "undefined" &&
		body instanceof URLSearchParams
	) {
		return false;
	}

	if (typeof Blob !== "undefined" && body instanceof Blob) {
		return false;
	}

	if (typeof ArrayBuffer !== "undefined" && body instanceof ArrayBuffer) {
		return false;
	}

	if (typeof ReadableStream !== "undefined" && body instanceof ReadableStream) {
		return false;
	}

	return true;
}

async function readErrorBody(response: Response, isJson: boolean) {
	try {
		if (isJson) {
			return JSON.stringify(await response.json());
		}

		return await response.text();
	} catch {
		return "";
	}
}

export async function apiFetch<T = unknown>(
	path: string,
	init: ApiFetchInit = {},
): Promise<T> {
	const { params, ...fetchInit } = init;

	const accessToken = await getAccessToken();

	const normalizedPath = path.startsWith("/") ? path : `/${path}`;
	const baseUrl = getApiBaseUrl();
	const rawUrl = baseUrl ? `${baseUrl}${normalizedPath}` : normalizedPath;
	const url = appendParams(rawUrl, params);

	const headers = new Headers(fetchInit.headers);

	if (!headers.has("Accept")) {
		headers.set("Accept", "application/json");
	}

	if (
		shouldSetJsonContentType(fetchInit.body) &&
		!headers.has("Content-Type")
	) {
		headers.set("Content-Type", "application/json");
	}

	if (accessToken) {
		headers.set("Authorization", `Bearer ${accessToken}`);
	}

	const response = await fetch(url, {
		...fetchInit,
		headers,
	});

	const contentType = response.headers.get("content-type") ?? "";
	const isJson = contentType.includes("application/json");

	if (!response.ok) {
		const bodyText = await readErrorBody(response, isJson);

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
