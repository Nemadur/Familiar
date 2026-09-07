interface LoginFormProps {
	onModeChange: (mode: "register" | "forgot") => void;
	onSuccess: () => void;
	onForgot?: () => void;
}

export type { LoginFormProps };
