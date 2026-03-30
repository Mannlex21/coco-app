const LightTheme = {
	// 1. 🟢 MANTENEMOS TUS COLORES ORIGINALES (Para no cambiar toda la app)
	clientBg: "#3498DB",
	businessBg: "#C45E1A",
	driverBg: "#2ECC71",
	cocoBase: "#5D4037",
	cocoInner: "#D7CCC8",
	cocoEyes: "#212121",
	leafMed: "#4CAF50",
	leafLight: "#8BC34A",

	// 2. 🟢 SUMAMOS LOS COLORES DE INTERFAZ QUE PROPUSISTE
	businessLight: "#FFF5EB",
	backgroundLight: "#F8F9FA",
	surfaceLight: "#FFFFFF",
	borderLight: "#EEEEEE",

	// Tipografía
	textPrimaryLight: "#333333",
	textSecondaryLight: "#666666",
	textOnPrimary: "#FFFFFF",

	// Colores Semánticos
	success: "#2D6A4F",
	successLight: "#E8F5E9",
	error: "#E76F51",
	errorLight: "#FFF0EE",
	warning: "#FFB703",
	warningLight: "#FFF9E6",
	info: "#2196F3",
	infoLight: "#E3F2FD",
};

const DarkTheme: ColorPalette = {
	clientBg: "#2980B9",
	businessBg: "#E07A2F",
	driverBg: "#27AE60",
	cocoBase: "#3E2723",
	cocoInner: "#5D4037",
	cocoEyes: "#F5F5F5",
	leafMed: "#388E3C",
	leafLight: "#689F38",

	businessLight: "#2C1D14",
	backgroundLight: "#121212",
	surfaceLight: "#1E1E1E",
	borderLight: "#333333",

	// Tipografía
	textPrimaryLight: "#F5F5F5",
	textSecondaryLight: "#AAAAAA",
	textOnPrimary: "#FFFFFF",

	// Colores Semánticos
	success: "#52B788",
	successLight: "#1A2E22",
	error: "#F4A261",
	errorLight: "#2C1B1A",
	warning: "#FFD166",
	warningLight: "#2C271A",
	info: "#64B5F6",
	infoLight: "#1A242E",
};

export type ColorPalette = typeof LightTheme;

export const Colors = {
	light: LightTheme,
	dark: DarkTheme,
};

// --- TIPOGRAFÍA Y MEDIDAS (Se quedan exactamente igual) ---

export const Spacing = {
	xs: 4,
	sm: 8,
	md: 16,
	lg: 24,
	xl: 32,
	xxl: 48,
};

export const BorderRadius = {
	sm: 8,
	md: 12,
	lg: 16,
	xl: 24,
	full: 9999,
};

export const FontSize = {
	xs: 11,
	sm: 13,
	md: 15,
	lg: 17,
	xl: 20,
	xxl: 24,
	title: 28,
	hero: 34,
};

export const FontWeight = {
	regular: "400" as const,
	medium: "500" as const,
	semibold: "600" as const,
	bold: "700" as const,
	black: "900" as const,
};

export const Shadow = {
	sm: {
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.04, // Bajamos un pelín más la opacidad
		shadowRadius: 2, // Menos dispersión
		elevation: 1, // Elevación 1 para Android
	},
	md: {
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1.5 }, // Altura muy baja
		shadowOpacity: 0.06, // Opacidad súper ligera
		shadowRadius: 4, // Dispersión controlada
		elevation: 2, // Elevación 2 para Android
	},
	lg: {
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 3 }, // Altura máxima de 3
		shadowOpacity: 0.08, // Sigue siendo muy transparente
		shadowRadius: 8, // Difuminado elegante pero no exagerado
		elevation: 3, // Elevación 3 para Android
	},
	xl: {
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 6 }, // Altura más pronunciada para simular distancia
		shadowOpacity: 0.12, // Subimos sutilmente para que la sombra no desaparezca al difuminarse tanto
		shadowRadius: 15, // Un difuminado bien amplio y suave
		elevation: 10, // Elevación 10 para Android
	},
};
