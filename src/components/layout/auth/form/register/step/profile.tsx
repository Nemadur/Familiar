import { ProfileEditor } from "@/components/layout/profile/profile-editor";
import type { RefObject } from "react";

interface RegisterStepProfileProps {
	displayNameRef: RefObject<HTMLInputElement | null>;
}

export function RegisterStepProfile({
	displayNameRef,
}: RegisterStepProfileProps) {
	return (
		<ProfileEditor
			displayNameRef={displayNameRef}
			bioClassName="min-h-22"
		/>
	);
}