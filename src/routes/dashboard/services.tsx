import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
	useMyCommissions,
	useDeleteCommission,
	usePublishCommission,
} from "@/hooks/use-commisions";
import { useAuth } from "@/providers/auth";
import { DashboardHeader } from "@/components/layout/dashboard/header";
import { Button } from "@/components/ui/button";
import {
	OutlinePlus,
	OutlineClock03,
	OutlineCheck,
	OutlineClose,
} from "@/components/icons/icons";
import { CreateCommissionForm } from "@/components/layout/commision/create-commission-form";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	MoreHorizontal,
	ExternalLink,
	Pencil,
	Trash,
	Send,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/services")({
	component: DashboardServices,
});

function DashboardServices() {
	const [page, setPage] = useState(0);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

	const { user } = useAuth();
	const { data: pageData, isPending } = useMyCommissions(page, 10);
	const deleteMutation = useDeleteCommission();
	const publishMutation = usePublishCommission();

	const commissions = pageData?.content ?? [];

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this commission?")) return;
		try {
			await deleteMutation.mutateAsync(id);
			toast.success("Commission deleted successfully");
		} catch (error) {
			toast.error("Failed to delete commission");
		}
	};

	const handlePublish = async (id: string) => {
		try {
			await publishMutation.mutateAsync(id);
			toast.success("Commission published successfully");
		} catch (error) {
			toast.error("Failed to publish commission");
		}
	};

	return (
		<div className="flex flex-1 flex-col h-full bg-muted/40">
			<DashboardHeader
				title="Services"
				actions={
					<Button size={"xl"} onClick={() => setIsCreateModalOpen(true)}>
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
										Loading...
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
												className={
													commission.commissionStatus === "ACTIVE"
														? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-200"
														: commission.commissionStatus === "DRAFT"
															? "bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-200"
															: ""
												}
											>
												{commission.commissionStatus}
											</Badge>
										</TableCell>
										<TableCell>
											{commission.basePrice} {commission.currencyCode}
										</TableCell>
										<TableCell className="text-muted-foreground">
											{new Date(commission.createdAt).toLocaleDateString()}
										</TableCell>
										<TableCell>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button
														variant="ghost"
														size="icon"
														className="h-8 w-8"
													>
														<MoreHorizontal className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													{commission.commissionStatus === "DRAFT" && (
														<DropdownMenuItem
															onClick={() => handlePublish(commission.id)}
														>
															<Send className="mr-2 h-4 w-4" />
															Publish
														</DropdownMenuItem>
													)}
													<DropdownMenuItem asChild>
														<Link
															to={
																`/${user?.username}/commissions/${commission.id}` as string
															}
														>
															<ExternalLink className="mr-2 h-4 w-4" />
															View Page
														</Link>
													</DropdownMenuItem>
													{/* We can route to a full edit page if it exists, or just open modal */}
													<DropdownMenuItem
														onClick={() => handleDelete(commission.id)}
														className="text-destructive focus:text-destructive"
													>
														<Trash className="mr-2 h-4 w-4" />
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
					username={user.username}
					tab="commissions"
					artistId={user.userId}
					onClose={() => {
						setIsCreateModalOpen(false);
						// We could invalidate queries here, but the CreateCommissionForm already does some
					}}
				/>
			)}
		</div>
	);
}
