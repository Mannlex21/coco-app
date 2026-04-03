import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
	FontSize,
	Spacing,
	FontWeight,
	BorderRadius,
} from "@coco/shared/config/theme";
import { useTheme } from "@coco/shared/hooks/useTheme";

export const OrderVolumeCard = () => {
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
				Historial y Volumen
			</Text>
			<View style={styles.dataRow}>
				<Text
					style={[
						styles.dataLabel,
						{ color: colors.textSecondaryLight },
					]}
				>
					Completados
				</Text>
				<View style={styles.alignRight}>
					<Text
						style={[
							styles.dataValue,
							{ color: colors.textPrimaryLight },
						]}
					>
						142
					</Text>
					<Text
						style={[styles.percentage, { color: colors.success }]}
					>
						+12% vs mes ant.
					</Text>
				</View>
			</View>
			<View style={styles.dataRow}>
				<Text
					style={[
						styles.dataLabel,
						{ color: colors.textSecondaryLight },
					]}
				>
					Cancelados
				</Text>
				<Text style={[styles.dataValue, { color: colors.error }]}>
					3
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
	alignRight: {
		alignItems: "flex-end",
	},
	percentage: {
		fontSize: FontSize.xs,
		fontWeight: FontWeight.medium,
		marginTop: 2,
	},
});
