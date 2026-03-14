import type { Column, ColumnDataType } from "../core/types";

interface FilterSubjectProps<TData, TType extends ColumnDataType> {
	column: Column<TData, TType>;
}

export function FilterSubject<TData, TType extends ColumnDataType>({
	column,
}: FilterSubjectProps<TData, TType>) {
	const hasIcon = !!column.icon;
	return (
		<span className="flex select-none items-center gap-1 whitespace-nowrap px-2.5 font-medium">
			{hasIcon && <column.icon className="size-4" />}
			{column.displayName}
		</span>
	);
}
