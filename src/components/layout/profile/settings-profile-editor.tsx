import { Typography } from "@heroui/react";
import { useForm } from "@tanstack/react-form";
import { type ChangeEvent, type RefObject, useEffect, useId } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import {
    OutlineAt,
    OutlineEdit,
    OutlineTrash,
    OutlineUser,
} from "@/components/icons/icons";
import type { ProfileEditorValues } from "@/components/layout/profile/profile-editor";
import UserAvatar from "@/components/layout/profile/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
    InputGroupTextArea,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";
import type { TUserProfile } from "@/types/user";

const profileSettingsSchema = z.object({
    avatar_url: z.string().optional(),
    cover_url: z.string().optional(),
    display_name: z
        .string()
        .trim()
        .min(2, "Display name must be at least 2 characters.")
        .max(50, "Display name must be at most 50 characters."),
    username: z
        .string()
        .trim()
        .min(3, "Username must be at least 3 characters.")
        .max(30, "Username must be at most 30 characters.")
        .regex(
            /^[a-zA-Z0-9_+.-]+$/,
            "Username can only contain letters, numbers, dots, dashes, underscores, and plus signs.",
        ),
    bio: z.string().max(160, "Bio must be at most 160 characters.").optional(),
    accent_color: z.string().optional(),
});

const EMPTY_PROFILE_VALUES: ProfileEditorValues = {
    avatar_url: "",
    cover_url: "",
    display_name: "",
    username: "",
    bio: "",
    accent_color: "",
};

interface SettingsProfileEditorProps {
    initialValues?: ProfileEditorValues;
    displayNameRef?: RefObject<HTMLInputElement | null>;
    bioClassName?: string;
    onSubmit?: (values: ProfileEditorValues) => void | Promise<void>;
}

