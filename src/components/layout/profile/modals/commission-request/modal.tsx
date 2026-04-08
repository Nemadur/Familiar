import { ScrollShadow } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import type { Option } from "@/components/layout/commision/form-blocks";
import { QuickMath } from "@/components/layout/commision/quick-math";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { useCommission } from "@/hooks/use-commisions";
import { useUserById } from "@/hooks/use-user";
import { calculateCommissionPricing } from "@/lib/commission-utils";
import type { TCommission } from "@/types/commissions";
import { type FormValues, formSchema } from "@/types/commissions/form";
import type { TUserResponse } from "@/types/user";
import { CommissionRequestFooter } from "./commission-request/footer";
import { CommissionRequestFormRenderer } from "./commission-request/form-renderer";
import { CommissionRequestHeader } from "./commission-request/header";
import { CommissionRequestIntroBox } from "./commission-request/intro-box";
import { mockCommissionRequestForm } from "./commission-request/mock-form-definition";

const DEFAULT_LICENSE_OPTIONS: Option[] = [
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

const DEFAULT_SHARING_OPTIONS: Option[] = [
	{ id: "yes", label: "Yes" },
	{ id: "wip", label: "Not while WIP but final work is ok" },
	{
		id: "nda",
		label: "NDA required (privacy fee)",
		price: 100,
	},
	{ id: "other", label: "Other", hasInput: true },
];

const DEFAULT_CUSTOM_OPTIONS: Option[] = [
	{ id: "minimalist", label: "Minimalist", price: 18.1 },
	{ id: "blank", label: "Blank" },
	{ id: "self", label: "Self-Provide" },
];

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

	const { control, handleSubmit } = form;

	const watchedLicenses = useWatch({ control, name: "licenses" });
	const watchedSharing = useWatch({ control, name: "sharing" });
	const watchedCustomOption = useWatch({ control, name: "customOption" });

	const { data: commission, error: commissionError } =
		useCommission(commissionId);

	useEffect(() => {
		if (commissionError) {
			console.error(
				"[CommissionRequestModal] Error fetching commission:",
				commissionError,
			);
		}
	}, [commissionError]);

	const { user: artist, error: artistError } = useUserById(
		commission?.artistId,
	);

	useEffect(() => {
		if (artistError) {
			console.error(
				"[CommissionRequestModal] Error fetching artist:",
				artistError,
			);
		}
	}, [artistError]);

	const { basePrice, originalPrice } = useMemo(
		() =>
			calculateCommissionPricing(
				commission?.basePrice || 0,
				commission?.discountRate || 0,
			),
		[commission?.basePrice, commission?.discountRate],
	);

	const licenseOptions = useMemo(
		() =>
			(commission?.licenseOptions || DEFAULT_LICENSE_OPTIONS).map((opt) => ({
				...opt,
				disabled: opt.included !== undefined,
			})),
		[commission?.licenseOptions],
	);

	const sharingOptions = useMemo(
		() =>
			(commission?.sharingOptions || DEFAULT_SHARING_OPTIONS).map((opt) => ({
				...opt,
				disabled: opt.included !== undefined,
			})),
		[commission?.sharingOptions],
	);

	const customOptions = useMemo(
		() =>
			(commission?.customOptions || DEFAULT_CUSTOM_OPTIONS).map((opt) => ({
				...opt,
				disabled: opt.included !== undefined,
			})),
		[commission?.customOptions],
	);

	const formDefinition = useMemo(
		() =>
			mockCommissionRequestForm(
				commission?.artistId ?? "",
				commission?.id ?? commissionId,
				licenseOptions,
				customOptions,
				sharingOptions,
			),
		[
			commission?.artistId,
			commission?.id,
			commissionId,
			licenseOptions,
			customOptions,
			sharingOptions,
		],
	);

	const getOptionPrice = (option: Option) => {
		if (option.price !== undefined) return option.price;
		if (option.pricePercentage !== undefined) {
			return basePrice * (option.pricePercentage / 100);
		}
		return 0;
	};

	const selectedLicensesPrice = useMemo(
		() =>
			licenseOptions
				.filter((opt) => watchedLicenses?.includes(opt.id))
				.reduce((acc, opt) => acc + getOptionPrice(opt), 0),
		[licenseOptions, watchedLicenses, basePrice],
	);

	const selectedSharingPrice = useMemo(() => {
		const option = sharingOptions.find((opt) => opt.id === watchedSharing);
		return option ? getOptionPrice(option) : 0;
	}, [sharingOptions, watchedSharing, basePrice]);

	const selectedCustomOptionPrice = useMemo(() => {
		const option = customOptions.find((opt) => opt.id === watchedCustomOption);
		return option ? getOptionPrice(option) : 0;
	}, [customOptions, watchedCustomOption, basePrice]);

	const totalPrice = useMemo(
		() =>
			basePrice +
			selectedLicensesPrice +
			selectedSharingPrice +
			selectedCustomOptionPrice,
		[
			basePrice,
			selectedLicensesPrice,
			selectedSharingPrice,
			selectedCustomOptionPrice,
		],
	);

	const quickMathItems = useMemo(
		() => [
			...(selectedLicensesPrice > 0
				? [{ label: "Licenses", value: selectedLicensesPrice }]
				: []),
			...(selectedSharingPrice > 0
				? [{ label: "Sharing", value: selectedSharingPrice }]
				: []),
			...(selectedCustomOptionPrice > 0
				? [{ label: "Custom Options", value: selectedCustomOptionPrice }]
				: []),
		],
		[selectedLicensesPrice, selectedSharingPrice, selectedCustomOptionPrice],
	);

	function onSubmit(data: FormValues) {
		console.log(data);
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

								<CommissionRequestFormRenderer
									control={control}
									blocks={formDefinition.blocks}
									artistName={artist?.displayName || ""}
								/>
							</div>
						</ScrollShadow>

						<CommissionRequestFooter totalPrice={totalPrice} />
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
