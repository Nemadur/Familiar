interface RegisterFormProps {
	onModeChange: (mode: "login") => void;
	onSuccess: () => void;
}

type Step = 0 | 1 | 2 | 3 | 4;

export type { Step, RegisterFormProps };
