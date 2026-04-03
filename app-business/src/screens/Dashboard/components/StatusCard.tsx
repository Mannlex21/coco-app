import React from "react";
import { View, Text, TouchableOpacity, Switch, StyleSheet } from "react-native";
import {
	FontSize,
	FontWeight,
	BorderRadius,
	Spacing,
	Shadow,
} from "@coco/shared/config/theme";
import { useBusiness } from "@coco/shared/hooks/supabase";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { useDialog } from "@coco/shared/providers/DialogContext";
import { useNavigation } from "@react-navigation/native";
import { Skeleton } from "@/components/Sekeleton";

export const StatusCard = () => {
	const { colors } = useTheme();
	const navigation = useNavigation<any>();
	const { showDialog } = useDialog();
	const { activeBusiness, toggleBusinessStatus, loadings } = useBusiness();
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

	if (loadings.fetch) {
		return (
			<Skeleton
				variant="circle"
				height={50}
				style={[
					styles.mainCard,
					{
						minHeight: 96,
						backgroundColor: colors.surfaceLight,
					},
				]}
			/>
		);
	}
	// Si no hay negocio registrado
	if (!activeBusiness) {
		return (
			<TouchableOpacity
				style={[
					styles.registerBanner,
					{ backgroundColor: colors.businessBg },
				]}
				onPress={() => navigation.navigate("BusinessSetup")}
			>
				<Text
					style={[
						styles.bannerTitle,
						{ color: colors.textOnPrimary },
					]}
				>
					¡Haz crecer tu negocio!
				</Text>
				<Text
					style={[styles.bannerSub, { color: colors.textOnPrimary }]}
				>
					Registra tu establecimiento para empezar.
				</Text>
				<View
					style={[
						styles.bannerButton,
						{ backgroundColor: colors.surfaceLight },
					]}
				>
					<Text
						style={[
							styles.bannerButtonText,
							{ color: colors.businessBg },
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
					backgroundColor: colors.surfaceLight,
					borderLeftColor: activeBusiness.isOpen
						? colors.success
						: colors.error,
				},
			]}
		>
			<View style={{ minHeight: 47 }}>
				<Text
					style={[
						styles.cardLabel,
						{ color: colors.textSecondaryLight },
					]}
				>
					Estado del Negocio
				</Text>
				<Text
					style={[
						styles.statusTitle,
						{
							color: activeBusiness.isOpen
								? colors.success
								: colors.error,
						},
					]}
				>
					{activeBusiness.isOpen
						? "RECIBIENDO PEDIDOS"
						: "PAUSADO / CERRADO"}
				</Text>
			</View>
			{!loadings.fetch && (
				<Switch
					value={activeBusiness.isOpen}
					onValueChange={handleToggle}
					trackColor={{
						false: colors.borderLight,
						true: colors.businessBg,
					}}
					thumbColor={colors.surfaceLight}
					ios_backgroundColor={colors.borderLight}
					disabled={loadings.toggle}
				/>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	registerBanner: {
		padding: Spacing.lg,
		borderRadius: BorderRadius.lg,
		marginBottom: Spacing.lg,
	},
	bannerTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
	bannerSub: {
		marginTop: 5,
		lineHeight: 20,
		fontSize: FontSize.sm,
	},
	bannerButton: {
		paddingVertical: 10,
		paddingHorizontal: Spacing.md,
		borderRadius: BorderRadius.sm,
		marginTop: Spacing.md,
		alignSelf: "flex-start",
	},
	bannerButtonText: { fontWeight: FontWeight.bold, fontSize: FontSize.sm },
	mainCard: {
		padding: Spacing.lg,
		borderRadius: BorderRadius.lg,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: Spacing.lg,
		...Shadow.md,
		borderLeftWidth: 5,
	},
	cardLabel: {
		fontSize: FontSize.xs,
		fontWeight: FontWeight.bold,
		textTransform: "uppercase",
	},
	statusTitle: {
		fontSize: FontSize.md,
		fontWeight: FontWeight.black,
		marginTop: 4,
	},
});
