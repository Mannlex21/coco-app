import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
	FontSize,
	FontWeight,
	BorderRadius,
	Spacing,
	Shadow,
} from "@coco/shared/config/theme";
import { useAppStore } from "@coco/shared/hooks/useAppStore";
import { useBusiness, useUser } from "@coco/shared/hooks/supabase";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { supabase } from "@/infrastructure/supabase/config";
import { Skeleton } from "@/components/Sekeleton";

export const StatsCard = () => {
	const { colors } = useTheme();
	const { user } = useAppStore();

	// 1. Obtenemos los datos del usuario de forma aislada
	const { userData, loadingUser } = useUser(supabase, user?.id);

	// 2. Obtenemos el negocio activo para leer la deuda semanal
	const { activeBusiness, loadingBusinesses } = useBusiness(
		supabase,
		user?.id,
		userData?.lastActiveBusinessId,
	);

	return (
		<View style={styles.statsRow}>
			{/* Tarjeta de Ventas */}
			{loadingBusinesses ? (
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
			{loadingBusinesses ? (
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
