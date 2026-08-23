import z from "zod";

const accountTypes = z.enum(["client", "artist"]);
type AccountType = z.infer<typeof accountTypes>;

export { accountTypes, type AccountType };
