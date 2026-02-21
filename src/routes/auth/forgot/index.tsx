import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { GalleryVerticalEnd } from "lucide-react";
import { useTranslation } from "react-i18next";
import ForgotForm from "@/components/layout/auth/form/forgot";

export const Route = createFileRoute("/auth/forgot/")({
	component: ForgotPage,
});

function ForgotPage() {
	const navigate = useNavigate();
	// const { t } = useTranslation();

	return (
		<div className="grid h-[calc(100vh-6rem)] mt-2 lg:grid-cols-2">
			<div className="flex flex-col gap-4 p-6 md:p-10">
				<div className="flex flex-1 items-center justify-center">
					<div className="w-full max-w-md">
						<ForgotForm
							onSuccess={() => {}}
							onModeChange={() => navigate({ to: "/auth/login" })}
						/>
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
	);
}
