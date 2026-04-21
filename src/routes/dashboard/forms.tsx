import { createFileRoute } from "@tanstack/react-router";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/providers/auth";
import User from "@/components/layout/profile/user";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
	useFormTemplates,
	useDeleteFormTemplate,
} from "@/hooks/use-form-templates";
import { Plus, Pencil, Trash2, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
// We will create this component next
import { FormTemplateModal } from "@/components/layout/commision/form-template-modal";

export const Route = createFileRoute("/dashboard/forms")({
	component: DashboardForms,
});

function DashboardForms() {
	const { user, isPending: userIsPending } = useAuth();
	const { t } = useTranslation();
	const { data: templates, isPending: templatesPending } = useFormTemplates();
	const deleteMutation = useDeleteFormTemplate();

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingTemplate, setEditingTemplate] = useState<any>(null);

	const handleDelete = async (id: string) => {
		if (confirm("Are you sure you want to delete this template?")) {
			try {
				await deleteMutation.mutateAsync(id);
				toast.success("Template deleted successfully");
			} catch (e: any) {
				toast.error(e.message || "Failed to delete template");
			}
		}
	};

	const handleEdit = (template: any) => {
		setEditingTemplate(template);
		setIsModalOpen(true);
	};

	const handleCreate = () => {
		setEditingTemplate(null);
		setIsModalOpen(true);
	};

	return (
		<div className="flex flex-1 flex-col gap-4 p-4 pt-0 h-full">
			<header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 justify-between">
				<div className="flex items-center gap-2">
					<SidebarTrigger className="-ml-1" />
					<h1 className="text-xl font-bold">Form Templates</h1>
				</div>

				<div className="flex items-center gap-4">
					<Button onClick={handleCreate} className="gap-2">
						<Plus className="size-4" />
						Create Template
					</Button>
					{userIsPending ? null : user ? (
						<User user={user} showInfo={false} isDropdown />
					) : (
						<div className="hidden lg:flex items-center gap-2">
							<Button asChild variant={"secondary"} size={"xl"}>
								<Link to="/auth/login">{t("auth.login.cta")}</Link>
							</Button>
							<Button asChild size={"xl"}>
								<Link to="/auth/register">{t("auth.register.cta")}</Link>
							</Button>
						</div>
					)}
				</div>
			</header>

			<main className="flex-1 overflow-y-auto p-4">
				{templatesPending ? (
					<div className="flex h-40 items-center justify-center">
						<Loader2 className="size-8 animate-spin text-muted-foreground" />
					</div>
				) : !templates?.length ? (
					<div className="flex h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed text-center">
						<div className="flex size-12 items-center justify-center rounded-2xl border bg-muted/50 mb-4">
							<FileText className="size-5 text-muted-foreground" />
						</div>
						<h2 className="text-lg font-semibold">No templates yet</h2>
						<p className="mt-2 text-sm text-muted-foreground max-w-sm">
							Create your first form template to gather custom requirements from
							clients when they request a commission.
						</p>
						<Button onClick={handleCreate} className="mt-6 gap-2">
							<Plus className="size-4" />
							Create Template
						</Button>
					</div>
				) : (
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{templates.map((template) => (
							<div
								key={template.id}
								className="flex flex-col justify-between rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md"
							>
								<div>
									<div className="flex items-start justify-between gap-4">
										<h3 className="font-semibold leading-none tracking-tight">
											{template.name}
										</h3>
										<span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
											v{template.version}
										</span>
									</div>
									<p className="mt-2 text-sm text-muted-foreground line-clamp-2">
										{template.description || "No description provided."}
									</p>
									<div className="mt-4 text-xs text-muted-foreground">
										{template.fields?.length || 0} fields defined
									</div>
								</div>

								<div className="mt-6 flex items-center justify-end gap-2 border-t pt-4">
									<Button
										variant="ghost"
										size="sm"
										className="h-8 gap-1.5 px-2 text-muted-foreground hover:text-foreground"
										onClick={() => handleEdit(template)}
									>
										<Pencil className="size-3.5" />
										Edit
									</Button>
									<Button
										variant="ghost"
										size="sm"
										className="h-8 gap-1.5 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
										onClick={() => handleDelete(template.id)}
									>
										<Trash2 className="size-3.5" />
										Delete
									</Button>
								</div>
							</div>
						))}
					</div>
				)}
			</main>

			{isModalOpen && (
				<FormTemplateModal
					open={isModalOpen}
					onClose={() => setIsModalOpen(false)}
					template={editingTemplate}
				/>
			)}
		</div>
	);
}
