import UserAvatar from "@/components/layout/profile/avatar";
import type { TUserProfile } from "@/types/user";
import { Surface } from "@heroui/react";
import { ThumbsUp } from "lucide-react";

export function DeliveryTab({ artist }: { artist: TUserProfile }) {
	return (
		<div className="mx-auto flex w-full max-w-[980px] flex-col gap-6 p-5 md:p-6 xl:p-8">
			<Surface>
				<p className="mb-5 text-xs text-muted-foreground">
					This review is now visible to artists when you submit a commission
					request.
				</p>
				<div className="rounded-2xl border border-border/70 bg-muted/40 p-4">
					<div className="mb-3 flex items-center gap-3">
						<div className="flex size-8 items-center justify-center overflow-hidden rounded-full border border-border/70 bg-background shadow-sm">
							<UserAvatar user={artist} />
						</div>
						<div className="flex items-center gap-2">
							<ThumbsUp className="size-4 text-emerald-600 dark:text-emerald-400" />
							<span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
								Recommend
							</span>
						</div>
						<span className="ml-auto text-xs text-muted-foreground">
							Recent
						</span>
					</div>
					<div className="mb-3 flex flex-wrap gap-1.5">
						{[
							"Respectful",
							"Clear requirements",
							"Helpful feedback",
							"Very responsive",
						].map((tag) => (
							<span
								key={tag}
								className="rounded-lg border border-border/70 bg-background px-2.5 py-1 text-xs text-foreground shadow-sm"
							>
								{tag}
							</span>
						))}
					</div>
					<button className="text-xs text-violet-600 hover:underline dark:text-violet-400">
						Difficulties:
					</button>
					<p className="mt-3 text-xs text-muted-foreground">
						Anonymize semi-public review
					</p>
				</div>
			</Surface>

			<Surface>
				<p className="mb-5 text-xs text-muted-foreground">
					Your feedback helps make the platform safer for everyone.
				</p>
				<div className="rounded-2xl border border-border/70 bg-muted/40 p-4">
					<div className="mb-3 flex items-center gap-2">
						<div className="flex items-center gap-0.5">
							{[1, 2, 3, 4, 5].map((star) => (
								<Star
									key={star}
									className="size-4 fill-amber-400 text-amber-400"
								/>
							))}
						</div>
						<span className="text-xs text-muted-foreground">Recent</span>
						<button className="ml-auto text-muted-foreground hover:text-foreground">
							<ChevronDown className="size-4" />
						</button>
					</div>
					<div className="mb-3 flex flex-wrap gap-1.5">
						{["Professional", "Clear communication"].map((tag) => (
							<span
								key={tag}
								className="rounded-lg border border-border/70 bg-background px-2.5 py-1 text-xs text-foreground shadow-sm"
							>
								{tag}
							</span>
						))}
					</div>
					<p className="text-xs text-muted-foreground">
						Anonymize semi-public review
					</p>
				</div>
			</Surface>
		</div>
	);
}
