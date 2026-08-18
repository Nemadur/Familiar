import {
	type FormEvent,
	useEffect,
	useId,
	useState,
} from "react";
import type {
	CatalogResponse,
	CreateCatalogRequest,
	UpdateCatalogRequest,
} from "@/api/portfolio/catalogs/catalog-types";
import {
	OutlineFolder,
	OutlineFolderAddOuLc,
} from "@/components/icons/icons";
import { UniversalModalLayout } from "@/components/layout/modal/universal-modal-layout";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

interface CreateCatalogModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCreateCatalog: (
		data: CreateCatalogRequest,
	) => Promise<CatalogResponse>;
	isCreating: boolean;
}

export function CreateCatalogModal({
	open,
	onOpenChange,
	onCreateCatalog,
	isCreating,
}: CreateCatalogModalProps) {
	const formId = useId();
	const nameInputId = useId();
	const descriptionInputId = useId();
	const nameDescriptionId = useId();
	const submitErrorId = useId();

	const [name, setName] = useState("");
	const [description, setDescription] =
		useState("");
	const [submitted, setSubmitted] =
		useState(false);
	const [submitError, setSubmitError] =
		useState<string | null>(null);

	const trimmedName = name.trim();

	const nameInvalid =
		submitted &&
		trimmedName.length === 0;

	useEffect(() => {
		if (!open) {
			setName("");
			setDescription("");
			setSubmitted(false);
			setSubmitError(null);
		}
	}, [open]);

	async function handleSubmit(
		event: FormEvent<HTMLFormElement>,
	) {
		event.preventDefault();

		if (isCreating) {
			return;
		}

		setSubmitted(true);
		setSubmitError(null);

		if (!trimmedName) {
			return;
		}

		try {
			await onCreateCatalog({
				name: trimmedName,
				description:
					description.trim() ||
					undefined,
			});

			onOpenChange(false);
		} catch (error) {
			setSubmitError(
				error instanceof Error
					? error.message
					: "The folder could not be created.",
			);
		}
	}

	return (
		<UniversalModalLayout
			open={open}
			onOpenChange={onOpenChange}
			title="Create portfolio folder"
			mediaClassName="bg-muted/30"
			mediaContent={
				<CatalogPreview
					name={name}
					description={description}
				/>
			}
			detailsHeaderContent={
				<div className="min-w-0">
					<h2 className="truncate text-sm font-semibold">
						Create folder
					</h2>

					<p className="truncate text-xs text-muted-foreground">
						New portfolio catalog
					</p>
				</div>
			}
			detailsContent={
				<form
					id={formId}
					className="flex flex-col gap-6 p-6"
					onSubmit={handleSubmit}
				>
					<p className="text-pretty text-sm text-muted-foreground">
						Group related portfolio posts into one catalog.
					</p>

					<FieldGroup>
						<Field
							data-invalid={
								nameInvalid ||
								undefined
							}
						>
							<FieldLabel
								htmlFor={
									nameInputId
								}
							>
								Folder name
							</FieldLabel>

							<Input
								id={nameInputId}
								value={name}
								maxLength={100}
								required
								autoFocus
								disabled={
									isCreating
								}
								aria-invalid={
									nameInvalid ||
									undefined
								}
								aria-describedby={
									nameDescriptionId
								}
								placeholder="Character illustrations"
								onChange={(
									event,
								) =>
									setName(
										event
											.target
											.value,
									)
								}
							/>

							<FieldDescription
								id={
									nameDescriptionId
								}
							>
								{nameInvalid
									? "Folder name is required."
									: "Maximum 100 characters."}
							</FieldDescription>
						</Field>

						<Field>
							<FieldLabel
								htmlFor={
									descriptionInputId
								}
							>
								Description
							</FieldLabel>

							<Textarea
								id={
									descriptionInputId
								}
								value={
									description
								}
								rows={5}
								disabled={
									isCreating
								}
								placeholder="A selected collection of finished character artwork."
								onChange={(
									event,
								) =>
									setDescription(
										event
											.target
											.value,
									)
								}
							/>

							<FieldDescription>
								Optional. You can edit
								this later.
							</FieldDescription>
						</Field>
					</FieldGroup>

					{submitError && (
						<p
							id={submitErrorId}
							role="alert"
							className="text-sm text-destructive"
						>
							{submitError}
						</p>
					)}
				</form>
			}
			detailsFooterContent={
				<div className="flex justify-end gap-2 p-4">
					<Button
						type="button"
						variant="outline"
						disabled={isCreating}
						onClick={() =>
							onOpenChange(
								false,
							)
						}
					>
						Cancel
					</Button>

					<Button
						type="submit"
						form={formId}
						disabled={
							isCreating ||
							!trimmedName
						}
						aria-describedby={
							submitError
								? submitErrorId
								: undefined
						}
					>
						{isCreating ? (
							<Spinner data-icon="inline-start" />
						) : (
							<OutlineFolderAddOuLc
								data-icon="inline-start"
								aria-hidden="true"
							/>
						)}

						{isCreating
							? "Creating..."
							: "Create folder"}
					</Button>
				</div>
			}
		/>
	);
}

