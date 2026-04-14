import z from "zod";

const email = z
	.string()
	.trim()
	.pipe(z.email({ message: "Please enter a valid email address" }));

export { email };
