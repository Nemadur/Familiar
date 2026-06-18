import { apiFetch } from "@/lib/fetch";
import type { FormTemplateResponse } from "@/types/commissions/templates";

export function getFormTemplates() {
	return apiFetch<FormTemplateResponse[]>("/api/form-templates");
}

export function getFormTemplateById(templateId: string) {
	return apiFetch<FormTemplateResponse>(`/api/form-templates/${templateId}`);
}

export function createFormTemplate(data: {
	name: string;
	description?: string;
	fields?: any[];
}) {
	return apiFetch<FormTemplateResponse>("/api/form-templates", {
		method: "POST",
		body: JSON.stringify(data),
		headers: {
			"Content-Type": "application/json",
		},
	});
}

export function assignFormTemplate(commissionId: string, templateId: string | null) {
	return apiFetch<void>(`/api/form-templates/commissions/${commissionId}/assign`, {
		method: "POST",
		body: JSON.stringify({ templateId }),
		headers: {
			"Content-Type": "application/json",
		},
	});
}

export function deleteFormTemplate(templateId: string) {
	return apiFetch<void>(`/api/form-templates/${templateId}`, {
		method: "DELETE",
	});
}

export function updateFormTemplate(
	templateId: string,
	data: {
		version: number;
		name: string;
		description?: string;
		fields?: any[];
	},
) {
	return apiFetch<FormTemplateResponse>(`/api/form-templates/${templateId}`, {
		method: "PATCH",
		body: JSON.stringify(data),
		headers: {
			"Content-Type": "application/json",
		},
	});
}
