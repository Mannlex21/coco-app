import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { useDialog } from "@coco/shared/providers/DialogContext";
import { AuthService } from "@/infrastructure/auth/AuthService";
import {
	FontSize,
	FontWeight,
	BorderRadius,
	Spacing,
	Shadow,
} from "@coco/shared/config/theme";

export const LogoutCard = () => {
	const { colors, isDark } = useTheme();
	const { showDialog } = useDialog();

	const cardBg = isDark ? "#1C1C1E" : "#FFFFFF";
	const subTextColor = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.55)";
	const errorColor = "rgba(231, 111, 81, 1)";

	const handleLogout = () => {
		showDialog({
			title: "Cerrar Sesión",
			message: "¿Estás seguro de que quieres salir de tu cuenta?",
			intent: "error",
			onConfirm: () => {
				(async () => {
					try {
						await AuthService.logout();
					} catch (error) {
						console.error(error);
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
		<>
			{/* Botón de Cerrar Sesión */}
			<View style={[styles.optionsCard, { backgroundColor: cardBg }]}>
				<TouchableOpacity
					style={styles.optionRow}
					onPress={handleLogout}
					activeOpacity={0.7}
				>
					<View style={styles.optionLeft}>
						<Ionicons
							name="log-out-outline"
							size={22}
							color={errorColor}
						/>
						<Text
							style={[styles.optionLabel, { color: errorColor }]}
						>
							Cerrar Sesión
						</Text>
					</View>
				</TouchableOpacity>
			</View>

			{/* Texto de la Versión */}
			<Text style={[styles.versionText, { color: subTextColor }]}>
				Coco App - Socio v1.0.0 (Beta)
			</Text>
		</>
	);
};

const styles = StyleSheet.create({
	optionsCard: {
		borderRadius: BorderRadius.lg,
		paddingHorizontal: Spacing.md,
		paddingVertical: Spacing.md,
		marginTop: Spacing.lg,
		...Shadow.md,
	},
	optionRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: Spacing.xs, // Un poco más pequeño porque es botón único
		paddingLeft: Spacing.md,
	},
	optionLeft: {
		flexDirection: "row",
		alignItems: "center",
	},
	optionLabel: {
		fontSize: FontSize.md,
		fontWeight: FontWeight.medium,
		marginLeft: Spacing.md,
	},
	versionText: {
		textAlign: "center",
		fontSize: FontSize.xs,
		opacity: 0.6,
		paddingTop: Spacing.lg,
		paddingBottom: Spacing.lg,
	},
});
