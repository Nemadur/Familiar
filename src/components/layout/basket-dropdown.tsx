import { Typography } from "@heroui/react";
import { Link } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { MOCK_BASKET_ITEMS } from "@/api/shop/mock";
import { OutlineTrash } from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
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

	return (
		<DropdownMenu open={open} onOpenChange={setOpen}>
			<DropdownMenuTrigger asChild>
				<Button variant={"secondary"} size={"icon-xl"} className="relative">
					<ShoppingCart />
					{basketItems.length > 0 && (
						<span className="absolute top-1 right-1 flex size-2 items-center justify-center rounded-full bg-red-500 text-[10px] text-white" />
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className="w-96 p-0 overflow-hidden rounded-3xl"
				align="end"
				sideOffset={8}
			>
				<div className="flex flex-col max-h-[80vh]">
					<div className="flex items-center justify-between p-4 border-b border-border">
						<Typography.Heading level={4}>Basket</Typography.Heading>
						<div className="flex items-center gap-2">
							<Typography.Paragraph
								size={"sm"}
								className="text-muted-foreground"
							>
								{basketItems.length} item{basketItems.length !== 1 ? "s" : ""}{" "}
								from
							</Typography.Paragraph>
							<UserAvatar user={basketItems[0]?.author} size="sm" />
						</div>
					</div>

					<div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
						{basketItems.map((item) => (
							<div key={item.id} className="flex gap-4">
								<img
									src={item.image}
									alt={item.title}
									className="size-14 rounded-xl object-cover shrink-0"
								/>
								<div className="flex flex-col flex-1 min-w-0">
									<div className="flex justify-between items-start gap-4">
										<Typography.Heading level={6} className="line-clamp-2">
											{item.title}
										</Typography.Heading>
										<Typography.Paragraph className="whitespace-nowrap">
											{item.currency} {item.price.toFixed(2)}
										</Typography.Paragraph>
									</div>
									<div className="mt-auto flex items-center justify-between">
										<Typography.Paragraph
											size={"sm"}
											className="text-muted-foreground"
										>
											#{item.id}
										</Typography.Paragraph>
										<Button variant={"destructive"} size={"icon"}>
											<OutlineTrash />
										</Button>
									</div>
								</div>
							</div>
						))}
					</div>

					<div className="p-4 border-t space-y-6">
						<div className="flex items-end justify-between">
							<div className="flex flex-col">
								<Typography.Heading level={6}>Subtotal</Typography.Heading>
								<Typography.Paragraph
									size={"sm"}
									className="text-muted-foreground"
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
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
