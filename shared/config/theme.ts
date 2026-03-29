export const Colors = {
	// 1. Identidad de Apps (Fondos de Login/Splash)
	clientBg: "#1A7A4A",
	businessBg: "#C45E1A",
	driverBg: "#0A4A7A",

	// 2. Colores de la Mascota Coco
	cocoBase: "#F4A261",
	cocoInner: "#E76F51",
	cocoEyes: "#2D1B0E",

	// 3. Paleta de Hojas y Acentos
	leafMed: "#27AE60",
	leafLight: "#2ECC71",

	// 4. Semánticos (Estados)
	success: "#27AE60",
	error: "#E74C3C",
	warning: "#F39C12",
	info: "#3498DB",

	// 4.1 Fondos suaves para iconos/badges/botones outline
	successLight: "#EAF7EF", // fondo verde suave
	errorLight: "#FDEDEC", // fondo rojo suave
	warningLight: "#FEF9E7", // fondo ámbar suave
	infoLight: "#EAF4FB", // fondo azul suave

	// 4.2 Texto sobre fondos light (más oscuro que el color base)
	successText: "#1E8449", // verde oscuro
	errorText: "#C0392B", // rojo oscuro
	warningText: "#D68910", // ámbar oscuro
	infoText: "#1A6FA8", // azul oscuro

	// 5. Neutros y Superficies
	backgroundLight: "#F5F3EF",
	surfaceLight: "#FFFFFF",
	borderLight: "#E8E4DC",

	// 6. Texto
	textPrimaryLight: "#1A1A1A",
	textSecondaryLight: "#7A736A",
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

export const ButtonStyles = {
	// Sólidos — fondo lleno
	solid: {
		success: {
			backgroundColor: Colors.success,
			borderRadius: BorderRadius.md,
			color: Colors.textOnPrimary,
		},
		error: {
			backgroundColor: Colors.error,
			borderRadius: BorderRadius.md,
			color: Colors.textOnPrimary,
		},
		warning: {
			backgroundColor: Colors.warning,
			borderRadius: BorderRadius.md,
			color: Colors.textOnPrimary,
		},
		info: {
			backgroundColor: Colors.info,
			borderRadius: BorderRadius.md,
			color: Colors.textOnPrimary,
		},
		primary: {
			backgroundColor: Colors.businessBg,
			borderRadius: BorderRadius.md,
			color: Colors.textOnPrimary,
		},
	},

	// Outline — solo borde, fondo transparente
	outline: {
		success: {
			backgroundColor: "transparent",
			borderRadius: BorderRadius.md,
			borderWidth: 1,
			borderColor: Colors.success,
			color: Colors.success,
		},
		error: {
			backgroundColor: "transparent",
			borderRadius: BorderRadius.md,
			borderWidth: 1,
			borderColor: Colors.error,
			color: Colors.error,
		},
		warning: {
			backgroundColor: "transparent",
			borderRadius: BorderRadius.md,
			borderWidth: 1,
			borderColor: Colors.warning,
			color: Colors.warning,
		},
		info: {
			backgroundColor: "transparent",
			borderRadius: BorderRadius.md,
			borderWidth: 1,
			borderColor: Colors.info,
			color: Colors.info,
		},
		primary: {
			backgroundColor: "transparent",
			borderRadius: BorderRadius.md,
			borderWidth: 1,
			borderColor: Colors.businessBg,
			color: Colors.businessBg,
		},
	},

	// Light — fondo suave con texto oscuro
	light: {
		success: {
			backgroundColor: Colors.successLight,
			borderRadius: BorderRadius.md,
			color: Colors.successText,
		},
		error: {
			backgroundColor: Colors.errorLight,
			borderRadius: BorderRadius.md,
			color: Colors.errorText,
		},
		warning: {
			backgroundColor: Colors.warningLight,
			borderRadius: BorderRadius.md,
			color: Colors.warningText,
		},
		info: {
			backgroundColor: Colors.infoLight,
			borderRadius: BorderRadius.md,
			color: Colors.infoText,
		},
		primary: {
			backgroundColor: Colors.backgroundLight,
			borderRadius: BorderRadius.md,
			color: Colors.businessBg,
		},
	},
};
