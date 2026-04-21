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

function LoginForm({ onModeChange, onSuccess, onForgot }: LoginFormProps) {
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

	return (
		<Form {...form}>
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-1">
				<FormField
					control={control}
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
										autoComplete="email"
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
									<InputGroupAddon>
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
											onClick={() => setShowPassword((prev) => !prev)}
										>
											{showPassword ? <OutlineEyeOff /> : <OutlineEye />}
											<span className="sr-only">
												{showPassword ? "Hide password" : "Show password"}
											</span>
										</InputGroupButton>
									</InputGroupAddon>
								</InputGroup>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button
					type="submit"
					disabled={isPending}
					className="w-full"
					size={"xl"}
				>
					{t("auth.login.cta")}
				</Button>

				<Button
					type="button"
					onClick={() => onForgot?.()}
					variant={"link"}
					className="w-full justify-end"
				>
					{t("auth.forgot.cta")}
				</Button>
			</form>
		</Form>
	);
}

export default LoginForm;
