// components/profile/profile-editor.tsx

import type { RefObject } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
    OutlineAt,
    OutlineEdit,
    OutlineTrash,
    OutlineUser,
} from "@/components/icons/icons";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import {
    Button,
    buttonVariants,
} from "@/components/ui/button";
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

export interface ProfileEditorValues {
    avatar_url?: string;
    cover_url?: string;
    display_name: string;
    username: string;
    bio?: string;
}

interface ProfileEditorProps {
    displayNameRef?: RefObject<HTMLInputElement | null>;
}

export function ProfileEditor({
    displayNameRef,
}: ProfileEditorProps) {
    const { t } = useTranslation();

    const {
        control,
        watch,
        setValue,
    } = useFormContext<ProfileEditorValues>();

    const watchedAvatar = watch("avatar_url");
    const watchedCover = watch("cover_url");
    const watchedDisplayName = watch("display_name");
    const watchedUsername = watch("username");

    const handleFileChange = (
        event: React.ChangeEvent<HTMLInputElement>,
        field: "avatar_url" | "cover_url",
    ) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        const reader = new FileReader();

        reader.onloadend = () => {
            setValue(field, reader.result as string, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
            });
        };

        reader.readAsDataURL(file);

        // Allow selecting the same file again.
        event.target.value = "";
    };

    return (
        <div className="space-y-6">
            {/* Visual profile preview */}
            <div className="relative w-full overflow-hidden">
                {/* Cover */}
                <div className="relative h-40 w-full overflow-hidden rounded-3xl bg-muted/50 sm:h-44 lg:h-48">
                    {watchedCover ? (
                        <img
                            src={watchedCover}
                            alt=""
                            className="size-full object-cover"
                        />
                    ) : (
                        <div className="flex size-full items-center justify-center text-xs text-muted-foreground/50">
                            {t(
                                "settings.profile.no_cover",
                                "No cover image",
                            )}
                        </div>
                    )}

                    <div className="absolute right-3 top-3 flex gap-2">
                        <label
                            htmlFor="profile-cover-upload"
                            aria-label={t(
                                "settings.profile.change_cover",
                                "Change cover image",
                            )}
                            className={cn(
                                buttonVariants({
                                    variant: "secondary",
                                    size: "icon-sm",
                                }),
                                "cursor-pointer rounded-full bg-background/90 backdrop-blur-sm",
                            )}
                        >
                            <OutlineEdit />

                            <input
                                id="profile-cover-upload"
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={(event) =>
                                    handleFileChange(
                                        event,
                                        "cover_url",
                                    )
                                }
                            />
                        </label>

                        {watchedCover && (
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon-sm"
                                aria-label={t(
                                    "settings.profile.remove_cover",
                                    "Remove cover image",
                                )}
                                className="rounded-full bg-destructive/90 backdrop-blur-sm hover:bg-destructive"
                                onClick={() =>
                                    setValue("cover_url", "", {
                                        shouldDirty: true,
                                    })
                                }
                            >
                                <OutlineTrash />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Avatar */}
                <div className="absolute left-4 top-28 sm:top-32 lg:top-36">
                    <div className="relative">
                        <Avatar className="size-24 ring-4 ring-background">
                            <AvatarImage
                                src={watchedAvatar}
                                alt={watchedDisplayName}
                            />

                            <AvatarFallback className="text-xl">
                                {watchedDisplayName
                                    ?.slice(0, 2)
                                    .toUpperCase() || "??"}
                            </AvatarFallback>
                        </Avatar>

                        <label
                            htmlFor="profile-avatar-upload"
                            aria-label={t(
                                "settings.profile.change_avatar",
                                "Change profile picture",
                            )}
                            className={cn(
                                buttonVariants({
                                    size: "icon-sm",
                                    variant: "secondary",
                                }),
                                "absolute -bottom-1 -right-1 cursor-pointer rounded-full border-3 border-background bg-secondary hover:bg-secondary/90",
                            )}
                        >
                            <OutlineEdit className="size-3.5" />

                            <input
                                id="profile-avatar-upload"
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={(event) =>
                                    handleFileChange(
                                        event,
                                        "avatar_url",
                                    )
                                }
                            />
                        </label>
                    </div>
                </div>

                {/* Profile identity */}
                <div className="px-4 pb-4 pt-16">
                    <p className="text-sm font-semibold">
                        {watchedDisplayName ||
                            t(
                                "settings.profile.display_name",
                                "Display name",
                            )}
                    </p>

                    <p className="text-xs text-muted-foreground">
                        @
                        {watchedUsername ||
                            t(
                                "settings.profile.username",
                                "username",
                            )}
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                <FormField
                    control={control}
                    name="display_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                {t(
                                    "auth.display_name.label",
                                    "Display name",
                                )}
                            </FormLabel>

                            <FormControl>
                                <InputGroup>
                                    <InputGroupAddon>
                                        <OutlineUser />
                                    </InputGroupAddon>

                                    <InputGroupInput
                                        placeholder={t(
                                            "auth.display_name.placeholder",
                                            "Display name",
                                        )}
                                        {...field}
                                        ref={(element) => {
                                            field.ref(element);

                                            if (
                                                displayNameRef
                                            ) {
                                                displayNameRef.current =
                                                    element;
                                            }
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
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                {t(
                                    "auth.username.label",
                                    "Username",
                                )}
                            </FormLabel>

                            <FormControl>
                                <InputGroup>
                                    <InputGroupAddon>
                                        <OutlineAt />
                                    </InputGroupAddon>

                                    <InputGroupInput
                                        placeholder={t(
                                            "auth.username.placeholder",
                                            "Username",
                                        )}
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
                            <FormLabel>
                                {t("auth.bio.label", "Bio")}
                            </FormLabel>

                            <FormControl>
                                <Textarea
                                    placeholder={t(
                                        "auth.bio.placeholder",
                                        "Tell us about yourself...",
                                    )}
                                    className="min-h-25 resize-none rounded-2xl"
                                    maxLength={160}
                                    {...field}
                                    value={field.value ?? ""}
                                />
                            </FormControl>

                            <div className="flex justify-end text-[10px] uppercase tracking-wider text-muted-foreground">
                                {field.value?.length ?? 0} / 160
                            </div>

                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
    );
}