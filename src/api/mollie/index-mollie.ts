import { apiFetch } from "@/lib/fetch";
import type { TMolliePaymentRequest, TMolliePaymentResponse, TMollieFlow } from "./types-mollie";

/**
 * Creates a payment in Mollie.
 * We prioritize calling our backend which should proxy to Mollie to keep the API key secure.
 */
export async function createMolliePayment(request: TMolliePaymentRequest) {
	return apiFetch<TMolliePaymentResponse>("/api/mollie/payments", {
		method: "POST",
		body: JSON.stringify(request),
	});
}

/**
 * Gets a payment status from Mollie via our backend.
 */
export async function getMolliePayment(paymentId: string) {
	return apiFetch<TMolliePaymentResponse>(`/api/mollie/payments/${paymentId}`);
}

export function buildMollieOnboardingUrl(baseUrl: string, params: Record<string, string | undefined>) {
  const url = new URL(baseUrl);

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
}

// 
// 
// 
export async function clientRegistrationMollie(flow: TMollieFlow, formData?: Record<string, string>) {
  // For existing accounts we don't send any form data to Mollie.
  if (flow === 'existing') {
	const existingLink = buildMollieOnboardingUrl('https://www.mollie.com/oauth2/authorize', {
	  client_id: import.meta.env.VITE_MOLLIE_CLIENT_ID,
	  redirect_uri: import.meta.env.VITE_MOLLIE_REDIRECT_URI,
	  state: import.meta.env.VITE_MOLLIE_STATE,
	  scope: import.meta.env.VITE_MOLLIE_SCOPES,
	});
    return Promise.resolve({ _links: { clientLink: { href: existingLink } } });
  } else {
    const url = new URL('https://api.mollie.com/v2/client-links');
  
    // Use provided formData when available to make this function easier to maintain/test
	// TODO: validate formData fields before sending to Mollie
    const registrationNumber = formData?.registrationNumber ?? '';
    const vatNumber = formData?.vatNumber ?? '';
    const mollieClientData = {
      existingAccount: false,
      owner: {
        email: formData?.ownerEmail,
        givenName: formData?.givenName,
        familyName: formData?.familyName,
      },
      name: formData?.businessName,
      address: {
        streetAndNumber: formData?.streetAndNumber,
        postalCode: formData?.postalCode,
        city: formData?.city,
        country: formData?.country,
        ...(registrationNumber ? { registrationNumber } : {}),
        ...(vatNumber ? { vatNumber } : {}),
      },
    };
  
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_MOLLIE_API_KEY}`,
      },
      body: JSON.stringify(mollieClientData),
    });
  
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Mollie client registration failed: ${response.status} ${response.statusText} - ${errorText}`);
    }
  
    return response.json();
  }

}