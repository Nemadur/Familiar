import { ScrollShadow, Surface } from "@heroui/react";
import { Check, Maximize2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MarkdownDisplay } from "@/components/ui/markdown-display";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

type CustomLicense = {
	id: string;
	title: string;
	description: string;
	label: string;
	updatedAt: string;
};

const EMPTY_CUSTOM_LICENSES: CustomLicense[] = [];

interface LicenseInfoModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	customLicenses?: CustomLicense[];
}

function ClientFormattedUpdatedDate({ value }: { value: string }) {
	const { t } = useTranslation();
	const [formattedDate, setFormattedDate] = useState("");

	useEffect(() => {
		const date = new Date(value);

		if (Number.isNaN(date.getTime())) {
			setFormattedDate("");
			return;
		}

		setFormattedDate(
			date.toLocaleDateString(undefined, {
				month: "short",
				day: "numeric",
				year: "numeric",
			}),
		);
	}, [value]);

	if (!formattedDate) {
		return null;
	}

	return (
		<div className="text-sm text-muted-foreground mb-4">
			{t(
				"components.profile.commissions.modal.license_info_modal.custom_licenses.updated",
				"Updated {{date}}",
				{
					date: formattedDate,
				},
			)}
		</div>
	);
}

function LicenseRule({
	allowed,
	children,
	muted = !allowed,
}: {
	allowed: boolean;
	children: React.ReactNode;
	muted?: boolean;
}) {
	const Icon = allowed ? Check : X;

	return (
		<div className="flex items-start gap-3">
			<Icon
				className={
					allowed
						? "w-5 h-5 text-green-500 mt-0.5 shrink-0"
						: "w-5 h-5 text-muted-foreground mt-0.5 shrink-0"
				}
			/>
			<span className={muted ? "text-sm text-muted-foreground" : "text-sm"}>
				{children}
			</span>
		</div>
	);
}

