import type { Control } from "react-hook-form";
import { useTranslation } from "react-i18next";
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
import type { RegisterData } from "@/types/auth/schema/register";

interface RegisterStepSecurityProps {
	control: Control<RegisterData>;
	showInviteKey: boolean;
}

export function RegisterStepSecurity({
	control,
	showInviteKey,
}: RegisterStepSecurityProps) {
	const { t } = useTranslation();

	if (!showInviteKey) return null;

	return (
		<div className="space-y-4">
			<FormField
				control={control}
				name="invite_key"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("auth.invite_key.label")}</FormLabel>
						<FormControl>
							<InputGroup>
								<InputGroupAddon>{t("auth.invite_key.prefix")}</InputGroupAddon>
								<InputGroupInput
									className="-ml-2"
									placeholder={t("auth.invite_key.placeholder").replace(
										t("auth.invite_key.prefix"),
										"",
									)}
									{...field}
									value={field.value?.replace(/^FAM-/, "") || ""}
									onChange={(e) => {
										let input = e.target.value.toUpperCase();
										input = input.replace(/\s/g, "");
										input = input.replace(/FAM-?/g, "");
										input = input.replace(/[^0-9A-Z]/g, "");

										let formatted = "";
										if (input.length > 0) formatted += input.slice(0, 4);
										if (input.length > 4) formatted += `-${input.slice(4, 8)}`;
										if (input.length > 8) formatted += `-${input.slice(8, 11)}`;

										field.onChange(
											input.length === 0 ? "" : `FAM-${formatted}`,
										);
									}}
									maxLength={32}
								/>
							</InputGroup>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		</div>
	);
}
