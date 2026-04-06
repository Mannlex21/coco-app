export interface ColorPalette {
	// 1. Colores de Marca / Roles
	clientBg: string;
	businessBg: string;
	driverBg: string;
	cocoBase: string;
	cocoInner: string;
	cocoEyes: string;
	leafMed: string;
	leafLight: string;

	// 2. Colores de Interfaz (Estructura)
	businessLight: string;
	backgroundLight: string;
	surfaceLight: string;
	borderLight: string;
	inputBg: string;

	// 3. Tipografía
	textPrimaryLight: string;
	textSecondaryLight: string;
	textOnPrimary: string;

	// 4. Colores Semánticos (Estados)
	success: string;
	successLight: string;
	error: string;
	errorLight: string;
	warning: string;
	warningLight: string;
	info: string;
	infoLight: string;
}
const DarkTheme: ColorPalette = {
	clientBg: "#1AB5AC",
	businessBg: "#1A7D78",
	driverBg: "#C8952A",
	cocoBase: "#3E2723",
	cocoInner: "#5D4037",
	cocoEyes: "#F5F5F5",
	leafMed: "#388E3C",
	leafLight: "#689F38",

	// 2. Colores de Interfaz (Estructura)
	businessLight: "#2C1D14",
	backgroundLight: "#1E1E1E",
	surfaceLight: "#1E1E1E",
	borderLight: "#333333",
	inputBg: "#2A2A2A",

	// 3. Tipografía
	textPrimaryLight: "#F5F5F5",
	textSecondaryLight: "#AAAAAA",
	textOnPrimary: "#FFFFFF",

	// 4. Colores Semánticos (Estados)
	success: "#52B788",
	successLight: "#1A2E22",
	error: "#ff3333",
	errorLight: "#2C1B1A",
	warning: "#FFD166",
	warningLight: "#2C271A",
	info: "#64B5F6",
	infoLight: "#1A242E",
};
const LightTheme: ColorPalette = {
	// 1. Colores de Marca / Roles (Se quedan para acentos específicos)
	clientBg: "#1AB5AC", // Teal Principal (Botones primarios, Switch, Iconos clave)
	businessBg: "#1A7D78", // Teal Oscuro
	driverBg: "#C8952A", // Dorado (Para elementos secundarios o de alerta suave)

	// Ilustraciones / Mascota
	cocoBase: "#5D4037",
	cocoInner: "#D7CCC8",
	cocoEyes: "#212121",
	leafMed: "#4CAF50",
	leafLight: "#8BC34A",

	// 2. Colores de Interfaz (Estructura)
	businessLight: "#DEF7F5", // Teal Muy Claro (Solo para badges muy específicos)
	backgroundLight: "#FFFFFF", //  Crema Fondo (El lienzo total de la app)
	surfaceLight: "#FFFFFF", // Un crema ligerísimamente más claro/pálido para elevar Cards sin romper la armonía
	borderLight: "#EEEEEE", // Crema Dorada (Para líneas de separación muy finas)
	inputBg: "#F5F5F5", // Fondo limpio y armónico para las cajas de texto

	// 3. Tipografía
	textPrimaryLight: "#000000", //  Negro absoluto para máxima legibilidad y minimalismo
	textSecondaryLight: "#666666", // Un gris oscuro estándar para subtítulos
	textOnPrimary: "#FFFFFF", // Blanco para el texto dentro de botones rellenos

	// 4. Colores Semánticos
	success: "#2D6A4F",
	successLight: "#E8F5E9",
	error: "#ff3333",
	errorLight: "#FFF0EE",
	warning: "#C8952A", // El Dorado de tu paleta
	warningLight: "#FFF9E6",
	info: "#1AB5AC", // El Teal Principal
	infoLight: "#DEF7F5",
};

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
