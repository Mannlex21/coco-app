import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { useAppStore } from "@coco/shared/hooks/useAppStore";
import { useBusiness, useUser } from "@coco/shared/hooks/supabase";
import { FontSize, FontWeight, Spacing } from "@coco/shared/config/theme";
import { Skeleton } from "@/components/Skeleton";

export const DashboardHeader = () => {
	const { colors } = useTheme();
	const { user } = useAppStore();
	const { loadingUser } = useUser();
	const { activeBusiness, loadings } = useBusiness();

	const firstName = user?.name ? user.name.split(" ")[0] : "Socio";

	return (
		<View
			style={[
				styles.header,
				{
					backgroundColor: colors.surfaceLight,
					borderBottomColor: colors.borderLight,
				},
			]}
		>
			<View style={styles.welcomeContainer}>
				{loadingUser ? (
					<Skeleton width={90} height={FontSize.xs} variant="text" />
				) : (
					<Text
						style={[
							styles.welcomeText,
							{ color: colors.textSecondaryLight },
						]}
						numberOfLines={1}
					>
						¡Hola, {firstName}!
					</Text>
				)}
			</View>
			<View style={styles.businessContainer}>
				{loadings.fetch ? (
					<Skeleton width={160} height={FontSize.xl} variant="text" />
				) : (
					<Text
						style={[
							styles.businessName,
							{ color: colors.textPrimaryLight },
						]}
						numberOfLines={1}
					>
						{activeBusiness
							? activeBusiness.name
							: "Configurar mi negocio"}
					</Text>
				)}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	header: {
		paddingHorizontal: Spacing.lg, // Más aire a los lados para look premium
		paddingTop: Spacing.sm,
		paddingBottom: Spacing.xs,
		borderBottomWidth: 1, // Usar 1 en lugar de hairlineWidth da un corte más limpio en pantallas densas
	},
	businessContainer: {
		marginBottom: Spacing.xs, // Separación controlada
		minHeight: FontSize.xl, // Evita colapso mientras carga el skeleton
		justifyContent: "center",
	},
	businessName: {
		fontSize: FontSize.xl,
		fontWeight: FontWeight.bold,
		letterSpacing: -0.5, // Toque tipográfico moderno
	},
	welcomeContainer: {
		minHeight: FontSize.xs,
		justifyContent: "center",
	},
	welcomeText: {
		fontSize: FontSize.xs,
		fontWeight: FontWeight.medium,
		textTransform: "uppercase", // El texto pequeño en mayúsculas se lee muy bien y luce minimalista
		letterSpacing: 0.5,
	},
});
