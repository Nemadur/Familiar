import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FormTemplateResponse } from "@/types/commissions/templates";
import {
	getFormTemplates,
	getFormTemplateById,
	createFormTemplate,
	assignFormTemplate,
	deleteFormTemplate,
	updateFormTemplate,
} from "@/api/commisions/form-templates";

export function useFormTemplates() {
	return useQuery({
		queryKey: ["form-templates"],
		queryFn: async (): Promise<FormTemplateResponse[]> => {
			const data = await getFormTemplates();
			return data || [];
		},
	});
}

export function useFormTemplate(templateId?: string) {
	return useQuery({
		queryKey: ["form-template", templateId],
		queryFn: async (): Promise<FormTemplateResponse | null> => {
			if (!templateId) return null;
			return await getFormTemplateById(templateId);
		},
		enabled: !!templateId,
	});
}

export function useCreateFormTemplate() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: {
			name: string;
			description?: string;
			fields?: any[];
		}) => {
			return await createFormTemplate(data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["form-templates"] });
		},
	});
}

export function useAssignFormTemplate() {
	return useMutation({
		mutationFn: async ({
			commissionId,
			templateId,
		}: {
			commissionId: string;
			templateId: string | null;
		}) => {
			await assignFormTemplate(commissionId, templateId);
		},
	});
}

export function useDeleteFormTemplate() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (templateId: string) => {
			await deleteFormTemplate(templateId);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["form-templates"] });
		},
	});
}

export function useUpdateFormTemplate() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			templateId,
			data,
		}: {
			templateId: string;
			data: {
				version: number;
				name: string;
				description?: string;
				fields?: any[];
			};
		}) => {
			return await updateFormTemplate(templateId, data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["form-templates"] });
		},
	});
}
