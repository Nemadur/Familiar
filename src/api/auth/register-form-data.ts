import { normalizeInviteKey } from "@/lib/invite-key";

import type { RegisterAccountInput } from "./auth-types";

function appendOptionalFile(
	formData: FormData,
	field: "avatar" | "cover",
	file: File | null | undefined,
) {
	if (!file || file.size === 0) {
		return;
	}

	formData.append(field, file, file.name);
}

export function createRegisterFormData({
	request,
	avatar,
	cover,
}: RegisterAccountInput) {
	const formData = new FormData();
	const normalizedRequest = {
		...request,
		inviteKey: normalizeInviteKey(request.inviteKey),
	};

	formData.append("request", JSON.stringify(normalizedRequest));

	appendOptionalFile(formData, "avatar", avatar);
	appendOptionalFile(formData, "cover", cover);

	return formData;
}
