import { createServerFn } from "@tanstack/react-start";

export const getUserReviews = createServerFn({
	method: "GET",
})
	.inputValidator((data: { username?: string }) => data)
	.handler(async () => {
		// Stub implementation - return empty array
		return [];
	});
