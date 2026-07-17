import { createFileRoute } from "@tanstack/react-router";

// TODO: utworzyć formularz sprawdzajacy dane użytkownika i dający szanse na uzupełnienie brakujących danych przed przekierowaniem do Mollie
// po uzupełnieniu i sprawdzeniu danych przekierować do Mollie z odpowiednimi parametrami (client_id, redirect_uri, state, scope)

// {
//     "owner":{
//         "email":"piekos.jan@gmail.com",
//         "givenName":"Given Familiar Name",
//         "familyName":"Familiar Family Name"
//     },
//     "name":"Familiar Customer business",
//     "address":{
//         "streetAndNumber":"Street 1234567",
//         "postalCode":"1234-12345",
//         "city":"City",
//         "country":"PL"
//     }
// }

export const Route = createFileRoute("/{-$locale}/_main/auth/mollie/connect")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/_main/auth/mollie/connect"!</div>;
}

// 1. ionclude form for collecting necessary data for Mollie client registration (e.g., company details, owner details)
// 2. on form submit, call Mollie API to create a client link and get the onboarding URL
// 3. redirect user to the Mollie onboarding URL with appropriate query parameters (client_id, redirect_uri, state, scope)
// 4. after successful onboarding, user will be redirected back to our app with an authorization code which we can exchange for an access token to make API calls on behalf of the user

// TODO: move to index-mollie.ts or create a new file for Mollie client registration related functions

async function clientRegistrationMollie() {
	const url = "https://api.mollie.com/v2/client-links";

	const registrationNumber = "30204462"; // TODO: get from user input form
	const vatNumber = "NL815839091B01"; // TODO: get from user input form
	const mollieClientData = {
		owner: {
			email: "piekos.jan@gmail.com",
			givenName: "Given Familiar Name",
			familyName: "Familiar Family Name",
		},
		name: "Familiar Customer business",
		address: {
			streetAndNumber: "Street 1234567",
			postalCode: "1234-12345",
			city: "City",
			country: "PL",
			...(registrationNumber ? { registrationNumber } : {}),
			...(vatNumber ? { vatNumber } : {}),
		},
	};

	const response = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${import.meta.env.VITE_MOLLIE_API_KEY}`,
		},
		body: JSON.stringify(mollieClientData),
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(
			`Mollie client registration failed: ${response.status} ${response.statusText} - ${errorText}`,
		);
	}

	return response.json();
}

// TODO: move to a utils file for URL building functions
function buildMollieOnboardingUrl(
	baseUrl: string,
	params: Record<string, string | undefined>,
) {
	const url = new URL(baseUrl);

	Object.entries(params).forEach(([key, value]) => {
		if (value) {
			url.searchParams.set(key, value);
		}
	});

	return url.toString();
}

// response from mollie gives us clientLink href which we can use to redirect user to Mollie onboarding flow
function handleMollieClientRegistration() {
	clientRegistrationMollie()
		.then((response) => {
			const mollieOnboardingUrl = response._links?.clientLink?.href;
			if (mollieOnboardingUrl) {
				const fullLink = buildMollieOnboardingUrl(mollieOnboardingUrl, {
					client_id: import.meta.env.VITE_MOLLIE_CLIENT_ID,
					redirect_uri: import.meta.env.VITE_MOLLIE_REDIRECT_URI,
					state: import.meta.env.VITE_MOLLIE_STATE,
					scope: import.meta.env.VITE_MOLLIE_SCOPES,
				});

				window.location.href = fullLink;
			} else {
				console.error("Mollie onboarding URL not found in response:", response);
			}
		})
		.catch((error) => {
			console.error("Error during Mollie client registration:", error);
		});
}
