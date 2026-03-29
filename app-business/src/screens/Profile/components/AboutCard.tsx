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

export const AboutCard = () => {
	// 🔌 Conectamos directamente con los hooks globales
	const { colors, isDark } = useTheme();
	const { showDialog } = useDialog();

	const cardBg = isDark ? "#1C1C1E" : "#FFFFFF";
	const subTextColor = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.55)";
	const textColor = isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.85)";

	return (
		<View style={[styles.optionsCard, { backgroundColor: cardBg }]}>
			<Text style={[styles.sectionTitle, { color: colors.businessBg }]}>
				Acerca de Coco
			</Text>

			{/* Ayuda y Soporte */}
			<TouchableOpacity
				style={[
					styles.optionRow,
					{
						borderBottomColor: isDark
							? "rgba(255,255,255,0.08)"
							: "rgba(0,0,0,0.05)",
					},
				]}
				onPress={() =>
					showDialog({
						title: "Soporte",
						message: "Abriendo chat de WhatsApp con soporte...",
						intent: "success",
					})
				}
				activeOpacity={0.7}
			>
				<View style={styles.optionLeft}>
					<Ionicons
						name="chatbubble-ellipses"
						size={22}
						color={
							isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)"
						}
					/>
					<Text style={[styles.optionLabel, { color: textColor }]}>
						Ayuda y Soporte
					</Text>
				</View>
				<Ionicons
					name="chevron-forward"
					size={20}
					color={subTextColor}
					style={{ opacity: 0.8 }}
				/>
			</TouchableOpacity>

			{/* Términos y Condiciones */}
			<TouchableOpacity
				style={[
					styles.optionRow,
					{
						borderBottomColor: isDark
							? "rgba(255,255,255,0.08)"
							: "rgba(0,0,0,0.05)",
					},
				]}
				onPress={() =>
					showDialog({
						title: "Legal",
						message: "Abriendo términos y condiciones...",
						intent: "success",
					})
				}
				activeOpacity={0.7}
			>
				<View style={styles.optionLeft}>
					<Ionicons
						name="document-text"
						size={22}
						color={
							isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)"
						}
					/>
					<Text style={[styles.optionLabel, { color: textColor }]}>
						Términos y Condiciones
					</Text>
				</View>
				<Ionicons
					name="chevron-forward"
					size={20}
					color={subTextColor}
					style={{ opacity: 0.8 }}
				/>
			</TouchableOpacity>

			{/* Política de Privacidad */}
			<TouchableOpacity
				style={styles.optionRow}
				onPress={() =>
					showDialog({
						title: "Legal",
						message: "Abriendo política de privacidad...",
						intent: "success",
					})
				}
				activeOpacity={0.7}
			>
				<View style={styles.optionLeft}>
					<Ionicons
						name="shield-checkmark"
						size={22}
						color={
							isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)"
						}
					/>
					<Text style={[styles.optionLabel, { color: textColor }]}>
						Política de Privacidad
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
		textTransform: "uppercase",
		letterSpacing: 0.5,
		marginBottom: Spacing.sm,
	},
	optionRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: Spacing.md,
		borderBottomWidth: 0.5,
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
