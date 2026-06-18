import { OutlineClose } from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import type { TCommission, TCommissionRequest } from "@/types/commissions";
import { Surface } from "@heroui/react";
import { Link } from "@tanstack/react-router";
import { Download, ExternalLink } from "lucide-react";

export type RequestSectionMedia = {
	id: string;
	sizes: {
		thumbnail?: string | null;
		half?: string | null;
		full?: string | null;
	};
};

export type RequestSectionRequest = {
	id: string;
	description?: string | null;
	multimedia?: RequestSectionMedia[] | null;
};

export type RequestSectionCommission = {
	title?: string | null;
	multimedia?: Array<{
		sizes?: {
			thumbnail?: string | null;
			half?: string | null;
			full?: string | null;
		} | null;
	}> | null;
};

const DEFAULT_MONEY_FORMATTER = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
	minimumFractionDigits: 2,
});

function defaultFormatMoney(value: number) {
	return DEFAULT_MONEY_FORMATTER.format(value);
}

function getPreviewUrl(media: RequestSectionMedia) {
	return (
		media?.sizes?.half || media?.sizes?.thumbnail || media?.sizes?.full || ""
	);
}

function getOriginalUrl(media: RequestSectionMedia) {
	return (
		media?.sizes?.full || media?.sizes?.half || media?.sizes?.thumbnail || ""
	);
}

export function RequestSectionCard({
	request,
	commission,
	formatMoney = defaultFormatMoney,
	onRemoveMedia,
}: {
	request: TCommissionRequest;
	commission?: TCommission | null;
	formatMoney?: (value: number) => string;
	onRemoveMedia?: (mediaId: string) => void;
}) {
	const title = commission?.title || "Untitled commission";
	const commissionCover =
		commission?.multimedia?.[0]?.sizes?.half ||
		commission?.multimedia?.[0]?.sizes?.thumbnail ||
		commission?.multimedia?.[0]?.sizes?.full ||
		"";

	return (
		<Surface className="space-y-6 rounded-3xl p-4">
			<Surface
				variant="secondary"
				className="flex items-center gap-4 rounded-2xl border border-border p-2 pr-4"
			>
				<div className="h-20 w-24 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
					{commissionCover ? (
						<img
							src={commissionCover}
							alt={title}
							className="h-full w-full object-cover"
						/>
					) : (
						<div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
							No image
						</div>
					)}
				</div>

				<div className="flex min-w-0 flex-1 flex-col">
					<h4 className="truncate text-sm font-semibold text-foreground">
						{title}
					</h4>
					<p className="mt-1 text-xs text-muted-foreground">
						Commission listing selected by the client
					</p>
				</div>

				{commission?.basePrice ? (
					<div className="shrink-0 text-right">
						<p className="text-[11px] text-muted-foreground">Starting at</p>
						<p className="text-sm font-semibold text-foreground">
							{formatMoney(commission.basePrice)}
						</p>
					</div>
				) : null}
			</Surface>

			<div className="grid gap-3 sm:grid-cols-2">
				<Surface
					variant="secondary"
					className="rounded-2xl border border-border px-4 py-3"
				>
					<p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-primary">
						Licence
					</p>
					<p className="text-sm font-medium text-foreground">
						{commission?.usageLabel || "No usage label provided."}
						{/* TODO: here's go licences */}
					</p>
				</Surface>

				<Surface
					variant="secondary"
					className="rounded-2xl border border-border px-4 py-3"
				>
					<p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-primary">
						Request ID
					</p>
					<p className="text-sm font-medium text-foreground">{request.id}</p>
				</Surface>
			</div>

			<div>
				<span className="mb-3 block text-xs font-medium uppercase tracking-wide text-primary">
					Client brief
				</span>

				<Surface
					variant="secondary"
					className="rounded-2xl border border-border p-4"
				>
					<p className="text-sm leading-relaxed text-foreground/90">
						{request.description || "No additional details provided."}
					</p>
				</Surface>
			</div>

			<div>
				<span className="mb-3 block text-xs font-medium uppercase tracking-wide text-primary">
					References and Files
				</span>

				{request.multimedia?.length ? (
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
						{request.multimedia.map((media) => {
							const previewUrl = getPreviewUrl(media);
							const originalUrl = getOriginalUrl(media);

							return (
								<Surface
									variant="secondary"
									key={media.id}
									className="overflow-hidden rounded-2xl border border-border"
								>
									<div className="relative aspect-4/3 w-full bg-muted">
										{previewUrl ? (
											<img
												src={previewUrl}
												alt={`Attachment ${media.id}`}
												className="h-full w-full object-cover"
											/>
										) : (
											<div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
												Preview unavailable
											</div>
										)}

										<div className="absolute right-2 top-2 flex items-center gap-2">
											{originalUrl ? (
												<Button
													size="icon-lg"
													aria-label="Open original file"
													asChild
												>
													<Link
														to={originalUrl}
														target="_blank"
														rel="noreferrer"
													>
														<ExternalLink className="size-4" />
													</Link>
												</Button>
											) : null}

											{originalUrl ? (
												<Button size="icon-lg" aria-label="Download file">
													<Download className="size-4" />
												</Button>
											) : null}

											{onRemoveMedia ? (
												<Button
													size="icon-lg"
													variant="destructive"
													className="shadow-sm"
													onClick={() => onRemoveMedia(media.id)}
												>
													<OutlineClose />
												</Button>
											) : null}
										</div>
									</div>
								</Surface>
							);
						})}
					</div>
				) : (
					<Surface
						variant="secondary"
						className="rounded-2xl border border-border p-4"
					>
						<p className="text-sm text-foreground">No references attached.</p>
					</Surface>
				)}
			</div>
		</Surface>
	);
}
