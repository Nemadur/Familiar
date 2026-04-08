import { memo } from "react";
import { Button } from "src/components/ui/button";
import { cn } from "src/lib/utils";
import { OutlineFilterClear } from "@/components/icons/icons";
import type { DataTableFilterActions } from "../core/types";
import { type Locale, t } from "../lib/i18n";

interface FilterActionsProps {
	hasFilters: boolean;
	actions?: DataTableFilterActions;
	locale?: Locale;
}

export const FilterActions = memo(__FilterActions);
function __FilterActions({
	hasFilters,
	actions,
	locale = "en",
}: FilterActionsProps) {
	return (
		<Button
			size={"xl"}
			className={cn(!hasFilters && "hidden")}
			variant="destructive"
			onClick={actions?.removeAllFilters}
		>
			<OutlineFilterClear />
			<span className="hidden md:block">{t("clear", locale)}</span>
		</Button>
	);
}
