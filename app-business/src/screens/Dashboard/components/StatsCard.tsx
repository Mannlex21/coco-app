import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
	FontSize,
	FontWeight,
	BorderRadius,
	Spacing,
	Shadow,
} from "@coco/shared/config/theme";
import { useBusiness } from "@coco/shared/hooks/supabase";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { Skeleton } from "@/components/Skeleton";

export const StatsCard = () => {
	const { colors } = useTheme();

	const { activeBusiness, loadings } = useBusiness();

	return (
		<View style={styles.statsRow}>
			{/* Tarjeta de Ventas */}
			{loadings.fetch ? (
				<Skeleton
					height={70}
					variant="circle"
					style={[
						styles.miniCard,
						{
							backgroundColor: colors.surfaceLight,
							minHeight: 115,
						},
					]}
				/>
			) : (
				<View
					style={[
						styles.miniCard,
						{ backgroundColor: colors.surfaceLight },
					]}
				>
					<Text
						style={[
							styles.miniCardLabel,
							{ color: colors.textSecondaryLight },
						]}
					>
						Ventas hoy
					</Text>
					<Text
						style={[
							styles.bigAmount,
							{ color: colors.textPrimaryLight },
						]}
					>
						{activeBusiness ? "$0.00" : "--"}
					</Text>
					<Text
						style={[
							styles.infoNote,
							{ color: colors.textSecondaryLight },
						]}
					>
						0 pedidos
					</Text>
				</View>
			)}

			{/* Tarjeta de Fee Coco */}
			{loadings.fetch ? (
				<Skeleton
					width={70}
					height={70}
					variant="circle"
					style={[
						styles.miniCard,
						{
							backgroundColor: colors.surfaceLight,
							minHeight: 115,
						},
					]}
				/>
			) : (
				<View
					style={[
						styles.miniCard,
						{ backgroundColor: colors.surfaceLight },
					]}
				>
					<Text
						style={[
							styles.miniCardLabel,
							{ color: colors.textSecondaryLight },
						]}
					>
						Fee Coco
					</Text>
					<Text style={[styles.bigAmount, { color: colors.error }]}>
						{activeBusiness
							? `$${activeBusiness.weeklyDebt}`
							: "--"}
					</Text>
					<Text
						style={[
							styles.infoNote,
							{ color: colors.textSecondaryLight },
						]}
					>
						Corte: Lunes
					</Text>
				</View>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	statsRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: Spacing.lg,
	},
	miniCard: {
		padding: Spacing.md,
		borderRadius: BorderRadius.lg,
		width: "48%",
		...Shadow.md,
	},
	miniCardLabel: {
		fontSize: FontSize.sm,
		fontWeight: FontWeight.semibold,
	},
	bigAmount: {
		fontSize: FontSize.xl + 4,
		fontWeight: FontWeight.bold,
	},
	infoNote: {
		fontSize: FontSize.xs,
		marginTop: 10,
	},
});
