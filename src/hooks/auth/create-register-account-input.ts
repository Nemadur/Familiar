import {
    AUTH_ROLES,
    type AuthRole,
    type RegisterAccountInput,
} from "@/api/auth/auth-types";
import { normalizeInviteKey } from "@/lib/invite-key";
import type { RegisterData } from "@/types/auth/schema/register";

function toOptionalString(value: string | null | undefined) {
    const normalized = value?.trim();
    return normalized || undefined;
}

function toAuthRole(accountType: RegisterData["account_type"]): AuthRole {
    const role = accountType.trim().toUpperCase();

    if (!AUTH_ROLES.includes(role as AuthRole)) {
        throw new Error(`Unsupported account type: ${accountType}`);
    }

    return role as AuthRole;
}

export function createRegisterAccountInput(
    data: RegisterData,
): RegisterAccountInput {
    return {
        request: {
            email: data.email.trim(),
            password: data.password,
            roleKey: toAuthRole(data.account_type),
            // The field may display only the body, but the API requires FAM-.
            // Normalizing here also protects against a schema/provider stripping it.
            inviteKey: normalizeInviteKey(data.invite_key),
            username: toOptionalString(data.username),
            displayName: toOptionalString(data.display_name),
            bio: toOptionalString(data.bio),
            socials: data.socials,
        },
        avatar: data.avatar,
        cover: data.cover,
    };
}
