import { Link } from "@tanstack/react-router";
import {
	type AnchorHTMLAttributes,
	createContext,
	type MouseEvent,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface MarkdownDisplayProps {
	content: string | null | undefined;
	className?: string;
	isShort?: boolean;
}

const NewTabModifierContext = createContext(false);
const CurrentOriginContext = createContext<string | null>(null);

function isExternalHref(href: string) {
	if (href.startsWith("//")) return true;

	try {
		const url = new URL(href);
		return url.protocol === "http:" || url.protocol === "https:";
	} catch {
		return false;
	}
}

function isInternalHref(href: string) {
	return href.startsWith("/") && !href.startsWith("//");
}

function isNewTabClick(event: MouseEvent) {
	return event.ctrlKey || event.metaKey || event.button === 1;
}

function getDisplayHref(href: string, origin: string | null) {
	if (!origin) return href;

	try {
		return new URL(href, origin).toString();
	} catch {
		return href;
	}
}

function openInNewTab(href: string) {
	window.open(href, "_blank", "noopener,noreferrer");
}

function useNewTabModifier() {
	const [isPressed, setIsPressed] = useState(false);

	useEffect(() => {
		const update = (event: KeyboardEvent) => {
			setIsPressed(event.ctrlKey || event.metaKey);
		};

		const reset = () => {
			setIsPressed(false);
		};

		window.addEventListener("keydown", update);
		window.addEventListener("keyup", update);
		window.addEventListener("blur", reset);

		return () => {
			window.removeEventListener("keydown", update);
			window.removeEventListener("keyup", update);
			window.removeEventListener("blur", reset);
		};
	}, []);

	return isPressed;
}

function useCurrentOrigin() {
	const [origin, setOrigin] = useState<string | null>(null);

	useEffect(() => {
		setOrigin(window.location.origin);
	}, []);

	return origin;
}

function MarkdownLink({
	href,
	children,
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
	const isNewTabModifierPressed = useContext(NewTabModifierContext);
	const currentOrigin = useContext(CurrentOriginContext);

	if (!href) {
		return <span>{children}</span>;
	}

	const isInternal = isInternalHref(href);
	const isExternal = isExternalHref(href);
	const displayHref = getDisplayHref(href, currentOrigin);

	const tooltipText = isNewTabModifierPressed
		? `${displayHref} (new tab)`
		: displayHref;

	const handleInternalClick = (event: MouseEvent) => {
		if (!isNewTabClick(event)) return;

		event.preventDefault();
		openInNewTab(href);
	};

	const handleInternalAuxClick = (event: MouseEvent) => {
		if (event.button !== 1) return;

		event.preventDefault();
		openInNewTab(href);
	};

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				{isInternal ? (
					<Link
						className="link text-[1em]"
						to={href}
						onClick={handleInternalClick}
						onAuxClick={handleInternalAuxClick}
					>
						{children}
					</Link>
				) : (
					<a
						className="link text-[1em]"
						href={href}
						target={isExternal ? "_blank" : undefined}
						rel={isExternal ? "noopener noreferrer" : undefined}
					>
						{children}
					</a>
				)}
			</TooltipTrigger>

			<TooltipContent>{tooltipText}</TooltipContent>
		</Tooltip>
	);
}

export function MarkdownDisplay({
	content,
	className,
	isShort = false,
}: MarkdownDisplayProps) {
	const isNewTabModifierPressed = useNewTabModifier();
	const currentOrigin = useCurrentOrigin();

	const remarkPlugins = useMemo(() => [remarkGfm, remarkBreaks], []);

	const components = useMemo(
		() => ({
			a: MarkdownLink,
		}),
		[],
	);

	if (!content) return null;

	return (
		<CurrentOriginContext.Provider value={currentOrigin}>
			<NewTabModifierContext.Provider value={isNewTabModifierPressed}>
				<TooltipProvider>
					<div
						className={cn(
							isShort && "line-clamp-3",
							"text-sm prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-secondary prose-pre:text-secondary-foreground",
							className,
						)}
					>
						<ReactMarkdown
							remarkPlugins={remarkPlugins}
							components={components}
						>
							{content}
						</ReactMarkdown>
					</div>
				</TooltipProvider>
			</NewTabModifierContext.Provider>
		</CurrentOriginContext.Provider>
	);
}
