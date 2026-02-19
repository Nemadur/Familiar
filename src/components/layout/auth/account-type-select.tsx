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
			<Label className={"font-medium text-sm"}>
				{t("auth.account_type.label")}
			</Label>

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
								"group relative w-full cursor-pointer rounded-xl border text-left transition-all",
								"p-2 sm:p-3",
								"focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 outline-none",
								selected
									? "border-blue-500 bg-blue-50/60 dark:bg-blue-950"
									: "border-border hover:border-blue-300 hover:bg-blue-50/40 dark:hover:bg-blue-950/40",
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
										"mt-0.5 flex relative size-5 items-center justify-center rounded-full border transition-all",
										selected
											? "border-blue-600 bg-blue-600 dark:border-blue-400 dark:bg-blue-400"
											: "border-border bg-background",
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
									<div className={"flex items-center gap-2"}>
										<span
											className={cn("font-medium", "text-sm sm:text-[0.95rem]")}
										>
											{opt.title}
										</span>
										{opt.key === "client" && (
											<Badge
												className={"bg-blue-100 text-[10px] text-blue-700"}
											>
												{t("auth.account_type.client_badge")}
											</Badge>
										)}
									</div>

									<p
										className={cn(
											"mt-1 text-muted-foreground text-xs leading-relaxed",
											selected
												? "text-secondary-foreground"
												: "text-muted-foreground",
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
