import { z } from "zod";

// TODO: make lego-builded form with custom form components

export const formSchema = z.object({
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

export type FormValues = z.infer<typeof formSchema>;
