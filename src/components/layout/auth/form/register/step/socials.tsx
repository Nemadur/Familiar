import { useMemo, useState } from "react";
import {
	type Control,
	type FieldPath,
	useFormContext,
	useWatch,
} from "react-hook-form";
import { useTranslation } from "react-i18next";

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

const MAX_SOCIALS = 5;

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
	discord: {
		label: "Discord",
		placeholder: "username",
	},
	tiktok: {
		label: "TikTok",
		prefix: "tiktok.com/@",
		placeholder: "username",
	},
	youtube: {
		label: "YouTube",
		prefix: "youtube.com/@",
		placeholder: "channel",
	},
	twitch: {
		label: "Twitch",
		prefix: "twitch.tv/",
		placeholder: "username",
	},
	facebook: {
		label: "Facebook",
		prefix: "facebook.com/",
		placeholder: "username",
	},
	linkedin: {
		label: "LinkedIn",
		prefix: "linkedin.com/in/",
		placeholder: "username",
	},
	github: {
		label: "GitHub",
		prefix: "github.com/",
		placeholder: "username",
	},
	behance: {
		label: "Behance",
		prefix: "behance.net/",
		placeholder: "username",
	},
	dribbble: {
		label: "Dribbble",
		prefix: "dribbble.com/",
		placeholder: "username",
	},
	pinterest: {
		label: "Pinterest",
		prefix: "pinterest.com/",
		placeholder: "username",
	},
	website: {
		label: "Website",
		prefix: "https://",
		placeholder: "example.com",
	},
} as const;

type SocialPlatform = keyof typeof SOCIAL_PLATFORMS;
type SocialsValue = Partial<Record<SocialPlatform, string>>;

const SOCIAL_PLATFORM_ENTRIES = Object.entries(
	SOCIAL_PLATFORMS,
) as Array<
	[
		SocialPlatform,
		(typeof SOCIAL_PLATFORMS)[SocialPlatform],
	]
>;

export function RegisterStepSocials({
	control,
}: RegisterStepSocialsProps) {
	const { t } = useTranslation();
	const { setValue } = useFormContext<RegisterData>();

	const [selectedPlatform, setSelectedPlatform] = useState<
		SocialPlatform | ""
	>("");

	const watchedSocials = useWatch({
		control,
		name: "socials",
	});

	const socials = (watchedSocials ?? {}) as SocialsValue;
	const selectedSocials = Object.entries(socials) as Array<
		[SocialPlatform, string]
	>;

	const availablePlatforms = useMemo(
		() =>
			SOCIAL_PLATFORM_ENTRIES.filter(
				([platform]) =>
					!Object.prototype.hasOwnProperty.call(
						socials,
						platform,
					),
			),
		[socials],
	);

	const hasReachedLimit =
		selectedSocials.length >= MAX_SOCIALS;

	const addSocial = () => {
		if (
			!selectedPlatform ||
			hasReachedLimit ||
			Object.hasOwn(
				socials,
				selectedPlatform,
			)
		) {
			return;
		}

		setValue(
			"socials",
			{
				...socials,
				[selectedPlatform]: "",
			},
			{
				shouldDirty: true,
				shouldTouch: true,
				shouldValidate: false,
			},
		);

		setSelectedPlatform("");
	};

	const removeSocial = (platform: SocialPlatform) => {
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
				<FormLabel>
					{t(
						"auth.socials.add_label",
						"Add social media",
					)}
				</FormLabel>

				<div className="flex items-center gap-2">
					<Select
						value={selectedPlatform}
						onValueChange={(value) =>
							setSelectedPlatform(
								value as SocialPlatform,
							)
						}
						disabled={
							hasReachedLimit ||
							availablePlatforms.length === 0
						}
					>
						<SelectTrigger className="min-w-0 flex-1">
							<SelectValue
								placeholder={t(
									"auth.socials.select_placeholder",
									"Select social media",
								)}
							/>
						</SelectTrigger>

						<SelectContent>
							{availablePlatforms.map(
								([platform, config]) => (
									<SelectItem
										key={platform}
										value={platform}
									>
										{config.label}
									</SelectItem>
								),
							)}
						</SelectContent>
					</Select>

					<Button
						type="button"
						size={"xl"}
						variant="secondary"
						onClick={addSocial}
						disabled={
							!selectedPlatform ||
							hasReachedLimit
						}
					>
						{t("auth.socials.add", "Add")}
					</Button>
				</div>

				<div className="flex items-center justify-between text-xs text-muted-foreground">
					<span>
						{t(
							"auth.socials.description",
							"Add usernames without the complete URL.",
						)}
					</span>

					<span>
						{selectedSocials.length}/{MAX_SOCIALS}
					</span>
				</div>
			</div>

			{selectedSocials.length === 0 && (
				<div className="rounded-2xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
					{t(
						"auth.socials.empty",
						"No social media added yet.",
					)}
				</div>
			)}

			<div className="space-y-4">
				{selectedSocials.map(([platform]) => {
					const config =
						SOCIAL_PLATFORMS[platform];

					const fieldName =
						`socials.${platform}` as FieldPath<RegisterData>;

					return (
						<FormField
							key={platform}
							control={control}
							name={fieldName}
							render={({ field }) => (
								<FormItem>
									<div className="flex items-center justify-between gap-3">
										<FormLabel>
											{config.label}
										</FormLabel>

										<Button
											type="button"
											variant={"destructive_ghost"}
											size="icon"
											aria-label={t(
												"auth.socials.remove",
												"Remove social media",
											)}
											onClick={() =>
												removeSocial(
													platform,
												)
											}
										>
											<OutlineTrash />
										</Button>
									</div>

									<FormControl>
										<InputGroup>
											{"prefix" in config &&
												config.prefix && (
													<InputGroupAddon>
														<InputGroupText>
															{
																config.prefix
															}
														</InputGroupText>
													</InputGroupAddon>
												)}

											<InputGroupInput
												placeholder={
													config.placeholder
												}
												autoComplete="off"
												{...field}
												value={
													typeof field.value ===
														"string"
														? field.value
														: ""
												}
												onChange={(
													event,
												) => {
													let value =
														event
															.target
															.value;

													if (
														platform !==
														"website"
													) {
														value =
															value.replace(
																/^@/,
																"",
															);
													}

													field.onChange(
														value,
													);
												}}
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