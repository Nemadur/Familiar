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
	icon?: React.ComponentType<IconProps>;
	title: string;
	error?: Error;
	description?: string;
	children?: React.ReactNode;
}

export function EmptyPage({
	icon: Icon = OutlineCircle,
	title,
	error,
	description,
	children,
}: EmptyPageProps) {
	const { t } = useTranslation();
	const desc = description || t("states.empty.under_construction");

	return (
		<Empty>
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<Icon />
				</EmptyMedia>
				<EmptyTitle>{title}</EmptyTitle>
				<EmptyDescription>{desc}</EmptyDescription>
				{error && <EmptyDescription>{error.message}</EmptyDescription>}
			</EmptyHeader>
			{children && <EmptyContent>{children}</EmptyContent>}
		</Empty>
	);
}
