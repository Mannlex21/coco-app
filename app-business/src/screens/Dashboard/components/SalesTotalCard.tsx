import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
	FontSize,
	Spacing,
	FontWeight,
	BorderRadius,
} from "@coco/shared/config/theme";
import { useTheme } from "@coco/shared/hooks/useTheme";

export const SalesTotalCard = () => {
	const { colors } = useTheme();

	return (
		<View
			style={[
				styles.moduleContainer,
				{
					backgroundColor: colors.inputBg,
					borderColor: colors.borderLight,
				},
			]}
		>
			<Text
				style={[
					styles.sectionTitle,
					{ color: colors.textPrimaryLight },
				]}
			>
				Ventas Totales
			</Text>
			<View style={styles.dataRow}>
				<Text
					style={[
						styles.dataLabel,
						{ color: colors.textSecondaryLight },
					]}
				>
					Esta semana
				</Text>
				<Text
					style={[
						styles.dataValue,
						{ color: colors.textPrimaryLight },
					]}
				>
					$8,420.00
				</Text>
			</View>
			<View style={styles.dataRow}>
				<Text
					style={[
						styles.dataLabel,
						{ color: colors.textSecondaryLight },
					]}
				>
					Este mes
				</Text>
				<Text
					style={[
						styles.dataValue,
						{ color: colors.textPrimaryLight },
					]}
				>
					$32,150.00
				</Text>
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
	dataRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: Spacing.sm,
	},
	dataLabel: {
		fontSize: FontSize.sm,
		fontWeight: FontWeight.medium,
	},
	dataValue: {
		fontSize: FontSize.md,
		fontWeight: FontWeight.semibold,
	},
});
