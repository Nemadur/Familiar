import { Check, Maximize2, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { MarkdownDisplay } from "@/components/common/markdown-display";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { LicenseOption } from "@/types/commission";

interface LicenseInfoModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	customLicenses?: LicenseOption[];
}

export function LicenseInfoModal({
	open,
	onOpenChange,
	customLicenses = [],
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

				<div className="flex-1 overflow-y-auto pr-2">
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
						<AccordionItem
							value="personal"
							className="border-b-0 mb-4 rounded-xl bg-secondary/30 px-4"
						>
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
									<div className="flex items-start gap-3">
										<Check className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
										<span className="text-sm">
											{t(
												"components.profile.commissions.modal.license_info_modal.personal.allowed.personal_use",
											)}
										</span>
									</div>
									<div className="flex items-start gap-3">
										<X className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
										<span className="text-sm text-muted-foreground">
											{t(
												"components.profile.commissions.modal.license_info_modal.personal.forbidden.monetized",
											)}
										</span>
									</div>
									<div className="flex items-start gap-3">
										<X className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
										<span className="text-sm text-muted-foreground">
											{t(
												"components.profile.commissions.modal.license_info_modal.personal.forbidden.commercial",
											)}
										</span>
									</div>
								</div>
							</AccordionContent>
						</AccordionItem>

						<AccordionItem
							value="monetized"
							className="border-b-0 mb-4 rounded-xl bg-secondary/30 px-4"
						>
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
									<div className="flex items-start gap-3">
										<Check className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
										<span className="text-sm">
											{t(
												"components.profile.commissions.modal.license_info_modal.monetized.allowed.personal_use",
											)}
										</span>
									</div>
									<div className="flex items-start gap-3">
										<Check className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
										<span className="text-sm">
											{t(
												"components.profile.commissions.modal.license_info_modal.monetized.allowed.monetized_content",
											)}
										</span>
									</div>
									<div className="flex items-start gap-3">
										<X className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
										<span className="text-sm text-muted-foreground">
											{t(
												"components.profile.commissions.modal.license_info_modal.monetized.forbidden.commercial",
											)}
										</span>
									</div>
								</div>
							</AccordionContent>
						</AccordionItem>

						<AccordionItem
							value="commercial"
							className="border-b-0 rounded-xl bg-secondary/30 px-4"
						>
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
												<Check className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
												<span className="text-sm">
													{t(
														"components.profile.commissions.modal.license_info_modal.commercial.commercial_use.allowed.creation",
													)}
												</span>
											</div>
											<div className="flex items-start gap-2">
												<Check className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
												<span className="text-sm">
													{t(
														"components.profile.commissions.modal.license_info_modal.commercial.commercial_use.allowed.distribution",
													)}
												</span>
											</div>
											<div className="flex items-start gap-2">
												<X className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
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
											<Check className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
											<span className="text-sm">
												{t(
													"components.profile.commissions.modal.license_info_modal.commercial.credit.value",
												)}
											</span>
										</div>
									</div>
								</div>
							</AccordionContent>
						</AccordionItem>
					</Accordion>

					{customLicenses.length > 0 && (
						<div className="mt-8">
							<h3 className="text-lg font-semibold mb-4 text-center text-muted-foreground">
								{/* Author displayName's - try do not display 's in other languages */}
								{t(
									"components.profile.commissions.modal.license_info_modal.custom_licenses.title",
								)}
							</h3>
							<div className="space-y-4">
								{customLicenses.map((license) => (
									<div
										key={license.id}
										className="rounded-xl border bg-secondary/30 p-6 shadow-sm relative"
									>
										<div className="absolute top-4 right-4 text-muted-foreground">
											<Maximize2 className="w-4 h-4" />
										</div>
										<div className="flex items-center gap-2 mb-2">
											<h4 className="font-bold text-lg">{license.label}</h4>
										</div>
										{license.updatedAt && (
											<div className="text-sm text-muted-foreground mb-4">
												{t(
													"components.profile.commissions.modal.license_info_modal.custom_licenses.updated",
													"Updated {{date}}",
													{
														date: new Date(
															license.updatedAt,
														).toLocaleDateString(undefined, {
															month: "short",
															day: "numeric",
															year: "numeric",
														}),
													},
												)}
											</div>
										)}
										<div className="text-sm text-muted-foreground/90">
											<MarkdownDisplay
												content={license.description}
												variant="restricted"
											/>
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
