import { Check } from "lucide-react";
import {
	Stepper,
	StepperIndicator,
	StepperItem,
	StepperNav,
	StepperSeparator,
	StepperTitle,
	StepperTrigger,
} from "@/components/reui/stepper";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TCommissionRequestStatus } from "@/types/commissions";

const REQUEST_STEPS: TCommissionRequestStatus[] = [
	TCommissionRequestStatus.Pending,
	TCommissionRequestStatus.Accepted,
	TCommissionRequestStatus.In_Progress,
	TCommissionRequestStatus.Delivered,
	// TCommissionRequestStatus.Completed,
];

function getStepLabel(status: TCommissionRequestStatus) {
	switch (status) {
		case TCommissionRequestStatus.Pending:
			return "Pending";
		case TCommissionRequestStatus.Accepted:
			return "Accepted";
		case TCommissionRequestStatus.In_Progress:
			return "In progress";
		case TCommissionRequestStatus.Delivered:
			return "Delivered";
		// case TCommissionRequestStatus.Completed:
		// 	return "Completed";
		case TCommissionRequestStatus.Cancelled:
			return "Cancelled";
		default:
			return "Unknown";
	}
}

function getStepIndex(status: TCommissionRequestStatus) {
	if (status === TCommissionRequestStatus.Cancelled) return -1;
	const index = REQUEST_STEPS.indexOf(status);
	return index === -1 ? 1 : index + 1;
}

export function RequestStatusStepper({
	status,
	className,
}: {
	status: TCommissionRequestStatus;
	className?: string;
}) {
	if (status === TCommissionRequestStatus.Cancelled) {
		return (
			<div
				aria-haspopup="false"
				className={cn(
					buttonVariants({ variant: "destructive", size: "xl" }),
					"border border-destructive/60 hover:bg-destructive/20!",
					className,
				)}
			>
				This request was cancelled
			</div>
		);
	}

	const currentStep = getStepIndex(status);

	return (
		<div className={cn("w-full", className)}>
			<Stepper value={currentStep} orientation="horizontal" className="w-full">
				<StepperNav className="flex w-full items-start">
					{REQUEST_STEPS.map((step, index) => {
						const stepNumber = index + 1;
						const isCompleted = stepNumber < currentStep;
						const isLast = index === REQUEST_STEPS.length - 1;

						return (
							<StepperItem
								key={step}
								step={stepNumber}
								completed={isCompleted}
								className={cn(
									"flex items-start",
									isLast ? "flex-none" : "flex-1",
								)}
							>
								<div className="flex w-full items-start">
									<StepperTrigger
										asChild
										className="group flex shrink-0 flex-col items-center gap-1"
									>
										<StepperIndicator>
											{isCompleted ? <Check className="size-3" /> : stepNumber}
										</StepperIndicator>

										<StepperTitle className="text-[11px]">
											{getStepLabel(step)}
										</StepperTitle>
									</StepperTrigger>

									{!isLast && (
										<StepperSeparator
											className={cn(
												"mt-3 w-full",
												stepNumber < currentStep ? "bg-primary" : "bg-border",
											)}
										/>
									)}
								</div>
							</StepperItem>
						);
					})}
				</StepperNav>
			</Stepper>
		</div>
	);
}
