import { z } from "zod";
import { TCommissionStatus } from "@/types/commissions";

// FIXME: get from backend :v
export const MAX_COMMISSION_TITLE_LENGTH = 255;
export const MAX_COMMISSION_DESCRIPTION_LENGTH = 5000;
export const MAX_COMMISSION_TAGS = 20;

export const COMMISSION_MEDIA_ACCEPTED_MIME_TYPES = [
	"image/jpeg",
	"image/png",
	"image/webp",
	"image/bmp",
	"image/tiff",
	"image/gif",
	"video/mp4",
	"video/webm",
	"video/quicktime",
	"video/x-msvideo",
	"video/x-matroska",
] as const;

const emptyStringToUndefined = (value: unknown) => {
	if (typeof value !== "string") return value;

	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : undefined;
};

const numberLikeToNumber = (value: unknown) => {
	if (typeof value === "number") return value;
	if (typeof value !== "string") return value;

	const normalized = value.trim().replace(",", ".");
	return normalized.length > 0 ? Number(normalized) : Number.NaN;
};

const trimmedUuid = (error: string) =>
	z.string().trim().pipe(z.uuid({ error }));

export const commissionStatusSchema = z.enum([
	TCommissionStatus.Draft,
	TCommissionStatus.Active,
	TCommissionStatus.Paused,
	TCommissionStatus.OnHold,
	TCommissionStatus.Archived,
]);

export const commissionTitleSchema = z
	.string()
	.trim()
	.min(1, "Title is required.")
	.max(
		MAX_COMMISSION_TITLE_LENGTH,
		`Title must be ${MAX_COMMISSION_TITLE_LENGTH} characters or less.`,
	);

export const commissionDescriptionSchema = z.preprocess(
	emptyStringToUndefined,
	z
		.string()
		.trim()
		.max(
			MAX_COMMISSION_DESCRIPTION_LENGTH,
			`Description must be ${MAX_COMMISSION_DESCRIPTION_LENGTH} characters or less.`,
		)
		.optional(),
);

export const commissionCategoryIdSchema = z
	.string()
	.trim()
	.min(1, "Category is required.")
	.pipe(z.uuid({ error: "Category must be a valid UUID." }));

export const commissionFolderIdSchema = z.preprocess(
	emptyStringToUndefined,
	trimmedUuid("Folder must be a valid UUID.").optional(),
);

export const commissionBasePriceSchema = z.preprocess(
	numberLikeToNumber,
	z.number().min(0, "Base price must be 0 or higher."),
);

export const commissionCurrencyCodeSchema = z
	.string()
	.trim()
	.transform((value) => value.toUpperCase())
	.refine((value) => /^[A-Z]{3}$/.test(value), {
		message: "Currency must be a 3-letter ISO code, for example USD.",
	});

export const commissionTagIdsSchema = z
	.array(trimmedUuid("Tag must be a valid UUID."))
	.max(
		MAX_COMMISSION_TAGS,
		`You can select up to ${MAX_COMMISSION_TAGS} tags.`,
	);

export const commissionMediaFileSchema = z
	.custom<File>(
		(value) => typeof File !== "undefined" && value instanceof File,
		"Media item must be a file.",
	)
	.refine((file) => file.size > 0, "File cannot be empty.")
	.refine(
		(file) =>
			COMMISSION_MEDIA_ACCEPTED_MIME_TYPES.includes(
				file.type as (typeof COMMISSION_MEDIA_ACCEPTED_MIME_TYPES)[number],
			) ||
			file.type.startsWith("image/") ||
			file.type.startsWith("video/"),
		"Unsupported media type. Use an image, GIF, or video file.",
	);

export const createCommissionRequestSchema = z.object({
	title: commissionTitleSchema,
	description: commissionDescriptionSchema,
	categoryId: commissionCategoryIdSchema,
	folderId: commissionFolderIdSchema.optional(),
	basePrice: commissionBasePriceSchema,
	currencyCode: commissionCurrencyCodeSchema,
	tagIds: commissionTagIdsSchema.optional(),
	commissionStatus: commissionStatusSchema.default(TCommissionStatus.Draft),
});

export const updateCommissionRequestSchema = z.object({
	title: commissionTitleSchema.optional(),
	description: commissionDescriptionSchema,
	categoryId: commissionCategoryIdSchema.optional(),
	folderId: commissionFolderIdSchema.optional(),
	basePrice: commissionBasePriceSchema.optional(),
	currencyCode: commissionCurrencyCodeSchema.optional(),
	multimediaIds: z
		.array(trimmedUuid("Multimedia ID must be a valid UUID."))
		.optional(),
	commissionStatus: commissionStatusSchema.optional(),
});

export const uploadCommissionMediaSchema = z.object({
	commissionId: trimmedUuid("Commission ID must be a valid UUID."),
	files: z
		.array(commissionMediaFileSchema)
		.min(1, "Select at least one media file."),
});

export const createCommissionFormSchema = z.object({
	title: commissionTitleSchema,
	description: commissionDescriptionSchema,
	categoryId: commissionCategoryIdSchema,
	basePrice: commissionBasePriceSchema,
	currencyCode: commissionCurrencyCodeSchema,
	tagIds: commissionTagIdsSchema.default([]),
	templateId: z.preprocess(
		emptyStringToUndefined,
		trimmedUuid("Template must be a valid UUID.").optional(),
	),
	mediaFiles: z.array(commissionMediaFileSchema).default([]),
});

export type TCreateCommissionRequestInput = z.input<
	typeof createCommissionRequestSchema
>;
export type TCreateCommissionRequestSchema = z.infer<
	typeof createCommissionRequestSchema
>;
export type TUpdateCommissionRequestSchema = z.infer<
	typeof updateCommissionRequestSchema
>;
export type TUploadCommissionMediaSchema = z.infer<
	typeof uploadCommissionMediaSchema
>;
export type TCreateCommissionFormValues = z.infer<
	typeof createCommissionFormSchema
>;

export function toCreateCommissionRequest(values: TCreateCommissionFormValues) {
	const parsed = createCommissionFormSchema.parse(values);

	return createCommissionRequestSchema.parse({
		title: parsed.title,
		description: parsed.description,
		categoryId: parsed.categoryId,
		basePrice: parsed.basePrice,
		currencyCode: parsed.currencyCode,
		tagIds: parsed.tagIds.length > 0 ? parsed.tagIds : undefined,
		commissionStatus: TCommissionStatus.Draft,
	});
}
