import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ShopItemModal } from "@/components/layout/modal/shop-item";

export const Route = createFileRoute("/{-$locale}/_main/shop/$id")({
	component: ShopItemRoute,
});

function ShopItemRoute() {
	const { id, locale } = Route.useParams();
	const navigate = useNavigate();

	const handleClose = () =>
		navigate({
			to: "/{-$locale}/shop",
			params: { locale },
			replace: true,
			resetScroll: false,
			search: (old) => old,
		});

	return (
		<ShopItemModal
			itemId={id}
			open={true}
			onOpenChange={(open) => {
				if (!open) handleClose();
			}}
		/>
	);
}
