import z from "zod";
import { email } from ".";

const login = z.object({
  email: email,
  password: z.string().min(1, "Password is required"),
})

export { login }
