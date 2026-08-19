// components/profile/profile-editor.tsx

import { Typography } from "@heroui/react";
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
    InputGroupTextArea,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";
import { Elevated } from "@/lib/elevated";
import UserAvatar from "./avatar";

export interface ProfileEditorValues {
    avatar_url?: string;
    cover_url?: string;
    display_name: string;
    username: string;
    bio?: string;
}

interface ProfileEditorProps {
    displayNameRef?: RefObject<HTMLInputElement | null>;
    bioClassName?: string;
}

export function ProfileEditor({
    displayNameRef,
    bioClassName,
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
                <div className="relative bg-surface-3 shadow-none! h-40 w-full overflow-hidden rounded-3xl sm:h-44 lg:h-48">
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
                                    size: "icon",
                                }),
                                "bg-surface-2",
                                "hover:bg-surface-2/90",
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
                                size="icon"
                                aria-label={t(
                                    "settings.profile.remove_cover",
                                    "Remove cover image",
                                )}
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
                        <UserAvatar className={"ring-surface-2"} size={"2xl"} hasOutline user={undefined} />

                        <label
                            htmlFor="profile-avatar-upload"
                            aria-label={t(
                                "settings.profile.change_avatar",
                                "Change profile picture",
                            )}
                            className={cn(
                                buttonVariants({
                                    size: "icon",
                                    variant: "secondary",
                                }),
                                "absolute -bottom-1 -right-1 ring-3 ring-surface-3 bg-surface-3 hover:bg-surface-3/90",
                            )}
                        >
                            {/* TODO: add remove avatar button like in cover */}
                            <OutlineEdit />

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
                    <Typography.Paragraph size={"sm"} className="font-semibold">
                        {watchedDisplayName ||
                            t(
                                "settings.profile.display_name",
                                "Display name",
                            )}
                    </Typography.Paragraph>

                    <Typography.Paragraph size={"xs"} className="text-muted-foreground!">
                        @
                        {watchedUsername ||
                            t(
                                "settings.profile.username",
                                "username",
                            )}
                    </Typography.Paragraph>
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
                                <InputGroup className="rounded-2xl">
                                    <InputGroupTextArea className={bioClassName} placeholder={t(
                                        "auth.bio.placeholder",
                                        "Tell us about yourself...",
                                    )} {...field} />
                                </InputGroup>
                            </FormControl>

                            <Typography.Paragraph size={"xs"} className="flex justify-end uppercase tracking-wider text-muted-foreground!">
                                {field.value?.length ?? 0} / 160
                                {/* TODO: get max length from backend */}
                            </Typography.Paragraph>

                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
    );
}