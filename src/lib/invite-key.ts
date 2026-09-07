export const INVITE_KEY_PREFIX = "FAM-";

const INVITE_KEY_BODY_LENGTH = 11;

function sanitizeInviteKeyBody(value: string | null | undefined) {
    return (value ?? "")
        .trim()
        .toUpperCase()
        .replace(/\s/g, "")
        .replace(/^FAM-?/, "")
        .replace(/[^0-9A-Z]/g, "")
        .slice(0, INVITE_KEY_BODY_LENGTH);
}

function formatInviteKeyBody(body: string) {
    const parts = [body.slice(0, 4), body.slice(4, 8), body.slice(8, 11)];
    return parts.filter(Boolean).join("-");
}

export function getInviteKeyInputValue(value: string | null | undefined) {
    return formatInviteKeyBody(sanitizeInviteKeyBody(value));
}

export function normalizeInviteKey(value: string | null | undefined) {
    const body = sanitizeInviteKeyBody(value);

    if (!body) {
        return undefined;
    }

    return `${INVITE_KEY_PREFIX}${formatInviteKeyBody(body)}`;
}
