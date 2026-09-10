import { Link } from "@tanstack/react-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { OutlineClose, SolidUser } from "@/components/icons/icons";
import {
	AuthArtworkImage,
	DEFAULT_AUTH_ARTWORK,
	REGISTER_ARTWORK_BY_STAGE,
} from "@/components/layout/auth/artwork";
import { AnimateChangeInHeight } from "@/components/ui/animate-change-in-height";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/ui/use-mobile";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth";
import type { RegisterStage } from "@/types/auth/form/register";
import type {
	AuthContentProps,
	AuthModalProps,
	AuthTab,
} from "@/types/auth/modal";
import ForgotForm from "./form/forgot";
import LoginForm from "./form/login";
import RegisterForm from "./form/register";

function AuthModal({ defaultTab = "login" }: AuthModalProps) {
	const { t } = useTranslation();
	const [open, setOpen] = React.useState(false);
	const [selectedTab, setSelectedTab] = React.useState<AuthTab | null>(null);
	const [forgotOpen, setForgotOpen] = React.useState(false);
	const [registerStage, setRegisterStage] =
		React.useState<RegisterStage>("account");
	const isMobile = useIsMobile();
	const { user } = useAuth();

	const tab = selectedTab ?? defaultTab;

	const setTab = React.useCallback((nextTab: AuthTab) => {
		setSelectedTab(nextTab);
	}, []);

	React.useEffect(() => {
		// Keep the registration confirmation screen visible after Supabase signs in.
		if (user && open && tab !== "register") setOpen(false);
	}, [user, open, tab]);

	React.useEffect(() => {
		if (!open) setRegisterStage("account");
	}, [open]);

	if (isMobile) {
		return (
			<>
				<Drawer open={open} onOpenChange={setOpen}>
					<DrawerTrigger asChild>
						<Button>{t("auth.register.cta")}</Button>
					</DrawerTrigger>
					<DrawerContent className="max-h-[85vh]">
						<DrawerHeader className="text-center">
							<DrawerClose asChild className="absolute top-2 right-2">
								<Button variant="ghost" size="icon" aria-label="Close">
									<OutlineClose />
								</Button>
							</DrawerClose>
						</DrawerHeader>
						<div className="px-4 pb-4">
							<AuthContent
								tab={tab}
								setTab={setTab}
								setOpen={setOpen}
								setForgotOpen={setForgotOpen}
								registerStage={registerStage}
								setRegisterStage={setRegisterStage}
							/>
						</div>
					</DrawerContent>
				</Drawer>

				<Drawer open={forgotOpen} onOpenChange={setForgotOpen}>
					<DrawerContent className="max-h-[85vh]">
						<DrawerHeader className="text-center">
							<DrawerTitle>Reset your password</DrawerTitle>
						</DrawerHeader>
						<div className="px-4 pb-4">
							<ForgotForm
								onModeChange={() => {
									setForgotOpen(false);
									setTab("login");
									setOpen(true);
								}}
								onSuccess={() => {
									setForgotOpen(false);
									setTab("login");
									setOpen(true);
								}}
							/>
						</div>
					</DrawerContent>
				</Drawer>
			</>
		);
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<SolidUser />
					{t("auth.register.cta")}
				</Button>
			</DialogTrigger>
			<DialogContent className="gap-0 p-0 md:max-w-4xl" showCloseButton={false}>
				<AuthContent
					tab={tab}
					setTab={setTab}
					setOpen={setOpen}
					setForgotOpen={setForgotOpen}
					registerStage={registerStage}
					setRegisterStage={setRegisterStage}
				/>
			</DialogContent>
		</Dialog>
	);
}

function AuthContent({
	tab,
	setTab,
	setOpen,
	setForgotOpen,
	registerStage,
	setRegisterStage,
}: AuthContentProps) {
	const artwork =
		tab === "register"
			? REGISTER_ARTWORK_BY_STAGE[registerStage]
			: DEFAULT_AUTH_ARTWORK;

	return (
		<div className="grid min-h-[420px] min-w-0 md:grid-cols-[320px_minmax(0,1fr)]">
			<aside className="relative hidden h-full flex-col gap-4 bg-muted/40 p-6 md:flex">
				<AuthArtworkImage
					artwork={artwork}
					className="absolute inset-0 h-full w-full rounded-r-lg object-cover"
				/>
				<div className="absolute inset-0 rounded-r-lg bg-black/50" />
				<div className="z-10 flex flex-col gap-2 text-white">
					<div className="space-y-1">
						<h3 className="font-semibold text-sm">Familiar</h3>
						<p className="text-xs opacity-80">
							Sign in to share your work and follow creators.
						</p>
					</div>
				</div>
			</aside>

			<section className="max-h-[80vh] min-w-0 overflow-x-hidden overflow-y-auto p-4">
				<div className="mb-3 flex justify-end">
					<DialogClose asChild>
						<Button variant="ghost" size="icon" aria-label="Close">
							<OutlineClose />
						</Button>
					</DialogClose>
				</div>

				<TabContent
					tab={tab}
					setTab={setTab}
					setOpen={setOpen}
					setForgotOpen={setForgotOpen}
					setRegisterStage={setRegisterStage}
				/>

				<AuthFooter />
			</section>
		</div>
	);
}

function TabContent({
	tab,
	setTab,
	setOpen,
	setForgotOpen,
	setRegisterStage,
}: {
	tab: AuthTab;
	setTab: (tab: AuthTab) => void;
	setOpen: (open: boolean) => void;
	setForgotOpen: (forgotOpen: boolean) => void;
	setRegisterStage: (stage: RegisterStage) => void;
}) {
	return (
		<AnimateChangeInHeight>
			<Tabs
				value={tab}
				onValueChange={(value) => setTab(value as AuthTab)}
				className="w-full"
			>
				<TabsList
					className={cn(
						"grid h-auto w-full grid-cols-2 rounded-lg bg-muted p-1",
						"[&>button]:rounded-md [&>button]:py-2 [&>button]:text-muted-foreground [&>button]:text-sm [&>button]:transition-all [&>button]:data-[state=active]:bg-background [&>button]:data-[state=active]:text-foreground [&>button]:data-[state=active]:shadow-sm",
					)}
				>
					<TabsTrigger value="login">Sign In</TabsTrigger>
					<TabsTrigger value="register">Sign Up</TabsTrigger>
				</TabsList>

				<TabsContent value="login">
					<LoginForm
						onModeChange={() => setTab("register")}
						onSuccess={() => setOpen(false)}
						onForgot={() => setForgotOpen(true)}
					/>
				</TabsContent>

				<TabsContent value="register">
					<RegisterForm
						onModeChange={() => setTab("login")}
						onSuccess={() => setOpen(false)}
						onStageChange={setRegisterStage}
					/>
				</TabsContent>
			</Tabs>
		</AnimateChangeInHeight>
	);
}

function AuthFooter() {
	const { t } = useTranslation();

	return (
		<p className="mt-3 text-sm text-muted-foreground">
			{t("auth.terms_agree.label")}{" "}
			<Link
				to="/"
				target="_blank"
				className={buttonVariants({ variant: "link" })}
			>
				{t("auth.terms_agree.terms")}
			</Link>{" "}
			{t("auth.terms_agree.and")}{" "}
			<Link
				to="/"
				target="_blank"
				className={buttonVariants({ variant: "link" })}
			>
				{t("auth.terms_agree.privacy")}
			</Link>
			.
		</p>
	);
}

export default AuthModal;
