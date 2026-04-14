import { Link, useLocation } from "@tanstack/react-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { OutlineClose, SolidUser } from "@/components/icons/icons";
import { AnimateChangeInHeight } from "@/components/ui/animate-change-in-height";
import { Button } from "@/components/ui/button";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth";
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
	const [tab, setTab] = React.useState<AuthTab>(defaultTab);
	const [forgotOpen, setForgotOpen] = React.useState(false);
	const isMobile = useIsMobile();
	const { user } = useAuth();

	// Auto-close modal when user successfully signs in
	React.useEffect(() => {
		if (user && open) setOpen(false);
	}, [user, open]);

	if (isMobile) {
		return (
			<>
				<Drawer open={open} onOpenChange={setOpen}>
					<DrawerTrigger asChild>
						<Button>{t("auth.register.cta")}</Button>
					</DrawerTrigger>
					<DrawerContent className={"max-h-[85vh]"}>
						<DrawerHeader className={"text-center"}>
							<DrawerClose asChild className={"absolute top-2 right-2"}>
								<Button variant={"ghost"} size={"icon"} aria-label={"Close"}>
									<OutlineClose />
								</Button>
							</DrawerClose>
						</DrawerHeader>
						<div className={"px-4 pb-4"}>
							<AuthContent
								tab={tab}
								setTab={setTab}
								setOpen={setOpen}
								setForgotOpen={setForgotOpen}
							/>
						</div>
					</DrawerContent>
				</Drawer>

				{/* Mobile forgot password drawer */}
				<Drawer open={forgotOpen} onOpenChange={setForgotOpen}>
					<DrawerContent className={"max-h-[85vh]"}>
						<DrawerHeader className={"text-center"}>
							<DrawerTitle>Reset your password</DrawerTitle>
						</DrawerHeader>
						<div className={"px-4 pb-4"}>
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
			<DialogContent
				className={"gap-0 p-0 md:max-w-4xl"}
				showCloseButton={false}
			>
				<AuthContent
					tab={tab}
					setTab={setTab}
					setOpen={setOpen}
					setForgotOpen={setForgotOpen}
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
}: AuthContentProps) {
	return (
		<div className={"grid min-h-[420px] md:grid-cols-[320px_minmax(0,1fr)]"}>
			{/* Left image panel (hidden on mobile) */}
			<aside
				className={
					"relative hidden h-full flex-col gap-4 bg-muted/40 p-6 md:flex"
				}
			>
				<img
					src="https://images.pexels.com/photos/1570264/pexels-photo-1570264.jpeg"
					alt="Familiar"
					className={"absolute inset-0 h-full w-full rounded-r-lg object-cover"}
				/>
				{/* Overlay */}
				<div className={"absolute inset-0 rounded-r-lg bg-black/50"} />
				{/* Text component */}
				<div className={"z-10 flex flex-col gap-2 text-white"}>
					<div className={"space-y-1"}>
						<h3 className={"font-semibold text-sm"}>Familiar</h3>
						<p className={"text-xs opacity-80"}>
							Sign in to share your work and follow creators.
						</p>
					</div>
				</div>
			</aside>

			{/* RIGHT Panel */}
			<section className={"max-h-[80vh] overflow-y-auto p-4"}>
				<div className={"mb-3 flex justify-end"}>
					<DialogClose asChild>
						<Button variant={"ghost"} size={"icon"} aria-label={"Close"}>
							<OutlineClose />
						</Button>
					</DialogClose>
				</div>

				{/* Tabs */}
				<TabContent
					tab={tab}
					setTab={setTab}
					setOpen={setOpen}
					setForgotOpen={setForgotOpen}
				/>
				{/* Footer */}
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
}: {
	tab: AuthTab;
	setTab: (tab: AuthTab) => void;
	setOpen: (open: boolean) => void;
	setForgotOpen: (forgotOpen: boolean) => void;
}) {
	return (
		<AnimateChangeInHeight>
			<Tabs
				value={tab}
				onValueChange={(value) => setTab(value as AuthTab)}
				className={"w-full"}
			>
				{/* TABS */}
				<TabsList
					className={cn(
						"grid h-auto w-full grid-cols-2 rounded-lg bg-muted p-1",
						"[&>button]:rounded-md [&>button]:py-2 [&>button]:text-muted-foreground [&>button]:text-sm [&>button]:transition-all [&>button]:data-[state=active]:bg-background [&>button]:data-[state=active]:text-foreground [&>button]:data-[state=active]:shadow-sm",
					)}
				>
					<TabsTrigger value="login">Sign In</TabsTrigger>
					<TabsTrigger value="register">Sign Up</TabsTrigger>
				</TabsList>
				{/* LOGIN */}
				<TabsContent value="login">
					<LoginForm
						onModeChange={() => setTab("register")}
						onSuccess={() => setOpen(false)}
						onForgot={() => setForgotOpen(true)}
					/>
				</TabsContent>
				{/* REGISTER */}
				<TabsContent value="register">
					<RegisterForm
						onModeChange={() => setTab("login")}
						onSuccess={() => setOpen(false)}
					/>
				</TabsContent>
			</Tabs>
		</AnimateChangeInHeight>
	);
}

function AuthFooter() {
	const { t } = useTranslation();
	return (
		<p className="mt-3 text-[10px] text-muted-foreground">
			{t("auth.terms_agree.label")}{" "}
			<Link
				to="/"
				target="_blank"
				className={"cursor-pointer text-blue-600 underline dark:text-blue-400"}
			>
				{t("auth.terms_agree.terms")}
			</Link>{" "}
			{t("auth.terms_agree.and")}{" "}
			<Link
				to="/"
				target="_blank"
				className={"cursor-pointer text-blue-600 underline dark:text-blue-400"}
			>
				{t("auth.terms_agree.privacy")}
			</Link>
			.
		</p>
	);
}

export default AuthModal;