interface RenameCatalogModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	catalog: CatalogResponse;
	onRenameCatalog: (
		catalogId: string,
		data: UpdateCatalogRequest,
	) => Promise<CatalogResponse>;
	isRenaming: boolean;
}

export function RenameCatalogModal({
	open,
	onOpenChange,
	catalog,
	onRenameCatalog,
	isRenaming,
}: RenameCatalogModalProps) {
	const formId = useId();
	const nameInputId = useId();
	const descriptionInputId = useId();
	const nameDescriptionId = useId();
	const submitErrorId = useId();

	const [name, setName] = useState(
		catalog.name,
	);

	const [description, setDescription] =
		useState(
			catalog.description || "",
		);

	const [submitted, setSubmitted] =
		useState(false);

	const [submitError, setSubmitError] =
		useState<string | null>(null);

	const trimmedName = name.trim();

	const nameInvalid =
		submitted &&
		trimmedName.length === 0;

	useEffect(() => {
		if (!open) {
			return;
		}

		setName(catalog.name);
		setDescription(
			catalog.description || "",
		);
		setSubmitted(false);
		setSubmitError(null);
	}, [
		open,
		catalog.id,
		catalog.name,
		catalog.description,
	]);

	async function handleSubmit(
		event: FormEvent<HTMLFormElement>,
	) {
		event.preventDefault();

		if (isRenaming) {
			return;
		}

		setSubmitted(true);
		setSubmitError(null);

		if (!trimmedName) {
			return;
		}

		try {
			await onRenameCatalog(
				catalog.id,
				{
					name: trimmedName,

					/*
					 * Keep an empty string so an existing description can
					 * be removed by the user.
					 */
					description:
						description.trim(),
				},
			);

			onOpenChange(false);
		} catch (error) {
			setSubmitError(
				error instanceof Error
					? error.message
					: "The folder could not be renamed.",
			);
		}
	}

	return (
		<UniversalModalLayout
			open={open}
			onOpenChange={onOpenChange}
			title="Rename portfolio folder"
			mediaClassName="bg-muted/30"
			mediaContent={
				<CatalogPreview
					name={name}
					description={description}
				/>
			}
			detailsHeaderContent={
				<div className="min-w-0">
					<h2 className="truncate text-sm font-semibold">
						Rename folder
					</h2>

					<p className="truncate text-xs text-muted-foreground">
						{catalog.name}
					</p>
				</div>
			}
			detailsContent={
				<form
					id={formId}
					className="flex flex-col gap-6 p-6"
					onSubmit={handleSubmit}
				>
					<p className="text-pretty text-sm text-muted-foreground">
						Update the name and description
						of this portfolio catalog.
					</p>

					<FieldGroup>
						<Field
							data-invalid={
								nameInvalid ||
								undefined
							}
						>
							<FieldLabel
								htmlFor={
									nameInputId
								}
							>
								Folder name
							</FieldLabel>

							<Input
								id={nameInputId}
								value={name}
								maxLength={100}
								required
								autoFocus
								disabled={
									isRenaming
								}
								aria-invalid={
									nameInvalid ||
									undefined
								}
								aria-describedby={
									nameDescriptionId
								}
								placeholder="Character illustrations"
								onChange={(
									event,
								) =>
									setName(
										event
											.target
											.value,
									)
								}
							/>

							<FieldDescription
								id={
									nameDescriptionId
								}
							>
								{nameInvalid
									? "Folder name is required."
									: "Maximum 100 characters."}
							</FieldDescription>
						</Field>

						<Field>
							<FieldLabel
								htmlFor={
									descriptionInputId
								}
							>
								Description
							</FieldLabel>

							<Textarea
								id={
									descriptionInputId
								}
								value={
									description
								}
								rows={5}
								disabled={
									isRenaming
								}
								placeholder="A selected collection of finished character artwork."
								onChange={(
									event,
								) =>
									setDescription(
										event
											.target
											.value,
									)
								}
							/>

							<FieldDescription>
								Optional. Leave this
								empty to remove the
								current description.
							</FieldDescription>
						</Field>
					</FieldGroup>

					{submitError && (
						<p
							id={submitErrorId}
							role="alert"
							className="text-sm text-destructive"
						>
							{submitError}
						</p>
					)}
				</form>
			}
			detailsFooterContent={
				<div className="flex justify-end gap-2 p-4">
					<Button
						type="button"
						variant="outline"
						disabled={isRenaming}
						onClick={() =>
							onOpenChange(
								false,
							)
						}
					>
						Cancel
					</Button>

					<Button
						type="submit"
						form={formId}
						disabled={
							isRenaming ||
							!trimmedName
						}
						aria-describedby={
							submitError
								? submitErrorId
								: undefined
						}
					>
						{isRenaming ? (
							<Spinner data-icon="inline-start" />
						) : (
							<OutlineFolder
								data-icon="inline-start"
								aria-hidden="true"
							/>
						)}

						{isRenaming
							? "Renaming..."
							: "Save changes"}
					</Button>
				</div>
			}
		/>
	);
}

