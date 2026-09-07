import * as React from "react";

const BREAKPOINTS = {
	sm: 640,
	md: 768,
	lg: 1024,
	xl: 1280,
	"2xl": 1536,
} as const;

type BreakpointKey = keyof typeof BREAKPOINTS;

function useIsBelowBreakpoint(breakpoint: BreakpointKey) {
	const [isBelow, setIsBelow] = React.useState<boolean | undefined>(undefined);
	const breakpointValue = BREAKPOINTS[breakpoint];

	React.useEffect(() => {
		const mql = window.matchMedia(`(max-width: ${breakpointValue - 1}px)`);
		const onChange = () => {
			setIsBelow(window.innerWidth < breakpointValue);
		};
		mql.addEventListener("change", onChange);
		setIsBelow(window.innerWidth < breakpointValue);
		return () => mql.removeEventListener("change", onChange);
	}, [breakpointValue]);

	return !!isBelow;
}

export function useIsSmDown() {
	return useIsBelowBreakpoint("md");
}

export function useIsMdDown() {
	return useIsBelowBreakpoint("lg");
}

export function useIsLgDown() {
	return useIsBelowBreakpoint("xl");
}

export function useIsXlDown() {
	return useIsBelowBreakpoint("2xl");
}

export function useIsTablet() {
	return useIsMdDown();
}

export function useIsMobile() {
	return useIsBelowBreakpoint("md");
}
