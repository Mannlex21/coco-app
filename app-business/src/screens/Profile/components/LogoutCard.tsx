import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { useDialog } from "@coco/shared/providers/DialogContext";
import {
	FontSize,
	FontWeight,
	Spacing,
	BorderRadius,
} from "@coco/shared/config/theme";
import { useAppStore } from "@coco/shared/hooks/useAppStore";
import { useSupabaseContext } from "@coco/shared/providers/SupabaseContext";

export const LogoutCard = () => {
	const supabase = useSupabaseContext();
	const { colors } = useTheme();
	const { showDialog } = useDialog();
	const { setActiveBusiness, setUser } = useAppStore();

	// Mapeo semántico de error directo de tu ColorPalette
	const errorBg = colors.errorLight;
	const errorTextColor = colors.error;

	const handleLogout = () => {
		showDialog({
			title: "Cerrar Sesión",
			message: "¿Estás seguro de que quieres salir de tu cuenta?",
			intent: "error",
			type: "options",
			onConfirm: () => {
				(async () => {
					try {
						const { error } = await supabase.auth.signOut();
						if (error) throw error;
						setActiveBusiness(null);
						setUser(null);
					} catch (error: any) {
						console.error("Error al cerrar sesión:", error.message);
						showDialog({
							title: "Error",
							message: "No se pudo cerrar sesión.",
							intent: "error",
						});
					}
				})();
			},
		});
	};

	return (
		<View style={styles.sectionContainer}>
			<TouchableOpacity
				style={[styles.buttonRow, { backgroundColor: errorBg }]}
				onPress={handleLogout}
				activeOpacity={0.7}
			>
				<View style={styles.buttonLeft}>
					<Ionicons
						name="log-out-outline"
						size={22}
						color={errorTextColor}
					/>
					<Text
						style={[styles.buttonLabel, { color: errorTextColor }]}
					>
						Cerrar Sesión
					</Text>
				</View>

				<Ionicons
					name="chevron-forward"
					size={20}
					color={errorTextColor}
				/>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	sectionContainer: {
		width: "100%",
		paddingVertical: Spacing.sm,
		paddingHorizontal: Spacing.xs, // Mismo alineado al ras que las demás secciones
	},
	buttonRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: Spacing.md,
		paddingHorizontal: Spacing.md, // Padding interno para que el texto no pegue al borde del fondo
		borderRadius: BorderRadius.md, // Un radio sutil para darle forma de botón
	},
	buttonLeft: {
		flexDirection: "row",
		alignItems: "center",
	},
	buttonLabel: {
		fontSize: FontSize.md,
		fontWeight: FontWeight.bold, // Le damos más peso para que resalte como botón de acción
		marginLeft: Spacing.md,
	},
});
