import z from "zod";
import { email } from ".";

const forgotPassword = z.object({
	email: email,
});

export { forgotPassword };
