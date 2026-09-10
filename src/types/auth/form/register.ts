type RegisterStage = "account" | "profile" | "socials" | "verify";

interface RegisterFormProps {
	onModeChange: (mode: "login") => void;
	onSuccess: () => void;
	onStageChange?: (stage: RegisterStage) => void;
}

export type { RegisterFormProps, RegisterStage };
