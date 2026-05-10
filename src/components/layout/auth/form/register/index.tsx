import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	Stepper,
	StepperIndicator,
	StepperItem,
	StepperNav,
	StepperTitle,
	StepperTrigger,
} from "@/components/reui/stepper";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import useFormValidation from "@/hooks/use-form-validation";
import { useAuth } from "@/providers/auth";
import { register } from "@/schemas/auth/register";
import type { RegisterFormProps } from "@/types/auth/form/register";
import type { AccountType } from "@/types/auth/schema/accounts";
import { RegisterStepAccount } from "./step/account";
import { RegisterStepProfile } from "./step/profile";
import { RegisterStepSocials } from "./step/socials";

type Step = 0 | 1 | 2;

const LAST_STEP: Step = 2;

function RegisterForm({ onModeChange, onSuccess }: RegisterFormProps) {
	const [step, setStep] = useState<Step>(0);
	const { t } = useTranslation();
	const { register: authRegister } = useAuth();

	const emailRef = useRef<HTMLInputElement | null>(null);
	const displayNameRef = useRef<HTMLInputElement | null>(null);

	const form = useFormValidation({
		schema: register,
		initialData: {
			email: "",
			password: "",
			display_name: "",
			username: "",
			account_type: "client" as AccountType,
			invite_key: "",
			avatar_url: "",
			cover_url: "",
			bio: "",
			socials: [],
		},
	});

	const { isPending, handleSubmit, control, setValue, watch, trigger } = form;

	const watchedAccountType = watch("account_type");
	const watchedEmail = watch("email");
	const watchedPassword = watch("password");
	const watchedInviteKey = watch("invite_key");

	const showInviteKey = watchedAccountType === "artist";

	const isStep0Valid =
		Boolean(watchedAccountType) &&
		Boolean(watchedEmail?.trim()) &&
		Boolean(watchedPassword?.trim()) &&
		(!showInviteKey || Boolean(watchedInviteKey?.trim()));

	const resetToStep0 = useCallback(() => {
		setStep(0);
	}, []);

	const handleAccountTypeChange = (accountType: AccountType) => {
		setValue("account_type", accountType, { shouldValidate: true });

		if (accountType === "client") {
			setValue("invite_key", "", { shouldValidate: true });
		}
	};

	const validateStep = useCallback(
		async (currentStep: Step) => {
			switch (currentStep) {
				case 0:
					return await trigger(
						showInviteKey
							? ["account_type", "email", "password", "invite_key"]
							: ["account_type", "email", "password"],
						{ shouldFocus: true },
					);

				case 1:
					return await trigger(
						["display_name", "username", "avatar_url", "cover_url", "bio"],
						{ shouldFocus: true },
					);

				case 2:
					return await trigger(["socials"], { shouldFocus: true });

				default:
					return true;
			}
		},
		[showInviteKey, trigger],
	);

	const goNext = useCallback(async () => {
		const valid = await validateStep(step);
		if (!valid) return;

		setStep((prev) => Math.min(prev + 1, LAST_STEP) as Step);
	}, [step, validateStep]);

	const goBack = useCallback(() => {
		setStep((prev) => Math.max(prev - 1, 0) as Step);
	}, []);

	const handleContinue = useCallback(async () => {
		if (step !== LAST_STEP) {
			await goNext();
		}
	}, [step, goNext]);

	const onFinalSubmit = async (data: any) => {
		// Prevent accidental submission from earlier steps
		if (step !== LAST_STEP) {
			return;
		}

		const valid = await validateStep(LAST_STEP);
		if (!valid) {
			return;
		}

		try {
			await authRegister(data);
			onSuccess?.();
		} catch (error) {
			// handled by provider
		}
	};

	const steps = [
		{ title: t("auth.register.steps.account", "Account") },
		{ title: t("auth.register.steps.profile", "Profile") },
		{ title: t("auth.register.steps.socials", "Socials") },
	] as const;

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			// If not on the last step, ALWAYS prevent default
			if (step !== LAST_STEP) {
				e.preventDefault();
				goNext();
			}
		}
	};

	return (
		<Form {...form}>
			<form
				onSubmit={handleSubmit(onFinalSubmit)}
				onKeyDown={handleKeyDown}
				className="flex flex-col h-full min-h-[450px]"
			>
				<div className="flex flex-1 flex-col">
					<div className="flex flex-1 flex-col">
						<div className="space-y-6">
							<Stepper value={step} className="w-full">
								<StepperNav className="pointer-events-none grid w-full grid-cols-3 gap-3">
									{steps.map((item, s) => (
										<StepperItem
											key={item.title}
											step={s}
											completed={step > s}
											className="min-w-0"
										>
											<StepperTrigger
												tabIndex={-1}
												className="pointer-events-none flex w-full flex-col items-center justify-start gap-2 text-center"
											>
												<StepperIndicator className="h-1 w-full rounded-full bg-border data-[state=active]:bg-primary data-[state=completed]:bg-primary" />
												<StepperTitle className="block w-full text-center text-xs leading-tight text-muted-foreground data-[state=completed]:text-primary data-[state=active]:text-primary md:text-sm">
													{item.title}
												</StepperTitle>
											</StepperTrigger>
										</StepperItem>
									))}
								</StepperNav>
							</Stepper>

							<div className="min-h-[300px]">
								{step === 0 && (
									<RegisterStepAccount
										control={control}
										onAccountTypeChange={handleAccountTypeChange}
										emailRef={emailRef}
										showInviteKey={showInviteKey}
									/>
								)}

								{step === 1 && (
									<RegisterStepProfile
										control={control}
										displayNameRef={displayNameRef}
									/>
								)}

								{step === 2 && <RegisterStepSocials control={control} />}
							</div>
						</div>
					</div>

					<div className="mt-auto shrink-0 space-y-4 pt-6">
						<div className="pt-4">
							<div className="flex flex-1 w-full items-center justify-between gap-2">
								{step > 0 && (
									<Button
										type="button"
										variant="ghost"
										onClick={goBack}
										disabled={isPending}
										className="w-1/3"
										size={"xl"}
									>
										{t("auth.back", "Back")}
									</Button>
								)}

								<Button
									type={step === LAST_STEP ? "submit" : "button"}
									onClick={step === LAST_STEP ? undefined : handleContinue}
									disabled={(step === 0 && !isStep0Valid) || isPending}
									className="flex-1 w-full"
									size={"xl"}
								>
									{step === LAST_STEP
										? t("auth.register.submit", "Submit")
										: t("auth.continue", "Continue")}
								</Button>
							</div>
						</div>
					</div>
				</div>
			</form>
		</Form>
	);
}

export default RegisterForm;
