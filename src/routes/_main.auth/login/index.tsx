import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { GalleryVerticalEnd } from "lucide-react";
import { useTranslation } from "react-i18next";
import LoginForm from "@/components/layout/auth/form/login";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_main/auth/login/")({
	component: LoginPage,
});

function LoginPage() {
	const navigate = useNavigate();
	const { t } = useTranslation();

	return (
		<div className="grid h-[calc(100vh-6rem)] mt-2 lg:grid-cols-2">
			<div className="flex flex-col gap-4 p-6 md:p-10">
				<div className="flex flex-1 items-center justify-center">
					<div className="w-full max-w-md">
						<LoginForm
							onSuccess={() => navigate({ to: "/" })}
							onModeChange={() => navigate({ to: "/auth/register" })}
							onForgot={() => navigate({ to: "/auth/forgot" })}
						/>
						<p className="px-8 text-center text-sm text-muted-foreground mt-4">
							{t("auth.terms_agree.label")}{" "}
							<Button asChild variant={"link"}>
								<Link to="/terms">{t("auth.terms_agree.terms")}</Link>
							</Button>{" "}
							{t("auth.terms_agree.and")}{" "}
							<Button asChild variant={"link"}>
								<Link to="/privacy">{t("auth.terms_agree.privacy")}</Link>
							</Button>
							.
						</p>
					</div>
				</div>
			</div>
			<div className="bg-muted relative hidden lg:block rounded-4xl overflow-hidden">
				<img
					src="https://images.pexels.com/photos/1570264/pexels-photo-1570264.jpeg"
					alt="Familiar"
					className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
				/>
			</div>
		</div>
	)
}