export function LicenseInfoModal({
	open,
	onOpenChange,
	customLicenses = EMPTY_CUSTOM_LICENSES,
}: LicenseInfoModalProps) {
	const { t } = useTranslation();

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md max-h-[85vh] overflow-hidden flex flex-col">
				<DialogHeader>
					<DialogTitle className="text-2xl font-bold">
						{t("components.profile.commissions.modal.license_info_modal.title")}
					</DialogTitle>
					<p className="text-sm text-muted-foreground">
						{t(
							"components.profile.commissions.modal.license_info_modal.subtitle",
						)}
					</p>
				</DialogHeader>

				<ScrollShadow className="flex-1 overflow-y-auto pr-2">
					<h3 className="text-lg font-semibold mb-4 text-center text-muted-foreground">
						{t(
							"components.profile.commissions.modal.license_info_modal.system_licenses.title",
						)}
					</h3>
					<Accordion
						type="single"
						collapsible
						className="w-full"
						defaultValue="personal"
					>
						<AccordionItem value="personal" className="border-b-0 mb-4">
							<Surface variant="secondary" className="rounded-2xl px-4">
								<AccordionTrigger className="hover:no-underline py-4">
									<div className="flex flex-col items-start text-left">
										<span className="font-semibold text-lg">
											{t(
												"components.profile.commissions.modal.license_info_modal.personal.title",
											)}
										</span>
										<span className="text-sm text-muted-foreground font-normal">
											{t(
												"components.profile.commissions.modal.license_info_modal.personal.description",
											)}
										</span>
									</div>
								</AccordionTrigger>
								<AccordionContent className="pb-4">
									<div className="space-y-4 pt-2">
										<LicenseRule allowed>
											{t(
												"components.profile.commissions.modal.license_info_modal.personal.allowed.personal_use",
											)}
										</LicenseRule>
										<LicenseRule allowed={false}>
											{t(
												"components.profile.commissions.modal.license_info_modal.personal.forbidden.monetized",
											)}
										</LicenseRule>
										<LicenseRule allowed={false}>
											{t(
												"components.profile.commissions.modal.license_info_modal.personal.forbidden.commercial",
											)}
										</LicenseRule>
									</div>
								</AccordionContent>
							</Surface>
						</AccordionItem>

						<AccordionItem value="monetized" className="border-b-0 mb-4">
							<Surface variant="secondary" className="rounded-2xl px-4">
								<AccordionTrigger className="hover:no-underline py-4">
									<div className="flex flex-col items-start text-left">
										<span className="font-semibold text-lg">
											{t(
												"components.profile.commissions.modal.license_info_modal.monetized.title",
											)}
										</span>
										<span className="text-sm text-muted-foreground font-normal">
											{t(
												"components.profile.commissions.modal.license_info_modal.monetized.description",
											)}
										</span>
									</div>
								</AccordionTrigger>
								<AccordionContent className="pb-4">
									<div className="space-y-4 pt-2">
										<LicenseRule allowed>
											{t(
												"components.profile.commissions.modal.license_info_modal.monetized.allowed.personal_use",
											)}
										</LicenseRule>
										<LicenseRule allowed>
											{t(
												"components.profile.commissions.modal.license_info_modal.monetized.allowed.monetized_content",
											)}
										</LicenseRule>
										<LicenseRule allowed={false}>
											{t(
												"components.profile.commissions.modal.license_info_modal.monetized.forbidden.commercial",
											)}
										</LicenseRule>
									</div>
								</AccordionContent>
							</Surface>
						</AccordionItem>

						<AccordionItem value="commercial" className="border-b-0">
							<Surface variant="secondary" className="rounded-2xl px-4">
								<AccordionTrigger className="hover:no-underline py-4">
									<div className="flex flex-col items-start text-left">
										<span className="font-semibold text-lg">
											{t(
												"components.profile.commissions.modal.license_info_modal.commercial.title",
											)}
										</span>
										<span className="text-sm text-muted-foreground font-normal">
											{t(
												"components.profile.commissions.modal.license_info_modal.commercial.description",
											)}
										</span>
									</div>
								</AccordionTrigger>
								<AccordionContent className="pb-4">
									<div className="space-y-4 pt-2">
										<div className="flex items-start gap-3">
											<div className="min-w-24 text-sm font-medium">
												{t(
													"components.profile.commissions.modal.license_info_modal.commercial.licensee.label",
												)}
											</div>
											<div className="text-sm text-muted-foreground">
												{t(
													"components.profile.commissions.modal.license_info_modal.commercial.licensee.value",
												)}
											</div>
										</div>
										<div className="h-px bg-border my-2" />
										<div className="flex items-start gap-3">
											<div className="min-w-24 text-sm font-medium">
												{t(
													"components.profile.commissions.modal.license_info_modal.commercial.commercial_use.label",
												)}
											</div>
											<div className="space-y-3 flex-1">
												<div className="flex items-start gap-2">
													<Check className="size-5 text-green-500 mt-0.5 shrink-0" />
													<span className="text-sm">
														{t(
															"components.profile.commissions.modal.license_info_modal.commercial.commercial_use.allowed.creation",
														)}
													</span>
												</div>
												<div className="flex items-start gap-2">
													<Check className="size-5 text-green-500 mt-0.5 shrink-0" />
													<span className="text-sm">
														{t(
															"components.profile.commissions.modal.license_info_modal.commercial.commercial_use.allowed.distribution",
														)}
													</span>
												</div>
												<div className="flex items-start gap-2">
													<X className="size-5 text-muted-foreground mt-0.5 shrink-0" />
													<span className="text-sm text-muted-foreground">
														{t(
															"components.profile.commissions.modal.license_info_modal.commercial.commercial_use.forbidden.reselling",
														)}
													</span>
												</div>
											</div>
										</div>
										<div className="h-px bg-border my-2" />
										<div className="flex items-start gap-3">
											<div className="min-w-24 text-sm font-medium">
												{t(
													"components.profile.commissions.modal.license_info_modal.commercial.credit.label",
												)}
											</div>
											<div className="flex items-start gap-2 flex-1">
												<Check className="size-5 text-green-500 mt-0.5 shrink-0" />
												<span className="text-sm">
													{t(
														"components.profile.commissions.modal.license_info_modal.commercial.credit.value",
													)}
												</span>
											</div>
										</div>
									</div>
								</AccordionContent>
							</Surface>
						</AccordionItem>
					</Accordion>

					{customLicenses.length > 0 && (
						<div className="mt-8">
							<h3 className="text-lg font-semibold mb-4 text-center text-muted-foreground">
								{t(
									"components.profile.commissions.modal.license_info_modal.custom_licenses.title",
								)}
							</h3>
							<div className="space-y-4">
								{customLicenses.map((license) => (
									<Surface
										variant="secondary"
										key={license.id}
										className="rounded-2xl p-4 relative"
									>
										<Button
											size="icon-sm"
											variant="ghost"
											className="absolute top-4 right-4"
										>
											<Maximize2 className="size-4" />
										</Button>
										<div className="flex items-center gap-2 mb-2">
											<h4 className="font-semibold text-lg">{license.label}</h4>
										</div>
										{license.updatedAt && (
											<ClientFormattedUpdatedDate value={license.updatedAt} />
										)}
										<div className="text-sm text-muted-foreground/90">
											<MarkdownDisplay content={license.description} />
										</div>
									</Surface>
								))}
							</div>
						</div>
					)}
				</ScrollShadow>
			</DialogContent>
		</Dialog>
	);
}
