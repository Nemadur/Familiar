import { useRef } from "react";
import type { Control } from "react-hook-form";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
	OutlineAt,
	OutlineEdit,
	OutlineTrash,
	OutlineUser,
} from "@/components/icons/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
} from "@/components/ui/input-group";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { RegisterData } from "@/types/auth/schema/register";

interface RegisterStepIdentityProps {
	control: Control<RegisterData>;
	displayNameRef: React.RefObject<HTMLInputElement | null>;
}

export function RegisterStepProfile({
	control,
	displayNameRef,
}: RegisterStepIdentityProps) {
	const { t } = useTranslation();
	const { watch, setValue } = useFormContext<RegisterData>();

	const watchedAvatar = watch("avatar_url");
	const watchedCover = watch("cover_url");
	const watchedDisplayName = watch("display_name");

	const handleFileChange = (
		event: React.ChangeEvent<HTMLInputElement>,
		field: "avatar_url" | "cover_url",
	) => {
		const file = event.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setValue(field, reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	return (
		<div className="space-y-6">
			{/* Visual Profile Preview */}
			<div className="relative w-full overflow-hidden">
				{/* Cover */}
				<div className="relative h-32 w-full bg-muted/50 rounded-3xl overflow-hidden">
					{watchedCover ? (
						<img
							src={watchedCover}
							alt="Cover"
							className="h-full w-full object-cover "
						/>
					) : (
						<div className="h-full w-full flex items-center justify-center text-muted-foreground/30 text-xs">
							No Cover
						</div>
					)}
					<div className="absolute flex gap-2 top-2 right-2">
						<label
							htmlFor="cover-upload"
							className={cn(
								buttonVariants({ variant: "secondary", size: "icon-sm" }),
							)}
						>
							<OutlineEdit />
							<input
								id="cover-upload"
								type="file"
								accept="image/*"
								className="hidden"
								onChange={(e) => handleFileChange(e, "cover_url")}
							/>
						</label>
						<Button
							type="button"
							variant={"destructive"}
							size={"icon-sm"}
							className={"bg-danger-soft-hover text-danger hover:bg-danger/30"}
							onClick={() => setValue("cover_url", "")}
						>
							<OutlineTrash />
						</Button>
					</div>
				</div>

				{/* Avatar */}
				<div className="absolute top-20 left-4">
					<div className="relative">
						<Avatar className="size-20 ring-4 ring-background">
							<AvatarImage src={watchedAvatar} alt={watchedDisplayName} />
							<AvatarFallback className="text-xl">
								{watchedDisplayName?.slice(0, 2).toUpperCase() || "??"}
							</AvatarFallback>
						</Avatar>
						<label
							htmlFor="avatar-upload"
							className={cn(
								buttonVariants({ size: "icon-sm", variant: "secondary" }),
								"absolute -bottom-1.5 -right-1.5 border-3 border-background bg-secondary hover:bg-secondary/90",
							)}
						>
							<OutlineEdit className="size-3.5" />
							<input
								id="avatar-upload"
								type="file"
								accept="image/*"
								className="hidden"
								onChange={(e) => handleFileChange(e, "avatar_url")}
							/>
						</label>
					</div>
				</div>

				<div className="pt-10 pb-4 px-4">
					<div className="text-sm font-medium">
						{watchedDisplayName || "Display Name"}
					</div>
					<div className="text-xs text-muted-foreground">
						@{watch("username") || "username"}
					</div>
				</div>
			</div>

			<div className="space-y-4">
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
					name={"bio"}
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("auth.bio.label", "Bio")}</FormLabel>
							<FormControl>
								{/* TODO: use same BioEditor component like in user profile settings */}
								<Textarea
									placeholder={t(
										"auth.bio.placeholder",
										"Tell us about yourself...",
									)}
									className="min-h-[100px] resize-none rounded-2xl"
									maxLength={160}
									{...field}
								/>
							</FormControl>
							<div className="flex justify-end text-[10px] text-muted-foreground uppercase tracking-wider">
								{field.value?.length || 0} / 160
							</div>
							<FormMessage />
						</FormItem>
					)}
				/>
			</div>
		</div>
	);
}
