import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/my-requests/$requestId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/my-requests/$requestId"!</div>
}
