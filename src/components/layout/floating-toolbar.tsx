// Floating Toolbar
import LanguageSelect from "./select/language";
import ThemeToggle from "./select/theme-toggle";
// TODO: maybe use as FAB? we need beter idea for placement of selectors

export default function FloatingToolbar() {
	return (
		<nav className="fixed hidden lg:flex flex-col gap-2 bottom-6 right-6 items-end">
			<LanguageSelect />
			<ThemeToggle />
		</nav>
	);
}
