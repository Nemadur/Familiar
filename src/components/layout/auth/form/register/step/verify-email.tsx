import { useTranslation } from "react-i18next";

import {
	OutlineCheckmarkSeal,
	OutlineMail,
	OutlineRefreshCw,
} from "@/components/icons/icons";
import { EmptyPage } from "@/components/layout/empty-page";
import { Button } from "@/components/ui/button";

interface RegisterStepVerifyEmailProps {
	email: string;
	isChecking: boolean;
	isVerified: boolean;
	onCheck: () => void;
}

export function RegisterStepVerifyEmail({
	email,
	isChecking,
	isVerified,
	onCheck,
}: RegisterStepVerifyEmailProps) {
	const { t } = useTranslation();

	return (
		<EmptyPage
			icon={isVerified ? OutlineCheckmarkSeal : OutlineMail}
			title={
				isVerified
					? t("auth.register.verify.verified_title", "Email confirmed")
					: t("auth.register.verify.title", "Please verify your email")
			}
			description={
				isVerified
					? t(
							"auth.register.verify.verified_description",
							"Your account is ready. You can safely close this page.",
						)
					: t(
							"auth.register.verify.description",
							"We sent a confirmation link to the email address below.",
						)
			}
			className="min-h-75 p-0"
			iconContainerClassName={isVerified ? "bg-success/12" : undefined}
			iconClassName={isVerified ? "text-success-foreground" : undefined}
			contentClassName="gap-3"
			aria-live="polite"
		>
			{!isVerified ? (
				<>
					<p className="break-all text-sm font-medium">{email}</p>

					<p className="text-center text-xs text-muted-foreground">
						{t(
							"auth.register.verify.waiting",
							"Open the link in the email. This page will update automatically, and you may also check again manually.",
						)}
					</p>

					<Button
						type="button"
						variant="outline"
						size="xl"
						onClick={onCheck}
						disabled={isChecking}
					>
						<OutlineRefreshCw
							className={isChecking ? "animate-spin" : undefined}
						/>
						{t("auth.register.verify.check_again", "Check again")}
					</Button>
				</>
			) : null}
		</EmptyPage>
	);
}
