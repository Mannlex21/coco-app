import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { useAppStore } from "@coco/shared/hooks/useAppStore";
import { useBusiness } from "@coco/shared/hooks/useBusiness";
import { db } from "@/infrastructure/firebase/config";
import { FontSize, FontWeight, Spacing } from "@coco/shared/config/theme";

export const DashboardHeader = () => {
	const { colors } = useTheme();
	const { user } = useAppStore();

	// Solo traemos el activeBusiness para pintar el nombre
	const { activeBusiness } = useBusiness(db, user?.id);
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
				Hola, {firstName} 👋
			</Text>

			{/* Cambiamos TouchableOpacity por View para que sea puramente informativo */}
			<View style={styles.selector}>
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
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	header: {
		padding: Spacing.lg,
		paddingTop: Spacing.sm + 20,
		borderBottomWidth: 1,
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
