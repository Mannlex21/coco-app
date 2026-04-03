import React from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { useAppStore } from "@coco/shared/hooks/useAppStore";
import { useDialog } from "@coco/shared/providers/DialogContext";
import { useNavigation } from "@react-navigation/native";
import { FontSize, FontWeight, Spacing } from "@coco/shared/config/theme";
import { useBusiness, useUser } from "@coco/shared/hooks/supabase";
import { Business } from "@coco/shared/core/entities/Business";

export const BusinessSelectorCard = () => {
	const { colors } = useTheme();
	const { showDialog } = useDialog();
	const navigation = useNavigation<any>();

	const { activeBusiness, setActiveBusiness } = useAppStore();
	const { updateLastActiveBusiness } = useUser();
	const { businesses, loadings } = useBusiness();

	// Mapeo semántico directo usando ColorPalette
	const separatorColor = colors.borderLight;
	const textColor = colors.textPrimaryLight;
	const subTextColor = colors.textSecondaryLight;
	const iconColor = colors.textSecondaryLight;

	const handleSelectBusiness = async (business: Business) => {
		setActiveBusiness(business);
		await updateLastActiveBusiness();
		showDialog({
			title: "Negocio Seleccionado",
			message: `Ahora estás gestionando "${business.name}".`,
			intent: "success",
		});
	};

	const handleRegisterBusiness = () => {
		navigation.navigate("BusinessSetup", { title: "Registrar Negocio" });
	};

	return (
		<View style={styles.sectionContainer}>
			<Text style={[styles.sectionTitle, { color: colors.businessBg }]}>
				Tus Negocios
			</Text>

			{loadings.fetch ? (
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="small" color={colors.businessBg} />
					<Text style={[styles.loadingText, { color: subTextColor }]}>
						Cargando sucursales...
					</Text>
				</View>
			) : (
				<>
					{/* Lista de negocios */}
					{businesses.map((business: Business, index: number) => {
						const isSelected = business.id === activeBusiness?.id;

						// Quitar borde inferior solo al último elemento de la lista SI no hay botón de agregar abajo
						const isLast = index === businesses.length - 1;

						return (
							<TouchableOpacity
								key={business.id}
								style={[
									styles.optionRow,
									{ borderBottomColor: separatorColor },
									isLast &&
										businesses.length > 0 && {
											borderBottomWidth:
												StyleSheet.hairlineWidth,
										},
								]}
								onPress={() => handleSelectBusiness(business)}
								activeOpacity={0.6}
							>
								<View style={styles.optionLeft}>
									<Ionicons
										name="storefront"
										size={22}
										color={
											isSelected
												? colors.businessBg
												: iconColor
										}
									/>
									<Text
										style={[
											styles.optionLabel,
											{
												color: isSelected
													? colors.businessBg
													: textColor,
												fontWeight: isSelected
													? FontWeight.bold
													: FontWeight.medium,
											},
										]}
									>
										{business.name}
									</Text>
								</View>

								{isSelected ? (
									<Ionicons
										name="checkmark-circle"
										size={22}
										color={colors.businessBg}
									/>
								) : (
									<Ionicons
										name="chevron-forward"
										size={20}
										color={subTextColor}
									/>
								)}
							</TouchableOpacity>
						);
					})}

					{/* Mensaje de feedback si no hay negocios */}
					{businesses.length === 0 && (
						<Text
							style={[styles.emptyText, { color: subTextColor }]}
						>
							Aún no tienes negocios registrados.
						</Text>
					)}

					{/* Botón final para agregar otro negocio */}
					<TouchableOpacity
						style={[styles.optionRow, { borderBottomWidth: 0 }]}
						onPress={handleRegisterBusiness}
						activeOpacity={0.6}
					>
						<View style={styles.optionLeft}>
							<Ionicons
								name="add-circle"
								size={22}
								color={iconColor}
							/>
							<Text
								style={[
									styles.optionLabel,
									{ color: textColor },
								]}
							>
								Registrar otro negocio
							</Text>
						</View>
						<Ionicons
							name="chevron-forward"
							size={20}
							color={subTextColor}
						/>
					</TouchableOpacity>
				</>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	sectionContainer: {
		width: "100%",
		paddingVertical: Spacing.sm,
	},
	sectionTitle: {
		fontSize: FontSize.sm,
		fontWeight: FontWeight.bold,
		textTransform: "uppercase",
		marginBottom: Spacing.sm,
		paddingLeft: Spacing.xs,
	},
	optionRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: Spacing.md,
		paddingHorizontal: Spacing.xs,
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	optionLeft: {
		flexDirection: "row",
		alignItems: "center",
	},
	optionLabel: {
		fontSize: FontSize.md,
		marginLeft: Spacing.md,
	},
	loadingContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: Spacing.lg,
	},
	loadingText: {
		marginLeft: Spacing.sm,
		fontSize: FontSize.sm,
	},
	emptyText: {
		textAlign: "center",
		fontSize: FontSize.sm,
		paddingVertical: Spacing.md,
	},
});
