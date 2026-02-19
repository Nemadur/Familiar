import { useState } from "react";
import type { Control } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
	OutlineArrowLeft,
	OutlineAt,
	OutlineEye,
	OutlineEyeOff,
	OutlineLock,
	OutlineLockOpen,
	OutlineUser,
} from "@/components/icons/icons";
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
import type { RegisterData } from "@/types/auth/schema/register";

interface RegisterStepProfileProps {
	control: Control<RegisterData>;
	isStepValid: boolean;
	isPending: boolean;
	onBack: () => void;
	showInviteKey: boolean;
	displayNameRef: React.RefObject<HTMLInputElement | null>;
}

export function RegisterStepProfile({
	control,
	isStepValid,
	isPending,
	onBack,
	showInviteKey,
	displayNameRef,
}: RegisterStepProfileProps) {
	const [showPassword, setShowPassword] = useState(false);
	const { t } = useTranslation();

	return (
		<div className="space-y-2">
			<FormField
				control={control}
				name={"display_name"}
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("auth.display_name.label")}</FormLabel>
						<FormControl>
							<InputGroup>
								<InputGroupAddon>
									<OutlineUser />
								</InputGroupAddon>
								<InputGroupInput
									placeholder={t("auth.display_name.placeholder")}
									{...field}
									ref={(e) => {
										field.ref(e);
										if (displayNameRef)
											(
												displayNameRef as { current: HTMLInputElement | null }
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
				name={"username"}
				render={({ field }) => (
					<FormItem>
						<FormLabel>{t("auth.username.label")}</FormLabel>
						<FormControl>
							<InputGroup>
								<InputGroupAddon>
									<OutlineAt />
								</InputGroupAddon>
								<InputGroupInput
									placeholder={t("auth.username.placeholder")}
									{...field}
								/>
							</InputGroup>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={control}
				name={"password"}
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
								<InputGroupAddon align="inline-end" className={"pr-3"}>
									<InputGroupButton
										type={"button"}
										variant={"ghost"}
										size={"icon-xs"}
										onClick={() => setShowPassword(!showPassword)}
									>
										{showPassword ? (
											<OutlineEyeOff className={"text-muted-foreground"} />
										) : (
											<OutlineEye className={"text-muted-foreground"} />
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
					name={"invite_key"}
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("auth.invite_key.label")}</FormLabel>
							<FormControl>
								<InputGroup>
									<InputGroupAddon>
										{t("auth.invite_key.prefix")}
									</InputGroupAddon>
									<InputGroupInput
										className={"-ml-2"}
										placeholder={t("auth.invite_key.placeholder").replace(
											t("auth.invite_key.prefix"),
											"",
										)}
										{...field}
										value={field.value?.replace(/^FAM-/, "") || ""}
										onChange={(e) => {
											let input = e.target.value.toUpperCase();

											// Handle copy-paste with prefix
											input = input.replace(/^FAM-?/, "");

											// Keep only Hex characters
											input = input.replace(/[^0-9A-F]/g, "");

											// Format with dashes: XXXX-XXXX-XXX
											let formatted = "";
											if (input.length > 0) formatted += input.slice(0, 4);
											if (input.length > 4)
												formatted += `-${input.slice(4, 8)}`;
											if (input.length > 8)
												formatted += `-${input.slice(8, 11)}`;

											// Update form value with full FAM- prefix
											field.onChange(
												input.length === 0 ? "" : `FAM-${formatted}`,
											);
										}}
										maxLength={17} // Allow pasting full FAM- code (17 chars) but logic truncates to 13 visible
									/>
								</InputGroup>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			)}

			<div className={"flex items-center gap-2"}>
				<Button type={"button"} variant={"ghost"} size={"lg"} onClick={onBack}>
					<OutlineArrowLeft />
					{t("auth.back")}
				</Button>
				<Button
					type="submit"
					disabled={isPending || !isStepValid}
					className={"flex-1"}
					size={"lg"}
				>
					{isPending
						? t("auth.create_account.pending")
						: t("auth.create_account.cta")}
				</Button>
			</div>
		</div>
	);
}
