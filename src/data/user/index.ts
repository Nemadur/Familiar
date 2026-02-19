import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema";
import type { User } from "@/types/user";

export const getUserByUsername = createServerFn({
	method: "GET",
})
	.inputValidator((data: { username: User["username"] }) => data)
	.handler(async ({ data }) => {
		return db.query.user.findFirst({ where: eq(user.username, data.username) });
	});

// return all users
export const getUsers = createServerFn({
	method: "GET",
}).handler(async () => {
	return db.query.user.findMany();
});
