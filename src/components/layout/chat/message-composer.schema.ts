import * as z from "zod/v4";

export const messageComposerSchema = z.object({
	body: z
		.string()
		.trim()
		.max(2000, { message: "Message is too long." }),
});

export type MessageComposerValues = z.infer<typeof messageComposerSchema>;
