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
	OutlineInstagram,
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

interface CommissionRequestFieldsProps {
	control: Control<FormValues>;
	licenseOptions: Option[];
	customOptions: Option[];
	sharingOptions: Option[];
	artistName: string;
}

export function CommissionRequestFields({
	control,
	licenseOptions,
	customOptions,
	sharingOptions,
	artistName,
}: CommissionRequestFieldsProps) {
	return (
		<div className="space-y-10">
			{/* Name */}
			<FormField
				control={control}
				name="name"
				render={({ field, fieldState }) => (
					<Field>
						<FieldLabel htmlFor={field.name}>
							Your name <span className="text-destructive">*</span>
						</FieldLabel>
						<InputGroup className="h-12 border-transparent">
							<InputGroupAddon className="pointer-events-none pl-3">
								<OutlineUser className="text-muted-foreground" />
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

			{/* Contact Details */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<Label className="font-medium text-base">Your contact details</Label>
					<span className="text-muted-foreground text-xs">Required</span>
				</div>

				<FormField
					control={control}
					name="email"
					render={({ field, fieldState }) => (
						<Field>
							<InputGroup className="h-12 border-transparent">
								<InputGroupAddon>
									<OutlineMail />
								</InputGroupAddon>
								<InputGroupInput
									id={field.name}
									placeholder="your@email.com"
									{...field}
								/>

								<InputGroupAddon align="inline-end">
									<InputGroupButton
										variant="secondary"
										className="h-10 rounded-full px-4"
									>
										Verify email
									</InputGroupButton>
								</InputGroupAddon>
							</InputGroup>
							<FieldError errors={[fieldState.error]} />
						</Field>
					)}
				/>

				<div className="grid grid-cols-2 gap-4">
					<FormField
						control={control}
						name="discord"
						render={({ field, fieldState }) => (
							<Field>
								<InputGroup className="h-12 border-transparent">
									<InputGroupAddon>
										<OutlineDiscord />
									</InputGroupAddon>
									<InputGroupInput
										id={field.name}
										placeholder="username"
										{...field}
									/>
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
								<InputGroup className="h-12 border-transparent">
									<InputGroupAddon>
										<OutlineTwitter />
									</InputGroupAddon>
									<InputGroupInput
										id={field.name}
										placeholder="Twitter"
										{...field}
									/>
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
								<InputGroup className="h-12 border-transparent">
									<InputGroupAddon>
										<OutlineInstagram />
									</InputGroupAddon>
									<InputGroupInput
										id={field.name}
										placeholder="Instagram"
										{...field}
									/>
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
								<InputGroup className="h-12 border-transparent">
									<InputGroupAddon>
										<OutlineSend />
									</InputGroupAddon>
									<InputGroupInput
										id={field.name}
										placeholder="Telegram"
										{...field}
									/>
								</InputGroup>
								<FieldError errors={[fieldState.error]} />
							</Field>
						)}
					/>
				</div>
			</div>

			{/* Usage / License */}
			<FormCheckboxGroup
				control={control}
				name="licenses"
				label="How will you be using this commission?"
				description="Choose the licenses you need."
				required
				options={licenseOptions}
			/>

			{/* Custom Options Example */}
			{customOptions && (
				<FormRadioGroup
					control={control}
					name="customOption"
					label="Background choice"
					description="make sure the self-provide background is public use art or an art you own for monetized use"
					options={customOptions}
				/>
			)}

			{/* References */}
			<div className="space-y-3">
				<Label className="font-medium text-base">References and files</Label>
				<p className="text-muted-foreground text-sm">
					Character reference sheets, PSD for rigging, mood boards, etc.
				</p>
				<div className="flex flex-wrap gap-3">
					<Button variant="outline" className="gap-2 bg-background" type="button">
						<Smile className="h-4 w-4" /> <span>Tag character profile</span>
					</Button>
					<Button variant="outline" className="gap-2 bg-background" type="button">
						<Upload className="h-4 w-4" /> <span>Upload file</span>
					</Button>
					<Button variant="outline" className="gap-2 bg-background" type="button">
						<LinkIcon className="h-4 w-4" /> <span>Add link</span>
					</Button>
				</div>
			</div>

			{/* Streaming/Sharing */}
			<FormRadioGroup
				control={control}
				name="sharing"
				label="May I publicly stream / share the work with credit?"
				required
				otherFieldName="sharingOther"
				options={sharingOptions}
			/>

			{/* Deadline */}
			<FormField
				control={control}
				name="deadline"
				render={({ field, fieldState }) => (
					<Field className="space-y-3">
						<FieldLabel className="font-medium text-base">
							Do you have a hard deadline?
						</FieldLabel>
						<FieldDescription>Rush order fees may apply.</FieldDescription>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant={"outline"}
									className={cn(
										"h-12 w-full justify-between border-transparent  text-left font-normal hover:bg-secondary/30",
										!field.value && "text-muted-foreground",
									)}
								>
									<span>
										{field.value ? format(field.value, "PPP") : "mm / dd / yyyy"}
									</span>
									<CalendarIcon className="mr-2 h-4 w-4" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0">
								<Calendar
									mode="single"
									selected={field.value}
									onSelect={field.onChange}
								/>
							</PopoverContent>
						</Popover>
						<FieldError errors={[fieldState.error]} />
					</Field>
				)}
			/>

			{/* Extra Info */}
			<FormField
				control={control}
				name="extraInfo"
				render={({ field, fieldState }) => (
					<Field className="space-y-2">
						<FieldLabel className="font-medium text-base">Extra info</FieldLabel>
						<FieldDescription>
							Pose, traits, multiple characters, add-ons, etc.
						</FieldDescription>
						<Textarea
							placeholder="Your answer"
							className="min-h-[100px] resize-none border-transparent  focus:border-primary"
							{...field}
						/>
						<FieldError errors={[fieldState.error]} />
					</Field>
				)}
			/>

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
									I understand that submitting this request does not guarantee that{" "}
									{artistName} will accept my commission
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
