import type React from "react";
import type { IconProps } from "../../icons-props";
import { getIconClassName } from "../../icons-props";

export const OutlineArrowRight: React.FC<IconProps> = ({
  className,
  size = 24,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={getIconClassName(className)}
  >
    <title>Arrow Right</title>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M22 12a1 1 0 0 1-1 1H3a1 1 0 1 1 0-2h18a1 1 0 0 1 1 1Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M21.707 11.293a1 1 0 0 1 0 1.414l-7 7a1 1 0 0 1-1.414-1.414L19.586 12l-6.293-6.293a1 1 0 0 1 1.414-1.414l7 7Z"
      fill="currentColor"
    />
  </svg>
);

export const SolidArrowRight: React.FC<IconProps> = ({
  className,
  size = 24,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={getIconClassName(className)}
  >
    <title>Arrow Right</title>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11 12a1 1 0 0 1-1 1H3a1 1 0 1 1 0-2h7a1 1 0 0 1 1 1Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M21.707 12.707a1 1 0 0 0 0-1.414l-7-7A1 1 0 0 0 13 5v14a1 1 0 0 0 1.707.707l7-7Z"
      fill="currentColor"
    />
  </svg>
);

export const DuotoneArrowRight: React.FC<IconProps> = ({
  className,
  size = 24,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={getIconClassName(className)}
  >
    <title>Arrow Right</title>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      opacity={0.5}
      d="M22 12a1 1 0 0 1-1 1H3a1 1 0 1 1 0-2h18a1 1 0 0 1 1 1Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M21.707 11.293a1 1 0 0 1 0 1.414l-7 7a1 1 0 0 1-1.414-1.414L19.586 12l-6.293-6.293a1 1 0 0 1 1.414-1.414l7 7Z"
      fill="currentColor"
    />
  </svg>
);
