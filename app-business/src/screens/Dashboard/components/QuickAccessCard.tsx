import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
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
import { useDialog } from "@coco/shared/providers/DialogContext";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "@/infrastructure/supabase/config";

export const QuickAccessCard = () => {
	const { colors } = useTheme();
	const navigation = useNavigation<any>();
	const { showDialog } = useDialog();
	const { user } = useAppStore();

	const { userData } = useUser(supabase, user?.id);

	const { activeBusiness, deleteBusiness, loadingBusinesses } = useBusiness(
		supabase,
		user?.id,
		userData?.lastActiveBusinessId,
	);

	const handleDelete = () => {
		if (!activeBusiness) return;

		showDialog({
			title: "Borrar Negocio",
			message:
				"¿Estás seguro? Esto eliminará el negocio permanentemente.",
			intent: "error",
			type: "options",
			onConfirm: async () => {
				try {
					await deleteBusiness(activeBusiness.id);
					showDialog({
						title: "Eliminado",
						message: "El negocio ha sido borrado con éxito.",
						intent: "success",
					});
				} catch (e) {
					console.log(e);
					showDialog({
						title: "Error",
						message: "No se pudo borrar el negocio.",
						intent: "error",
					});
				}
			},
		});
	};

	return (
		<View style={styles.container}>
			<Text
				style={[
					styles.sectionTitle,
					{ color: colors.textPrimaryLight },
				]}
			>
				Gestión
			</Text>

			<TouchableOpacity
				style={[
					styles.menuItem,
					{ backgroundColor: colors.surfaceLight },
				]}
				onPress={() => navigation.navigate("Catálogo")}
			>
				<Text
					style={[
						styles.menuItemText,
						{ color: colors.textPrimaryLight },
					]}
				>
					📦 Gestionar Catálogo
				</Text>
				<Text
					style={[
						styles.chevronInline,
						{ color: colors.textSecondaryLight },
					]}
				>
					›
				</Text>
			</TouchableOpacity>

			{activeBusiness && (
				<TouchableOpacity
					style={[
						styles.cancelBtn,
						{
							backgroundColor: colors.errorLight,
							borderColor: colors.error,
						},
					]}
					onPress={handleDelete}
					disabled={loadingBusinesses}
				>
					<Text
						style={[styles.deleteBtnText, { color: colors.error }]}
					>
						Borrar Negocio (Debug)
					</Text>
				</TouchableOpacity>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		marginTop: Spacing.sm,
	},
	sectionTitle: {
		fontSize: FontSize.md,
		fontWeight: FontWeight.bold,
		marginBottom: Spacing.md,
	},
	menuItem: {
		padding: Spacing.md,
		borderRadius: BorderRadius.md,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: Spacing.sm,
		...Shadow.sm,
	},
	menuItemText: {
		fontSize: FontSize.md,
		fontWeight: FontWeight.medium,
	},
	chevronInline: {
		fontSize: FontSize.lg,
	},
	cancelBtn: {
		marginTop: Spacing.xl,
		padding: Spacing.md,
		borderRadius: BorderRadius.md,
		borderWidth: 1,
		alignItems: "center",
	},
	deleteBtnText: {
		fontWeight: FontWeight.bold,
		fontSize: FontSize.sm,
	},
});
