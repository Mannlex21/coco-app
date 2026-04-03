import { View, Text, StyleSheet, TouchableOpacity, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { useDialog } from "@coco/shared/providers";
import { FontSize, FontWeight, Spacing } from "@coco/shared/config/theme";

export const PreferencesCard = () => {
	const { colors, isDark, toggleTheme } = useTheme();
	const { showDialog } = useDialog();

	// Mapeo semántico directo
	const separatorColor = colors.borderLight;
	const textColor = colors.textPrimaryLight;
	const iconColor = colors.textSecondaryLight;
	const subTextColor = colors.textSecondaryLight;

	return (
		<View style={styles.sectionContainer}>
			<Text style={[styles.sectionTitle, { color: colors.businessBg }]}>
				Preferencias
			</Text>

			{/* Opción de Modo Oscuro */}
			<View
				style={[
					styles.optionRow,
					{ borderBottomColor: separatorColor },
				]}
			>
				<View style={styles.optionLeft}>
					<Ionicons
						name={isDark ? "moon" : "sunny"}
						size={22}
						color={iconColor}
					/>
					<Text style={[styles.optionLabel, { color: textColor }]}>
						Modo Oscuro
					</Text>
				</View>

				<Switch
					value={isDark}
					onValueChange={toggleTheme}
					trackColor={{
						false: colors.borderLight, // Más sutil que un color transparente
						true: colors.businessBg,
					}}
					thumbColor={isDark ? "#FFFFFF" : "#F5F5F5"}
				/>
			</View>

			{/* Opción de Notificaciones */}
			<TouchableOpacity
				style={[styles.optionRow, { borderBottomWidth: 0 }]}
				onPress={() =>
					showDialog({
						title: "Próximamente",
						message: "Ajustes de notificaciones de pedidos.",
						intent: "success",
					})
				}
				activeOpacity={0.6}
			>
				<View style={styles.optionLeft}>
					<Ionicons
						name="notifications"
						size={22}
						color={iconColor}
					/>
					<Text style={[styles.optionLabel, { color: textColor }]}>
						Notificaciones
					</Text>
				</View>
				<Ionicons
					name="chevron-forward"
					size={20}
					color={subTextColor}
				/>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	sectionContainer: {
		width: "100%",
		paddingVertical: Spacing.sm,
	},
	sectionTitle: {
		fontSize: FontSize.sm,
		fontWeight: FontWeight.bold,
		textTransform: "uppercase",
		marginBottom: Spacing.sm,
		paddingLeft: Spacing.xs,
	},
	optionRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: Spacing.md,
		paddingHorizontal: Spacing.xs,
		borderBottomWidth: StyleSheet.hairlineWidth,
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
