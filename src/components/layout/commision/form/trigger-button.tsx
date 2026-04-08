import { useTranslation } from "react-i18next";
import { SolidUser } from "@/components/icons/icons";
import { Button } from "@/components/ui/button";

export default function CreateNewCommission() {
	const { t } = useTranslation();
	return (
		<Button>
			<SolidUser />
			{t("commissions.create-new", "Create commission")}
		</Button>
	);
}
