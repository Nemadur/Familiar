import {
	type FormEvent,
	type KeyboardEvent,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import type { FieldErrors, FieldPath } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

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
import { cn } from "@/lib/utils";
import { RegistrationError, useAuth } from "@/providers/auth";
import { register } from "@/schemas/auth/register";
import type {
	RegisterFormProps,
	RegisterStage,
} from "@/types/auth/form/register";
import type { AccountType } from "@/types/auth/schema/accounts";
import type { RegisterData } from "@/types/auth/schema/register";

import { RegisterStepAccount } from "./step/account";
import { RegisterStepProfile } from "./step/profile";
import { RegisterStepSocials } from "./step/socials";
import { RegisterStepVerifyEmail } from "./step/verify-email";

type FormStep = 0 | 1 | 2;

const LAST_FORM_STEP: FormStep = 2;
const REGISTER_STAGE_BY_STEP: Record<FormStep, RegisterStage> = {
	0: "account",
	1: "profile",
	2: "socials",
};

const STEP_FIELDS = {
	0: ["account_type", "email", "password", "confirm_password", "invite_key"],
	1: ["display_name", "username", "bio", "avatar", "cover"],
	2: ["socials"],
} as const satisfies Record<FormStep, ReadonlyArray<keyof RegisterData>>;

function stepHasErrors(errors: FieldErrors<RegisterData>, step: FormStep) {
	return STEP_FIELDS[step].some((field) => Boolean(errors[field]));
}

function getStepForField(field: keyof RegisterData): FormStep {
	if (STEP_FIELDS[0].includes(field as (typeof STEP_FIELDS)[0][number])) {
		return 0;
	}

	if (STEP_FIELDS[1].includes(field as (typeof STEP_FIELDS)[1][number])) {
		return 1;
	}

	return 2;
}

function getFirstErrorStep(errors: FieldErrors<RegisterData>): FormStep {
	if (stepHasErrors(errors, 0)) return 0;
	if (stepHasErrors(errors, 1)) return 1;
	return 2;
}

function getFirstFocusableError(
	errors: FieldErrors<RegisterData>,
	step: FormStep,
): FieldPath<RegisterData> | undefined {
	for (const field of STEP_FIELDS[step]) {
		if (!errors[field]) continue;

		if (field !== "socials" && field !== "avatar" && field !== "cover") {
			return field as FieldPath<RegisterData>;
		}

		if (field === "socials" && typeof errors.socials === "object") {
			const socialPlatform = Object.keys(errors.socials)[0];

			if (socialPlatform) {
				return `socials.${socialPlatform}` as FieldPath<RegisterData>;
			}
		}
	}

	return undefined;
}

function RegisterForm({ onSuccess, onStageChange }: RegisterFormProps) {
	const [step, setStep] = useState<FormStep>(0);
	const [furthestFormStep, setFurthestFormStep] = useState<FormStep>(0);
	const [isChangingStep, setIsChangingStep] = useState(false);
	const [isAwaitingVerification, setIsAwaitingVerification] = useState(false);
	const [registeredEmail, setRegisteredEmail] = useState("");
	const [responseEmailVerified, setResponseEmailVerified] = useState(false);

	const { t } = useTranslation();
	const {
		authEmail,
		isEmailVerified,
		isPending: isAuthPending,
		refreshSession,
		register: authRegister,
	} = useAuth();

	const emailRef = useRef<HTMLInputElement | null>(null);

	const form = useFormValidation({
		schema: register,
		initialData: {
			email: "",
			password: "",
			confirm_password: "",
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

	const {
		isPending,
		handleSubmit,
		control,
		setValue,
		trigger,
		setError,
		setFocus,
		formState: { errors },
	} = form;

	const showInviteKey = true;

	const normalizedRegisteredEmail = registeredEmail.trim().toLowerCase();
	const registeredEmailVerified =
		responseEmailVerified ||
		(Boolean(normalizedRegisteredEmail) &&
			authEmail === normalizedRegisteredEmail &&
			isEmailVerified);
	const currentStage = isAwaitingVerification
		? "verify"
		: REGISTER_STAGE_BY_STEP[step];

	useEffect(() => {
		onStageChange?.(currentStage);
	}, [currentStage, onStageChange]);

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
		async (currentStep: FormStep) => {
			switch (currentStep) {
				case 0:
					return trigger(
						[
							"account_type",
							"email",
							"password",
							"confirm_password",
							"invite_key",
						],
						{ shouldFocus: true },
					);

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
		if (isChangingStep || step >= LAST_FORM_STEP) {
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

				const nextStep = Math.min(currentStep + 1, LAST_FORM_STEP) as FormStep;
				setFurthestFormStep(
					(furthestStep) => Math.max(furthestStep, nextStep) as FormStep,
				);

				return nextStep;
			});
		} finally {
			setIsChangingStep(false);
		}
	}, [isChangingStep, step, validateStep]);

	const handleStepChange = useCallback(
		async (nextStep: number) => {
			if (
				isChangingStep ||
				isPending ||
				nextStep < 0 ||
				nextStep > furthestFormStep ||
				nextStep === step
			) {
				return;
			}

			const targetStep = nextStep as FormStep;

			if (targetStep < step) {
				setStep(targetStep);
				return;
			}

			setIsChangingStep(true);

			try {
				const valid = await validateStep(step as FormStep);

				if (valid) {
					setStep(targetStep);
				}
			} finally {
				setIsChangingStep(false);
			}
		},
		[furthestFormStep, isChangingStep, isPending, step, validateStep],
	);

	const goBack = useCallback(() => {
		if (isChangingStep || isPending) {
			return;
		}

		setStep((currentStep) => Math.max(currentStep - 1, 0) as FormStep);
	}, [isChangingStep, isPending]);

	const onFinalSubmit = useCallback(
		async (data: RegisterData) => {
			try {
				const response = await authRegister({
					...data,
					invite_key: normalizeInviteKey(data.invite_key) ?? "",
				});

				setRegisteredEmail(data.email.trim().toLowerCase());
				setResponseEmailVerified(Boolean(response.user.email_confirmed_at));
				setIsAwaitingVerification(true);
			} catch (error) {
				if (error instanceof RegistrationError && error.field) {
					const errorField = error.field;

					setError(errorField, {
						type: "server",
						message: error.message,
					});

					const errorStep = getStepForField(errorField);
					setStep(errorStep);
					setFurthestFormStep(LAST_FORM_STEP);

					if (
						errorField !== "socials" &&
						errorField !== "avatar" &&
						errorField !== "cover"
					) {
						window.setTimeout(() => setFocus(errorField), 0);
					}
				}
			}
		},
		[authRegister, setError, setFocus],
	);

	const handleInvalidSubmit = useCallback(
		(submitErrors: FieldErrors<RegisterData>) => {
			const errorStep = getFirstErrorStep(submitErrors);
			const errorField = getFirstFocusableError(submitErrors, errorStep);

			setStep(errorStep);
			setFurthestFormStep(LAST_FORM_STEP);
			toast.error(
				t(
					"auth.register.validation_error_title",
					"Check the highlighted fields",
				),
				{
					description: t(
						"auth.register.validation_error_description",
						"Some details need your attention before the account can be created.",
					),
				},
			);

			if (errorField) {
				window.setTimeout(() => setFocus(errorField), 0);
			}
		},
		[setFocus, t],
	);

	const submitRegistration = useCallback(() => {
		if (step !== LAST_FORM_STEP || isPending || isChangingStep) {
			return;
		}

		void handleSubmit(onFinalSubmit, handleInvalidSubmit)();
	}, [
		handleInvalidSubmit,
		handleSubmit,
		isChangingStep,
		isPending,
		onFinalSubmit,
		step,
	]);

	const checkVerification = useCallback(() => {
		void refreshSession();
	}, [refreshSession]);

	useEffect(() => {
		if (!isAwaitingVerification || registeredEmailVerified) {
			return;
		}

		const checkWhenVisible = () => {
			if (document.visibilityState === "visible") {
				checkVerification();
			}
		};

		const intervalId = window.setInterval(checkVerification, 5_000);
		window.addEventListener("focus", checkVerification);
		window.addEventListener("storage", checkVerification);
		document.addEventListener("visibilitychange", checkWhenVisible);

		return () => {
			window.clearInterval(intervalId);
			window.removeEventListener("focus", checkVerification);
			window.removeEventListener("storage", checkVerification);
			document.removeEventListener("visibilitychange", checkWhenVisible);
		};
	}, [checkVerification, isAwaitingVerification, registeredEmailVerified]);

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

			if (step === LAST_FORM_STEP) {
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

	if (isAwaitingVerification) {
		return (
			<div className="flex h-full min-h-112.5 min-w-0 flex-col gap-6 overflow-x-hidden px-1">
				<RegisterStepVerifyEmail
					email={registeredEmail}
					isChecking={isAuthPending}
					isVerified={registeredEmailVerified}
					onCheck={checkVerification}
				/>

				<Button
					type="button"
					onClick={onSuccess}
					className="mt-auto w-full"
					size="2xl"
				>
					{registeredEmailVerified
						? t("auth.register.verify.continue", "Continue")
						: t("auth.register.verify.close_for_now", "Close for now")}
				</Button>
			</div>
		);
	}

	return (
		<Form {...form}>
			<form
				onSubmit={blockNativeSubmit}
				onKeyDown={handleKeyDown}
				className="flex h-full min-h-112.5 min-w-0 flex-col gap-6 overflow-x-hidden"
				noValidate
			>
				<Stepper
					value={step}
					onValueChange={(nextStep) => void handleStepChange(nextStep)}
					className="w-full shrink-0 px-1"
				>
					<StepperNav className="grid w-full grid-cols-3 gap-3">
						{steps.map((item, stepIndex) => {
							const formStep = stepIndex as FormStep;
							const hasError = stepHasErrors(errors, formStep);
							const isDisabled = formStep > furthestFormStep;

							return (
								<StepperItem
									key={item.title}
									step={stepIndex}
									completed={step > stepIndex}
									disabled={isDisabled}
									data-error={hasError || undefined}
									className="min-w-0"
								>
									<StepperTrigger
										type="button"
										aria-label={item.title}
										className="flex w-full flex-col items-center justify-start gap-2 text-center"
									>
										<StepperIndicator
											className={cn(
												"h-1 w-full rounded-full bg-border data-[state=active]:bg-primary data-[state=completed]:bg-primary",
												hasError &&
													"bg-destructive data-[state=active]:bg-destructive data-[state=completed]:bg-destructive",
											)}
										/>

										<StepperTitle
											className={cn(
												"block w-full text-center text-xs leading-tight text-muted-foreground data-[state=active]:text-primary data-[state=completed]:text-primary md:text-sm",
												hasError &&
													"text-destructive data-[state=active]:text-destructive data-[state=completed]:text-destructive",
											)}
										>
											{item.title}
										</StepperTitle>
									</StepperTrigger>
								</StepperItem>
							);
						})}
					</StepperNav>
				</Stepper>

				<div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-1">
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

				<div className="shrink-0 px-1">
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

						{step === LAST_FORM_STEP ? (
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
								disabled={isPending || isChangingStep}
								className="w-full flex-1"
								size="2xl"
							>
								{t("auth.continue", "Continue")}
							</Button>
						)}
					</div>
				</div>
			</form>
		</Form>
	);
}

export default RegisterForm;
