import { z } from "zod";

export const formFieldOptionSchema = z.object({
	label: z.string().min(1, "Option label is required"),
	value: z.string().min(1, "Option value is required"),
	priceModifier: z
		.object({
			type: z.enum(["NONE", "FIXED", "PERCENT"]),
			value: z.number().optional(),
		})
		.optional(),
});

export const formFieldSchema = z.object({
	fieldId: z.string().optional(),
	type: z.enum([
		"TEXT_INPUT",
		"TEXTAREA",
		"NUMBER_INPUT",
		"DATE_INPUT",
		"RADIO",
		"CHECKBOX",
		"SELECT",
	]),
	label: z.string().min(1, "Field label is required"),
	description: z.string().optional().nullable(),
	required: z.boolean().optional(),
	minValue: z.number().optional().nullable(),
	maxValue: z.number().optional().nullable(),
	options: z.array(formFieldOptionSchema).optional().nullable(),
});

export const formTemplateSchema = z.object({
	name: z.string().min(1, "Template name is required"),
	description: z.string().optional().nullable(),
	fields: z.array(formFieldSchema).default([]),
});

export type FormTemplateData = z.infer<typeof formTemplateSchema>;
