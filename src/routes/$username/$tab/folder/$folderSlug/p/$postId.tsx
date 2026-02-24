import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/$username/$tab/folder/$folderSlug/p/$postId',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/$username/$tab/folder/$folderSlug/p/$postId"!</div>
}
