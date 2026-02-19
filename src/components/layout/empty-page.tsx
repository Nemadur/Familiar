import { useTranslation } from "react-i18next";
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
	icon: React.ComponentType<IconProps>;
	title: string;
	description?: string;
	children?: React.ReactNode;
}

export function EmptyPage({
	icon: Icon,
	title,
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
			</EmptyHeader>
			{children && <EmptyContent>{children}</EmptyContent>}
		</Empty>
	);
}
