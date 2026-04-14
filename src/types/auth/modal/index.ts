type AuthTab = "login" | "register";

interface AuthModalProps {
	defaultTab?: AuthTab;
	children?: React.ReactNode;
}

interface AuthContentProps {
	tab: AuthTab;
	setTab: (tab: AuthTab) => void;
	setOpen: (open: boolean) => void;
	setForgotOpen: (open: boolean) => void;
}

export type { AuthContentProps, AuthModalProps, AuthTab };
