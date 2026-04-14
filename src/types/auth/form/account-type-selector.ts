import type { AccountType } from "../schema/accounts";

interface AccountTypeSelectorProps {
  value: AccountType
  onChange: (value: AccountType) => void
}

export type { AccountTypeSelectorProps }