interface CatalogPreviewProps {
	name: string;
	description: string;
}

function CatalogPreview({
	name,
	description,
}: CatalogPreviewProps) {
	const trimmedName = name.trim();
	const trimmedDescription =
		description.trim();

	return (
		<div className="flex min-h-64 size-full items-center justify-center p-8">
			<div className="relative aspect-4/3 w-full max-w-sm">
				<div className="absolute inset-x-0 bottom-0 h-[90%] rounded-2xl rounded-tl-md bg-muted ring-1 ring-border">
					<div className="absolute -top-3 left-0 h-6 w-[42%] rounded-t-xl bg-muted ring-1 ring-border" />

					<div className="absolute -top-px left-px h-3 w-[calc(42%-2px)] bg-muted" />
				</div>

				<div className="absolute inset-x-0 bottom-0 flex h-[84%] flex-col justify-end overflow-hidden rounded-2xl bg-card p-4 ring-1 ring-border">
					<div className="absolute inset-0 flex items-center justify-center bg-muted/30">
						<OutlineFolder
							aria-hidden="true"
							className="size-14 text-muted-foreground/50"
						/>
					</div>

					<div className="relative flex min-w-0 flex-col gap-1">
						<h3 className="line-clamp-2 text-pretty font-semibold">
							{trimmedName ||
								"New portfolio folder"}
						</h3>

						{trimmedDescription && (
							<p className="line-clamp-2 text-pretty text-xs text-muted-foreground">
								{
									trimmedDescription
								}
							</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}