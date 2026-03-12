import { Button } from "@/components/ui/button";
import { OutlineCheck } from "@/components/icons/icons";

interface CommissionRequestFooterProps {
	totalPrice: number;
}

export function CommissionRequestFooter({
	totalPrice,
}: CommissionRequestFooterProps) {
	return (
		<div className="z-20 space-y-3 border-t bg-background p-4">
			<div className="flex items-center justify-between rounded-lg bg-secondary/10 px-4 py-2 lg:hidden">
				<div className="text-sm">
					<span className="text-muted-foreground">Estimated Total:</span>
				</div>
				<div className="font-bold text-lg text-primary">
					~USD {totalPrice.toFixed(2)}
				</div>
			</div>

			<div className="flex flex-col gap-2 rounded-xl border border-secondary  p-3 text-xs">
				<span className="font-semibold">Request as guest, or sign up to:</span>
				<div className="flex flex-wrap gap-x-4 gap-y-2">
					<div className="flex items-center gap-1.5">
						<OutlineCheck
							size={14}
							className="rounded-full bg-primary p-0.5 text-primary-foreground"
						/>
						<span>Track requests</span>
					</div>
					<div className="flex items-center gap-1.5">
						<OutlineCheck
							size={14}
							className="rounded-full bg-primary p-0.5 text-primary-foreground"
						/>
						<span>Follow artists</span>
					</div>
					<div className="flex items-center gap-1.5">
						<OutlineCheck
							size={14}
							className="rounded-full bg-primary p-0.5 text-primary-foreground"
						/>
						<span>Priority support</span>
					</div>
				</div>
			</div>
			<div className="flex w-full gap-3">
				<Button size="xl" className="flex-1" type="button">
					Sign up / login
				</Button>
				<Button size="xl" variant="outline" className="flex-1" type="submit">
					Request as Guest
				</Button>
			</div>
			<div className="px-4 text-center text-muted-foreground text-xs">
				By submitting a request, you agree to Terms of Service and acknowledge
				you've read our Privacy Policy.
			</div>
		</div>
	);
}
