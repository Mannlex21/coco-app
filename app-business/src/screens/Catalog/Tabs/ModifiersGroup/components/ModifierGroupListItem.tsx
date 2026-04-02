import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
	FontSize,
	FontWeight,
	Spacing,
	BorderRadius,
	ColorPalette, // Importamos la interfaz para tipar colors
} from "@coco/shared/config/theme";
import { RolesApp } from "@coco/shared/constants";

interface ModifierGroupListItemProps {
	item: any; // Aquí usarás tu interfaz ModifierGroup con un agregado de productCount
	colors: ColorPalette; // 👈 Tipado estricto con tu interfaz
	onPress: () => void;
	role?: RolesApp;
}

export const ModifierGroupListItem = ({
	item,
	colors,
	onPress,
	role,
}: ModifierGroupListItemProps) => {
	const isRequired = item.min_selectable > 0;
	const min = item.min_selectable || 0;
	const max = item.max_selectable || 0;

	// Lógica para mejorar la lectura de Mín y Máx
	let selectionRule = "";
	if (min <= 0) {
		selectionRule = "Sin cantidad";
	} else if (min === max) {
		selectionRule = min === 1 ? "Selección unica" : `Selecciona ${min}`;
	} else if (min > 0) {
		selectionRule = `Mínimo ${min} - Máximo ${max}`;
	} else {
		selectionRule = max === 1 ? "Máximo 1 opción" : `Hasta ${max} opciones`;
	}

	// Fallback por si choices viene como array o directo como número
	const optionsCount = Array.isArray(item.choices)
		? item.choices.length
		: item.options_count || 0;

	return (
		<TouchableOpacity
			style={[
				styles.container,
				{
					backgroundColor: colors.surfaceLight,
					borderBottomColor: colors.borderLight,
				},
			]}
			activeOpacity={0.7}
			onPress={onPress}
		>
			{/* Contenedor del Texto (Lado Izquierdo) */}
			<View style={styles.textContainer}>
				{/* Nombre Público */}
				<Text
					style={[styles.title, { color: colors.textPrimaryLight }]}
				>
					{item.internal_name}
				</Text>

				{/* Nombre Interno si existe */}
				{item.internal_name && (
					<Text
						style={[
							styles.internalName,
							{ color: colors.textSecondaryLight },
						]}
					>
						{item.name}
					</Text>
				)}

				{/* Reglas de selección */}
				<Text
					style={[
						styles.subtitle,
						{ color: colors.textSecondaryLight },
					]}
				>
					{selectionRule}
				</Text>
			</View>

			{/* Contenedor de Badges (Lado Derecho) */}
			<View style={styles.badgeContainer}>
				{/* 1. Badge de Cantidad de Opciones */}
				<View
					style={[
						styles.badge,
						{ backgroundColor: colors.borderLight },
					]}
				>
					<Text
						style={[
							styles.badgeText,
							{ color: colors.textPrimaryLight },
						]}
					>
						{optionsCount} opciones
					</Text>
				</View>
				<View
					style={[
						styles.statusTag,
						{
							// 🎨 Usamos los colores semánticos puros de tu paleta
							backgroundColor: isRequired
								? colors.errorLight
								: colors.successLight,
						},
					]}
				>
					<Text
						style={[
							styles.statusTagText,
							{
								color: isRequired
									? colors.error
									: colors.success,
								fontWeight: FontWeight.bold,
							},
						]}
					>
						{isRequired ? "Requerido" : "Opcional"}
					</Text>
				</View>
			</View>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "flex-start",
		justifyContent: "space-between",
		paddingVertical: Spacing.md,
		paddingHorizontal: Spacing.xs, // 4 según tu theme
		borderBottomWidth: 1,
	},
	textContainer: {
		flex: 1,
		paddingRight: Spacing.sm, // 8 según tu theme
	},
	title: {
		fontSize: FontSize.md, // 15
		fontWeight: FontWeight.semibold, // "600"
	},
	internalName: {
		fontSize: FontSize.sm, // 13
		marginTop: 2,
	},
	subtitle: {
		fontSize: FontSize.sm, // 13
		fontWeight: FontWeight.medium, // "500"
		marginTop: 4,
	},
	productsCount: {
		fontSize: FontSize.xs, // 11
		marginTop: 2,
	},
	badgeContainer: {
		alignItems: "flex-end",
		gap: Spacing.xs, // 4
	},
	badge: {
		minWidth: 80,
		paddingVertical: 4,
		paddingHorizontal: Spacing.sm, // 8
		borderRadius: BorderRadius.full, // 9999 para píldora perfecta
		justifyContent: "center",
		alignItems: "center",
	},
	badgeText: {
		fontSize: FontSize.xs, // 11
		fontWeight: FontWeight.medium, // "500"
	},
	statusTag: {
		minWidth: 80,

		paddingVertical: 2,
		paddingHorizontal: Spacing.sm, // 8
		borderRadius: BorderRadius.full, // 8
	},
	statusTagText: {
		textAlign: "center",
		fontSize: FontSize.xs - 1, // Reducido un pelín a 10 para balancear el texto en mayúsculas
		letterSpacing: 0.5,
	},
});
