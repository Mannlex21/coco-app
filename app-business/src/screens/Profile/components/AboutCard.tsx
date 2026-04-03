import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { useDialog } from "@coco/shared/providers/DialogContext";
import { FontSize, FontWeight, Spacing } from "@coco/shared/config/theme";

export const AboutCard = () => {
	const { colors } = useTheme();
	const { showDialog } = useDialog();

	// Mapeo semántico directo
	const separatorColor = colors.borderLight;
	const textColor = colors.textPrimaryLight;
	const iconColor = colors.textSecondaryLight;
	const subTextColor = colors.textSecondaryLight;

	return (
		<View style={styles.sectionContainer}>
			{/* Título de la sección plano */}
			<Text style={[styles.sectionTitle, { color: colors.businessBg }]}>
				Acerca de Coco
			</Text>

			{/* Ayuda y Soporte */}
			<TouchableOpacity
				style={[
					styles.optionRow,
					{ borderBottomColor: separatorColor },
				]}
				onPress={() =>
					showDialog({
						title: "Soporte",
						message: "Abriendo chat de WhatsApp con soporte...",
						intent: "success",
					})
				}
				activeOpacity={0.6}
			>
				<View style={styles.optionLeft}>
					<Ionicons
						name="chatbubble-ellipses"
						size={22}
						color={iconColor}
					/>
					<Text style={[styles.optionLabel, { color: textColor }]}>
						Ayuda y Soporte
					</Text>
				</View>
				<Ionicons
					name="chevron-forward"
					size={20}
					color={subTextColor}
				/>
			</TouchableOpacity>

			{/* Términos y Condiciones */}
			<TouchableOpacity
				style={[
					styles.optionRow,
					{ borderBottomColor: separatorColor },
				]}
				onPress={() =>
					showDialog({
						title: "Legal",
						message: "Abriendo términos y condiciones...",
						intent: "success",
					})
				}
				activeOpacity={0.6}
			>
				<View style={styles.optionLeft}>
					<Ionicons
						name="document-text"
						size={22}
						color={iconColor}
					/>
					<Text style={[styles.optionLabel, { color: textColor }]}>
						Términos y Condiciones
					</Text>
				</View>
				<Ionicons
					name="chevron-forward"
					size={20}
					color={subTextColor}
				/>
			</TouchableOpacity>

			{/* Política de Privacidad */}
			<TouchableOpacity
				style={[styles.optionRow, { borderBottomWidth: 0 }]}
				onPress={() =>
					showDialog({
						title: "Legal",
						message: "Abriendo política de privacidad...",
						intent: "success",
					})
				}
				activeOpacity={0.6}
			>
				<View style={styles.optionLeft}>
					<Ionicons
						name="shield-checkmark"
						size={22}
						color={iconColor}
					/>
					<Text style={[styles.optionLabel, { color: textColor }]}>
						Política de Privacidad
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
		paddingLeft: Spacing.xs, // Alineado con el contenido de las filas
	},
	optionRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: Spacing.md,
		paddingHorizontal: Spacing.xs, // Alineación al ras de la pantalla
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
