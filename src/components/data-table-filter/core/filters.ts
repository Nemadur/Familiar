import { isAnyOf, uniq } from "../lib/array";
import { isColumnOptionArray } from "../lib/helpers";
import { memo } from "../lib/memo";
import type {
	Column,
	ColumnConfig,
	ColumnDataType,
	ColumnOption,
	ElementType,
	FilterStrategy,
	Nullable,
	TAccessorFn,
	TOrderFn,
	TTransformOptionFn,
} from "./types";

class ColumnConfigBuilder<
	TData,
	TType extends ColumnDataType = any,
	TVal = unknown,
	TId extends string = string,
> {
	private config: Partial<ColumnConfig<TData, TType, TVal, TId>>;

	constructor(type: TType) {
		this.config = { type } as Partial<ColumnConfig<TData, TType, TVal, TId>>;
	}

	private clone(): ColumnConfigBuilder<TData, TType, TVal, TId> {
		const newInstance = new ColumnConfigBuilder<TData, TType, TVal, TId>(
			this.config.type as TType,
		);
		newInstance.config = { ...this.config };

		return newInstance;
	}

	id<TNewId extends string>(
		value: TNewId,
	): ColumnConfigBuilder<TData, TType, TVal, TNewId> {
		const newInstance = this.clone() as unknown as ColumnConfigBuilder<
			TData,
			TType,
			TVal,
			TNewId
		>;
		newInstance.config.id = value;

		return newInstance;
	}

	accessor<TNewVal>(
		accessor: TAccessorFn<TData, TNewVal>,
	): ColumnConfigBuilder<TData, TType, TNewVal, TId> {
		const newInstance = this.clone() as unknown as ColumnConfigBuilder<
			TData,
			TType,
			TNewVal,
			TId
		>;
		newInstance.config.accessor = accessor;

		return newInstance;
	}

	displayName(value: string): ColumnConfigBuilder<TData, TType, TVal, TId> {
		const newInstance = this.clone();
		newInstance.config.displayName = value;

		return newInstance;
	}

	icon(value: any): ColumnConfigBuilder<TData, TType, TVal, TId> {
		const newInstance = this.clone();
		newInstance.config.icon = value;

		return newInstance;
	}

	min(
		value: number,
	): ColumnConfigBuilder<
		TData,
		TType extends "number" ? TType : never,
		TVal,
		TId
	> {
		if (this.config.type !== "number") {
			throw new Error("min() is only applicable to number columns");
		}

		const newInstance = this.clone() as any;
		newInstance.config.min = value;

		return newInstance;
	}

	max(
		value: number,
	): ColumnConfigBuilder<
		TData,
		TType extends "number" ? TType : never,
		TVal,
		TId
	> {
		if (this.config.type !== "number") {
			throw new Error("max() is only applicable to number columns");
		}

		const newInstance = this.clone() as any;
		newInstance.config.max = value;

		return newInstance;
	}

	options(
		value: ColumnOption[],
	): ColumnConfigBuilder<
		TData,
		TType extends "option" | "multiOption" ? TType : never,
		TVal,
		TId
	> {
		if (!isAnyOf(this.config.type, ["option", "multiOption"])) {
			throw new Error(
				"options() is only applicable to option or multiOption columns",
			);
		}

		const newInstance = this.clone() as any;
		newInstance.config.options = value;

		return newInstance;
	}

	transformOptionFn(
		fn: TTransformOptionFn<TVal>,
	): ColumnConfigBuilder<
		TData,
		TType extends "option" | "multiOption" ? TType : never,
		TVal,
		TId
	> {
		if (!isAnyOf(this.config.type, ["option", "multiOption"])) {
			throw new Error(
				"transformOptionFn() is only applicable to option or multiOption columns",
			);
		}

		const newInstance = this.clone() as any;
		newInstance.config.transformOptionFn = fn;

		return newInstance;
	}

	orderFn(
		fn: TOrderFn<TVal>,
	): ColumnConfigBuilder<
		TData,
		TType extends "option" | "multiOption" ? TType : never,
		TVal,
		TId
	> {
		if (!isAnyOf(this.config.type, ["option", "multiOption"])) {
			throw new Error(
				"orderFn() is only applicable to option or multiOption columns",
			);
		}

		const newInstance = this.clone() as any;
		newInstance.config.orderFn = fn;

		return newInstance;
	}

	build(): ColumnConfig<TData, TType, TVal, TId> {
		if (!this.config.id) throw new Error("id is required");
		if (!this.config.accessor) throw new Error("accessor is required");
		if (!this.config.displayName) throw new Error("displayName is required");
		if (!this.config.icon) throw new Error("icon is required");

		return this.config as ColumnConfig<TData, TType, TVal, TId>;
	}
}

