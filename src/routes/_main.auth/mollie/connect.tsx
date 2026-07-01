import { createFileRoute } from '@tanstack/react-router'
import React, { useState } from 'react'
import { clientRegistrationMollie } from '@api/mollie/index-mollie'

export const Route = createFileRoute('/_main/auth/mollie/connect')({
  component: RouteComponent,
})

function RouteComponent() {
  const [showForm, setShowForm] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    
    // normalize form entries to a simple Record<string, string>
    const formData = Object.fromEntries(
      [...form.entries()].map(([key, value]) => [key, String(value)])
    ) as Record<string, string>;

    await clientRegistrationMollie('create', formData)
  }
  

  return (
    // FIXME: add styling and layout for the Mollie connect page
    <div style={{ padding: 16 }}>
      <h1>Mollie Connect</h1>
      <p>Connect your Mollie account to Familiar Art to enable payments and other features.</p>
      <p>You can either connect an existing Mollie account or create a new one.</p>
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => clientRegistrationMollie('existing')}>Go to Mollie (existing account)</button>
        <button onClick={() => setShowForm(s => !s)} style={{ marginLeft: 8 }}>{showForm ? 'Hide form' : 'Create Mollie account'}</button>
      </div>

      {showForm && (
        <form onSubmit={onSubmit}>
          <div>
            <label>Owner email: <input name="ownerEmail" defaultValue="piekos.jan@gmail.com" /></label>
          </div>
          <div>
            <label>Given name: <input name="givenName" defaultValue="Given Familiar Name" /></label>
          </div>
          <div>
            <label>Family name: <input name="familyName" defaultValue="Familiar Family Name" /></label>
          </div>
          <div>
            <label>Business name: <input name="businessName" defaultValue="Familiar Customer business" /></label>
          </div>
          <div>
            <label>Street and number: <input name="streetAndNumber" defaultValue="Street 1234567" /></label>
          </div>
          <div>
            <label>Postal code: <input name="postalCode" defaultValue="1234-12345" /></label>
          </div>
          <div>
            <label>City: <input name="city" defaultValue="City" /></label>
          </div>
          <div>
            <label>Country: <input name="country" defaultValue="PL" /></label>
          </div>
          <div>
            <label>Registration number: <input name="registrationNumber" /></label>
          </div>
          <div>
            <label>VAT number: <input name="vatNumber" /></label>
          </div>
          <div style={{ marginTop: 8 }}>
            <button type="submit">Submit and Redirect</button>
          </div>
        </form>
      )}
    </div>
  )
}

// 4. after successful onboarding, user will be redirected back to our app with an authorization code which we can exchange for an access token to make API calls on behalf of the user

export default RouteComponent;