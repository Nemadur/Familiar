import {
	DndContext,
	type DragEndEvent,
	type DraggableAttributes,
	type DraggableSyntheticListeners,
	type DragOverEvent,
	DragOverlay,
	type DragStartEvent,
	type DropAnimation,
	defaultDropAnimationSideEffects,
	KeyboardSensor,
	MeasuringStrategy,
	type Modifiers,
	MouseSensor,
	TouchSensor,
	type UniqueIdentifier,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	type AnimateLayoutChanges,
	arrayMove,
	defaultAnimateLayoutChanges,
	rectSortingStrategy,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Slot } from "radix-ui";
import type * as React from "react";
import {
	type CSSProperties,
	createContext,
	type Dispatch,
	type HTMLAttributes,
	type ReactNode,
	type SetStateAction,
	useCallback,
	use,
	useMemo,
	useState,
} from "react";
import { createPortal } from "react-dom";

import { cn } from "src/lib/utils";

type KanbanColumns<T> = Record<string, T[]>;

type KanbanItemIdGetter<T> = (item: T) => string;

interface KanbanContextProps<T> {
	columns: KanbanColumns<T>;
	setColumns: Dispatch<SetStateAction<KanbanColumns<T>>>;
	getItemId: KanbanItemIdGetter<T>;
	columnIds: string[];
	activeId: UniqueIdentifier | null;
	setActiveId: (id: UniqueIdentifier | null) => void;
	findContainer: (id: UniqueIdentifier) => string | undefined;
	isColumn: (id: UniqueIdentifier) => boolean;
	modifiers?: Modifiers;
}

interface ColumnContextValue {
	attributes: DraggableAttributes;
	listeners: DraggableSyntheticListeners | undefined;
	isDragging?: boolean;
	disabled?: boolean;
}

interface ItemContextValue {
	listeners: DraggableSyntheticListeners | undefined;
	isDragging?: boolean;
	disabled?: boolean;
}

interface KanbanDragHandlersParams<T> {
	columns: KanbanColumns<T>;
	setColumns: Dispatch<SetStateAction<KanbanColumns<T>>>;
	getItemValue: KanbanItemIdGetter<T>;
	columnIds: string[];
	setActiveId: (id: UniqueIdentifier | null) => void;
	findContainer: (id: UniqueIdentifier) => string | undefined;
	isColumn: (id: UniqueIdentifier) => boolean;
	onMove?: (event: KanbanMoveEvent) => void;
}

interface MoveAcrossColumnsParams<T> {
	columns: KanbanColumns<T>;
	activeContainer: string;
	activeIndex: number;
	overContainer: string;
	overIndex: number;
}

interface ReorderColumnItemsParams<T> {
	columns: KanbanColumns<T>;
	container: string;
	activeIndex: number;
	overIndex: number;
}

const KanbanContext = createContext<KanbanContextProps<any>>({
	columns: {},
	setColumns: () => {},
	getItemId: () => "",
	columnIds: [],
	activeId: null,
	setActiveId: () => {},
	findContainer: () => undefined,
	isColumn: () => false,
	modifiers: undefined,
});

const ColumnContext = createContext<ColumnContextValue>({
	attributes: {} as DraggableAttributes,
	listeners: undefined,
	isDragging: false,
	disabled: false,
});

const ItemContext = createContext<ItemContextValue>({
	listeners: undefined,
	isDragging: false,
	disabled: false,
});

const IsOverlayContext = createContext(false);

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
	defaultAnimateLayoutChanges({ ...args, wasDragging: true });

const dropAnimationConfig: DropAnimation = {
	sideEffects: defaultDropAnimationSideEffects({
		styles: {
			active: {
				opacity: "0.4",
			},
		},
	}),
};

export interface KanbanMoveEvent {
	event: DragEndEvent;
	activeContainer: string;
	activeIndex: number;
	overContainer: string;
	overIndex: number;
}

