import { Typography } from "@heroui/react";
import { Link } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { MOCK_BASKET_ITEMS } from "#/mock/shop";
import { OutlineTrash } from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsTablet } from "@/hooks/use-mobile";
import UserAvatar from "./profile/avatar";

export function BasketDropdown() {
	const isTablet = useIsTablet();
	const [open, setOpen] = useState(false);

	// Mock data for the basket
	const basketItems = MOCK_BASKET_ITEMS;

	const subtotal = basketItems.reduce((acc, item) => acc + item.price, 0);

	const TriggerButton = (
		<Button variant={"secondary"} size={"icon-xl"} className="relative">
			<ShoppingCart />
			{basketItems.length > 0 && (
				<span className="absolute top-0 right-0 flex size-2.5 items-center justify-center rounded-full bg-danger ring-3 ring-background" />
			)}
		</Button>
	);

	const BasketContent = (
		<div className="flex flex-col max-h-[85vh] lg:max-h-[80vh]">
			<div className="flex items-center justify-between pt-5 px-5">
				<Typography.Heading level={6}>Basket</Typography.Heading>
				<div className="flex items-center gap-2">
					<Typography.Paragraph size={"sm"} className="text-muted-foreground">
						{basketItems.length} item{basketItems.length !== 1 ? "s" : ""} from
					</Typography.Paragraph>
					<UserAvatar user={basketItems[0]?.author} size="sm" />
				</div>
			</div>

			<div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
				{basketItems.map((item) => (
					<div
						key={item.id}
						className="flex gap-3 hover:bg-secondary/30 p-2 items-center rounded-2xl transition-colors duration-75"
					>
						<img
							src={item.image}
							alt={item.title}
							className="size-12 rounded-xl object-cover shrink-0"
						/>
						<div className="flex flex-col flex-1 min-w-0">
							<div className="flex justify-between items-start gap-3">
								<Typography.Heading
									level={6}
									className="line-clamp-1 uppercase"
								>
									{item.title}
								</Typography.Heading>
							</div>
							<div className="mt-auto flex items-center gap-2">
								{/* ITEM TYPE (if available to choose) for example: color variant */}
								<Typography.Paragraph
									size={"xs"}
									className="text-muted-foreground!"
								>
									#{item.id}
								</Typography.Paragraph>
								<Typography.Paragraph
									size={"xs"}
									className="whitespace-nowrap font-medium"
								>
									{item.currency} {item.price.toFixed(2)}
								</Typography.Paragraph>
							</div>
						</div>
						<Button variant={"destructive"} size={"icon-lg"}>
							<OutlineTrash />
						</Button>
					</div>
				))}
			</div>

			<div className="p-3 border-t space-y-6">
				<div className="flex items-end justify-between">
					<div className="flex flex-col">
						<Typography.Heading level={6}>Subtotal</Typography.Heading>
						<Typography.Paragraph
							size={"xs"}
							className="text-muted-foreground!"
						>
							Sales tax calculated at checkout
						</Typography.Paragraph>
					</div>
					<Typography.Heading level={5}>
						PLN {subtotal.toFixed(2)}
					</Typography.Heading>
				</div>

				<Button
					size="xl"
					className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-full"
					asChild
					onClick={() => setOpen(false)}
				>
					<Link to="/basket" preload={false}>
						Checkout
					</Link>
				</Button>
			</div>
		</div>
	);

	if (isTablet) {
		return (
			<Drawer open={open} onOpenChange={setOpen}>
				<DrawerTrigger asChild>{TriggerButton}</DrawerTrigger>
				<DrawerContent className="p-0 overflow-hidden">
					{BasketContent}
				</DrawerContent>
			</Drawer>
		);
	}

	return (
		<DropdownMenu open={open} onOpenChange={setOpen}>
			<DropdownMenuTrigger asChild>{TriggerButton}</DropdownMenuTrigger>
			<DropdownMenuContent
				className="w-sm p-0 overflow-hidden rounded-3xl"
				align="center"
				sideOffset={8}
			>
				{BasketContent}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
