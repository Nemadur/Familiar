import type React from "react";
import type { IconProps } from "../../icons-props";
import { getIconClassName } from "../../icons-props";

export const OutlineGlobe: React.FC<IconProps> = ({
	className,
	size = 24,
	style,
}) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		style={style}
		className={getIconClassName(className)}
	>
		<title>Globe</title>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M16.975 13H21v-2h-4.025c-.25-5.053-2.382-9-4.975-9-2.593 0-4.724 3.947-4.975 9H3v2h4.025c.25 5.053 2.382 9 4.975 9 2.593 0 4.724-3.947 4.975-9Zm-2.002 0c-.116 2.094-.587 3.899-1.226 5.177C12.948 19.774 12.215 20 12 20c-.215 0-.948-.226-1.747-1.823-.639-1.278-1.11-3.083-1.226-5.177h5.946Zm-5.946-2c.116-2.094.587-3.899 1.226-5.177C11.052 4.226 11.785 4 12 4c.215 0 .948.226 1.747 1.823.639 1.278 1.11 3.083 1.226 5.177H9.027Z"
			fill="currentColor"
		/>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm0 2c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z"
			fill="currentColor"
		/>
	</svg>
);

export const SolidGlobe: React.FC<IconProps> = ({ className, size = 24 }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		style={style}
		className={getIconClassName(className)}
	>
		<title>Globe</title>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M15.488 2.625A10.009 10.009 0 0 1 21.95 11h-3.97c-.162-3.88-1.254-6.604-2.485-8.373l-.006-.002ZM11.999 2c-3.042 1.442-3.888 6.085-4.021 9h7.999c-.139-3.048-1.004-7.352-3.978-9Zm-3.553.65C7.22 4.419 6.137 7.136 5.976 11H2.049a10.009 10.009 0 0 1 6.397-8.35Zm7.042 18.725A10.009 10.009 0 0 0 21.95 13h-3.97c-.163 3.88-1.255 6.604-2.486 8.373l-.006.002ZM12 22c-3.043-1.442-3.889-6.085-4.022-9h8c-.14 3.048-1.005 7.352-3.978 9Zm-3.554-.65c-1.225-1.769-2.309-4.486-2.47-8.35H2.05a10.01 10.01 0 0 0 6.397 8.35Z"
			fill="currentColor"
		/>
	</svg>
);

export const DuotoneGlobe: React.FC<IconProps> = ({
	className,
	size = 24,
	style,
}) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		style={style}
		className={getIconClassName(className)}
	>
		<title>Globe</title>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			opacity={0.5}
			d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10Z"
			fill="currentColor"
		/>

		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M5.977 11H2v2h3.977c.151 3.646 1.125 6.27 2.263 8.04.073.115.147.226.222.333a9.98 9.98 0 0 0 3.494.627H12a9.98 9.98 0 0 0 3.494-.627c.075-.108.149-.218.222-.332 1.138-1.77 2.112-4.395 2.263-8.041H22v-2h-4.02c-.152-3.646-1.126-6.27-2.264-8.04a10.66 10.66 0 0 0-.222-.333A9.978 9.978 0 0 0 12 2h-.044a9.99 9.99 0 0 0-3.494.627 10.64 10.64 0 0 0-.222.332C7.102 4.73 6.128 7.354 5.977 11Zm2.001 0c.15-3.28 1.024-5.528 1.944-6.96.508-.79 1.029-1.33 1.45-1.66.211-.167.386-.273.512-.333.042-.02.073-.032.094-.04.021.008.052.02.094.04.126.06.301.166.512.332.421.332.942.872 1.45 1.662.92 1.43 1.794 3.679 1.943 6.959H7.978Zm8 2c-.15 3.28-1.024 5.528-1.944 6.96-.508.79-1.029 1.33-1.45 1.66a2.83 2.83 0 0 1-.512.333c-.042.02-.073.032-.094.04a1.068 1.068 0 0 1-.094-.04 2.83 2.83 0 0 1-.512-.332c-.421-.332-.942-.872-1.45-1.662-.92-1.43-1.794-3.679-1.944-6.959h8Z"
			fill="currentColor"
		/>
	</svg>
);
