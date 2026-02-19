import { z } from "zod";

const envSchema = z.object({
	DATABASE_URL: z.string(),
});

export const envVars = envSchema.parse(process.env);
