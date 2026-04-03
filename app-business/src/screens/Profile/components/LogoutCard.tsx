import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { useDialog } from "@coco/shared/providers/DialogContext";
import {
	FontSize,
	FontWeight,
	BorderRadius,
	Spacing,
	Shadow,
} from "@coco/shared/config/theme";
import { useAppStore } from "@coco/shared/hooks/useAppStore";
import { useSupabaseContext } from "@coco/shared/providers/SupabaseContext";

export const LogoutCard = () => {
	const supabase = useSupabaseContext();
	const { isDark } = useTheme();
	const { showDialog } = useDialog();
	const { setActiveBusiness, setUser } = useAppStore();

	const cardBg = isDark ? "#1C1C1E" : "#FFFFFF";
	const subTextColor = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.55)";
	const errorColor = "rgba(231, 111, 81, 1)";

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
