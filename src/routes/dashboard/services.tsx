import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, MoreHorizontal, Send, Trash } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { CreateCommissionForm } from "@/components/layout/commision/create-commission-form";
import { DashboardHeader } from "@/components/layout/dashboard/header";
import { OutlinePlus } from "@/components/icons/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	useDeleteCommission,
	useMyCommissions,
	usePublishCommission,
} from "@/hooks/use-commisions";
import { useAuth } from "@/providers/auth";

export const Route = createFileRoute("/dashboard/services")({
	component: DashboardServices,
});

type FormattedDateSnapshot = {
	formattedDate: string;
	dateTime: string;
} | null;

const formattedDateCache = new Map<string, FormattedDateSnapshot>();

function subscribeToFormattedDateStore() {
	return () => {};
}

function getDateCacheKey(value: string | number | Date) {
	return value instanceof Date ? value.toISOString() : String(value);
}

function getClientFormattedDateSnapshot(
	value: string | number | Date,
): FormattedDateSnapshot {
	const cacheKey = getDateCacheKey(value);
	const cached = formattedDateCache.get(cacheKey);

	if (cached !== undefined) {
		return cached;
	}

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		formattedDateCache.set(cacheKey, null);
		return null;
	}

	const snapshot = {
		formattedDate: date.toLocaleDateString(),
		dateTime: date.toISOString(),
	};

	formattedDateCache.set(cacheKey, snapshot);

	return snapshot;
}

function getServerFormattedDateSnapshot(): FormattedDateSnapshot {
	return null;
}

function useClientFormattedDate(value: string | number | Date) {
	return useSyncExternalStore(
		subscribeToFormattedDateStore,
		() => getClientFormattedDateSnapshot(value),
		getServerFormattedDateSnapshot,
	);
}

function ClientDate({
	value,
	className,
}: {
	value: string | number | Date;
	className?: string;
}) {
	const snapshot = useClientFormattedDate(value);

	if (!snapshot) {
		return null;
	}

	return (
		<time className={className} dateTime={snapshot.dateTime}>
			{snapshot.formattedDate}
		</time>
	);
}

function getStatusBadgeClassName(status: string) {
	if (status === "ACTIVE")
		return "bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-200";

	if (status === "DRAFT")
		return "bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-200";
}

function DashboardServices() {
	const page = 0;
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

	const { user } = useAuth();
	const { data: pageData, isPending } = useMyCommissions(page, 10);
	const deleteMutation = useDeleteCommission();
	const publishMutation = usePublishCommission();

	const commissions = pageData?.content ?? [];

	const handleDelete = async (id: string) => {
		if (!window.confirm("Are you sure you want to delete this commission?")) {
			return;
		}

		try {
			await deleteMutation.mutateAsync(id);
			toast.success("Commission deleted successfully");
		} catch {
			toast.error("Failed to delete commission");
		}
	};

	const handlePublish = async (id: string) => {
		try {
			await publishMutation.mutateAsync(id);
			toast.success("Commission published successfully");
		} catch {
			toast.error("Failed to publish commission");
		}
	};

	return (
		<div className="flex flex-1 flex-col h-full bg-muted/40">
			<DashboardHeader
				title="Services"
				actions={
					<Button size="xl" onClick={() => setIsCreateModalOpen(true)}>
						<OutlinePlus />
						<span className="hidden sm:inline">Create Service</span>
					</Button>
				}
			/>

			<div className="flex flex-1 flex-col gap-4 p-6">
				<div className="rounded-xl border bg-background overflow-hidden">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Title</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Base Price</TableHead>
								<TableHead>Created</TableHead>
								<TableHead className="w-[70px]"></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isPending ? (
								<TableRow>
									<TableCell
										colSpan={5}
										className="text-center py-10 text-muted-foreground"
									>
										Loading services&hellip;
									</TableCell>
								</TableRow>
							) : commissions.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={5}
										className="text-center py-10 text-muted-foreground"
									>
										No services found. Create one to get started!
									</TableCell>
								</TableRow>
							) : (
								commissions.map((commission) => (
									<TableRow key={commission.id}>
										<TableCell className="font-medium">
											{commission.title}
										</TableCell>
										<TableCell>
											<Badge
												variant={
													commission.commissionStatus === "ACTIVE"
														? "default"
														: "secondary"
												}
												className={getStatusBadgeClassName(
													commission.commissionStatus,
												)}
											>
												{commission.commissionStatus}
											</Badge>
										</TableCell>
										<TableCell>
											{commission.basePrice} {commission.currencyCode}
										</TableCell>
										<TableCell>
											<ClientDate
												value={commission.createdAt}
												className="text-muted-foreground"
											/>
										</TableCell>
										<TableCell>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button
														variant="ghost"
														size="icon"
														className="size-8"
														aria-label={`Open actions for ${commission.title}`}
													>
														<MoreHorizontal className="size-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													{commission.commissionStatus === "DRAFT" && (
														<DropdownMenuItem
															onClick={() => handlePublish(commission.id)}
														>
															<Send className="mr-2 size-4" />
															Publish
														</DropdownMenuItem>
													)}
													<DropdownMenuItem asChild>
														<Link
															to={
																`/${user?.username}/commissions/${commission.id}` as string
															}
														>
															<ExternalLink className="mr-2 size-4" />
															View Page
														</Link>
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() => handleDelete(commission.id)}
														className="text-destructive focus:text-destructive"
													>
														<Trash className="mr-2 size-4" />
														Delete
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>
			</div>

			{isCreateModalOpen && user && (
				<CreateCommissionForm
					username={user.username || user.userId}
					tab="commissions"
					artistId={user.userId}
					onClose={() => {
						setIsCreateModalOpen(false);
					}}
				/>
			)}
		</div>
	);
}
