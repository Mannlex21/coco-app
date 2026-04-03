import React from "react";
import { View, Text, TouchableOpacity, Switch, StyleSheet } from "react-native";
import {
	FontSize,
	FontWeight,
	BorderRadius,
	Spacing,
} from "@coco/shared/config/theme";
import { useBusiness } from "@coco/shared/hooks/supabase";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { useDialog } from "@coco/shared/providers/DialogContext";
import { useNavigation } from "@react-navigation/native";

export const StatusCard = () => {
	const { colors, isDark } = useTheme();
	const navigation = useNavigation<any>();
	const { showDialog } = useDialog();
	const { activeBusiness, toggleBusinessStatus, loadings } = useBusiness();

	const cardBg = colors.inputBg;
	const borderColor = colors.borderLight;

	const handleToggle = async () => {
		if (!activeBusiness || loadings.toggle) return;
		try {
			await toggleBusinessStatus(
				activeBusiness.id,
				activeBusiness.isOpen,
			);
		} catch (error) {
			console.log("Error", error);
			showDialog({
				title: "Error",
				message: "No se pudo cambiar el estado del negocio.",
				intent: "error",
			});
		}
	};

	// Si no hay negocio registrado, mostramos el banner de invitación
	if (!activeBusiness) {
		return (
			<TouchableOpacity
				style={[
					styles.registerBanner,
					{
						backgroundColor: colors.businessLight,
						borderColor: colors.businessBg,
					},
				]}
				onPress={() => navigation.navigate("BusinessSetup")}
				activeOpacity={0.8}
			>
				<View style={{ flex: 1 }}>
					<Text
						style={[
							styles.bannerTitle,
							{ color: colors.textPrimaryLight },
						]}
					>
						¡Haz crecer tu negocio!
					</Text>
					<Text
						style={[
							styles.bannerSub,
							{ color: colors.textSecondaryLight },
						]}
					>
						Registra tu establecimiento para empezar.
					</Text>
				</View>
				<View
					style={[
						styles.bannerButton,
						{ backgroundColor: colors.businessBg },
					]}
				>
					<Text
						style={[
							styles.bannerButtonText,
							{ color: colors.textOnPrimary },
						]}
					>
						Comenzar
					</Text>
				</View>
			</TouchableOpacity>
		);
	}

	// Si hay negocio registrado, mostramos el switch de estado
	return (
		<View
			style={[
				styles.mainCard,
				{
					backgroundColor: cardBg,
					borderColor: borderColor,
				},
			]}
		>
			<View style={{ justifyContent: "center" }}>
				<Text
					style={[
						styles.cardLabel,
						{ color: colors.textSecondaryLight },
					]}
				>
					Estado del Negocio
				</Text>

				<View style={styles.statusWrapper}>
					<View
						style={[
							styles.statusDot,
							{
								backgroundColor: activeBusiness.isOpen
									? colors.success
									: colors.error,
							},
						]}
					/>
					<Text
						style={[
							styles.statusTitle,
							{
								color: colors.textPrimaryLight,
							},
						]}
					>
						{activeBusiness.isOpen ? "Abierto" : "Pausado"}
					</Text>
				</View>
			</View>

			<Switch
				value={activeBusiness.isOpen}
				onValueChange={handleToggle}
				trackColor={{
					false: isDark ? "#444444" : colors.borderLight,
					true: colors.businessBg,
				}}
				thumbColor={colors.surfaceLight}
				ios_backgroundColor={isDark ? "#444444" : colors.borderLight}
				disabled={loadings.toggle} // Mantengo este disable por seguridad al hacer el switch
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	registerBanner: {
		padding: Spacing.md,
		borderRadius: BorderRadius.md,
		marginBottom: Spacing.md,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		borderWidth: 1,
	},
	bannerTitle: {
		fontSize: FontSize.md,
		fontWeight: FontWeight.bold,
	},
	bannerSub: {
		marginTop: 2,
		fontSize: FontSize.xs,
	},
	bannerButton: {
		paddingVertical: Spacing.sm,
		paddingHorizontal: Spacing.md,
		borderRadius: BorderRadius.sm,
		marginLeft: Spacing.sm,
	},
	bannerButtonText: {
		fontWeight: FontWeight.bold,
		fontSize: FontSize.sm,
	},
	mainCard: {
		padding: Spacing.md,
		borderRadius: BorderRadius.md,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: Spacing.md,
		borderWidth: 1,
	},
	cardLabel: {
		fontSize: FontSize.xs,
		fontWeight: FontWeight.bold,
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	statusWrapper: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 4,
	},
	statusDot: {
		width: 8,
		height: 8,
		borderRadius: BorderRadius.full,
		marginRight: Spacing.sm,
	},
	statusTitle: {
		fontSize: FontSize.lg,
		fontWeight: FontWeight.bold,
	},
});
