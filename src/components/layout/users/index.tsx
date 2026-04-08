import { Link } from "@tanstack/react-router";
import { useUserByFilter } from "@/hooks/use-user";
import type { UserResponse } from "@/types/user";

export default function Users() {
	const { users, error, isPending } = useUserByFilter({
		page: 1,
		pageSize: 24,
	});

	if (error) {
		return (
			<div className="mx-auto w-full max-w-5xl px-4 py-10">
				<div className="rounded-2xl border border-border bg-background p-6">
					<p className="text-sm font-medium">Failed to load users.</p>
					<p className="text-muted-foreground mt-1 text-sm">
						Please try again in a moment.
					</p>
				</div>
			</div>
		);
	}

	if (isPending) {
		return (
			<div className="mx-auto w-full max-w-5xl px-4 py-10">
				<div className="mb-6">
					<div className="h-8 w-40 animate-pulse rounded-md bg-muted" />
					<div className="mt-2 h-4 w-64 animate-pulse rounded-md bg-muted" />
				</div>

				<div className="overflow-hidden rounded-2xl border border-border bg-background">
					{Array.from({ length: 8 }).map((_, index) => (
						<div
							key={users.uuid}
							className="flex items-center gap-4 border-b border-border px-5 py-4 last:border-b-0"
						>
							<div className="h-12 w-12 animate-pulse rounded-full bg-muted" />
							<div className="min-w-0 flex-1">
								<div className="h-4 w-40 animate-pulse rounded-md bg-muted" />
								<div className="mt-2 h-3 w-28 animate-pulse rounded-md bg-muted" />
							</div>
							<div className="hidden gap-6 md:flex">
								<div className="h-4 w-12 animate-pulse rounded-md bg-muted" />
								<div className="h-4 w-12 animate-pulse rounded-md bg-muted" />
								<div className="h-4 w-12 animate-pulse rounded-md bg-muted" />
							</div>
						</div>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto w-full max-w-5xl px-4 py-10">
			<div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Users</h1>
					<p className="text-muted-foreground text-sm">
						Browse community profiles and open a user page.
					</p>
				</div>

				<div className="text-muted-foreground text-sm">
					{users?.total ?? users.length} total
				</div>
			</div>

			{users.length === 0 ? (
				<div className="rounded-2xl border border-border bg-background p-8 text-center">
					<p className="text-sm font-medium">No users found.</p>
					<p className="text-muted-foreground mt-1 text-sm">
						There are no profiles to display yet.
					</p>
				</div>
			) : (
				<div className="overflow-hidden rounded-2xl border border-border bg-background">
					{users.map((user: UserResponse) => {
						const initials =
							user.displayName?.trim()?.[0]?.toUpperCase() ||
							user.username?.trim()?.[0]?.toUpperCase() ||
							"?";

						return (
							<Link
								key={user.userId}
								to="/$username"
								params={{ username: user.username }}
								className="group flex items-center gap-4 border-b border-border px-5 py-4 transition-colors last:border-b-0 hover:bg-muted/40"
							>
								<div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-semibold">
									{user.avatarPath ? (
										<img
											src={user.avatarPath}
											alt={user.displayName || user.username}
											className="h-full w-full object-cover"
										/>
									) : (
										<span>{initials}</span>
									)}
								</div>

								<div className="min-w-0 flex-1">
									<div className="flex min-w-0 items-center gap-2">
										<h2 className="truncate text-sm font-medium">
											{user.displayName || user.username}
										</h2>

										{user.isVerified ? (
											<span className="rounded-full border border-border px-2 py-0.5 text-[11px] leading-none">
												Verified
											</span>
										) : null}

										{user.isPremium ? (
											<span className="rounded-full border border-border px-2 py-0.5 text-[11px] leading-none">
												Premium
											</span>
										) : null}
									</div>

									<p className="text-muted-foreground truncate text-sm">
										@{user.username}
									</p>

									{user.bio ? (
										<p className="text-muted-foreground mt-1 line-clamp-1 text-sm">
											{user.bio}
										</p>
									) : null}
								</div>

								<div className="hidden shrink-0 items-center gap-6 md:flex">
									<div className="text-right">
										<p className="text-sm font-medium">
											{/* {user.followersCount ?? 0} */}0
										</p>
										<p className="text-muted-foreground text-xs">Followers</p>
									</div>

									<div className="text-right">
										<p className="text-sm font-medium">
											{/* {user.worksCount ?? 0} */}0
										</p>
										<p className="text-muted-foreground text-xs">Works</p>
									</div>

									<div className="text-right">
										<p className="text-sm font-medium">
											{/* {user.commissionsCount ?? 0} */}0
										</p>
										<p className="text-muted-foreground text-xs">Commissions</p>
									</div>
								</div>
							</Link>
						);
					})}
				</div>
			)}

			{users ? (
				<div className="text-muted-foreground mt-4 flex items-center justify-between text-sm">
					<span>
						Page {users.page} of {Math.max(users.pageCount, 1)}
					</span>
					<span>{users.pageSize} per page</span>
				</div>
			) : null}
		</div>
	);
}
