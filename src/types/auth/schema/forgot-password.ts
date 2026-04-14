import type { forgotPassword } from "@/schemas/auth/forgot-password";
import type z from "zod";

type ForgotPasswordData = z.infer<typeof forgotPassword>

export type { ForgotPasswordData }
