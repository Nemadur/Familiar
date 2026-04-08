import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Column, ColumnDataType } from "../core/types";

interface FilterSubjectProps<TData, TType extends ColumnDataType> {
	column: Column<TData, TType>;
}

export function FilterSubject<TData, TType extends ColumnDataType>({
	column,
}: FilterSubjectProps<TData, TType>) {
	const hasIcon = !!column.icon;
	return (
		<Button
			aria-haspopup="true"
			variant={"ghost"}
			size="xl"
			className={cn(
				"rounded-r-none hover:text-foreground text-xs hover:bg-transparent",
			)}
		>
			{hasIcon && <column.icon className="size-4" />}
			{column.displayName}
		</Button>
	);
}
