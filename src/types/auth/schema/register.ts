import type { register } from "@/schemas/auth/register";
import type z from "zod";

type RegisterData = z.infer<typeof register>;

export type { RegisterData };
