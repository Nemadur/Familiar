import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/auth/mollie/callback')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_main/auth/mollie/callback"!</div>
}

// TODO: handle the callback from Mollie after user completes onboarding
// 1. get the authorization code from the query parameters
// 2. exchange the authorization code for an access token by calling our backend API which will proxy to Mollie
// 3. store the access token securely (e.g., in HttpOnly cookie or secure storage) for making authenticated API calls to Mollie on behalf of the user