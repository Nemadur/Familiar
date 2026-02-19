import type { login } from "@/schemas/auth/login";
import z from "zod";

type LoginData = z.infer<typeof login>

export { type LoginData }
