import type z from "zod";
import type { login } from "@/schemas/auth/login";

type LoginData = z.infer<typeof login>;

export type { LoginData };
