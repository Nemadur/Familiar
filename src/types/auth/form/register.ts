interface RegisterFormProps {
  onModeChange: (mode: "login") => void
  onSuccess: () => void
}

type Step = 0 | 1

export type { Step, RegisterFormProps }
