import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
	FontSize,
	Spacing,
	FontWeight,
	BorderRadius,
} from "@coco/shared/config/theme";
import { useTheme } from "@coco/shared/hooks/useTheme";

export const SummaryCards = () => {
	const { colors } = useTheme();

	return (
		<View style={styles.summaryRow}>
			<View
				style={[
					styles.summaryCard,
					{
						backgroundColor: colors.inputBg,
						borderColor: colors.borderLight,
					},
				]}
			>
				<Ionicons
					name="cash-outline"
					size={16}
					color={colors.businessBg}
					style={styles.iconMargin}
				/>
				<Text
					style={[
						styles.summaryTitle,
						{ color: colors.textSecondaryLight },
					]}
				>
					Ventas de hoy
				</Text>
				<Text
					style={[
						styles.summaryValue,
						{ color: colors.textPrimaryLight },
					]}
				>
					$1,250.00
				</Text>
			</View>

			<View
				style={[
					styles.summaryCard,
					{
						backgroundColor: colors.inputBg,
						borderColor: colors.borderLight,
					},
				]}
			>
				<Ionicons
					name="receipt-outline"
					size={16}
					color={colors.businessBg}
					style={styles.iconMargin}
				/>
				<Text
					style={[
						styles.summaryTitle,
						{ color: colors.textSecondaryLight },
					]}
				>
					Pedidos de hoy
				</Text>
				<Text
					style={[
						styles.summaryValue,
						{ color: colors.textPrimaryLight },
					]}
				>
					14
				</Text>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	summaryRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: Spacing.md,
		marginTop: Spacing.xs,
	},
	summaryCard: {
		flex: 0.48,
		borderRadius: BorderRadius.md,
		padding: Spacing.md,
		borderWidth: 1,
	},
	iconMargin: {
		marginBottom: Spacing.xs,
	},
	summaryTitle: {
		fontSize: FontSize.xs,
		fontWeight: FontWeight.medium,
		marginBottom: 2,
	},
	summaryValue: {
		fontSize: FontSize.lg,
		fontWeight: FontWeight.bold,
	},
});
