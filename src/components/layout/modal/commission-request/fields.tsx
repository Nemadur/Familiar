import { format } from "date-fns";
import {
	Calendar as CalendarIcon,
	Link as LinkIcon,
	Smile,
	Upload,
} from "lucide-react";
import type { Control } from "react-hook-form";
import {
	OutlineDiscord,
	OutlineEdit,
	OutlineFaceSmilling,
	OutlineInstagram,
	OutlineLink,
	OutlineMail,
	OutlineSend,
	OutlineTwitter,
	OutlineUser,
} from "@/components/icons/icons";
import {
	FormCheckboxGroup,
	FormRadioGroup,
	type Option,
} from "@/components/layout/commision/form-blocks";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import { FormField } from "@/components/ui/form";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
	InputGroupText,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { FormValues } from "./types";
import type { FormFieldDto } from "@/types/commissions/templates";
import { PreviewCustomFields } from "./preview-custom-fields";

interface CommissionRequestFieldsProps {
	control: Control<FormValues>;
	licenseOptions: Option[];
	customOptions: Option[];
	sharingOptions: Option[];
	artistName: string;
	previewFields?: FormFieldDto[];
}

export function CommissionRequestFields({
	control,
	licenseOptions,
	customOptions,
	sharingOptions,
	artistName,
	previewFields,
}: CommissionRequestFieldsProps) {
	const hasCustomFields = previewFields && previewFields.length > 0;

	return (
		<div className="space-y-10">
			{hasCustomFields ? (
				<PreviewCustomFields fields={previewFields} />
			) : (
				<>
					{/* Name */}
					<FormField
						control={control}
						name="name"
						render={({ field, fieldState }) => (
							<Field>
								<FieldLabel
									htmlFor={field.name}
									className="w-full justify-between"
								>
									{/* TODO: add translation + check if it's required */}
									<span className="flex-1 w-full">Your name</span>
									<span className="w-fit text-destructive">Required *</span>
								</FieldLabel>
								<InputGroup className="h-12">
									<InputGroupAddon>
										<OutlineUser />
									</InputGroupAddon>
									<InputGroupInput
										id={field.name}
										placeholder="Name / nickname"
										{...field}
									/>
								</InputGroup>
								<FieldError errors={[fieldState.error]} />
							</Field>
						)}
					/>

					{/* Contact Information */}
					<Field className="space-y-4">
						<FieldLabel className="w-full justify-between">
							<span className="flex-1 w-full">Your email</span>
							{/* TODO: add translation + check if it's required */}
							<span className="w-fit text-destructive">Required *</span>
						</FieldLabel>
						<FormField
							control={control}
							name="email"
							render={({ field, fieldState }) => (
								<Field>
									<InputGroup className="h-12 bg-secondary/30">
										<InputGroupAddon>
											<OutlineMail />
										</InputGroupAddon>
										<InputGroupInput
											placeholder="your@email.com"
											className="placeholder:text-foreground"
											{...field}
										/>
										<InputGroupButton
											variant="secondary"
											className="mr-1.5 px-4 font-medium"
										>
											Verify email
										</InputGroupButton>
									</InputGroup>
									<FieldError errors={[fieldState.error]} />
								</Field>
							)}
						/>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<FormField
								control={control}
								name="discord"
								render={({ field, fieldState }) => (
									<Field>
										<InputGroup className="h-12">
											<InputGroupAddon>
												<OutlineDiscord />
											</InputGroupAddon>
											<InputGroupInput placeholder="username" {...field} />
										</InputGroup>
										<FieldError errors={[fieldState.error]} />
									</Field>
								)}
							/>
							<FormField
								control={control}
								name="twitter"
								render={({ field, fieldState }) => (
									<Field>
										<InputGroup className="h-12">
											<InputGroupAddon>
												<OutlineTwitter />
											</InputGroupAddon>
											<InputGroupInput placeholder="Twitter" {...field} />
										</InputGroup>
										<FieldError errors={[fieldState.error]} />
									</Field>
								)}
							/>
							<FormField
								control={control}
								name="instagram"
								render={({ field, fieldState }) => (
									<Field>
										<InputGroup className="h-12">
											<InputGroupAddon>
												<OutlineInstagram />
											</InputGroupAddon>
											<InputGroupInput placeholder="Instagram" {...field} />
										</InputGroup>
										<FieldError errors={[fieldState.error]} />
									</Field>
								)}
							/>
							<FormField
								control={control}
								name="telegram"
								render={({ field, fieldState }) => (
									<Field>
										<InputGroup className="h-12">
											<InputGroupAddon>
												<OutlineSend className="-mt-1" />
											</InputGroupAddon>
											<InputGroupInput placeholder="Telegram" {...field} />
										</InputGroup>
										<FieldError errors={[fieldState.error]} />
									</Field>
								)}
							/>
						</div>
					</Field>

					{/* References and files */}
					<Field className="space-y-4">
						<div className="space-y-2">
							<FieldLabel className="font-medium text-base">
								References and files
							</FieldLabel>
							<FieldDescription>
								Character reference sheets, PSD for rigging, mood boards, etc.
							</FieldDescription>
						</div>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="flex h-12 items-center justify-center gap-2 rounded-full border border-dashed text-muted-foreground text-sm hover:bg-muted/50 cursor-pointer">
								<OutlineLink className="size-4" /> Link a file
							</div>
							<div className="flex h-12 items-center justify-center gap-2 rounded-full border border-dashed text-muted-foreground text-sm hover:bg-muted/50 cursor-pointer">
								<Upload className="size-4" /> Upload file
							</div>
						</div>
					</Field>

					{/* Extra Info */}
					<FormField
						control={control}
						name="extraInfo"
						render={({ field, fieldState }) => (
							<Field className="space-y-2">
								<FieldLabel className="font-medium text-base">
									Extra info
								</FieldLabel>
								<FieldDescription>
									Pose, traits, multiple characters, add-ons, etc.
								</FieldDescription>
								<InputGroup className="rounded-xl">
									<Textarea
										placeholder="Your answer"
										className="min-h-[100px] w-full resize-none"
										{...field}
									/>
								</InputGroup>
								<FieldError errors={[fieldState.error]} />
							</Field>
						)}
					/>
				</>
			)}

			{/* Footer Checkboxes */}
			<div className="space-y-3">
				<FormField
					control={control}
					name="termsAccepted"
					render={({ field, fieldState }) => (
						<Field orientation="horizontal">
							<Checkbox
								checked={field.value}
								onCheckedChange={field.onChange}
								id="terms"
							/>
							<FieldContent>
								<FieldLabel
									htmlFor="terms"
									className="font-normal text-sm leading-snug"
								>
									I understand that submitting this request does not guarantee
									that {artistName} will accept my commission
									<span className="text-destructive">*</span>
								</FieldLabel>
							</FieldContent>
						</Field>
					)}
				/>
				<FormField
					control={control}
					name="marketing"
					render={({ field }) => (
						<Field orientation="horizontal">
							<Checkbox
								checked={field.value}
								onCheckedChange={field.onChange}
								id="marketing"
							/>
							<FieldContent>
								<FieldLabel
									htmlFor="marketing"
									className="font-normal text-sm leading-snug"
								>
									I agree to receive marketing emails
								</FieldLabel>
							</FieldContent>
						</Field>
					)}
				/>
			</div>
		</div>
	);
}
