import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
	FontSize,
	Spacing,
	FontWeight,
	BorderRadius,
} from "@coco/shared/config/theme";
import { useTheme } from "@coco/shared/hooks/useTheme";

export const TopProductsCard = () => {
	const { colors } = useTheme();
	const products = [
		{ rank: 1, name: "Hamburguesa Doble Queso", count: "45 ord." },
		{ rank: 2, name: "Papas Fritas Grandes", count: "32 ord." },
		{ rank: 3, name: "Malteada de Oreo", count: "28 ord." },
	];

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
				Más vendidos
			</Text>
			{products.map((item) => (
				<View key={item.rank} style={styles.productRow}>
					<Text
						style={[
							styles.productRank,
							{ color: colors.businessBg },
						]}
					>
						{item.rank}
					</Text>
					<Text
						style={[
							styles.productName,
							{ color: colors.textPrimaryLight },
						]}
					>
						{item.name}
					</Text>
					<Text
						style={[
							styles.productCount,
							{ color: colors.textSecondaryLight },
						]}
					>
						{item.count}
					</Text>
				</View>
			))}
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
	productRow: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: Spacing.sm,
	},
	productRank: {
		fontSize: FontSize.sm,
		fontWeight: FontWeight.bold,
		width: 24,
	},
	productName: {
		fontSize: FontSize.sm,
		fontWeight: FontWeight.medium,
		flex: 1,
	},
	productCount: {
		fontSize: FontSize.sm,
	},
});
