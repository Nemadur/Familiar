import type { ComponentType, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { OutlineCircle } from "../icons/icons";
import type { IconProps } from "../icons/icons-props";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "../ui/empty";

interface EmptyPageProps {
	icon?: ComponentType<IconProps>;
	title: string;
	error?: Error;
	description?: string;
	children?: ReactNode;

	className?: string;
	iconClassName?: string;
	titleClassName?: string;
	descriptionClassName?: string;
	contentClassName?: string;
}

export function EmptyPage({
	icon: Icon = OutlineCircle,
	title,
	error,
	description,
	children,
	className,
	iconClassName,
	titleClassName,
	descriptionClassName,
	contentClassName,
}: EmptyPageProps) {
	const { t } = useTranslation();

	const resolvedDescription =
		description || t("states.empty.under_construction");

	return (
		<Empty className={className}>
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<Icon className={iconClassName} />
				</EmptyMedia>

				<EmptyTitle className={titleClassName}>{title}</EmptyTitle>

				<EmptyDescription className={descriptionClassName}>
					{resolvedDescription}
				</EmptyDescription>

				{error && (
					<EmptyDescription className={descriptionClassName}>
						{error.message}
					</EmptyDescription>
				)}
			</EmptyHeader>

			{children && (
				<EmptyContent className={contentClassName}>{children}</EmptyContent>
			)}
		</Empty>
	);
}
