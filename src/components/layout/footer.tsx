import { Surface, Typography } from "@heroui/react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { OutlineArrowRight, SolidLogoText } from "@/components/icons/icons";

type FooterLink = {
	label: string;
	href: string;
};

type FooterSection = {
	title: string;
	links: FooterLink[];
};

const SOCIAL_LINKS: FooterLink[] = [
	{ label: "Discord", href: "https://discord.gg/DW8rqjmpPZ" },
	{ label: "Telegram", href: "https://t.me/familiar_art" },
];

export default function Footer() {
	const { t } = useTranslation();
	const currentYear = new Date().getFullYear();

	const sections: FooterSection[] = [
		{
			title: t("footer.sections.socials", "Socials"),
			links: SOCIAL_LINKS,
		},
		{
			title: t("footer.sections.navigation", "Navigation"),
			links: [
				{ label: t("footer.links.home", "Home"), href: "/" },
				// { label: t("footer.links.blog", "Blog"), href: "/blog" },
				// { label: t("footer.links.faq", "FAQ"), href: "/faq" },
				// { label: t("footer.links.sponsors", "Sponsors"), href: "/sponsors" },
			],
		},
		{
			title: t("footer.sections.resources", "Resources"),
			links: [
				// Match these hrefs to your actual route paths.
				{
					label: t("footer.links.privacy", "Privacy Policy"),
					href: "/privacy",
				},
				{
					label: t("footer.links.terms", "Terms of Service"),
					href: "/tos",
				},
				{
					label: t("footer.links.release-notes", "Release Notes"),
					href: "/release-notes",
				},
				{
					label: t("footer.links.roadmap", "Roadmap"),
					href: "/roadmap",
				},
			],
		},
	];

	return (
		<footer className="px-4">
			<Surface
				variant="secondary"
				className="rounded-3xl p-6 text-secondary-foreground"
			>
				<div className="flex flex-col items-start justify-between gap-8 md:flex-row">
					<FooterBrand />

					<nav
						aria-label={t("footer.sections.resources", "Footer links")}
						className="grid w-full grid-cols-1 gap-8 md:flex md:w-auto md:gap-8"
					>
						{sections.map((section) => (
							<FooterSection key={section.title} section={section} />
						))}
					</nav>
				</div>
			</Surface>

			<FooterBottom currentYear={currentYear} />
		</footer>
	);
}

function FooterBrand() {
	const { t } = useTranslation();

	return (
		<div className="w-full space-y-4 md:w-auto">
			<SolidLogoText size={80} />

			<div className="space-y-2">
				<Typography.Heading level={3}>
					{t("footer.about.title")}
				</Typography.Heading>

				<Typography.Paragraph className="text-muted-foreground" size={"sm"}>
					{t("footer.about.description")}
				</Typography.Paragraph>
			</div>
		</div>
	);
}

function FooterSection({ section }: { section: FooterSection }) {
	return (
		<div className="space-y-3">
			<Typography.Heading level={6}>{section.title}</Typography.Heading>

			<div className="space-y-1.5">
				{section.links.map((link) => (
					<FooterLink key={link.href} link={link} />
				))}
			</div>
		</div>
	);
}

function FooterLink({ link }: { link: FooterLink }) {
	const isExternal = link.href.startsWith("http");

	if (isExternal) {
		return (
			<a
				href={link.href}
				target="_blank"
				rel="noopener noreferrer"
				className={footerLinkClassName}
			>
				<LinkContent label={link.label} />
			</a>
		);
	}

	return (
		<Link to={link.href} className={footerLinkClassName}>
			<LinkContent label={link.label} />
		</Link>
	);
}

function LinkContent({ label }: { label: string }) {
	return (
		<>
			{label}

			<OutlineArrowRight
				size={12}
				className="-translate-x-2 -rotate-45 opacity-0 transition-all duration-150 group-focus-within:translate-x-0 group-focus-within:rotate-0 group-focus-within:opacity-100 group-hover:translate-x-0 group-hover:rotate-0 group-hover:opacity-100"
			/>
		</>
	);
}

function FooterBottom({ currentYear }: { currentYear: number }) {
	const { t } = useTranslation();

	return (
		<div className="p-6">
			<div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
				<Typography.Paragraph
					size={"xs"}
					className="text-muted-foreground uppercase"
				>
					&copy; {currentYear} {t("footer.copyright.rights")}
				</Typography.Paragraph>

				<Typography.Paragraph
					size={"xs"}
					className="text-muted-foreground uppercase"
				>
					{t("footer.copyright.made_with")}
				</Typography.Paragraph>
			</div>
		</div>
	);
}

const footerLinkClassName =
	"group flex items-center gap-3 text-xs tracking-wider transition-colors focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
