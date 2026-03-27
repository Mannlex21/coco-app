export const Colors = {
	// 1. Identidad de Apps (Fondos de Login/Splash)
	clientBg: "#1A7A4A", // Verde selva
	businessBg: "#C45E1A", // Naranja oscuro
	driverBg: "#0A4A7A", // Azul marino

	// 2. Colores de la Mascota Coco
	cocoBase: "#F4A261", // Naranja coco
	cocoInner: "#E76F51", // Naranja interior
	cocoEyes: "#2D1B0E", // Café oscuro

	// 3. Paleta de Hojas y Acentos
	leafMed: "#27AE60", // Verde medio
	leafLight: "#2ECC71", // Verde claro

	// 4. Semánticos (Estados)
	success: "#27AE60", // Reutilizamos verde medio
	error: "#E74C3C", // Rojo estándar
	warning: "#F39C12", // Ámbar
	info: "#3498DB", // Azul

	// 5. Neutros y Superficies
	backgroundLight: "#F5F3EF",
	surfaceLight: "#FFFFFF",
	borderLight: "#E8E4DC",

	// 6. Texto
	textPrimaryLight: "#1A1A1A",
	textSecondaryLight: "#7A736A", // El gris para subtítulos que faltaba
	textOnPrimary: "#FFFFFF",
};

// Función auxiliar para obtener el color de marca según el rol
export const getBrandColor = (role: "client" | "business" | "driver") => {
	switch (role) {
		case "client":
			return Colors.clientBg;
		case "business":
			return Colors.businessBg;
		case "driver":
			return Colors.driverBg;
		default:
			return Colors.clientBg;
	}
};

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
		shadowOpacity: 0.06,
		shadowRadius: 4,
		elevation: 2,
	},
	md: {
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 12,
		elevation: 5,
	},
	lg: {
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.15,
		shadowRadius: 24,
		elevation: 10,
	},
};
