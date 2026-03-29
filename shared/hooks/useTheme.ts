import { useAppStore } from "@coco/shared/hooks/useAppStore";
import { Colors } from "@coco/shared/config/theme";

export const useTheme = () => {
	const { themeMode, setThemeMode } = useAppStore(); // O como lo tengas en Zustand

	const isDark = themeMode === "dark";

	// Aquí centralizas la lógica de cambio
	const toggleTheme = () => {
		setThemeMode(isDark ? "light" : "dark");
	};

	// Mantenemos la protección de colores que ya conocemos
	const colors = isDark ? Colors.dark : Colors.light;

	return {
		colors,
		isDark,
		toggleTheme,
	};
};
