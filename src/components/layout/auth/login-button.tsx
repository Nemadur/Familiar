import { useTranslation } from "react-i18next";
import { SolidUser } from "@/components/icons/icons";
import { Button } from "@/components/ui/button";

export default function LoginButton() {
	const { t } = useTranslation();
	return (
		<Button>
			<SolidUser />
			<span className={"hidden sm:inline-block"}>{t("auth.login")}</span>
		</Button>
	);
}
