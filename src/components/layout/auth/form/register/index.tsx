import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import useFormValidation from "@/hooks/use-form-validation";
import { useAuth } from "@/providers/auth";
import {
	register,
	registerStep0,
	registerStep1,
} from "@/schemas/auth/register";
import type { RegisterFormProps, Step } from "@/types/auth/form/register";
import type { AccountType } from "@/types/auth/schema/accounts";
import type { RegisterData } from "@/types/auth/schema/register";
import { RegisterStepAccount } from "./step/account";
import { RegisterStepProfile } from "./step/profile";

function RegisterForm({ onModeChange, onSuccess }: RegisterFormProps) {
	const [step, setStep] = useState<Step>(0);
	const [isMounted, setIsMounted] = useState(false);
	const { t } = useTranslation();
	const { register: authRegister } = useAuth();

	useEffect(() => {
		setIsMounted(true);
	}, []);

	const emailRef = useRef<HTMLInputElement | null>(null);
	const displayNameRef = useRef<HTMLInputElement | null>(null);
	const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);

	const form = useFormValidation({
		schema: register,
		initialData: {
			email: "",
			password: "",
			display_name: "",
			username: "",
			account_type: "client" as AccountType,
			invite_key: "",
		},
	});

	const { isPending, handleSubmit, control, setValue, watch } = form;

	// Watch values for validation logic
	const watchedAccountType = watch("account_type");
	const watchedEmail = watch("email");
	const watchedDisplayName = watch("display_name");
	const watchedUsername = watch("username");
	const watchedPassword = watch("password");
	const watchedInviteKey = watch("invite_key");

	const isStep0Valid = registerStep0.safeParse({
		account_type: watchedAccountType,
		email: watchedEmail,
	}).success;

	const isStep1Valid =
		registerStep1.safeParse({
			display_name: watchedDisplayName,
			username: watchedUsername,
			password: watchedPassword,
			invite_key: watchedInviteKey,
		}).success &&
		(watchedAccountType !== "artist" || !!watchedInviteKey);

	const resetToStep0 = useCallback(() => {
		setStep(0);
		if (subscriptionRef.current) {
			subscriptionRef.current.unsubscribe();
			subscriptionRef.current = null;
		}
	}, []);

	useEffect(() => {
		if (step === 0) {
			// Focus logic could be implemented with ref if needed, but react-hook-form handles focus on error
			// For initial focus:
			// document.getElementById("email-input")?.focus()
		}
		if (step === 1) {
			// document.getElementById("display-name-input")?.focus()
		}
	}, [step]);

	const handleAccountTypeChange = (accountType: AccountType) => {
		setValue("account_type", accountType, { shouldValidate: true });
		if (accountType === "client") {
			setValue("invite_key", "", { shouldValidate: true });
		}
	};

	const goNext = () => {
		if (step === 0 && isStep0Valid) setStep(1);
	};

	const goBack = () => {
		setStep((step) => (step === 0 ? 0 : ((step - 1) as Step)));
	};

	const onFormSubmit = async (data: any) => {
		if (step === 0) {
			if (isStep0Valid) setStep(1);
		} else if (step === 1) {
			if (isStep1Valid) {
				try {
					await authRegister(data);
					onSuccess?.();
				} catch (error) {
					// Error handled by provider toast
				}
			}
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={handleSubmit(onFormSubmit)} className={"space-y-3 px-1"}>
				{/* STEP 0 — Account (type + email) */}
				{step === 0 && (
					<RegisterStepAccount
						control={control}
						isStepValid={isMounted && isStep0Valid}
						onNext={goNext}
						onAccountTypeChange={handleAccountTypeChange}
						emailRef={emailRef}
						isPending={isPending}
					/>
				)}

				{/* STEP 1 — Profile + Security (displayName + username + password + invite) */}
				{step === 1 && (
					<RegisterStepProfile
						control={control}
						isStepValid={isStep1Valid}
						isPending={isPending}
						onBack={goBack}
						showInviteKey={watchedAccountType === "artist"}
						displayNameRef={displayNameRef}
					/>
				)}

				<div className={"text-center"}>
					<div className={"text-muted-foreground text-sm"}>
						{t("auth.register.already_have_account")}{" "}
						<Button
							type={"button"}
							variant={"link"}
							onClick={() => {
								resetToStep0();
								onModeChange("login");
							}}
							className={
								"text-blue-600 hover:underline dark:text-blue-400 h-auto"
							}
						>
							{t("auth.login.cta")}
						</Button>
					</div>
				</div>
			</form>
		</Form>
	);
}

export default RegisterForm;