export interface KanbanRootProps<T> extends HTMLAttributes<HTMLDivElement> {
	value: KanbanColumns<T>;
	onValueChange: Dispatch<SetStateAction<KanbanColumns<T>>>;
	getItemValue: KanbanItemIdGetter<T>;
	children: ReactNode;
	onMove?: (event: KanbanMoveEvent) => void;
	asChild?: boolean;
	modifiers?: Modifiers;
}

function getItemIndex<T>(
	items: T[],
	id: UniqueIdentifier,
	getItemValue: KanbanItemIdGetter<T>,
) {
	return items.findIndex((item) => getItemValue(item) === id);
}

function getContainerId<T>({
	id,
	columns,
	columnIds,
	getItemValue,
}: {
	id: UniqueIdentifier;
	columns: KanbanColumns<T>;
	columnIds: string[];
	getItemValue: KanbanItemIdGetter<T>;
}) {
	if (columnIds.includes(id as string)) {
		return id as string;
	}

	return columnIds.find((columnId) =>
		(columns[columnId] ?? []).some((item) => getItemValue(item) === id),
	);
}

function getOverIndex<T>({
	overId,
	overContainer,
	columns,
	getItemValue,
	isColumn,
}: {
	overId: UniqueIdentifier;
	overContainer: string;
	columns: KanbanColumns<T>;
	getItemValue: KanbanItemIdGetter<T>;
	isColumn: (id: UniqueIdentifier) => boolean;
}) {
	const overItems = columns[overContainer] ?? [];

	if (isColumn(overId)) {
		return overItems.length;
	}

	const overIndex = getItemIndex(overItems, overId, getItemValue);
	return overIndex === -1 ? overItems.length : overIndex;
}

function reorderColumns<T>(
	columns: KanbanColumns<T>,
	activeIndex: number,
	overIndex: number,
) {
	const newOrder = arrayMove(Object.keys(columns), activeIndex, overIndex);
	const reorderedColumns: KanbanColumns<T> = {};

	newOrder.forEach((key) => {
		reorderedColumns[key] = columns[key];
	});

	return reorderedColumns;
}

function moveItemAcrossColumns<T>({
	columns,
	activeContainer,
	activeIndex,
	overContainer,
	overIndex,
}: MoveAcrossColumnsParams<T>) {
	const activeItems = columns[activeContainer] ?? [];
	const overItems = columns[overContainer] ?? [];
	const nextActiveItems = [...activeItems];
	const nextOverItems = [...overItems];
	const [movedItem] = nextActiveItems.splice(activeIndex, 1);

	if (!movedItem) {
		return columns;
	}

	nextOverItems.splice(overIndex, 0, movedItem);

	return {
		...columns,
		[activeContainer]: nextActiveItems,
		[overContainer]: nextOverItems,
	};
}

function reorderColumnItems<T>({
	columns,
	container,
	activeIndex,
	overIndex,
}: ReorderColumnItemsParams<T>) {
	if (activeIndex === overIndex) {
		return columns;
	}

	const items = columns[container] ?? [];

	return {
		...columns,
		[container]: arrayMove(items, activeIndex, overIndex),
	};
}

function canMoveItem(activeIndex: number, overIndex: number) {
	return activeIndex !== -1 && overIndex !== -1;
}

