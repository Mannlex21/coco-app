import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Switch } from "react-native";
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

export const PreferencesCard = () => {
	const { colors, isDark, toggleTheme } = useTheme();
	const { showDialog } = useDialog();

	const cardBg = isDark ? "#1C1C1E" : "#FFFFFF";
	const subTextColor = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.55)";
	const textColor = isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.85)";

	return (
		<View style={[styles.optionsCard, { backgroundColor: cardBg }]}>
			<Text style={[styles.sectionTitle, { color: colors.businessBg }]}>
				Preferencias
			</Text>

			{/* Opción de Modo Oscuro */}
			<View
				style={[
					styles.optionRow,
					{
						borderBottomColor: isDark
							? "rgba(255,255,255,0.08)"
							: "rgba(0,0,0,0.05)",
					},
				]}
			>
				<View style={styles.optionLeft}>
					<Ionicons
						name={isDark ? "moon" : "sunny"}
						size={22}
						color={
							isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)"
						}
					/>
					<Text style={[styles.optionLabel, { color: textColor }]}>
						Modo Oscuro
					</Text>
				</View>

				<Switch
					value={isDark}
					onValueChange={toggleTheme}
					trackColor={{
						false: "rgba(0,0,0,0.1)",
						true: colors.businessBg,
					}}
					thumbColor={isDark ? "#FFFFFF" : "#F5F5F5"}
				/>
			</View>

			{/* Opción de Notificaciones */}
			<TouchableOpacity
				style={styles.optionRow}
				onPress={() =>
					showDialog({
						title: "Próximamente",
						message: "Ajustes de notificaciones de pedidos.",
						intent: "success",
					})
				}
				activeOpacity={0.7}
			>
				<View style={styles.optionLeft}>
					<Ionicons
						name="notifications"
						size={22}
						color={
							isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)"
						}
					/>
					<Text style={[styles.optionLabel, { color: textColor }]}>
						Notificaciones
					</Text>
				</View>
				<Ionicons
					name="chevron-forward"
					size={20}
					color={subTextColor}
					style={{ opacity: 0.8 }}
				/>
			</TouchableOpacity>
		</View>
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
	sectionTitle: {
		fontSize: FontSize.sm,
		fontWeight: FontWeight.bold,
		marginBottom: Spacing.sm,
	},
	optionRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: Spacing.md,
		paddingLeft: Spacing.lg,
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
});
