import type { User } from "@/types/user";

function userLocalTime({ timeZone }: { timeZone: User["timezone"] }) {
	if (!timeZone) return null;
	return new Date().toLocaleTimeString("en-US", {
		timeZone,
		hour: "2-digit",
		minute: "2-digit",
		hour12: true,
	});
}

// TODO: add i18n
function userJoinDate({ createdAt }: { createdAt: User["created_at"] }) {
	if (!createdAt) return "Unknown";
	return new Date(createdAt).toLocaleDateString("en-US", {
		month: "short",
		year: "numeric",
	});
}

export { userLocalTime, userJoinDate };
