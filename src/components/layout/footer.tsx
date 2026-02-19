import { Link } from "@tanstack/react-router";
import {
	OutlineArrowRight,
	SolidLogo,
	SolidLogoText,
} from "@/components/icons/icons";

export default function Footer() {
	const currentYear = new Date().getFullYear();

	const socialLinks = [
		{ label: "GitHub", href: "https://github.com" },
		{ label: "Twitter", href: "https://twitter.com" },
		{ label: "Bsky", href: "https://bsky.app" },
		{ label: "Patreon", href: "https://patreon.com" },
		{ label: "Discord", href: "https://discord.gg" },
		{ label: "Telegram", href: "https://t.me" },
	];

	const navigationLinks = [
		{ label: "Home", href: "/" },
		{ label: "Blog", href: "/blog" },
		{ label: "FAQ", href: "/faq" },
		{ label: "Sponsors", href: "/sponsors" },
		{ label: "Terms", href: "/tos" },
	];

	const resourceLinks = [
		{ label: "Documentation", href: "#" },
		{ label: "Blog", href: "/blog" },
	];

	return (
		<footer className={"mt-auto"}>
			{/* Main Footer Content */}
			<div className="rounded-3xl bg-primary/6 p-6">
				<div className="flex flex-col items-start justify-between gap-8 md:flex-row">
					{/* Logo and info */}
					<div className="w-full space-y-4 md:w-auto">
						<SolidLogoText size={80} />
						<div className="space-y-2">
							<span className=" mt-4 font-bold text-sm uppercase tracking-wider">
								Familiar
							</span>
							<p className="text-xs tracking-wider">
								Familiar is a social platform for artists to connect with each
								other.
							</p>
						</div>
					</div>

					{/* Links */}
					<div className="grid w-full grid-cols-1 gap-8 md:flex md:w-auto md:gap-8">
						{/* Social Links */}
						<div className="space-y-4">
							<h4 className="font-bold text-xs tracking-wider">Socials</h4>

							<div className="space-y-2">
								{socialLinks.map((link) => (
									<LinkWithArrow
										key={link.label}
										href={link.href}
										label={link.label}
										isExternal={link.href.startsWith("http")}
									/>
								))}
							</div>
						</div>

						{/* Navigation Links */}
						<div className="space-y-4">
							<h4 className="font-bold text-xs tracking-wider">Navigation</h4>
							<div className="space-y-2">
								{navigationLinks.map((link) => (
									<LinkWithArrow
										key={link.label}
										href={link.href}
										label={link.label}
									/>
								))}
							</div>
						</div>

						{/* Resources */}
						<div className="space-y-4">
							<h4 className="font-bold text-xs tracking-wider">Resources</h4>

							<div className="space-y-2">
								{resourceLinks.map((link) => (
									<LinkWithArrow
										key={link.label}
										href={link.href}
										label={link.label}
										isExternal
									/>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* <SectionSeparator /> */}

			<div className="p-6">
				<div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
					<p className="text-gray-500 text-xs uppercase tracking-wider dark:text-gray-500">
						&copy; {currentYear} All rights reserved
					</p>
					<p className="text-gray-500 text-xs uppercase tracking-wider dark:text-gray-500">
						Made with ❤️
					</p>
				</div>
			</div>
		</footer>
	);
}

const LinkWithArrow = ({
	href,
	label,
	isExternal = false,
}: {
	href: string;
	label: string;
	icon?: string;
	isExternal?: boolean;
}) => (
	<Link
		to={href}
		target={isExternal ? "_blank" : undefined}
		rel={isExternal ? "noopener noreferrer" : undefined}
		className="group flex items-center gap-3 text-xs tracking-wider transition-colors focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
	>
		{label}
		<OutlineArrowRight
			size={12}
			className="-translate-x-2 -rotate-45 opacity-0 transition-all duration-150 group-focus-within:translate-x-0 group-focus-within:rotate-0 group-focus-within:opacity-100 group-hover:translate-x-0 group-hover:rotate-0 group-hover:opacity-100"
		/>
	</Link>
);
