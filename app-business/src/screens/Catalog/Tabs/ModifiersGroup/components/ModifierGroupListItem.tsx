import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
	FontSize,
	FontWeight,
	Spacing,
	BorderRadius,
	ColorPalette,
} from "@coco/shared/config/theme";
import { RolesApp } from "@coco/shared/constants";

interface ModifierGroupListItemProps {
	item: any;
	colors: ColorPalette;
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
	const min = item.minSelectable || 0;
	const max = item.maxSelectable || 0;

	// Lógica para mejorar la lectura de Mín y Máx
	let selectionRule = "";

	if (min === max) {
		selectionRule = min === 1 ? "Selección única" : `Selecciona ${min}`;
	} else if (min > 0) {
		selectionRule = `Mínimo ${min} - Máximo ${max}`;
	} else {
		selectionRule = max === 1 ? "Máximo 1 opción" : `Hasta ${max} opciones`;
	}

	// Fallback por si choices viene como array o directo como número
	const optionsCount = Array.isArray(item.choices)
		? item.choices.length
		: item.optionsCount || 0;

	return (
		<TouchableOpacity
			style={[
				styles.container,
				{
					backgroundColor: colors.surfaceLight,
					borderBottomColor: colors.borderLight,
					opacity: item.isAvailable ? 1 : 0.7,
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
					{item.internalName}
				</Text>

				{/* Nombre Interno si existe */}
				{item.internalName && (
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
				{/* 1. Cantidad de Opciones */}
				<Badge
					text={`${optionsCount} opciones`}
					bgColor={colors.borderLight}
					textColor={colors.textPrimaryLight}
				/>

				{/* 2. Requerido / Opcional */}
				<Badge
					text={isRequired ? "Requerido" : "Opcional"}
					bgColor={
						isRequired ? colors.errorLight : colors.successLight
					}
					textColor={isRequired ? colors.error : colors.success}
					isBold={true}
				/>

				{/* 3. Estado de pausa */}
				{!item.isAvailable && (
					<Badge
						text="Pausado"
						bgColor={colors.errorLight}
						textColor={colors.error}
						isBold={true}
					/>
				)}
			</View>
		</TouchableOpacity>
	);
};

interface BadgeProps {
	text: string;
	bgColor: string;
	textColor: string;
	isBold?: boolean;
}

const Badge = ({ text, bgColor, textColor, isBold = false }: BadgeProps) => (
	<View style={[styles.badgeBase, { backgroundColor: bgColor }]}>
		<Text
			style={[
				styles.badgeTextBase,
				{
					color: textColor,
					fontWeight: isBold ? FontWeight.bold : FontWeight.medium,
				},
			]}
		>
			{text}
		</Text>
	</View>
);

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "flex-start",
		justifyContent: "space-between",
		paddingVertical: Spacing.md,
		paddingHorizontal: Spacing.xs,
		borderBottomWidth: 1,
	},
	textContainer: {
		flex: 1,
		paddingRight: Spacing.sm,
	},
	title: {
		fontSize: FontSize.md,
		fontWeight: FontWeight.semibold,
	},
	internalName: {
		fontSize: FontSize.sm,
		marginTop: 2,
	},
	subtitle: {
		fontSize: FontSize.sm,
		fontWeight: FontWeight.medium,
		marginTop: 4,
	},
	badgeContainer: {
		alignItems: "flex-end",
		gap: Spacing.xs,
	},
	badgeBase: {
		minWidth: 80,
		paddingVertical: 2,
		paddingHorizontal: Spacing.xs,
		borderRadius: BorderRadius.full,
		justifyContent: "center",
		alignItems: "center",
	},
	badgeTextBase: {
		textAlign: "center",
		fontSize: FontSize.xs,
		letterSpacing: 0.2,
	},
});