interface FluentColumnConfigHelper<TData> {
	text: () => ColumnConfigBuilder<TData, "text", string>;
	number: () => ColumnConfigBuilder<TData, "number", number>;
	date: () => ColumnConfigBuilder<TData, "date", Date>;
	option: () => ColumnConfigBuilder<TData, "option", string>;
	multiOption: () => ColumnConfigBuilder<TData, "multiOption", string[]>;
}

export function createColumnConfigHelper<
	TData,
>(): FluentColumnConfigHelper<TData> {
	return {
		text: () => new ColumnConfigBuilder<TData, "text", string>("text"),
		number: () => new ColumnConfigBuilder<TData, "number", number>("number"),
		date: () => new ColumnConfigBuilder<TData, "date", Date>("date"),
		option: () => new ColumnConfigBuilder<TData, "option", string>("option"),
		multiOption: () =>
			new ColumnConfigBuilder<TData, "multiOption", string[]>("multiOption"),
	};
}

function pushNullableValue<T>(values: T[], value: T | null | undefined): void {
	if (value !== undefined && value !== null) {
		values.push(value);
	}
}

function collectAccessorValues<TData, TType extends ColumnDataType, TVal>(
	column: ColumnConfig<TData, TType, TVal>,
	data: TData[],
): ElementType<NonNullable<TVal>>[] {
	const values: ElementType<NonNullable<TVal>>[] = [];

	for (const row of data) {
		const value = column.accessor(row) as unknown;

		if (Array.isArray(value)) {
			for (const item of value) {
				pushNullableValue(
					values,
					item as ElementType<NonNullable<TVal>> | null | undefined,
				);
			}

			continue;
		}

		pushNullableValue(
			values,
			value as ElementType<NonNullable<TVal>> | null | undefined,
		);
	}

	return values;
}

function collectNumberAccessorValues<TData, TType extends ColumnDataType, TVal>(
	column: ColumnConfig<TData, TType, TVal>,
	data: TData[],
): number[] {
	const values: number[] = [];

	for (const row of data) {
		const value = column.accessor(row) as Nullable<number>;

		if (typeof value === "number" && !Number.isNaN(value)) {
			values.push(value);
		}
	}

	return values;
}

function createOptionValueIndex(options: ColumnOption[]) {
	const optionValueByRawValue = new Map<unknown, string>();

	for (const option of options) {
		if (
			option.value !== undefined &&
			option.value !== null &&
			!optionValueByRawValue.has(option.value)
		) {
			optionValueByRawValue.set(option.value, option.value);
		}
	}

	return optionValueByRawValue;
}

function mapValuesToStaticOptionValues<TVal>(
	values: ElementType<NonNullable<TVal>>[],
	options: ColumnOption[],
): string[] {
	const mappedValues: string[] = [];
	const optionValueByRawValue = createOptionValueIndex(options);

	for (const value of values) {
		const optionValue = optionValueByRawValue.get(value);

		if (optionValue !== undefined && optionValue !== null) {
			mappedValues.push(optionValue);
		}
	}

	return mappedValues;
}

