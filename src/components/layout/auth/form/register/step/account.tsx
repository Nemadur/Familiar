import { useState } from "react";
import type { Control } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
	OutlineEye,
	OutlineEyeOff,
	OutlineLock,
	OutlineMail,
} from "@/components/icons/icons";
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
	InputGroupButton,
	InputGroupInput,
} from "@/components/ui/input-group";
import type { AccountType } from "@/types/auth/schema/accounts";
import type { RegisterData } from "@/types/auth/schema/register";

interface RegisterStepAccountProps {
	control: Control<RegisterData>;
	onAccountTypeChange: (accountType: AccountType) => void;
	emailRef: React.RefObject<HTMLInputElement | null>;
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
						<FormLabel>{t("auth.email.label")}</FormLabel>
						<FormControl>
							<InputGroup>
								<InputGroupAddon>
									<OutlineMail />
								</InputGroupAddon>
								<InputGroupInput
									placeholder={t("auth.email.placeholder")}
									type="email"
									{...field}
									ref={(e) => {
										field.ref(e);
										emailRef.current = e;
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
						<FormLabel>{t("auth.password.label")}</FormLabel>
						<FormControl>
							<InputGroup>
								<InputGroupAddon>
									<OutlineLock />
								</InputGroupAddon>
								<InputGroupInput
									placeholder={t("auth.password.placeholder")}
									type={showPassword ? "text" : "password"}
									{...field}
								/>
								<InputGroupAddon align="inline-end" className="pr-3">
									<InputGroupButton
										type="button"
										variant="ghost"
										size="icon-xs"
										onClick={() => setShowPassword((prev) => !prev)}
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
							<FormLabel>{t("auth.invite_key.label")}</FormLabel>
							<FormControl>
								<InputGroup>
									<InputGroupAddon>
										{t("auth.invite_key.prefix")}
									</InputGroupAddon>
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
										maxLength={32}
									/>
								</InputGroup>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			)}

			{/* <Button
				type="button"
				onClick={onNext}
				disabled={!isStepValid || isPending}
				className="w-full"
				size="lg"
			>
				{t("auth.continue")}
			</Button> */}
		</div>
	);
}
