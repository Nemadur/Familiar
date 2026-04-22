import type { Control } from "react-hook-form";
import { ContactEmailBlock } from "./blocks/contact-email-block";
import { CustomOptionBlock } from "./blocks/custom-option-block";
import { DeadlineBlock } from "./blocks/deadline-block";
import { ExtraInfoBlock } from "./blocks/extra-info-block";
import { LicenseBlock } from "./blocks/license-block";
import { MarketingConsentBlock } from "./blocks/marketing-consent-block";
import { NoteBlock } from "./blocks/note-block";
import { ReferencesBlock } from "./blocks/references-block";
import { RequesterNameBlock } from "./blocks/requester-name-block";
import { RequesterTermsBlock } from "./blocks/requester-terms-block";
import { SharingBlock } from "./blocks/sharing-block";
import { SocialHandlesBlock } from "./blocks/social-handles-block";
import type { RequestFormBlock } from "./request-form.types";
import type { FormValues } from "./types";

interface FormRendererProps {
	control: Control<FormValues>;
	blocks: RequestFormBlock[];
	artistName: string;
}

export function CommissionRequestFormRenderer({
	control,
	blocks,
	artistName,
}: FormRendererProps) {
	const visibleBlocks = [...blocks]
		.filter((block) => block.enabled)
		.sort((a, b) => a.order - b.order);

	return (
		<div className="space-y-10">
			{visibleBlocks.map((block) => {
				switch (block.kind) {
					case "requester_name":
						return <RequesterNameBlock key={block.id} control={control} block={block} />;
					case "contact_email":
						return <ContactEmailBlock key={block.id} control={control} block={block} />;
					case "social_handles":
						return <SocialHandlesBlock key={block.id} control={control} block={block} />;
					case "licenses":
						return <LicenseBlock key={block.id} control={control} block={block} />;
					case "custom_option":
						return <CustomOptionBlock key={block.id} control={control} block={block} />;
					case "references":
						return <ReferencesBlock key={block.id} block={block} />;
					case "sharing":
						return <SharingBlock key={block.id} control={control} block={block} />;
					case "deadline":
						return <DeadlineBlock key={block.id} control={control} block={block} />;
					case "extra_info":
						return <ExtraInfoBlock key={block.id} control={control} block={block} />;
					case "requester_terms":
						return (
							<RequesterTermsBlock
								key={block.id}
								control={control}
								block={block}
								artistName={artistName}
							/>
						);
					case "marketing_consent":
						return (
							<MarketingConsentBlock
								key={block.id}
								control={control}
								block={block}
							/>
						);
					case "note":
						return <NoteBlock key={block.id} block={block} />;
					default:
						return null;
				}
			})}
		</div>
	);
}