import { accountTypes } from "@/types/auth/schema/accounts"
import z from "zod"
import { email } from "."

const register = z.object({
  account_type: accountTypes,
  email: email,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/[0-9]/, "Password must contain at least one number.")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character."),
    display_name: z
      .string()
      .min(2, "Display name must be at least 2 characters.")
      .max(50, "Display name must be less than 50 characters."),
      username: z
        .string()
        .min(3, "Username must be at least 3 characters.")
        .max(30, "Username must be less than 30 characters.")
        .regex(
          /^[a-z-A-Z0-9_]$/,
          "Username can only contain letters, numbers, and underscores"
        ),
        // key schema is (FAM-xxxx-xxxx-xxx)
        invite_key: z.string().regex(/^FAM-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{3}$/, "Invalid invite key."),
})

const registerStep0 = z.object({
  account_type: register.shape.account_type,
  email: register.shape.email
})

const registerStep1 = z.object({
  display_name: register.shape.display_name,
  username: register.shape.username,
  password: register.shape.password,
  invite_key: register.shape.invite_key
})

export { register, registerStep0, registerStep1 }
