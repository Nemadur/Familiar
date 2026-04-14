import { ScrollShadow } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Option } from "@/components/layout/commision/form-blocks";
import { QuickMath } from "@/components/layout/commision/quick-math";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { useCommission } from "@/hooks/use-commisions";
import { useUserById } from "@/hooks/use-user";
import { calculateCommissionPricing } from "@/lib/commission-utils";
import type { TCommission } from "@/types/commissions";
import type { TUserResponse } from "@/types/user";
import { CommissionRequestFields } from "./commission-request/fields";
import { CommissionRequestFooter } from "./commission-request/footer";
import { CommissionRequestHeader } from "./commission-request/header";
import { CommissionRequestIntroBox } from "./commission-request/intro-box";
import { type FormValues, formSchema } from "./commission-request/types";

// FIXME: OPTIMZE RERENDERING ISSUES

interface CommissionRequestModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onBack: () => void;
	commissionId: string;
	initialLicenses?: string[];
}

export function CommissionRequestModal({
	open,
	onOpenChange,
	onBack,
	commissionId,
	initialLicenses = ["personal"],
}: CommissionRequestModalProps) {
	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			email: "",
			username: "",
			discord: "",
			twitter: "",
			instagram: "",
			telegram: "",
			licenses: initialLicenses,
			sharing: "yes",
			sharingOther: "",
			customOption: "",
			extraInfo: "",
			termsAccepted: false,
			marketing: false,
		},
	});

	const { control, handleSubmit, watch } = form;
	const watchedValues = watch();

	// Fetch commission
	const {
		data: commission,
		isPending: isCommissionPending,
		error: commissionError,
	} = useCommission(commissionId);

	useEffect(() => {
		if (commissionError) {
			console.error(
				"[CommissionRequestModal] Error fetching commission:",
				commissionError,
			);
		}
	}, [commissionError]);

	// Fetch Commission Artist
	const {
		user: artist,
		isPending: isArtistPending,
		error: artistError,
	} = useUserById(commission?.artistId);

	useEffect(() => {
		if (artistError) {
			console.error(
				"[CommissionRequestModal] Error fetching artist:",
				artistError,
			);
		}
	}, [artistError]);

	const { basePrice, originalPrice } = calculateCommissionPricing(
		commission?.basePrice || 0,
		commission?.discountRate || 0,
	);

	// Default options if not provided by the item
	const defaultLicenseOptions: Option[] = [
		{
			id: "personal",
			label: "Personal",
			price: 0,
			description: "Included",
			disabled: true,
		},
		{
			id: "monetized",
			label: "Monetized content",
			price: 50,
			disabled: false,
		},
		{
			id: "commercial",
			label: "Commercial merchandising",
			price: 150,
			disabled: false,
		},
	];

	const defaultSharingOptions: Option[] = [
		{ id: "yes", label: "Yes" },
		{ id: "wip", label: "Not while WIP but final work is ok" },
		{
			id: "nda",
			label: "NDA required (privacy fee)",
			price: 100,
		},
		{ id: "other", label: "Other", hasInput: true },
	];

	const demoCustomOptions: Option[] = [
		{ id: "minimalist", label: "Minimalist", price: 18.1 },
		{ id: "blank", label: "Blank" },
		{ id: "self", label: "Self-Provide" },
	];

	const licenseOptions = (
		commission?.licenseOptions || defaultLicenseOptions
	).map((opt) => ({
		...opt,
		disabled: opt.included !== undefined,
	}));
	const sharingOptions = (
		commission?.sharingOptions || defaultSharingOptions
	).map((opt) => ({
		...opt,
		disabled: opt.included !== undefined,
	}));
	const customOptions = (commission?.customOptions || demoCustomOptions).map(
		(opt) => ({
			...opt,
			disabled: opt.included !== undefined,
		}),
	);

	const getOptionPrice = (option: Option) => {
		if (option.price !== undefined) return option.price;
		if (option.pricePercentage !== undefined)
			return basePrice * (option.pricePercentage / 100);
		return 0;
	};

	const selectedLicensesPrice = licenseOptions
		.filter((opt) => watchedValues.licenses?.includes(opt.id))
		.reduce((acc, opt) => acc + getOptionPrice(opt), 0);

	const selectedSharingPrice = sharingOptions.find(
		(opt) => opt.id === watchedValues.sharing,
	)
		? getOptionPrice(
				sharingOptions.find((opt) => opt.id === watchedValues.sharing)!,
			)
		: 0;

	const selectedCustomOptionPrice = customOptions.find(
		(opt) => opt.id === watchedValues.customOption,
	)
		? getOptionPrice(
				customOptions.find((opt) => opt.id === watchedValues.customOption)!,
			)
		: 0;

	const totalPrice =
		basePrice +
		selectedLicensesPrice +
		selectedSharingPrice +
		selectedCustomOptionPrice;

	const quickMathItems = [
		...(selectedLicensesPrice > 0
			? [{ label: "Licenses", value: selectedLicensesPrice }]
			: []),
		...(selectedSharingPrice > 0
			? [{ label: "Sharing", value: selectedSharingPrice }]
			: []),
		...(selectedCustomOptionPrice > 0
			? [{ label: "Custom Options", value: selectedCustomOptionPrice }]
			: []),
	];

	function onSubmit(data: FormValues) {
		console.log(data);
		// Handle submission
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				showCloseButton={false}
				className="h-[96vh] flex-col overflow-visible p-0"
			>
				<Form {...form}>
					<form
						onSubmit={handleSubmit(onSubmit)}
						className="flex h-full flex-col overflow-hidden sm:rounded-3xl"
					>
						<CommissionRequestHeader
							onBack={onBack}
							artistName={artist?.displayName || ""}
						/>

						<ScrollShadow className="flex-1 overflow-y-auto">
							<div className="space-y-8 p-6">
								<CommissionRequestIntroBox
									artist={artist as TUserResponse}
									commission={commission as TCommission}
									basePrice={basePrice}
									originalPrice={originalPrice}
								/>

								<CommissionRequestFields
									control={control}
									licenseOptions={licenseOptions}
									customOptions={customOptions}
									sharingOptions={sharingOptions}
									artistName={artist?.displayName || ""}
								/>
							</div>
						</ScrollShadow>

						<CommissionRequestFooter onBack={onBack} totalPrice={totalPrice} />
					</form>
					<QuickMath
						basePrice={basePrice}
						originalPrice={originalPrice}
						items={quickMathItems}
						total={totalPrice}
					/>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
