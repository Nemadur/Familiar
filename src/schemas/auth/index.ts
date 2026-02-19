import z from "zod";

const email = z.email("Please enter a valid email address")

export { email }
