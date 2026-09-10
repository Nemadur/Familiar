import {
	type CSSProperties,
	createContext,
	type ReactNode,
	use,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import type { RegisterStage } from "@/types/auth/form/register";

export interface AuthArtwork {
	src: string;
	alt?: string;
	objectPosition?: CSSProperties["objectPosition"];
}

const AUTH_PLACEHOLDER_IMAGE =
	"https://images.pexels.com/photos/1570264/pexels-photo-1570264.jpeg";

export const DEFAULT_AUTH_ARTWORK: AuthArtwork = {
	src: AUTH_PLACEHOLDER_IMAGE,
	alt: "",
};

/*
 * Replace each src independently when the mascot artwork is ready.
 * The verify artwork is shown after submission, but Verify is not a form step.
 */
export const REGISTER_ARTWORK_BY_STAGE: Record<RegisterStage, AuthArtwork> = {
	account: {
		src: AUTH_PLACEHOLDER_IMAGE,
		alt: "",
		objectPosition: "center",
	},
	profile: {
		src: AUTH_PLACEHOLDER_IMAGE,
		alt: "",
		objectPosition: "45% center",
	},
	socials: {
		src: AUTH_PLACEHOLDER_IMAGE,
		alt: "",
		objectPosition: "55% center",
	},
	verify: {
		src: AUTH_PLACEHOLDER_IMAGE,
		alt: "",
		objectPosition: "center",
	},
};

interface AuthArtworkContextValue {
	artwork: AuthArtwork;
	setArtwork: (artwork: AuthArtwork) => void;
	resetArtwork: () => void;
}

const AuthArtworkContext = createContext<AuthArtworkContextValue | undefined>(
	undefined,
);

export function AuthArtworkProvider({ children }: { children: ReactNode }) {
	const [artwork, setArtwork] = useState<AuthArtwork>(DEFAULT_AUTH_ARTWORK);
	const resetArtwork = useCallback(() => {
		setArtwork(DEFAULT_AUTH_ARTWORK);
	}, []);
	const value = useMemo(
		() => ({ artwork, setArtwork, resetArtwork }),
		[artwork, resetArtwork],
	);

	return (
		<AuthArtworkContext.Provider value={value}>
			{children}
		</AuthArtworkContext.Provider>
	);
}

export function useAuthArtwork() {
	const context = use(AuthArtworkContext);

	if (!context) {
		throw new Error("useAuthArtwork must be used within AuthArtworkProvider");
	}

	return context;
}

export function useSetAuthArtwork(artwork: AuthArtwork) {
	const { setArtwork, resetArtwork } = useAuthArtwork();

	useEffect(() => {
		setArtwork(artwork);
	}, [artwork, setArtwork]);

	useEffect(
		() => () => {
			resetArtwork();
		},
		[resetArtwork],
	);
}

export function AuthArtworkImage({
	artwork,
	className,
}: {
	artwork: AuthArtwork;
	className?: string;
}) {
	return (
		<img
			key={artwork.src}
			src={artwork.src}
			alt={artwork.alt ?? ""}
			className={className}
			style={{ objectPosition: artwork.objectPosition }}
		/>
	);
}
