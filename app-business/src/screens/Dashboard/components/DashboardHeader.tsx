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
			<Text
				style={[
					styles.welcomeText,
					{ color: colors.textSecondaryLight },
				]}
			>
				¡Bienvenido,{" "}
				{loadingUser ? (
					<Skeleton width={100} height={10} variant="text" />
				) : (
					firstName
				)}
				!
			</Text>

			<View style={styles.selector}>
				{loadings.fetch ? (
					<Skeleton
						width={180}
						height={24}
						variant="text"
						style={{ marginTop: 4 }}
					/>
				) : (
					<Text
						style={[
							styles.businessName,
							{ color: colors.textPrimaryLight },
						]}
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
		paddingHorizontal: Spacing.md,
		paddingBottom: Spacing.xs,
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	welcomeText: {
		fontSize: FontSize.sm,
		fontWeight: FontWeight.medium,
	},
	selector: {
		marginTop: Spacing.xs,
		alignSelf: "flex-start",
	},
	businessName: {
		fontSize: FontSize.xl,
		fontWeight: FontWeight.bold,
	},
});
