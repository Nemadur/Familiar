import type { ChangeEvent, InputHTMLAttributes } from "react";
import { useMemo } from "react";
import { Input } from "src/components/ui/input";
import { debounce } from "../lib/debounce";

export function DebouncedInput({
	value: externalValue,
	onChange,
	debounceMs = 500,
	...props
}: {
	value: string | number;
	onChange: (value: string | number) => void;
	debounceMs?: number;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "onChange">) {
	const debouncedOnChange = useMemo(
		() =>
			debounce((nextValue: string | number) => {
				onChange(nextValue);
			}, debounceMs),
		[onChange, debounceMs],
	);

	const updateDebouncedInputValue = (event: ChangeEvent<HTMLInputElement>) => {
		debouncedOnChange(event.target.value);
	};

	return (
		<Input
			{...props}
			key={`${typeof externalValue}:${externalValue}`}
			defaultValue={externalValue}
			onChange={updateDebouncedInputValue}
		/>
	);
}
