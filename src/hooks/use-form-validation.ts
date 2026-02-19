import type { UseFormValidationProps } from "@/types/validation/form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldValues, type SubmitHandler, type Resolver, type SubmitErrorHandler } from "react-hook-form";

function useFormValidation<T extends FieldValues>({
  schema,
  initialData
}: UseFormValidationProps<T>) {
  const [isPending, setIsPending] = useState(false)
  const {
    register,
    handleSubmit: rhfHandleSubmit,
    formState: { errors, ...formState },
    setValue,
    watch,
    control,
    ...rest
  } = useForm<T>({
    resolver: zodResolver(schema as any) as Resolver<T>,
    defaultValues: initialData as any
  })

  const formData = watch()

  const handleInputChange = (field: keyof T) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string
  ) => {
    const value = typeof e === "string" ? e : e.target.value;
    setValue(field as any, value as any, { shouldValidate: true });
  };

  const handleSubmit = (onValid: SubmitHandler<T>, onInvalid?: SubmitErrorHandler<T>) => {
    return rhfHandleSubmit(async (data, e) => {
      setIsPending(true);
      try {
        await onValid(data, e);
      } finally {
        setIsPending(false);
      }
    }, onInvalid);
  }

  const setFormData = (updater: (prev: T) => T) => {
    const newData = updater(formData)
    Object.entries(newData).forEach(([key, value]) => {
      setValue(key as any, value as any, { shouldValidate: true });
    })
  }

  return {
    formData,
    errors: Object.keys(errors).reduce((acc, key) => {
      const error = errors[key as keyof T];
      if (error && typeof error === "object" && "message" in error) {
        acc[key as keyof T] = error.message as string;
      }
      return acc
    }, {} as Record<keyof T, string>),
    isPending,
    handleInputChange,
    handleSubmit,
    setFormData,
    register,
    setValue,
    control,
    watch,
    formState: { errors, ...formState },
    ...rest
  }
}

export default useFormValidation
