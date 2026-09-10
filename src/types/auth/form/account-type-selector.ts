import type { ComponentPropsWithoutRef } from "react";
import type { AccountType } from "../schema/accounts";

interface AccountTypeSelectorProps
	extends Omit<ComponentPropsWithoutRef<"div">, "onChange"> {
	value: AccountType;
	onChange: (value: AccountType) => void;
}

export type { AccountTypeSelectorProps };
