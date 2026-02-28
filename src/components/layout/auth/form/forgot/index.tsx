import { useState } from "react";
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

function ForgotForm({ onSuccess: _onSuccess, onModeChange }: ForgotFormProps) {
	const [_isSubmitted, setIsSubmitted] = useState(false);
	const form = useFormValidation({
		schema: forgotPassword,
		initialData: {
			email: "",
		},
	});

	const { handleSubmit } = form;
	const { t } = useTranslation();

	const onSubmit = async (data: ForgotPasswordData) => {
		const forgotPasswordPromise = (async () => {
			// Always return success to prevent user enumeration
			await supabase.auth.resetPasswordForEmail(data.email, {
				redirectTo: `${window.location.origin}/auth/reset-password`,
			});
			return { success: true };
		})();

		toast.promise(forgotPasswordPromise, {
			loading: "Sending reset email...",
			success: () => {
				setIsSubmitted(true);
				return "If an account exists with this email, you will receive a password reset link shortly.";
			},
			error: () => {
				// Even on error, show the same success message to avoid leaking info
				// Unless it's a rate limit or network error which might be worth showing generically
				return "If an account exists with this email, you will receive a password reset link shortly.";
			},
		});
	};

	return (
		<Form {...form}>
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("auth.email.label")}</FormLabel>
							<FormControl>
								<InputGroup>
									<InputGroupAddon>
										<OutlineMail />
									</InputGroupAddon>
									<InputGroupInput
										placeholder={t("auth.email.placeholder")}
										type="email"
										{...field}
									/>
								</InputGroup>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="flex flex-col gap-2">
					<Button type="submit">{t("auth.forgot.reset_password")}</Button>
					<Button
						type="button"
						variant="ghost"
						onClick={() => onModeChange("login")}
					>
						{t("auth.forgot.back_to_login")}
					</Button>
				</div>
			</form>
		</Form>
	);
}

// function PostSubmit({
// 	email,
// 	onModeChange,
// }: {
// 	email: string;
// 	onModeChange: (tab: AuthTab) => void;
// }) {
// 	return (
// 		<div className={"space-y-4 text-center"}>
// 			<div className={"space-y-2"}>
// 				<h3 className={"font-semibold text-lg"}>Check your email</h3>
// 				<p className={"text-gray-600 text-sm"}>
// 					We've sent a password reset link to {email}
// 				</p>
// 			</div>

// 			<Button
// 				onClick={() => onModeChange("login")}
// 				variant={"outline"}
// 				className={"w-full"}
// 			>
// 				Back to Sign In
// 			</Button>
// 		</div>
// 	);
// }

export default ForgotForm;