export function SettingsProfileEditor({
    initialValues,
    displayNameRef,
    bioClassName,
    onSubmit,
}: SettingsProfileEditorProps) {
    const { t } = useTranslation();
    const uploadId = useId();
    const avatarUploadId = `${uploadId}-avatar`;
    const coverUploadId = `${uploadId}-cover`;
    const form = useForm({
        defaultValues: initialValues ?? EMPTY_PROFILE_VALUES,
        validators: {
            onSubmit: profileSettingsSchema,
        },
        onSubmit: async ({ value }) => {
            await onSubmit?.(value);
        },
    });

    useEffect(() => {
        form.reset(initialValues ?? EMPTY_PROFILE_VALUES);
    }, [form, initialValues]);

    function handleFileChange(
        event: ChangeEvent<HTMLInputElement>,
        field: "avatar_url" | "cover_url",
    ) {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            form.setFieldValue(field, reader.result as string);
        };
        reader.readAsDataURL(file);
        event.target.value = "";
    }

    return (
        <form
            id="profile-settings-form"
            onSubmit={(event) => {
                event.preventDefault();
                void form.handleSubmit();
            }}
        >
            <form.Subscribe selector={(state) => state.values}>
                {(values) => {
                    const previewUser = {
                        avatarPath: values.avatar_url || undefined,
                        displayName: values.display_name || "",
                        username: values.username || "",
                        accentColor: values.accent_color || undefined,
                    } as TUserProfile;

                    return (
                        <div className="flex flex-col gap-6">
                            <div className="relative w-full overflow-hidden">
                                <div className="relative h-40 w-full overflow-hidden rounded-3xl bg-surface-3 sm:h-44 lg:h-48">
                                    {values.cover_url ? (
                                        <img
                                            src={values.cover_url}
                                            alt=""
                                            className="size-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex size-full items-center justify-center text-xs text-muted-foreground/50">
                                            {t("settings.profile.no_cover", "No cover image")}
                                        </div>
                                    )}

                                    <div className="absolute right-3 top-3 flex gap-2">
                                        <label
                                            htmlFor={coverUploadId}
                                            aria-label={t(
                                                "settings.profile.change_cover",
                                                "Change cover image",
                                            )}
                                            className={cn(
                                                buttonVariants({ variant: "secondary", size: "icon" }),
                                                "bg-surface-2 hover:bg-surface-2/90",
                                            )}
                                        >
                                            <OutlineEdit />
                                            <input
                                                id={coverUploadId}
                                                type="file"
                                                accept="image/*"
                                                className="sr-only"
                                                onChange={(event) =>
                                                    handleFileChange(event, "cover_url")
                                                }
                                            />
                                        </label>

                                        {values.cover_url ? (
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                aria-label={t(
                                                    "settings.profile.remove_cover",
                                                    "Remove cover image",
                                                )}
                                                onClick={() => form.setFieldValue("cover_url", "")}
                                            >
                                                <OutlineTrash />
                                            </Button>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="absolute bottom-16 left-4">
                                    <div className="relative">
                                        <UserAvatar
                                            user={previewUser}
                                            size="2xl"
                                            hasOutline
                                            className="ring-surface-2"
                                        />

                                        <label
                                            htmlFor={avatarUploadId}
                                            aria-label={t(
                                                "settings.profile.change_avatar",
                                                "Change profile picture",
                                            )}
                                            className={cn(
                                                buttonVariants({ size: "icon", variant: "secondary" }),
                                                "absolute -bottom-1 -right-1 bg-surface-3 ring-3 ring-surface-3 hover:bg-surface-3/90",
                                            )}
                                        >
                                            <OutlineEdit />
                                            <input
                                                id={avatarUploadId}
                                                type="file"
                                                accept="image/*"
                                                className="sr-only"
                                                onChange={(event) =>
                                                    handleFileChange(event, "avatar_url")
                                                }
                                            />
                                        </label>
                                    </div>
                                </div>

                                <div className="px-4 pb-4 pt-16">
                                    <Typography.Paragraph size="sm" className="font-semibold">
                                        {values.display_name ||
                                            t("settings.profile.display_name", "Display name")}
                                    </Typography.Paragraph>
                                    <Typography.Paragraph
                                        size="xs"
                                        className="text-muted-foreground!"
                                    >
                                        @
                                        {values.username ||
                                            t("settings.profile.username", "username")}
                                    </Typography.Paragraph>
                                </div>
                            </div>

                            <FieldGroup>
                                <form.Field
                                    name="display_name"
                                    children={(field) => {
                                        const isInvalid =
                                            field.state.meta.isTouched && !field.state.meta.isValid;

                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel htmlFor={field.name}>
                                                    {t("auth.display_name.label", "Display name")}
                                                </FieldLabel>
                                                <InputGroup>
                                                    <InputGroupAddon>
                                                        <OutlineUser />
                                                    </InputGroupAddon>
                                                    <InputGroupInput
                                                        id={field.name}
                                                        name={field.name}
                                                        value={field.state.value}
                                                        onBlur={field.handleBlur}
                                                        onChange={(event) =>
                                                            field.handleChange(event.target.value)
                                                        }
                                                        aria-invalid={isInvalid}
                                                        placeholder={t(
                                                            "auth.display_name.placeholder",
                                                            "Display name",
                                                        )}
                                                        ref={displayNameRef}
                                                    />
                                                </InputGroup>
                                                {isInvalid ? (
                                                    <FieldError errors={field.state.meta.errors} />
                                                ) : null}
                                            </Field>
                                        );
                                    }}
                                />

                                <form.Field
                                    name="username"
                                    children={(field) => {
                                        const isInvalid =
                                            field.state.meta.isTouched && !field.state.meta.isValid;

                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel htmlFor={field.name}>
                                                    {t("auth.username.label", "Username")}
                                                </FieldLabel>
                                                <InputGroup>
                                                    <InputGroupAddon>
                                                        <OutlineAt />
                                                    </InputGroupAddon>
                                                    <InputGroupInput
                                                        id={field.name}
                                                        name={field.name}
                                                        value={field.state.value}
                                                        onBlur={field.handleBlur}
                                                        onChange={(event) =>
                                                            field.handleChange(event.target.value)
                                                        }
                                                        aria-invalid={isInvalid}
                                                        placeholder={t(
                                                            "auth.username.placeholder",
                                                            "Username",
                                                        )}
                                                    />
                                                </InputGroup>
                                                {isInvalid ? (
                                                    <FieldError errors={field.state.meta.errors} />
                                                ) : null}
                                            </Field>
                                        );
                                    }}
                                />

                                <form.Field
                                    name="bio"
                                    children={(field) => {
                                        const isInvalid =
                                            field.state.meta.isTouched && !field.state.meta.isValid;

                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel htmlFor={field.name}>
                                                    {t("auth.bio.label", "Bio")}
                                                </FieldLabel>
                                                <InputGroup className="rounded-2xl">
                                                    <InputGroupTextArea
                                                        id={field.name}
                                                        name={field.name}
                                                        value={field.state.value ?? ""}
                                                        onBlur={field.handleBlur}
                                                        onChange={(event) =>
                                                            field.handleChange(event.target.value)
                                                        }
                                                        aria-invalid={isInvalid}
                                                        className={bioClassName}
                                                        placeholder={t(
                                                            "auth.bio.placeholder",
                                                            "Tell us about yourself...",
                                                        )}
                                                        maxLength={160}
                                                    />
                                                </InputGroup>
                                                <p className="text-right text-xs tabular-nums text-muted-foreground">
                                                    {field.state.value?.length ?? 0} / 160
                                                </p>
                                                {isInvalid ? (
                                                    <FieldError errors={field.state.meta.errors} />
                                                ) : null}
                                            </Field>
                                        );
                                    }}
                                />
                            </FieldGroup>
                        </div>
                    );
                }}
            </form.Subscribe>
        </form>
    );
}