import { useTranslation } from "react-i18next";
import { SolidCheck } from "@/components/icons/icons";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { AccountTypeSelectorProps } from "@/types/auth/form/account-type-selector";
import type { AccountType } from "@/types/auth/schema/accounts";

export function AccountTypeSelector({
	value,
	onChange,
}: AccountTypeSelectorProps) {
	const { t } = useTranslation();

	const OPTIONS: Array<{
		key: AccountType;
		title: string;
		description: string;
	}> = [
		{
			key: "client",
			title: t("auth.account_type.client_title"),
			description: t("auth.account_type.client_description"),
		},
		{
			key: "artist",
			title: t("auth.account_type.artist_title"),
			description: t("auth.account_type.artist_description"),
		},
	];
	return (
		<div className={"space-y-3"}>
			{/* radiogroup container */}
			<div
				role="radiogroup"
				aria-label="Account Type"
				className={"flex flex-col gap-3"}
			>
				{OPTIONS.map((opt) => {
					const selected = value === opt.key;
					return (
						<label
							key={opt.key}
							className={cn(
								"group relative w-full cursor-pointer rounded-2xl border p-2 text-left outline-none transition-all sm:p-3",

								// Shared keyboard focus state
								"has-focus-visible:ring-2 has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-background",

								selected
									? [
											"border-blue-500! bg-blue-50 dark:bg-blue-950",

											// Focus when selected
											"has-focus-visible:border-blue-600",
											"has-focus-visible:ring-blue-500/40",
											"dark:has-focus-visible:border-blue-300",
											"dark:has-focus-visible:ring-blue-300/30",
										]
									: [
											"border-border hover:border-blue-300! hover:bg-blue-50",
											"dark:hover:border-blue-900! dark:hover:bg-blue-950/50",

											// Focus when not selected
											"has-focus-visible:border-input",
											"has-focus-visible:ring-input/50",
										],
							)}
						>
							<input
								type="radio"
								name="accountType"
								value={opt.key}
								checked={selected}
								onChange={() => onChange(opt.key)}
								className={"sr-only"}
							/>
							{/* subtle animated border glow when selected */}
							<span
								className={cn(
									"pointer-events-none absolute inset-0 rounded-xl transition-opacity",
								)}
								aria-hidden
							/>

							<div className={"flex items-start gap-3"}>
								{/* custom radio mark */}
								<span
									className={cn(
										"mt-0.5 flex relative size-5 items-center justify-center rounded-full border transition-all duraton-75",
										selected
											? "border-blue-600! bg-blue-600 dark:border-blue-400 dark:bg-blue-400"
											: "border-border group-hover:border-blue-700! group-hover:dark:border-blue-300!",
									)}
									aria-hidden
								>
									{selected && (
										<SolidCheck
											size={13}
											className={
												"absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-50 dark:text-blue-950"
											}
										/>
									)}
								</span>

								<div className={"flex-1"}>
									<div className={"flex items-center justify-between gap-2"}>
										<span
											className={cn(
												"font-medium",
												selected
													? "text-blue-950 dark:text-blue-50"
													: "text-primary group-hover:text-blue-950 group-hover:dark:text-blue-50",
												"text-sm sm:text-[0.95rem]",
											)}
										>
											{opt.title}
										</span>
										{opt.key === "client" && (
											<Badge
												size={"sm"}
												className={
													"bg-blue-100 text-blue-700 dark:bg-blue-800/30 dark:text-blue-300"
												}
											>
												{t("auth.account_type.client_badge")}
											</Badge>
										)}
									</div>

									<p
										className={cn(
											"mt-1 text-muted-foreground text-xs leading-relaxed",
											selected
												? "text-blue-700 dark:text-blue-300"
												: "text-muted-foreground group-hover:text-blue-700 group-hover:dark:text-blue-300 ",
										)}
									>
										{opt.description}
									</p>
								</div>
							</div>
						</label>
					);
				})}
			</div>
		</div>
	);
}
