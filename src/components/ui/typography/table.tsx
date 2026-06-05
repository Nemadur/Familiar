import type { ReactNode } from "react";

export function TypographyTable({ children }: { children: ReactNode }) {
	return (
		<div className="my-6 w-full overflow-y-auto">
			<table className="w-full">
				<thead>
					<tr className="m-0 border-t p-0 even:bg-muted &[th]:&even:border &[th]:px-4 &[th]:py-2 &[th]:text-left &[th]:font-bold &[th]:&[align=center]:text-center &[th]:&[align=right]:text-right">
						{/* Thead childrens */}
					</tr>
				</thead>
				<tbody>
					<tr className="m-0 border-t p-0 even:bg-muted">
						<td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
							Empty
						</td>
						<td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
							Overflowing
						</td>
					</tr>
					<tr className="m-0 border-t p-0 even:bg-muted">
						<td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
							Modest
						</td>
						<td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
							Satisfied
						</td>
					</tr>
					<tr className="m-0 border-t p-0 even:bg-muted">
						<td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
							Full
						</td>
						<td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
							Ecstatic
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	);
}
