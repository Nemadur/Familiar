import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth";
import {
	OutlineFileText,
	OutlineHome,
	OutlineLogout,
	OutlineReceipt,
	OutlineUser,
	SolidFileText,
	SolidHome,
	SolidReceipt,
	SolidUser,
} from "../icons/icons";
import { Button } from "../ui/button";
import AuthModal from "./auth/modal";
import LanguageSelect from "./select/language";
import UserDropDown from "./user/drop-down";

export default function Header() {
	const { t } = useTranslation();
	const { user } = useAuth();

	return (
		<header className="sticky top-0 z-50">
			<div className="flex h-16 items-center justify-between gap-4">
				{/* NAVIGATION */}
				<div className="flex items-center gap-2">
					<NavWrapper>
						<Link to="/" className="mr-2 ml-3 flex items-center space-x-2">
							<span className="font-bold text-sm uppercase tracking-wider">
								{t("header.title")}
							</span>
							{/* <img
              src="/tanstack-word-logo-white.svg"
              alt="TanStack Logo"
              className="h-6 invert dark:invert-0"
            /> */}
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
						<LanguageSelect />
						{user ? (
							<UserDropDown user={user} />
						) : (
							<>
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
							</>
						)}
					</NavWrapper>
				</div>
			</div>
		</header>
	);
}

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

const NavWrapper = ({ children }: { children: React.ReactNode }) => {
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
				"hidden items-center gap-1 rounded-full bg-background p-1 transition-shadow duration-200 lg:flex",
				isScrolled ? "shadow-lg" : "shadow-none",
			)}
		>
			{children}
		</nav>
	);
};