export function getColumnOptions<TData, TType extends ColumnDataType, TVal>(
	column: ColumnConfig<TData, TType, TVal>,
	data: TData[],
	strategy: FilterStrategy,
): ColumnOption[] {
	if (!isAnyOf(column.type, ["option", "multiOption"])) {
		console.warn(
			"Column options can only be retrieved for option and multiOption columns",
		);

		return [];
	}

	if (strategy === "server" && !column.options) {
		throw new Error("column options are required for server-side filtering");
	}

	if (column.options) {
		return column.options;
	}

	let models = uniq(collectAccessorValues(column, data));

	if (column.orderFn) {
		models = models.toSorted((m1, m2) =>
			column.orderFn!(
				m1 as ElementType<NonNullable<TVal>>,
				m2 as ElementType<NonNullable<TVal>>,
			),
		);
	}

	if (column.transformOptionFn) {
		const memoizedTransform = memo(
			() => [models],
			(deps) =>
				deps[0].map((model) =>
					column.transformOptionFn!(model as ElementType<NonNullable<TVal>>),
				),
			{ key: `transform-${column.id}` },
		);

		return memoizedTransform();
	}

	if (isColumnOptionArray(models)) return models;

	throw new Error(
		`[data-table-filter] [${column.id}] Either provide static options, a transformOptionFn, or ensure the column data conforms to ColumnOption type`,
	);
}

export function getColumnValues<TData, TType extends ColumnDataType, TVal>(
	column: ColumnConfig<TData, TType, TVal>,
	data: TData[],
) {
	const memoizedAccessor = memo(
		() => [data],
		() => collectAccessorValues(column, data),
		{ key: `accessor-${column.id}` },
	);

	const raw = memoizedAccessor();

	if (!isAnyOf(column.type, ["option", "multiOption"])) {
		return raw;
	}

	if (column.options) {
		return mapValuesToStaticOptionValues(raw, column.options);
	}

	if (column.transformOptionFn) {
		const memoizedTransform = memo(
			() => [raw],
			(deps) =>
				deps[0].map(
					(value) =>
						column.transformOptionFn!(value) as ElementType<NonNullable<TVal>>,
				),
			{ key: `transform-values-${column.id}` },
		);

		return memoizedTransform();
	}

	if (isColumnOptionArray(raw)) {
		return raw;
	}

	throw new Error(
		`[data-table-filter] [${column.id}] Either provide static options, a transformOptionFn, or ensure the column data conforms to ColumnOption type`,
	);
}

export function getFacetedUniqueValues<
	TData,
	TType extends ColumnDataType,
	TVal,
>(
	column: ColumnConfig<TData, TType, TVal>,
	values: string[] | ColumnOption[],
	strategy: FilterStrategy,
): Map<string, number> | undefined {
	if (!isAnyOf(column.type, ["option", "multiOption"])) {
		console.warn(
			"Faceted unique values can only be retrieved for option and multiOption columns",
		);

		return new Map<string, number>();
	}

	if (strategy === "server") {
		return column.facetedOptions;
	}

	const acc = new Map<string, number>();

	if (isColumnOptionArray(values)) {
		for (const option of values) {
			const curr = acc.get(option.value) ?? 0;
			acc.set(option.value, curr + 1);
		}
	} else {
		for (const option of values) {
			const curr = acc.get(option) ?? 0;
			acc.set(option, curr + 1);
		}
	}

	return acc;
}

export function getFacetedMinMaxValues<
	TData,
	TType extends ColumnDataType,
	TVal,
>(
	column: ColumnConfig<TData, TType, TVal>,
	data: TData[],
	strategy: FilterStrategy,
): [number, number] | undefined {
	if (column.type !== "number") return undefined;

	if (typeof column.min === "number" && typeof column.max === "number") {
		return [column.min, column.max];
	}

	if (strategy === "server") {
		return undefined;
	}

	const values = collectNumberAccessorValues(column, data);

	if (values.length === 0) {
		return [0, 0];
	}

	const min = Math.min(...values);
	const max = Math.max(...values);

	return [min, max];
}

