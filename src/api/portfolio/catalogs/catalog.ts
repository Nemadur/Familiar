import { apiFetch } from "@/lib/fetch";
import type {
	CatalogResponse,
	CreateCatalogRequest,
	UpdateCatalogRequest,
	AssignCoverRequest,
	ReorderCatalogsRequest,
} from "./catalog-types";

// ------------------------------------------------------------------
// Me Endpoints (Authenticated Artist)
// ------------------------------------------------------------------

export async function getMyCatalogs() {
	return apiFetch<CatalogResponse[]>("portfolio/me/catalogs");
}

export async function createCatalog(data: CreateCatalogRequest) {
	return apiFetch<CatalogResponse>("portfolio/me/catalogs", {
		method: "POST",
		body: JSON.stringify(data),
	});
}

export async function updateCatalog(
	catalogId: string,
	data: UpdateCatalogRequest,
) {
	return apiFetch<CatalogResponse>(`portfolio/me/catalogs/${catalogId}`, {
		method: "PATCH",
		body: JSON.stringify(data),
	});
}

export async function deleteCatalog(catalogId: string) {
	return apiFetch<void>(`portfolio/me/catalogs/${catalogId}`, {
		method: "DELETE",
	});
}

export async function reorderMyCatalogs(data: ReorderCatalogsRequest) {
	return apiFetch<void>("portfolio/me/catalogs/order", {
		method: "PUT",
		body: JSON.stringify(data),
	});
}

export async function assignCatalogCover(
	catalogId: string,
	data: AssignCoverRequest,
) {
	return apiFetch<CatalogResponse>(`portfolio/me/catalogs/${catalogId}/cover`, {
		method: "PUT",
		body: JSON.stringify(data),
	});
}

// ------------------------------------------------------------------
// Public / Artist Endpoints
// ------------------------------------------------------------------

export async function getArtistCatalogs(username: string) {
	return apiFetch<CatalogResponse[]>(
		`portfolio/artists/${encodeURIComponent(username)}/catalogs`,
	);
}
