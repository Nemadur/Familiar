import { createFileRoute } from "@tanstack/react-router";
import { UserSettingsPanel } from "@/components/layout/modal/profile/settings/settings-modal";
import { Elevated } from "@/lib/elevated";

export const Route = createFileRoute("/{-$locale}/_main/settings/profile")({
	component: RouteComponent,
});

function RouteComponent() {
	const handleSave = () => {
		// TODO: Connect this to the settings API.
	};

	return (
		<Elevated offset={1} className="flex min-h-0 flex-1 rounded-3xl">
			<UserSettingsPanel
				// className="min-h-[calc(100dvh-4rem)] w-full"
				onSave={handleSave}
			/>
		</Elevated>
	);
}
