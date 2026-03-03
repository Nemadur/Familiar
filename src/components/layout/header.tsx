import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth";
import { useTheme } from "@/providers/theme";
import {
	OutlineClearNight,
	OutlineFileText,
	OutlineHome,
	OutlineMenu,
	OutlineReceipt,
	OutlineSunny,
	SolidFileText,
	SolidHome,
	SolidReceipt,
} from "../icons/icons";
import { Button } from "../ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "../ui/sheet";
import UserDropDown from "./profile/drop-down";
import LanguageSelect from "./select/language";
import ThemeToggle from "./select/theme-toggle";

export default function Header() {
	const { t } = useTranslation();
	const { user } = useAuth();

	return (
		<header className="sticky top-0 z-50 px-5">
			<div className="flex h-16 items-center justify-between gap-4">
				{/* NAVIGATION */}
				<div className="flex items-center gap-2">
					<MobileNav />
					<NavWrapper className="hidden lg:flex">
						<Link to="/" className="mr-2 ml-3 flex items-center space-x-2">
							<span className="font-bold text-sm uppercase tracking-wider">
								{t("header.title")}
							</span>
						</Link>
						<NavLinks />
						{/* TODO: mobile nav */}
					</NavWrapper>
				</div>
				{/* USER CTAS */}
				<div className="flex shrink-0 items-center gap-2">
					<NavWrapper>
						{/* CurrencySelect */}
						{/* LanguageSelect */}
						{/* ThemeSelect */}
						<ThemeToggle />
						<LanguageSelect />
						{user ? (
							<UserDropDown user={user} />
						) : (
							<div className="hidden lg:flex items-center gap-2">
								<Button asChild variant={"secondary"}>
									<Link to="/auth/login">
										{/* <OutlineLogout /> */}
										{t("auth.login.cta")}
									</Link>
								</Button>
								<Button asChild>
									<Link to="/auth/register">
										{/* <SolidUser /> */}
										{t("auth.register.cta")}
									</Link>
								</Button>
							</div>
						)}
					</NavWrapper>
				</div>
			</div>
		</header>
	);
}

const MobileNav = () => {
	const { t } = useTranslation();
	const { user } = useAuth();
	const { setTheme, userTheme } = useTheme();

	return (
		<Sheet>
			<NavWrapper className="lg:hidden">
				<SheetTrigger asChild>
					<Button variant="ghost" size="icon">
						<OutlineMenu />
					</Button>
				</SheetTrigger>
			</NavWrapper>
			<SheetContent side="left" className="w-[300px] sm:w-[400px]">
				<SheetHeader className="text-left px-4">
					<SheetTitle className="text-xl font-bold uppercase tracking-wider">
						{t("header.title")}
					</SheetTitle>
				</SheetHeader>
				<div className="flex flex-col h-full py-6 px-2">
					<div className="flex flex-col gap-2">
						<NavLinks />
					</div>

					<div className="mt-auto space-y-4">
						<div className="h-px bg-border/50 mx-2" />

						{user ? (
							<div className="px-2">
								<div className="flex items-center gap-3 rounded-xl bg-secondary/50">
									<UserDropDown user={user} showInfo />
								</div>
							</div>
						) : (
							<div className="grid grid-cols-2 gap-3 px-2">
								<Button asChild variant="secondary" className="w-full">
									<Link to="/auth/login">{t("auth.login.cta")}</Link>
								</Button>
								<Button asChild className="w-full">
									<Link to="/auth/register">{t("auth.register.cta")}</Link>
								</Button>
							</div>
						)}
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
};

const NavLinks = ({ size = "default" }: { size?: "sm" | "default" }) => {
	const { t } = useTranslation();
	const location = useLocation();
	const pathname = location.pathname;

	/**
	 * Bierzemy odpowiedni state ikon w zależności na jakim url path jest użytkownik
	 * @param path
	 * @param isActive
	 * @returns solid lub outline ikonę
	 */
	const getIconState = (path: string, isActive: boolean) => {
		switch (path) {
			case "/":
				return isActive ? <SolidHome /> : <OutlineHome />;
			case "/shop":
				return isActive ? <SolidReceipt /> : <OutlineReceipt />;
			case "/blog":
				return isActive ? <SolidFileText /> : <OutlineFileText />;
			default:
				return null;
		}
	};

	const navigationLinks = [
		{ path: "/", label: t("header.navigation.home") },
		{ path: "/shop", label: t("header.navigation.shop") },
		{ path: "/blog", label: t("header.navigation.blog") },
		{ path: "/users", label: t("header.navigation.users") },
	];

	return (
		<>
			{navigationLinks.map((link) => {
				const isActive = pathname === link.path;
				const icon = getIconState(link.path, isActive);
				const isIconOnly = icon && !link.label;
				const buttonSize = isIconOnly
					? "icon"
					: size === "sm"
						? "sm"
						: "default";

				return (
					<Button
						asChild
						key={link.path}
						variant={isActive ? "default" : "ghost"}
						size={buttonSize}
						className={cn(!isIconOnly && "justify-start")}
					>
						<Link to={link.path}>
							{icon}
							{link.label}
						</Link>
					</Button>
				);
			})}
		</>
	);
};

const NavWrapper = ({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) => {
	const [isScrolled, setIsScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 0);
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<nav
			className={cn(
				"flex items-center gap-1 rounded-full bg-background p-1 transition-shadow duration-200",
				isScrolled ? "shadow-lg" : "shadow-none",
				className,
			)}
		>
			{children}
		</nav>
	);
};
