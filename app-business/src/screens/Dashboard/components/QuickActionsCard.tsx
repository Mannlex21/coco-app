import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
	FontSize,
	Spacing,
	FontWeight,
	BorderRadius,
} from "@coco/shared/config/theme";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export const QuickActionsCard = () => {
	const { colors } = useTheme();
	const navigation = useNavigation();

	const textColor = colors.textPrimaryLight;
	const subTextColor = colors.textSecondaryLight;
	const cardBg = colors.inputBg;
	const borderColor = colors.borderLight;

	// Arreglo con los accesos directos más importantes para el negocio
	const actions = [
		{
			id: "menu",
			title: "Mi Menú",
			subtitle: "Platillos y precios",
			icon: "restaurant-outline",
			screen: "MenuManagement",
		},
		{
			id: "history",
			title: "Historial",
			subtitle: "Ver órdenes pasadas",
			icon: "time-outline",
			screen: "OrderHistory",
		},
		{
			id: "promo",
			title: "Promociones",
			subtitle: "Crear descuentos",
			icon: "ticket-outline",
			screen: "Promotions",
		},
		{
			id: "settings",
			title: "Ajustes",
			subtitle: "Horarios y datos",
			icon: "settings-outline",
			screen: "BusinessSettings",
		},
	];

	return (
		<View
			style={[
				styles.moduleContainer,
				{ backgroundColor: cardBg, borderColor: borderColor },
			]}
		>
			<Text style={[styles.sectionTitle, { color: textColor }]}>
				Accesos Rápidos
			</Text>

			<View style={styles.grid}>
				{actions.map((action) => (
					<TouchableOpacity
						key={action.id}
						style={[
							styles.actionButton,
							{
								backgroundColor: colors.surfaceLight,
								borderColor: borderColor,
							},
						]}
						onPress={() =>
							navigation.navigate(action.screen as never)
						}
						activeOpacity={0.7}
					>
						<View
							style={[
								styles.iconWrapper,
								{ backgroundColor: colors.businessLight },
							]}
						>
							<Ionicons
								name={action.icon as any}
								size={20}
								color={colors.businessBg}
							/>
						</View>
						<View style={styles.textWrapper}>
							<Text
								style={[
									styles.actionTitle,
									{ color: textColor },
								]}
								numberOfLines={1}
							>
								{action.title}
							</Text>
							<Text
								style={[
									styles.actionSubtitle,
									{ color: subTextColor },
								]}
								numberOfLines={1}
							>
								{action.subtitle}
							</Text>
						</View>
						<Ionicons
							name="chevron-forward"
							size={16}
							color={subTextColor}
						/>
					</TouchableOpacity>
				))}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	moduleContainer: {
		borderRadius: BorderRadius.md,
		padding: Spacing.md,
		marginBottom: Spacing.md,
		borderWidth: 1,
	},
	sectionTitle: {
		fontSize: FontSize.md,
		fontWeight: FontWeight.bold,
		marginBottom: Spacing.md,
	},
	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
	},
	actionButton: {
		width: "100%", // Lista vertical limpia, si prefieres cuadrícula me avisas y lo cambiamos a "48%"
		flexDirection: "row",
		alignItems: "center",
		padding: Spacing.md,
		borderRadius: BorderRadius.sm,
		borderWidth: 1,
		marginBottom: Spacing.sm,
	},
	iconWrapper: {
		width: 38,
		height: 38,
		borderRadius: BorderRadius.sm,
		justifyContent: "center",
		alignItems: "center",
		marginRight: Spacing.md,
	},
	textWrapper: {
		flex: 1,
		justifyContent: "center",
	},
	actionTitle: {
		fontSize: FontSize.sm,
		fontWeight: FontWeight.bold,
		marginBottom: 2,
	},
	actionSubtitle: {
		fontSize: FontSize.xs,
		fontWeight: FontWeight.medium,
	},
});
