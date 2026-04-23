import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState, useCallback } from "react";
import {
	type FieldValues,
	type Resolver,
	type SubmitErrorHandler,
	type SubmitHandler,
	useForm,
} from "react-hook-form";
import type { UseFormValidationProps } from "@/types/validation/form";

function useFormValidation<T extends FieldValues>({
	schema,
	initialData,
}: UseFormValidationProps<T>) {
	const [isPending, setIsPending] = useState(false);
	const isSubmittingRef = useRef(false);
	const {
		register,
		handleSubmit: rhfHandleSubmit,
		formState: { errors, ...formState },
		setValue,
		watch,
		control,
		getValues,
		reset,
		...rest
	} = useForm<T>({
		resolver: zodResolver(schema as any) as Resolver<T>,
		defaultValues: initialData as any,
	});

	const handleInputChange =
		(field: keyof T) =>
		(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string) => {
			const value = typeof e === "string" ? e : e.target.value;
			setValue(field as any, value as any, { shouldValidate: true });
		};

	const handleSubmit = useCallback(
		(onValid: SubmitHandler<T>, onInvalid?: SubmitErrorHandler<T>) => {
			return rhfHandleSubmit(async (data, e) => {
				if (isSubmittingRef.current) return;
				isSubmittingRef.current = true;
				setIsPending(true);
				try {
					await onValid(data, e);
				} finally {
					isSubmittingRef.current = false;
					setIsPending(false);
				}
			}, onInvalid);
		},
		[rhfHandleSubmit],
	);

	const setFormData = useCallback(
		(updater: (prev: T) => T) => {
			const newData = updater(getValues());
			reset(newData);
		},
		[getValues, reset],
	);

	return {
		formData: getValues(),
		errors: Object.keys(errors).reduce(
			(acc, key) => {
				const error = errors[key as keyof T];
				if (error && typeof error === "object" && "message" in error) {
					acc[key as keyof T] = error.message as string;
				}
				return acc;
			},
			{} as Record<keyof T, string>,
		),
		isPending,
		handleInputChange,
		handleSubmit,
		setFormData,
		register,
		setValue,
		getValues,
		reset,
		control,
		watch,
		formState: { errors, ...formState },
		...rest,
	};
}

export default useFormValidation;