function assignClientPrefetchMethods<TData>(
	column: Column<TData>,
	columnConfig: ColumnConfig<TData, any, any, any>,
	getOptions: () => ColumnOption[],
	getValues: () => ElementType<NonNullable<any>>[],
	getUniqueValues: () => Map<string, number> | undefined,
	getMinMaxValues: () => [number, number] | undefined,
) {
	column.prefetchOptions = async (): Promise<void> => {
		if (!column._prefetchedOptionsCache) {
			await new Promise((resolve) =>
				setTimeout(() => {
					const options = getOptions();
					column._prefetchedOptionsCache = options;
					resolve(undefined);
				}, 0),
			);
		}
	};

	column.prefetchValues = async (): Promise<void> => {
		if (!column._prefetchedValuesCache) {
			await new Promise((resolve) =>
				setTimeout(() => {
					const values = getValues();
					column._prefetchedValuesCache = values;
					resolve(undefined);
				}, 0),
			);
		}
	};

	column.prefetchFacetedUniqueValues = async (): Promise<void> => {
		if (!column._prefetchedFacetedUniqueValuesCache) {
			await new Promise((resolve) =>
				setTimeout(() => {
					const facetedMap = getUniqueValues();
					column._prefetchedFacetedUniqueValuesCache = facetedMap ?? null;
					resolve(undefined);
				}, 0),
			);
		}
	};

	column.prefetchFacetedMinMaxValues = async (): Promise<void> => {
		if (!column._prefetchedFacetedMinMaxValuesCache) {
			await new Promise((resolve) =>
				setTimeout(() => {
					const value = getMinMaxValues();
					column._prefetchedFacetedMinMaxValuesCache = value ?? null;
					resolve(undefined);
				}, 0),
			);
		}
	};

	void columnConfig;
}

function createColumn<TData>(
	data: TData[],
	columnConfig: ColumnConfig<TData, any, any, any>,
	strategy: FilterStrategy,
): Column<TData> {
	const getOptions: () => ColumnOption[] = memo(
		() => [data, strategy, columnConfig.options],
		([memoData, memoStrategy]) =>
			getColumnOptions(columnConfig, memoData as any, memoStrategy as any),
		{ key: `options-${columnConfig.id}` },
	);

	const getValues: () => ElementType<NonNullable<any>>[] = memo(
		() => [data, strategy],
		() => (strategy === "client" ? getColumnValues(columnConfig, data) : []),
		{ key: `values-${columnConfig.id}` },
	);

	const getUniqueValues: () => Map<string, number> | undefined = memo(
		() => [getValues(), strategy],
		([values, memoStrategy]) =>
			getFacetedUniqueValues(columnConfig, values as any, memoStrategy as any),
		{ key: `faceted-${columnConfig.id}` },
	);

	const getMinMaxValues: () => [number, number] | undefined = memo(
		() => [data, strategy],
		() => getFacetedMinMaxValues(columnConfig, data, strategy),
		{ key: `minmax-${columnConfig.id}` },
	);

	const column: Column<TData> = {
		...columnConfig,
		getOptions,
		getValues,
		getFacetedUniqueValues: getUniqueValues,
		getFacetedMinMaxValues: getMinMaxValues,
		prefetchOptions: async () => {},
		prefetchValues: async () => {},
		prefetchFacetedUniqueValues: async () => {},
		prefetchFacetedMinMaxValues: async () => {},
		_prefetchedOptionsCache: null,
		_prefetchedValuesCache: null,
		_prefetchedFacetedUniqueValuesCache: null,
		_prefetchedFacetedMinMaxValuesCache: null,
	};

	if (strategy === "client") {
		assignClientPrefetchMethods(
			column,
			columnConfig,
			getOptions,
			getValues,
			getUniqueValues,
			getMinMaxValues,
		);
	}

	return column;
}

export function createColumns<TData>(
	data: TData[],
	columnConfigs: ReadonlyArray<ColumnConfig<TData, any, any, any>>,
	strategy: FilterStrategy,
): Column<TData>[] {
	const columns: Column<TData>[] = [];

	for (const columnConfig of columnConfigs) {
		columns.push(createColumn(data, columnConfig, strategy));
	}

	return columns;
}
