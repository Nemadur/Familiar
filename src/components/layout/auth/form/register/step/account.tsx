import { type RefObject, useState } from "react";
import type { Control } from "react-hook-form";
import { useTranslation } from "react-i18next";

import {
	OutlineEye,
	OutlineEyeOff,
	OutlineLock,
	OutlineMail,
} from "@/components/icons/icons";
import { AccountTypeSelector } from "@/components/layout/auth/account-type-select";
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
	InputGroupButton,
	InputGroupInput,
} from "@/components/ui/input-group";
import type { AccountType } from "@/types/auth/schema/accounts";
import type { RegisterData } from "@/types/auth/schema/register";

interface RegisterStepAccountProps {
	control: Control<RegisterData>;
	onAccountTypeChange: (accountType: AccountType) => void;
	emailRef: RefObject<HTMLInputElement | null>;
	showInviteKey: boolean;
}

export function RegisterStepAccount({
	control,
	onAccountTypeChange,
	emailRef,
	showInviteKey,
}: RegisterStepAccountProps) {
	const { t } = useTranslation();
	const [showPassword, setShowPassword] = useState(false);

	return (
		<div className="space-y-4">
			<FormField
				control={control}
				name="account_type"
				render={({ field }) => (
					<FormItem>
						<FormLabel>
							{t("auth.account_type.label", "Account Type")}
						</FormLabel>

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

			<FormField
				control={control}
				name="email"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("auth.email.label", "Email")}</FormLabel>

						<FormControl>
							<InputGroup>
								<InputGroupAddon>
									<OutlineMail />
								</InputGroupAddon>

								<InputGroupInput
									type="email"
									autoComplete="email"
									placeholder={t("auth.email.placeholder", "Email address")}
									{...field}
									ref={(element) => {
										field.ref(element);
										emailRef.current = element;
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
				name="password"
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("auth.password.label", "Password")}</FormLabel>

						<FormControl>
							<InputGroup>
								<InputGroupAddon>
									<OutlineLock />
								</InputGroupAddon>

								<InputGroupInput
									type={showPassword ? "text" : "password"}
									autoComplete="new-password"
									placeholder={t("auth.password.placeholder", "Password")}
									{...field}
								/>

								<InputGroupAddon align="inline-end" className="pr-3">
									<InputGroupButton
										type="button"
										variant="ghost"
										size="icon-xs"
										aria-label={
											showPassword
												? t("auth.password.hide", "Hide password")
												: t("auth.password.show", "Show password")
										}
										onClick={() => setShowPassword((current) => !current)}
									>
										{showPassword ? (
											<OutlineEyeOff className="text-muted-foreground" />
										) : (
											<OutlineEye className="text-muted-foreground" />
										)}
									</InputGroupButton>
								</InputGroupAddon>
							</InputGroup>
						</FormControl>

						<FormMessage />
					</FormItem>
				)}
			/>

			{showInviteKey && (
				<FormField
					control={control}
					name="invite_key"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("auth.invite_key.label", "Invite key")}</FormLabel>

							<FormControl>
								<InputGroup>
									<InputGroupAddon>
										{t("auth.invite_key.prefix", "FAM-")}
									</InputGroupAddon>

									<InputGroupInput
										className="-ml-2"
										autoComplete="off"
										placeholder={t(
											"auth.invite_key.placeholder",
											"FAM-XXXX-XXXX-XXX",
										).replace(t("auth.invite_key.prefix", "FAM-"), "")}
										{...field}
										value={field.value?.replace(/^FAM-/, "") ?? ""}
										onChange={(event) => {
											let input = event.target.value.toUpperCase();

											input = input.replace(/\s/g, "");
											input = input.replace(/FAM-?/g, "");
											input = input.replace(/[^0-9A-Z]/g, "");
											input = input.slice(0, 11);

											let formatted = input.slice(0, 4);

											if (input.length > 4) {
												formatted += `-${input.slice(4, 8)}`;
											}

											if (input.length > 8) {
												formatted += `-${input.slice(8, 11)}`;
											}

											field.onChange(
												input.length === 0 ? "" : `FAM-${formatted}`,
											);
										}}
										maxLength={13}
									/>
								</InputGroup>
							</FormControl>

							<FormMessage />
						</FormItem>
					)}
				/>
			)}
		</div>
	);
}
