import type { ZodType } from "zod";

interface UseFormValidationProps<T> {
	schema: ZodType<T>;
	initialData: T;
}

export type { UseFormValidationProps };
