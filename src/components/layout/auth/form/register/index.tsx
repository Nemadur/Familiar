import {
	type FormEvent,
	type KeyboardEvent,
	useCallback,
	useRef,
	useState,
} from "react";
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
import useFormValidation from "@/hooks/form/use-form-validation";
import { normalizeInviteKey } from "@/lib/invite-key";
import { useAuth } from "@/providers/auth";
import { register } from "@/schemas/auth/register";
import type { RegisterFormProps } from "@/types/auth/form/register";
import type { AccountType } from "@/types/auth/schema/accounts";
import type { RegisterData } from "@/types/auth/schema/register";

import { RegisterStepAccount } from "./step/account";
import { RegisterStepProfile } from "./step/profile";
import { RegisterStepSocials } from "./step/socials";

type Step = 0 | 1 | 2;

const LAST_STEP: Step = 2;

function RegisterForm({ onSuccess }: RegisterFormProps) {
	const [step, setStep] = useState<Step>(0);
	const [isChangingStep, setIsChangingStep] = useState(false);

	const { t } = useTranslation();
	const { register: authRegister } = useAuth();

	const emailRef = useRef<HTMLInputElement | null>(null);

	const form = useFormValidation({
		schema: register,
		initialData: {
			email: "",
			password: "",
			account_type: "client" as AccountType,
			invite_key: "",
			display_name: "",
			username: "",
			bio: "",
			socials: {},
			avatar: null,
			cover: null,
		},
	});

	const { isPending, handleSubmit, control, setValue, watch, trigger } = form;

	const watchedAccountType = watch("account_type");
	const watchedEmail = watch("email");
	const watchedPassword = watch("password");
	const watchedInviteKey = watch("invite_key");

	const showInviteKey = true;

	const isStep0Valid =
		Boolean(watchedAccountType) &&
		Boolean(watchedEmail?.trim()) &&
		Boolean(watchedPassword?.trim()) &&
		Boolean(watchedInviteKey?.trim());

	const handleAccountTypeChange = useCallback(
		(accountType: AccountType) => {
			setValue("account_type", accountType, {
				shouldDirty: true,
				shouldValidate: true,
			});
		},
		[setValue],
	);

	const validateStep = useCallback(
		async (currentStep: Step) => {
			switch (currentStep) {
				case 0:
					return trigger(["account_type", "email", "password", "invite_key"], {
						shouldFocus: true,
					});

				case 1:
					return trigger(
						["display_name", "username", "bio", "avatar", "cover"],
						{ shouldFocus: true },
					);

				case 2:
					return trigger(["socials"], {
						shouldFocus: true,
					});

				default:
					return true;
			}
		},
		[trigger],
	);

	const goNext = useCallback(async () => {
		if (isChangingStep || step === LAST_STEP) {
			return;
		}

		setIsChangingStep(true);

		try {
			const valid = await validateStep(step);

			if (!valid) {
				return;
			}

			setStep((currentStep) => {
				/*
				 * Do not advance twice if two clicks or Enter events
				 * happened while validation was running.
				 */
				if (currentStep !== step) {
					return currentStep;
				}

				return Math.min(currentStep + 1, LAST_STEP) as Step;
			});
		} finally {
			setIsChangingStep(false);
		}
	}, [isChangingStep, step, validateStep]);

	const goBack = useCallback(() => {
		if (isChangingStep || isPending) {
			return;
		}

		setStep((currentStep) => Math.max(currentStep - 1, 0) as Step);
	}, [isChangingStep, isPending]);

	const onFinalSubmit = useCallback(
		async (data: RegisterData) => {
			try {
				await authRegister({
					...data,
					invite_key: normalizeInviteKey(data.invite_key) ?? "",
				});
				onSuccess?.();
			} catch {
				// Error is handled by the auth provider.
			}
		},
		[authRegister, onSuccess],
	);

	const submitRegistration = useCallback(() => {
		if (step !== LAST_STEP || isPending || isChangingStep) {
			return;
		}

		void handleSubmit(onFinalSubmit)();
	}, [handleSubmit, isChangingStep, isPending, onFinalSubmit, step]);

	const blockNativeSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
		/*
		 * Native form submission is always disabled.
		 * Registration is started only by submitRegistration().
		 */
		event.preventDefault();
		event.stopPropagation();
	}, []);

	const handleKeyDown = useCallback(
		(event: KeyboardEvent<HTMLFormElement>) => {
			if (event.key !== "Enter") {
				return;
			}

			const target = event.target as HTMLElement;

			// Let Enter create a new line inside bio.
			if (target.tagName === "TEXTAREA") {
				return;
			}

			event.preventDefault();
			event.stopPropagation();

			if (isChangingStep || isPending) {
				return;
			}

			if (step === LAST_STEP) {
				submitRegistration();
				return;
			}

			void goNext();
		},
		[goNext, isChangingStep, isPending, step, submitRegistration],
	);

	const steps = [
		{
			title: t("auth.register.steps.account", "Account"),
		},
		{
			title: t("auth.register.steps.profile", "Profile"),
		},
		{
			title: t("auth.register.steps.socials", "Socials"),
		},
	] as const;

	return (
		<Form {...form}>
			<form
				onSubmit={blockNativeSubmit}
				onKeyDown={handleKeyDown}
				className="flex h-full min-h-112.5 flex-col"
				noValidate
			>
				<div className="flex flex-1 flex-col">
					<div className="flex flex-1 flex-col">
						<div className="space-y-6">
							<Stepper value={step} className="w-full">
								<StepperNav className="pointer-events-none grid w-full grid-cols-3 gap-3">
									{steps.map((item, stepIndex) => (
										<StepperItem
											key={item.title}
											step={stepIndex}
											completed={step > stepIndex}
											className="min-w-0"
										>
											<StepperTrigger
												type="button"
												tabIndex={-1}
												className="pointer-events-none flex w-full flex-col items-center justify-start gap-2 text-center"
											>
												<StepperIndicator className="h-1 w-full rounded-full bg-border data-[state=active]:bg-primary data-[state=completed]:bg-primary" />

												<StepperTitle className="block w-full text-center text-xs leading-tight text-muted-foreground data-[state=active]:text-primary data-[state=completed]:text-primary md:text-sm">
													{item.title}
												</StepperTitle>
											</StepperTrigger>
										</StepperItem>
									))}
								</StepperNav>
							</Stepper>

							<div className="min-h-75">
								{step === 0 && (
									<RegisterStepAccount
										control={control}
										onAccountTypeChange={handleAccountTypeChange}
										emailRef={emailRef}
										showInviteKey={showInviteKey}
									/>
								)}

								{step === 1 && <RegisterStepProfile />}

								{step === 2 && <RegisterStepSocials control={control} />}
							</div>
						</div>
					</div>

					<div className="mt-auto shrink-0 space-y-2 px-1">
						<div className="flex w-full items-center justify-between gap-2">
							{step > 0 && (
								<Button
									type="button"
									variant="ghost"
									onClick={goBack}
									disabled={isPending || isChangingStep}
									className="w-1/3"
									size="2xl"
								>
									{t("auth.back", "Back")}
								</Button>
							)}

							{step === LAST_STEP ? (
								<Button
									key="register-submit"
									type="button"
									onClick={submitRegistration}
									disabled={isPending || isChangingStep}
									className="w-full flex-1"
									size="2xl"
								>
									{t("auth.register.submit", "Submit")}
								</Button>
							) : (
								<Button
									key="register-continue"
									type="button"
									onClick={() => void goNext()}
									disabled={
										isPending || isChangingStep || (step === 0 && !isStep0Valid)
									}
									className="w-full flex-1"
									size="2xl"
								>
									{t("auth.continue", "Continue")}
								</Button>
							)}
						</div>
					</div>
				</div>
			</form>
		</Form>
	);
}

export default RegisterForm;
