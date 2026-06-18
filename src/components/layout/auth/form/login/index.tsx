import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
	OutlineEye,
	OutlineEyeOff,
	OutlineLock,
	OutlineMail,
} from "@/components/icons/icons";
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
	InputGroupButton,
	InputGroupInput,
} from "@/components/ui/input-group";
import useFormValidation from "@/hooks/use-form-validation";
import { useAuth } from "@/providers/auth";
import { login } from "@/schemas/auth/login";
import type { LoginFormProps } from "@/types/auth/form/login";
import type { LoginData } from "@/types/auth/schema/login";

function LoginForm({ onSuccess, onForgot }: LoginFormProps) {
	const [showPassword, setShowPassword] = useState(false);
	const { login: authLogin, isPending } = useAuth();
	const { t } = useTranslation();

	const form = useFormValidation({
		schema: login,
		initialData: {
			email: "",
			password: "",
		},
	});

	const { handleSubmit, control } = form;

	const onSubmit = async (data: LoginData) => {
		try {
			await authLogin(data);
			onSuccess();
		} catch {
			// handled in auth provider toast
		}
	};

	const passwordToggleLabel = showPassword ? "Hide password" : "Show password";

	return (
		<Form {...form}>
			<form
				onSubmit={handleSubmit(onSubmit)}
				className="flex min-h-[300px] h-full w-full flex-col"
				aria-label={t("auth.login.cta")}
			>
				<fieldset
					disabled={isPending}
					className="flex flex-1 flex-col gap-4 px-1"
				>
					<legend className="sr-only">{t("auth.login.title")}</legend>

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

					<FormField
						control={control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t("auth.password.label")}</FormLabel>

								<FormControl>
									<InputGroup>
										<InputGroupAddon aria-hidden="true">
											<OutlineLock />
										</InputGroupAddon>

										<InputGroupInput
											placeholder={t("auth.password.placeholder")}
											type={showPassword ? "text" : "password"}
											autoComplete="current-password"
											{...field}
										/>

										<InputGroupAddon align="inline-end">
											<InputGroupButton
												type="button"
												variant="ghost"
												size="icon-xs"
												aria-label={passwordToggleLabel}
												aria-pressed={showPassword}
												onClick={() => setShowPassword((prev) => !prev)}
											>
												{showPassword ? (
													<OutlineEyeOff aria-hidden="true" />
												) : (
													<OutlineEye aria-hidden="true" />
												)}
											</InputGroupButton>
										</InputGroupAddon>
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
						disabled={isPending}
						className="w-full"
						size="2xl"
					>
						{t("auth.login.cta")}
					</Button>

					<Button
						type="button"
						onClick={() => onForgot?.()}
						variant="link"
						className="w-full justify-center"
					>
						{t("auth.forgot.cta")}
					</Button>
				</footer>
			</form>
		</Form>
	);
}

export default LoginForm;
