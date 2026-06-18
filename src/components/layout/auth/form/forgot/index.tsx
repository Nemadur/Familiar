import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { OutlineMail } from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import useFormValidation from "@/hooks/use-form-validation";
import { supabase } from "@/lib/supabase";
import { forgotPassword } from "@/schemas/auth/forgot-password";
import type { ForgotFormProps } from "@/types/auth/form/forgot";
import type { ForgotPasswordData } from "@/types/auth/schema/forgot-password";

function ForgotForm({ onSuccess, onModeChange }: ForgotFormProps) {
	const { t } = useTranslation();

	const form = useFormValidation({
		schema: forgotPassword,
		initialData: {
			email: "",
		},
	});

	const {
		handleSubmit,
		control,
		formState: { isSubmitting },
	} = form;

	const submitPasswordResetRequest = async (data: ForgotPasswordData) => {
		const resetPasswordPromise = (async () => {
			const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
				redirectTo: `${window.location.origin}/auth/reset-password`,
			});

			if (error) {
				throw error;
			}
		})();

		toast.promise(resetPasswordPromise, {
			loading: "Sending reset email...",
			success: () => {
				onSuccess?.();

				return "If an account exists with this email, you will receive a password reset link shortly.";
			},
			error: () => {
				return "If an account exists with this email, you will receive a password reset link shortly.";
			},
		});

		try {
			await resetPasswordPromise;
		} catch {
			// Intentionally hidden to avoid account enumeration.
		}
	};

	return (
		<Form {...form}>
			<form
				onSubmit={handleSubmit(submitPasswordResetRequest)}
				className="flex min-h-[300px] h-full w-full flex-col"
				aria-label={t("auth.forgot.reset_password")}
			>
				<fieldset
					disabled={isSubmitting}
					className="flex flex-1 flex-col gap-4 px-1"
				>
					<legend className="sr-only">{t("auth.forgot.title")}</legend>

					<FormField
						control={control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t("auth.email.label")}</FormLabel>

								<FormControl>
									<InputGroup>
										<InputGroupAddon aria-hidden="true">
											<OutlineMail />
										</InputGroupAddon>

										<InputGroupInput
											placeholder={t("auth.email.placeholder")}
											type="email"
											autoComplete="email"
											inputMode="email"
											{...field}
										/>
									</InputGroup>
								</FormControl>

								<FormMessage />
							</FormItem>
						)}
					/>
				</fieldset>

				<footer className="mt-auto flex shrink-0 flex-col gap-2 px-1">
					<Button
						type="submit"
						disabled={isSubmitting}
						className="w-full"
						size="2xl"
					>
						{t("auth.forgot.reset_password")}
					</Button>

					<Button
						type="button"
						variant="link"
						onClick={() => onModeChange?.("login")}
						className="w-full justify-center"
					>
						{t("auth.forgot.back_to_login")}
					</Button>
				</footer>
			</form>
		</Form>
	);
}

export default ForgotForm;
