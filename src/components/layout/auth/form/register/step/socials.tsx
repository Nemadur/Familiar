import { useEffect } from "react";
import { type Control, useFieldArray } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
} from "@/components/ui/input-group";
import type { RegisterData } from "@/types/auth/schema/register";

interface RegisterStepSocialsProps {
	control: Control<RegisterData>;
}

const STATIC_PLATFORMS = [
	{
		id: "twitter",
		label: "Twitter / X",
		prefix: "x.com/",
		placeholder: "username",
	},
	{
		id: "instagram",
		label: "Instagram",
		prefix: "instagram.com/",
		placeholder: "username",
	},
	{
		id: "discord",
		label: "Discord",
		placeholder: "username",
	},
	{
		id: "website",
		label: "Website",
		prefix: "https://",
		placeholder: "example.com",
	},
] as const;

export function RegisterStepSocials({ control }: RegisterStepSocialsProps) {
	const { t } = useTranslation();
	const { fields, replace } = useFieldArray({
		control,
		name: "socials",
	});

	// Initialize fields if empty
	useEffect(() => {
		if (fields.length === 0) {
			replace(STATIC_PLATFORMS.map((p) => ({ platform: p.id, url: "" })));
		}
	}, [fields.length, replace]);

	return (
		<div className="space-y-4">
			{STATIC_PLATFORMS.map((platform, index) => (
				<FormField
					key={platform.id}
					control={control}
					name={`socials.${index}.url`}
					render={({ field }) => (
						<FormItem>
							<FormLabel>{platform.label}</FormLabel>
							<FormControl>
								<InputGroup>
									{platform.prefix && (
										<InputGroupAddon>
											<InputGroupText>{platform.prefix}</InputGroupText>
										</InputGroupAddon>
									)}
									<InputGroupInput
										placeholder={platform.placeholder}
										{...field}
										onChange={(e) => {
											field.onChange(e);
										}}
									/>
								</InputGroup>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			))}
		</div>
	);
}
