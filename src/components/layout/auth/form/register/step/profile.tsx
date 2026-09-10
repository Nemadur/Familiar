import { useEffect, useId, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
	OutlineAt,
	OutlineEdit,
	OutlineTrash,
	OutlineUser,
} from "@/components/icons/icons";
import { Button, buttonVariants } from "@/components/ui/button";
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
	InputGroupTextArea,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";
import type { RegisterData } from "@/types/auth/schema/register";

const ACCEPTED_IMAGE_TYPES =
	"image/jpeg,image/png,image/webp,image/bmp,image/tiff";

function useFilePreview(file: File | null | undefined) {
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);

	useEffect(() => {
		if (!file) {
			setPreviewUrl(null);
			return;
		}

		const objectUrl = URL.createObjectURL(file);
		setPreviewUrl(objectUrl);

		return () => URL.revokeObjectURL(objectUrl);
	}, [file]);

	return previewUrl;
}

export function RegisterStepProfile() {
	const { t } = useTranslation();
	const uploadId = useId();
	const {
		control,
		setValue,
		watch,
		formState: { errors },
	} = useFormContext<RegisterData>();
	const avatar = watch("avatar");
	const cover = watch("cover");
	const displayName = watch("display_name");
	const username = watch("username");
	const bio = watch("bio");
	const avatarPreview = useFilePreview(avatar);
	const coverPreview = useFilePreview(cover);
	const mediaError = errors.cover?.message ?? errors.avatar?.message;

	const handleFileChange = (
		event: React.ChangeEvent<HTMLInputElement>,
		field: "avatar" | "cover",
	) => {
		const file = event.target.files?.[0] ?? null;

		setValue(field, file, {
			shouldDirty: true,
			shouldTouch: true,
			shouldValidate: true,
		});
		event.target.value = "";
	};

	return (
		<div className="space-y-4">
			<div>
				<h3 className="font-medium">
					{t("auth.register.profile.title", "Profile details")}
				</h3>
				<p className="mt-1 text-sm text-muted-foreground">
					{t(
						"auth.register.profile.description",
						"Choose how your public profile will appear.",
					)}
				</p>
			</div>

			<div className="relative">
				<div
					className={cn(
						"relative h-36 w-full overflow-hidden rounded-3xl border bg-surface-3",
						errors.cover &&
							"border-destructive ring-3 ring-destructive/20 dark:ring-destructive/40",
					)}
				>
					{coverPreview ? (
						<img
							src={coverPreview}
							alt={t("auth.register.images.cover_preview", "Cover preview")}
							className="size-full object-cover"
						/>
					) : (
						<div className="flex size-full items-center justify-center text-xs text-muted-foreground">
							{t("auth.register.images.no_cover", "No cover image")}
						</div>
					)}

					<div className="absolute right-3 top-3 flex gap-2">
						<label
							htmlFor={`${uploadId}-cover`}
							aria-label={t(
								"auth.register.images.change_cover",
								"Choose cover image",
							)}
							className={cn(
								buttonVariants({ variant: "secondary", size: "icon" }),
								"bg-surface-2 hover:bg-surface-2/90",
							)}
						>
							<OutlineEdit />
							<input
								id={`${uploadId}-cover`}
								type="file"
								accept={ACCEPTED_IMAGE_TYPES}
								className="sr-only"
								onChange={(event) => handleFileChange(event, "cover")}
							/>
						</label>

						{cover ? (
							<Button
								type="button"
								variant="destructive"
								size="icon"
								aria-label={t(
									"auth.register.images.remove_cover",
									"Remove cover image",
								)}
								onClick={() =>
									setValue("cover", null, {
										shouldDirty: true,
										shouldTouch: true,
									})
								}
							>
								<OutlineTrash />
							</Button>
						) : null}
					</div>
				</div>

				<div className="relative min-h-20 px-4 pb-4 pt-3">
					<div className="absolute -top-10 left-4">
						<div className="relative size-20">
							<div
								className={cn(
									"flex size-full items-center justify-center overflow-hidden rounded-full bg-surface-3 ring-3 ring-surface-2",
									errors.avatar && "ring-destructive",
								)}
							>
								{avatarPreview ? (
									<img
										src={avatarPreview}
										alt={t(
											"auth.register.images.avatar_preview",
											"Avatar preview",
										)}
										className="size-full object-cover"
									/>
								) : (
									<OutlineUser className="size-8 text-muted-foreground" />
								)}
							</div>

							<label
								htmlFor={`${uploadId}-avatar`}
								aria-label={t(
									"auth.register.images.choose_avatar",
									"Choose avatar",
								)}
								className={cn(
									buttonVariants({ variant: "secondary", size: "icon" }),
									"absolute -bottom-1 -right-1 bg-surface-3 hover:bg-surface-3",
								)}
							>
								<OutlineEdit />
								<input
									id={`${uploadId}-avatar`}
									type="file"
									accept={ACCEPTED_IMAGE_TYPES}
									className="sr-only"
									onChange={(event) => handleFileChange(event, "avatar")}
								/>
							</label>

							{avatar ? (
								<Button
									type="button"
									variant="destructive"
									size="icon"
									className="absolute -bottom-1 -left-1"
									aria-label={t(
										"auth.register.images.remove_avatar",
										"Remove avatar",
									)}
									onClick={() =>
										setValue("avatar", null, {
											shouldDirty: true,
											shouldTouch: true,
										})
									}
								>
									<OutlineTrash />
								</Button>
							) : null}
						</div>
					</div>

					<div className="ml-24 min-w-0">
						<p className="truncate text-sm font-semibold">
							{displayName || t("auth.display_name.placeholder", "Your name")}
						</p>
						<p className="truncate text-xs text-muted-foreground">
							@{username || t("auth.username.placeholder", "username")}
						</p>
					</div>
				</div>

				<p className="line-clamp-2 min-h-14 break-words px-4 pb-4 text-sm text-muted-foreground">
					{bio || "\u00a0"}
				</p>

				{mediaError ? (
					<p className="px-4 pb-4 text-sm text-destructive" role="alert">
						{String(mediaError)}
					</p>
				) : null}
			</div>

			<div className="space-y-4">
				<FormField
					control={control}
					name="display_name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								{t("auth.display_name.label", "Display name")}
							</FormLabel>
							<FormControl>
								<InputGroup>
									<InputGroupAddon>
										<OutlineUser />
									</InputGroupAddon>
									<InputGroupInput
										placeholder={t(
											"auth.display_name.placeholder",
											"Your name",
										)}
										maxLength={100}
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
					name="username"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("auth.username.label", "Username")}</FormLabel>
							<FormControl>
								<InputGroup>
									<InputGroupAddon>
										<OutlineAt />
									</InputGroupAddon>
									<InputGroupInput
										placeholder={t("auth.username.placeholder", "username")}
										maxLength={32}
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
					name="bio"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("auth.bio.label", "Bio")}</FormLabel>
							<FormControl>
								<InputGroup className="rounded-2xl">
									<InputGroupTextArea
										className="h-22 min-h-22 max-h-22 resize-none overflow-y-auto"
										placeholder={t(
											"auth.bio.placeholder",
											"Tell us about yourself...",
										)}
										maxLength={150}
										{...field}
									/>
								</InputGroup>
							</FormControl>
							<p className="text-right text-xs text-muted-foreground">
								{field.value.length} / 150
							</p>
							<FormMessage />
						</FormItem>
					)}
				/>
			</div>
		</div>
	);
}
