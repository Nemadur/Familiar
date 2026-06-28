export function ChatPanelState({ text }: { text: string }) {
	return (
		<div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
			{text}
		</div>
	);
}
