import type { Control } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { OutlineMail } from "@/components/icons/icons";
import { AccountTypeSelector } from "@/components/layout/auth/account-type-select";
import { Button } from "@/components/ui/button";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import type { AccountType } from "@/types/auth/schema/accounts";
import type { RegisterData } from "@/types/auth/schema/register";

interface RegisterStepAccountProps {
	control: Control<RegisterData>;
	isStepValid: boolean;
	onNext: () => void;
	onAccountTypeChange: (accountType: AccountType) => void;
	emailRef: React.RefObject<HTMLInputElement | null>;
	isPending: boolean;
}

export function RegisterStepAccount({
	control,
	isStepValid,
	onNext,
	onAccountTypeChange,
	emailRef,
	isPending,
}: RegisterStepAccountProps) {
	const { t } = useTranslation();
	return (
		<div className={"space-y-2"}>
			<FormField
				control={control}
				name={"email"}
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("auth.email.label")}</FormLabel>
						<FormControl>
							<InputGroup>
								<InputGroupAddon>
									<OutlineMail />
								</InputGroupAddon>
								<InputGroupInput
									placeholder={t("auth.email.placeholder")}
									type={"email"}
									{...field}
									ref={(e) => {
										field.ref(e);
										if (emailRef)
											(
												emailRef as { current: HTMLInputElement | null }
											).current = e;
									}}
								/>
							</InputGroup>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={control}
				name="account_type"
				render={({ field }) => (
					<FormItem>
						<FormControl>
							<AccountTypeSelector
								value={field.value}
								onChange={onAccountTypeChange}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			<div className="flex gap-2">
				<Button
					type={"button"}
					onClick={onNext}
					disabled={!isStepValid || isPending}
					className={"w-full"}
					size={"lg"}
				>
					{t("auth.continue")}
				</Button>
			</div>
		</div>
	);
}