function useKanbanSensors() {
	return useSensors(
		useSensor(MouseSensor, {
			activationConstraint: {
				distance: 10,
			},
		}),
		useSensor(TouchSensor, {
			activationConstraint: {
				delay: 250,
				tolerance: 5,
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);
}

function useKanbanContainerLookup<T>(
	columns: KanbanColumns<T>,
	columnIds: string[],
	getItemValue: KanbanItemIdGetter<T>,
) {
	const isColumn = useCallback(
		(id: UniqueIdentifier) => columnIds.includes(id as string),
		[columnIds],
	);

	const findContainer = useCallback(
		(id: UniqueIdentifier) =>
			getContainerId({ id, columns, columnIds, getItemValue }),
		[columns, columnIds, getItemValue],
	);

	return { isColumn, findContainer };
}

function useKanbanDragHandlers<T>({
	columns,
	setColumns,
	getItemValue,
	columnIds,
	setActiveId,
	findContainer,
	isColumn,
	onMove,
}: KanbanDragHandlersParams<T>) {
	const handleDragStart = useCallback(
		(event: DragStartEvent) => {
			setActiveId(event.active.id);
		},
		[setActiveId],
	);

	const handleDragCancel = useCallback(() => {
		setActiveId(null);
	}, [setActiveId]);

	const handleDragOver = useCallback(
		(event: DragOverEvent) => {
			if (onMove) return;

			const { active, over } = event;
			if (!over || isColumn(active.id)) return;

			const activeContainer = findContainer(active.id);
			const overContainer = findContainer(over.id);

			if (!activeContainer || !overContainer) return;

			setColumns((previousColumns) => {
				const activeItems = previousColumns[activeContainer] ?? [];
				const activeIndex = getItemIndex(activeItems, active.id, getItemValue);
				const overIndex = getOverIndex({
					overId: over.id,
					overContainer,
					columns: previousColumns,
					getItemValue,
					isColumn,
				});

				if (!canMoveItem(activeIndex, overIndex)) {
					return previousColumns;
				}

				if (activeContainer !== overContainer) {
					return moveItemAcrossColumns({
						columns: previousColumns,
						activeContainer,
						activeIndex,
						overContainer,
						overIndex,
					});
				}

				return reorderColumnItems({
					columns: previousColumns,
					container: activeContainer,
					activeIndex,
					overIndex,
				});
			});
		},
		[findContainer, getItemValue, isColumn, onMove, setColumns],
	);

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			const { active, over } = event;

			setActiveId(null);

			if (!over) return;

			if (onMove && !isColumn(active.id)) {
				const moveEvent = createMoveEvent({
					event,
					columns,
					getItemValue,
					findContainer,
					isColumn,
				});

				if (moveEvent) {
					onMove(moveEvent);
				}

				return;
			}

			if (isColumn(active.id) && isColumn(over.id)) {
				const activeIndex = columnIds.indexOf(active.id as string);
				const overIndex = columnIds.indexOf(over.id as string);

				if (activeIndex !== overIndex) {
					setColumns((previousColumns) =>
						reorderColumns(previousColumns, activeIndex, overIndex),
					);
				}

				return;
			}

			const activeContainer = findContainer(active.id);
			const overContainer = findContainer(over.id);

			if (!activeContainer || activeContainer !== overContainer) return;

			setColumns((previousColumns) => {
				const items = previousColumns[activeContainer] ?? [];
				const activeIndex = getItemIndex(items, active.id, getItemValue);
				const overIndex = getItemIndex(items, over.id, getItemValue);

				if (!canMoveItem(activeIndex, overIndex)) {
					return previousColumns;
				}

				return reorderColumnItems({
					columns: previousColumns,
					container: activeContainer,
					activeIndex,
					overIndex,
				});
			});
		},
		[
			columnIds,
			columns,
			findContainer,
			getItemValue,
			isColumn,
			onMove,
			setActiveId,
			setColumns,
		],
	);

	return {
		handleDragStart,
		handleDragOver,
		handleDragEnd,
		handleDragCancel,
	};
}

function createMoveEvent<T>({
	event,
	columns,
	getItemValue,
	findContainer,
	isColumn,
}: {
	event: DragEndEvent;
	columns: KanbanColumns<T>;
	getItemValue: KanbanItemIdGetter<T>;
	findContainer: (id: UniqueIdentifier) => string | undefined;
	isColumn: (id: UniqueIdentifier) => boolean;
}): KanbanMoveEvent | undefined {
	const { active, over } = event;
	if (!over) return undefined;

	const activeContainer = findContainer(active.id);
	const overContainer = findContainer(over.id);

	if (!activeContainer || !overContainer) return undefined;

	const activeIndex = getItemIndex(
		columns[activeContainer] ?? [],
		active.id,
		getItemValue,
	);
	const overIndex = getOverIndex({
		overId: over.id,
		overContainer,
		columns,
		getItemValue,
		isColumn,
	});

	return {
		event,
		activeContainer,
		activeIndex,
		overContainer,
		overIndex,
	};
}

function useKanbanContextValue<T>({
	columns,
	setColumns,
	getItemValue,
	columnIds,
	activeId,
	setActiveId,
	findContainer,
	isColumn,
	modifiers,
}: KanbanContextProps<T> & {
	getItemValue: KanbanItemIdGetter<T>;
}) {
	return useMemo(
		() => ({
			columns,
			setColumns,
			getItemId: getItemValue,
			columnIds,
			activeId,
			setActiveId,
			findContainer,
			isColumn,
			modifiers,
		}),
		[
			columns,
			setColumns,
			getItemValue,
			columnIds,
			activeId,
			setActiveId,
			findContainer,
			isColumn,
			modifiers,
		],
	);
}

function Kanban<T>({
	value,
	onValueChange,
	getItemValue,
	children,
	className,
	asChild = false,
	onMove,
	modifiers,
	...props
}: KanbanRootProps<T>) {
	const columns = value;
	const setColumns = onValueChange;
	const sensors = useKanbanSensors();
	const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
	const columnIds = useMemo(() => Object.keys(columns), [columns]);
	const { isColumn, findContainer } = useKanbanContainerLookup(
		columns,
		columnIds,
		getItemValue,
	);
	const handlers = useKanbanDragHandlers({
		columns,
		setColumns,
		getItemValue,
		columnIds,
		setActiveId,
		findContainer,
		isColumn,
		onMove,
	});
	const contextValue = useKanbanContextValue({
		columns,
		setColumns,
		getItemValue,
		getItemId: getItemValue,
		columnIds,
		activeId,
		setActiveId,
		findContainer,
		isColumn,
		modifiers,
	});
	const Comp = asChild ? Slot.Root : "div";

	return (
		<KanbanContext.Provider value={contextValue}>
			<DndContext
				sensors={sensors}
				modifiers={modifiers}
				measuring={{
					droppable: {
						strategy: MeasuringStrategy.Always,
					},
				}}
				onDragStart={handlers.handleDragStart}
				onDragOver={handlers.handleDragOver}
				onDragEnd={handlers.handleDragEnd}
				onDragCancel={handlers.handleDragCancel}
			>
				<Comp
					data-slot="kanban"
					data-dragging={activeId !== null}
					className={cn(activeId !== null && "cursor-grabbing!", className)}
					{...props}
				>
					{children}
				</Comp>
			</DndContext>
		</KanbanContext.Provider>
	);
}

export interface KanbanBoardProps extends HTMLAttributes<HTMLDivElement> {
	asChild?: boolean;
}

function KanbanBoard({
	className,
	asChild = false,
	children,
	...props
}: KanbanBoardProps) {
	const { columnIds } = use(KanbanContext);
	const Comp = asChild ? Slot.Root : "div";

	return (
		<SortableContext items={columnIds} strategy={rectSortingStrategy}>
			<Comp
				data-slot="kanban-board"
				className={cn("grid auto-rows-fr gap-4 sm:grid-cols-3", className)}
				{...props}
			>
				{children}
			</Comp>
		</SortableContext>
	);
}

export interface KanbanColumnProps extends HTMLAttributes<HTMLDivElement> {
	value: string;
	disabled?: boolean;
	asChild?: boolean;
}

function KanbanColumn({
	value,
	className,
	asChild = false,
	disabled,
	children,
	...props
}: KanbanColumnProps) {
	const isOverlay = use(IsOverlayContext);
	const sortable = useSortable({
		id: value,
		disabled: disabled || isOverlay,
		animateLayoutChanges,
	});
	const { activeId, isColumn } = use(KanbanContext);
	const isColumnDragging = activeId ? isColumn(activeId) : false;
	const Comp = asChild ? Slot.Root : "div";

	if (isOverlay) {
		return (
			<OverlayColumnContextProvider>
				<Comp
					data-slot="kanban-column"
					data-value={value}
					data-dragging={true}
					className={cn("group/kanban-column flex flex-col", className)}
					{...props}
				>
					{children}
				</Comp>
			</OverlayColumnContextProvider>
		);
	}

	return (
		<ColumnContext.Provider
			value={{
				attributes: sortable.attributes,
				listeners: sortable.listeners,
				isDragging: isColumnDragging,
				disabled,
			}}
		>
			<Comp
				data-slot="kanban-column"
				data-value={value}
				data-dragging={sortable.isDragging}
				data-disabled={disabled}
				ref={sortable.setNodeRef}
				style={getSortableStyle(sortable.transform, sortable.transition)}
				className={cn(
					"group/kanban-column flex flex-col",
					sortable.isDragging && "z-50 opacity-50",
					disabled && "opacity-50",
					className,
				)}
				{...props}
			>
				{children}
			</Comp>
		</ColumnContext.Provider>
	);
}

function OverlayColumnContextProvider({ children }: { children: ReactNode }) {
	return (
		<ColumnContext.Provider
			value={{
				attributes: {} as DraggableAttributes,
				listeners: undefined,
				isDragging: true,
				disabled: false,
			}}
		>
			{children}
		</ColumnContext.Provider>
	);
}

export interface KanbanColumnHandleProps
	extends HTMLAttributes<HTMLDivElement> {
	cursor?: boolean;
	asChild?: boolean;
}

function KanbanColumnHandle({
	className,
	asChild = false,
	cursor = true,
	children,
	...props
}: KanbanColumnHandleProps) {
	const { attributes, listeners, isDragging, disabled } = use(ColumnContext);
	const Comp = asChild ? Slot.Root : "div";

	return (
		<Comp
			data-slot="kanban-column-handle"
			data-dragging={isDragging}
			data-disabled={disabled}
			{...attributes}
			{...listeners}
			className={cn(
				"opacity-0 transition-opacity group-hover/kanban-column:opacity-100",
				cursor && (isDragging ? "cursor-grabbing!" : "cursor-grab!"),
				className,
			)}
			{...props}
		>
			{children}
		</Comp>
	);
}

export interface KanbanItemProps extends HTMLAttributes<HTMLDivElement> {
	value: string;
	disabled?: boolean;
	asChild?: boolean;
}

function KanbanItem({
	value,
	className,
	asChild = false,
	disabled,
	children,
	...props
}: KanbanItemProps) {
	const isOverlay = use(IsOverlayContext);
	const sortable = useSortable({
		id: value,
		disabled: disabled || isOverlay,
		animateLayoutChanges,
	});
	const { activeId, isColumn } = use(KanbanContext);
	const isItemDragging = activeId ? !isColumn(activeId) : false;
	const Comp = asChild ? Slot.Root : "div";

	if (isOverlay) {
		return (
			<OverlayItemContextProvider>
				<Comp
					data-slot="kanban-item"
					data-value={value}
					data-dragging={true}
					className={cn(className)}
					{...props}
				>
					{children}
				</Comp>
			</OverlayItemContextProvider>
		);
	}

	return (
		<ItemContext.Provider
			value={{
				listeners: sortable.listeners,
				isDragging: isItemDragging,
				disabled,
			}}
		>
			<Comp
				data-slot="kanban-item"
				data-value={value}
				data-dragging={sortable.isDragging}
				data-disabled={disabled}
				ref={sortable.setNodeRef}
				style={getSortableStyle(sortable.transform, sortable.transition)}
				{...sortable.attributes}
				className={cn(
					sortable.isDragging && "z-50 opacity-50",
					disabled && "opacity-50",
					className,
				)}
				{...props}
			>
				{children}
			</Comp>
		</ItemContext.Provider>
	);
}

function OverlayItemContextProvider({ children }: { children: ReactNode }) {
	return (
		<ItemContext.Provider
			value={{ listeners: undefined, isDragging: true, disabled: false }}
		>
			{children}
		</ItemContext.Provider>
	);
}

function getSortableStyle(
	transform: Parameters<typeof CSS.Transform.toString>[0],
	transition: string | undefined,
) {
	return {
		transition,
		transform: CSS.Transform.toString(transform),
	} as CSSProperties;
}

export interface KanbanItemHandleProps extends HTMLAttributes<HTMLDivElement> {
	cursor?: boolean;
	asChild?: boolean;
}

function KanbanItemHandle({
	className,
	asChild = false,
	cursor = true,
	children,
	...props
}: KanbanItemHandleProps) {
	const { listeners, isDragging, disabled } = use(ItemContext);
	const Comp = asChild ? Slot.Root : "div";

	return (
		<Comp
			data-slot="kanban-item-handle"
			data-dragging={isDragging}
			data-disabled={disabled}
			{...listeners}
			className={cn(
				cursor && (isDragging ? "cursor-grabbing!" : "cursor-grab!"),
				className,
			)}
			{...props}
		>
			{children}
		</Comp>
	);
}

export interface KanbanColumnContentProps
	extends HTMLAttributes<HTMLDivElement> {
	value: string;
	asChild?: boolean;
}

function KanbanColumnContent({
	value,
	className,
	asChild = false,
	children,
	...props
}: KanbanColumnContentProps) {
	const { columns, getItemId } = use(KanbanContext);
	const itemIds = useMemo(
		() => (columns[value] ?? []).map(getItemId),
		[columns, getItemId, value],
	);
	const Comp = asChild ? Slot.Root : "div";

	return (
		<SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
			<Comp
				data-slot="kanban-column-content"
				className={cn("flex flex-col gap-2", className)}
				{...props}
			>
				{children}
			</Comp>
		</SortableContext>
	);
}

export interface KanbanOverlayProps
	extends Omit<React.ComponentProps<typeof DragOverlay>, "children"> {
	children?:
		| ReactNode
		| ((params: {
				value: UniqueIdentifier;
				variant: "column" | "item";
		  }) => ReactNode);
}

function KanbanOverlay({ children, className, ...props }: KanbanOverlayProps) {
	const { activeId, isColumn, modifiers } = use(KanbanContext);

	if (typeof document === "undefined") {
		return null;
	}

	const variant = activeId ? (isColumn(activeId) ? "column" : "item") : "item";
	const content = getOverlayContent(children, activeId, variant);

	return createPortal(
		<DragOverlay
			dropAnimation={dropAnimationConfig}
			modifiers={modifiers}
			className={cn("z-50", activeId && "cursor-grabbing", className)}
			{...props}
		>
			<IsOverlayContext.Provider value={true}>
				{content}
			</IsOverlayContext.Provider>
		</DragOverlay>,
		document.body,
	);
}

function getOverlayContent(
	children: KanbanOverlayProps["children"],
	activeId: UniqueIdentifier | null,
	variant: "column" | "item",
) {
	if (!activeId || !children) {
		return null;
	}

	if (typeof children === "function") {
		return children({ value: activeId, variant });
	}

	return children;
}

export {
	Kanban,
	KanbanBoard,
	KanbanColumn,
	KanbanColumnHandle,
	KanbanItem,
	KanbanItemHandle,
	KanbanColumnContent,
	KanbanOverlay,
};
