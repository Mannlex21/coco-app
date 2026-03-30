import { useAppStore } from "@coco/shared/hooks/useAppStore";
import { Colors } from "@coco/shared/config/theme";

export const useTheme = () => {
	const { themeMode, setThemeMode } = useAppStore();
	const isDark = themeMode === "dark";
	const toggleTheme = () => {
		setThemeMode(isDark ? "light" : "dark");
	};

	const colors = isDark ? Colors.dark : Colors.light;

	return {
		colors,
		isDark,
		toggleTheme,
	};
};
