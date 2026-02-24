import { ScrollShadow } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
	Calendar as CalendarIcon,
	Info,
	Link as LinkIcon,
	Smile,
	Upload,
	X,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
	OutlineArrowLeft,
	OutlineArrowRight,
	OutlineCheck,
	OutlineClose,
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
import { QuickMath } from "@/components/layout/commision/quick-math";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { calculateCommissionPricing } from "@/lib/commission-utils";
import { cn } from "@/lib/utils";
import type { CommissionItem, LicenseType } from "@/types/commission";
import type { User } from "@/types/user";

const formSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters."),
	email: z.email("Please enter a valid email address."),
	username: z.string().optional(),
	discord: z.string().optional(),
	twitter: z.string().optional(),
	instagram: z.string().optional(),
	telegram: z.string().optional(),
	licenses: z.array(z.string()).min(1, "Please select at least one license."),
	sharing: z.enum(["yes", "wip", "nda", "other"], {
		message: "Please select a sharing option.",
	}),
	sharingOther: z.string().optional(),
	customOption: z.string().optional(),
	deadline: z.date().optional(),
	extraInfo: z.string().optional(),
	termsAccepted: z.boolean().refine((val) => val === true, {
		message: "You must accept the terms of service.",
	}),
	marketing: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface CommissionRequestModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onBack: () => void;
	item: CommissionItem;
	artist: User;
	initialLicenses?: string[];
}

export function CommissionRequestModal({
	open,
	onOpenChange,
	onBack,
	item,
	artist,
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

	const { basePrice, originalPrice } = calculateCommissionPricing(
		item.price,
		item.discountRate,
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

	const licenseOptions = (item.licenseOptions || defaultLicenseOptions).map(
		(opt) => ({
			...opt,
			disabled: opt.included !== undefined,
		}),
	);
	const sharingOptions = item.sharingOptions || defaultSharingOptions;
	const customOptions = item.customOptions || demoCustomOptions;

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
						{/* Header */}
						<div className="z-20 flex shrink-0 items-center justify-between border-b bg-background px-6 py-4">
							<div className="flex items-center gap-2">
								<Button
									variant="ghost"
									size="icon"
									className="-ml-2"
									onClick={onBack}
									type="button"
								>
									<OutlineArrowLeft />
								</Button>
								<DialogTitle>Commission Request</DialogTitle>
								<DialogDescription className="sr-only">
									Fill out the form to request a commission from{" "}
									{artist.display_name}
								</DialogDescription>
							</div>
							<DialogClose asChild>
								<Button variant={"ghost"} size={"icon"} type="button">
									<OutlineClose />
								</Button>
							</DialogClose>
						</div>

						<ScrollShadow className="flex-1 overflow-y-auto">
							<div className="space-y-8 p-6">
								{/* Intro Box */}
								<div className="flex flex-col gap-4">
									<div className="flex gap-4">
										<Avatar className="size-10 shrink-0 border">
											<AvatarImage src={artist.avatar_url ?? undefined} />
											<AvatarFallback>{artist.display_name[0]}</AvatarFallback>
										</Avatar>
										<div className="flex flex-col gap-2 rounded-xl border border-secondary bg-secondary/30 p-4 text-sm leading-relaxed">
											<div className="flex flex-col border-border/50 border-b pb-2">
												<div className="flex items-center gap-2">
													<span className="rounded-md bg-primary/10 px-2 py-0.5 font-medium text-primary text-xs">
														50% off
													</span>
												</div>
												<span className="mt-1 font-semibold text-lg">
													{item.title}
												</span>
												<div className="flex items-baseline gap-2 text-sm">
													<span className="text-muted-foreground">From</span>
													<span className="font-semibold text-primary">
														USD {basePrice.toFixed(2)}
													</span>
													<span className="text-muted-foreground line-through opacity-70">
														USD {originalPrice.toFixed(2)}
													</span>
												</div>
											</div>
											<div className="text-muted-foreground">
												Once you submit your request, I'll review it to
												determine if I'm the right fit for your needs. If so,
												I'll send you a proposal with your exact pricing and
												timing before we move forward. Please provide as much
												detail upfront as possible!
											</div>
										</div>
									</div>

									{/* Guest Banner - Cleaner */}
									{/* <Button
                    className="h-auto justify-between p-1 pr-5"
                    variant={"outline"}
                    type="button"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarFallback>
                          <OutlineUser />
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">Requesting as Guest</span>
                    </div>
                    <span className="flex items-center gap-1.5 text-xs">
                      Sign up / login <OutlineArrowRight />
                    </span>
                  </Button> */}
								</div>

								{/* Form Fields */}
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
											<Label className="font-medium text-base">
												Your contact details
											</Label>
											<span className="text-muted-foreground text-xs">
												Required
											</span>
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
										<Label className="font-medium text-base">
											References and files
										</Label>
										<p className="text-muted-foreground text-sm">
											Character reference sheets, PSD for rigging, mood boards,
											etc.
										</p>
										<div className="flex flex-wrap gap-3">
											<Button
												variant="outline"
												className="gap-2 bg-background"
												type="button"
											>
												<Smile className="h-4 w-4" />{" "}
												<span>Tag character profile</span>
											</Button>
											<Button
												variant="outline"
												className="gap-2 bg-background"
												type="button"
											>
												<Upload className="h-4 w-4" /> <span>Upload file</span>
											</Button>
											<Button
												variant="outline"
												className="gap-2 bg-background"
												type="button"
											>
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
												<FieldDescription>
													Rush order fees may apply.
												</FieldDescription>
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
																{field.value
																	? format(field.value, "PPP")
																	: "mm / dd / yyyy"}
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
												<FieldLabel className="font-medium text-base">
													Extra info
												</FieldLabel>
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
															I understand that submitting this request does not
															guarantee that {artist.display_name} will accept
															my commission
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
							</div>
						</ScrollShadow>

						{/* Fixed Footer */}
						<div className="z-20 space-y-3 border-t bg-background p-4">
							<div className="flex items-center justify-between rounded-lg bg-secondary/10 px-4 py-2 lg:hidden">
								<div className="text-sm">
									<span className="text-muted-foreground">
										Estimated Total:
									</span>
								</div>
								<div className="font-bold text-lg text-primary">
									~USD {totalPrice.toFixed(2)}
								</div>
							</div>

							<div className="flex flex-col gap-2 rounded-xl border border-secondary  p-3 text-xs">
								<span className="font-semibold">
									Request as guest, or sign up to:
								</span>
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
								<Button
									size="xl"
									variant="outline"
									className="flex-1"
									type="submit"
								>
									Request as Guest
								</Button>
							</div>
							<div className="px-4 text-center text-muted-foreground text-xs">
								By submitting a request, you agree to Terms of Service and
								acknowledge you've read our Privacy Policy.
							</div>
						</div>
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
