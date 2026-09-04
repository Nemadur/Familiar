import { useMemo, useState } from "react";
import {
	type Control,
	type FieldPath,
	useFormContext,
	useWatch,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { RegistrationSocialPlatform } from "@/api/auth/auth-types";
import { OutlineTrash } from "@/components/icons/icons";
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
	InputGroupText,
} from "@/components/ui/input-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { RegisterData } from "@/types/auth/schema/register";

interface RegisterStepSocialsProps {
	control: Control<RegisterData>;
}

type SocialPlatformOption =
	| Exclude<RegistrationSocialPlatform, "website_1" | "website_2">
	| "website";

const WEBSITE_PLATFORMS = ["website_1", "website_2"] as const;

const SOCIAL_PLATFORMS = {
	twitter: {
		label: "Twitter / X",
		prefix: "x.com/",
		placeholder: "username",
	},
	instagram: {
		label: "Instagram",
		prefix: "instagram.com/",
		placeholder: "username",
	},
	facebook: {
		label: "Facebook",
		prefix: "facebook.com/",
		placeholder: "username",
	},
	website_1: {
		label: "Website",
		prefix: "https://",
		placeholder: "example.com",
	},
	website_2: {
		label: "Website",
		prefix: "https://",
		placeholder: "example.com",
	},
} satisfies Record<
	RegistrationSocialPlatform,
	{ label: string; prefix: string; placeholder: string }
>;

const SOCIAL_PLATFORM_OPTIONS = [
	["twitter", SOCIAL_PLATFORMS.twitter],
	["instagram", SOCIAL_PLATFORMS.instagram],
	["facebook", SOCIAL_PLATFORMS.facebook],
	["website", SOCIAL_PLATFORMS.website_1],
] as const satisfies ReadonlyArray<
	readonly [
		SocialPlatformOption,
		(typeof SOCIAL_PLATFORMS)[RegistrationSocialPlatform],
	]
>;

function normalizeSocialValue(
	value: string,
	platform: RegistrationSocialPlatform,
) {
	let normalizedValue = value.trimStart().replace(/^https?:\/\/(www\.)?/i, "");

	if (platform === "website_1" || platform === "website_2") {
		return normalizedValue;
	}

	const prefix = SOCIAL_PLATFORMS[platform].prefix;
	if (normalizedValue.toLowerCase().startsWith(prefix.toLowerCase())) {
		normalizedValue = normalizedValue.slice(prefix.length);
	}

	return normalizedValue.replace(/^@/, "");
}

export function RegisterStepSocials({ control }: RegisterStepSocialsProps) {
	const { t } = useTranslation();
	const { setValue } = useFormContext<RegisterData>();
	const [selectedPlatform, setSelectedPlatform] = useState<
		SocialPlatformOption | ""
	>("");
	const watchedSocials = useWatch({ control, name: "socials" });
	const socials = watchedSocials ?? {};
	const selectedSocials = Object.entries(socials) as Array<
		[RegistrationSocialPlatform, string]
	>;
	const availablePlatforms = useMemo(
		() =>
			SOCIAL_PLATFORM_OPTIONS.filter(([platform]) => {
				if (platform === "website") {
					return WEBSITE_PLATFORMS.some(
						(websitePlatform) => !Object.hasOwn(socials, websitePlatform),
					);
				}

				return !Object.hasOwn(socials, platform);
			}),
		[socials],
	);

	const addSocial = () => {
		if (!selectedPlatform) {
			return;
		}

		const platform =
			selectedPlatform === "website"
				? WEBSITE_PLATFORMS.find(
					(websitePlatform) => !Object.hasOwn(socials, websitePlatform),
				)
				: selectedPlatform;

		if (!platform || Object.hasOwn(socials, platform)) {
			return;
		}

		setValue(
			"socials",
			{ ...socials, [platform]: "" },
			{
				shouldDirty: true,
				shouldTouch: true,
			},
		);
		setSelectedPlatform("");
	};

	const removeSocial = (platform: RegistrationSocialPlatform) => {
		const nextSocials = { ...socials };
		delete nextSocials[platform];

		setValue("socials", nextSocials, {
			shouldDirty: true,
			shouldTouch: true,
			shouldValidate: true,
		});
	};

	return (
		<div className="space-y-5">
			<div className="space-y-2">
				<FormLabel>{t("auth.socials.add_label", "Add profile link")}</FormLabel>
				<div className="flex items-center gap-2">
					<Select
						value={selectedPlatform}
						onValueChange={(value) =>
							setSelectedPlatform(value as SocialPlatformOption)
						}
						disabled={availablePlatforms.length === 0}
					>
						<SelectTrigger className="min-w-0 flex-1">
							<SelectValue
								placeholder={t(
									"auth.socials.select_placeholder",
									"Select a platform",
								)}
							/>
						</SelectTrigger>
						<SelectContent>
							{availablePlatforms.map(([platform, config]) => (
								<SelectItem key={platform} value={platform}>
									{config.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Button
						type="button"
						size="xl"
						variant="secondary"
						onClick={addSocial}
						disabled={!selectedPlatform}
					>
						{t("auth.socials.add", "Add")}
					</Button>
				</div>

				<p className="text-xs text-muted-foreground">
					{t(
						"auth.socials.description",
						"Add up to five links supported by the registration API.",
					)}
				</p>
			</div>

			{selectedSocials.length === 0 ? (
				<div className="rounded-2xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
					{t("auth.socials.empty", "No profile links added yet.")}
				</div>
			) : null}

			<div className="space-y-4">
				{selectedSocials.map(([platform]) => {
					const config = SOCIAL_PLATFORMS[platform];
					const fieldName = `socials.${platform}` as FieldPath<RegisterData>;

					return (
						<FormField
							key={platform}
							control={control}
							name={fieldName}
							render={({ field }) => (
								<FormItem>
									<div className="flex items-center justify-between gap-3">
										<FormLabel>{config.label}</FormLabel>
										<Button
											type="button"
											variant="destructive_ghost"
											size="icon"
											aria-label={t(
												"auth.socials.remove",
												"Remove profile link",
											)}
											onClick={() => removeSocial(platform)}
										>
											<OutlineTrash />
										</Button>
									</div>

									<FormControl>
										<InputGroup>
											<InputGroupAddon>
												<InputGroupText>{config.prefix}</InputGroupText>
											</InputGroupAddon>
											<InputGroupInput
												placeholder={config.placeholder}
												autoComplete="off"
												{...field}
												value={
													typeof field.value === "string" ? field.value : ""
												}
												onChange={(event) =>
													field.onChange(
														normalizeSocialValue(event.target.value, platform),
													)
												}
											/>
										</InputGroup>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					);
				})}
			</div>
		</div>
	);
}
