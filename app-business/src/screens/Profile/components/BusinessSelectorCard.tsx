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
import {
	FontSize,
	FontWeight,
	BorderRadius,
	Spacing,
	Shadow,
} from "@coco/shared/config/theme";
import { useBusiness } from "@coco/shared/hooks/useBusiness";
import { db } from "@/infrastructure/firebase/config";
import { Business } from "@coco/shared/core/entities/Business";

export const BusinessSelectorCard = () => {
	// 🔌 Conexiones a los hooks globales de la app
	const { colors, isDark } = useTheme();
	const { showDialog } = useDialog();
	const navigation = useNavigation<any>();
	const { user, activeBusiness, setActiveBusiness } = useAppStore();
	const { businesses, loadingBusinesses } = useBusiness(db, user?.id);

	const cardBg = isDark ? "#1C1C1E" : "#FFFFFF";
	const subTextColor = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.55)";
	const textColor = isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.85)";

	const handleSelectBusiness = (business: Business) => {
		// Guardamos el objeto completo del negocio en el Zustand store
		setActiveBusiness(business);

		showDialog({
			title: "Negocio Seleccionado",
			message: `Ahora estás gestionando "${business.name}".`,
			intent: "success",
		});
	};

	const handleRegisterBusiness = () => {
		navigation.navigate("BusinessSetup", { title: "Registrar Negocio" });
	};
	const getIconColor = (
		isSelected: boolean,
		isDark: boolean,
		businessBgColor: string,
	) => {
		if (isSelected) return businessBgColor;
		if (isDark) return "rgba(255,255,255,0.7)";
		return "rgba(0,0,0,0.6)";
	};
	return (
		<View style={[styles.optionsCard, { backgroundColor: cardBg }]}>
			<Text style={[styles.sectionTitle, { color: colors.businessBg }]}>
				Tus Negocios
			</Text>

			{loadingBusinesses ? (
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="small" color={colors.businessBg} />
					<Text style={[styles.loadingText, { color: subTextColor }]}>
						Cargando sucursales...
					</Text>
				</View>
			) : (
				<>
					{/* Mapeo de la lista real de Firebase */}
					{businesses.map((business: Business) => {
						// Comparamos los IDs para saber cuál está seleccionado
						const isSelected = business.id === activeBusiness?.id;

						const labelColor = isSelected
							? colors.businessBg
							: textColor;

						const iconColor = getIconColor(
							isSelected,
							isDark,
							colors.businessBg,
						);

						return (
							<TouchableOpacity
								key={business.id}
								style={[
									styles.optionRow,
									{
										borderBottomColor: isDark
											? "rgba(255,255,255,0.08)"
											: "rgba(0,0,0,0.05)",
									},
								]}
								onPress={() => handleSelectBusiness(business)}
								activeOpacity={0.7}
							>
								<View style={styles.optionLeft}>
									<Ionicons
										name="storefront"
										size={22}
										color={iconColor}
									/>
									<Text
										style={[
											styles.optionLabel,
											{
												color: labelColor,
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
										style={{ opacity: 0.8 }}
									/>
								)}
							</TouchableOpacity>
						);
					})}

					{/* Mensaje de feedback por si no tiene negocios aún */}
					{businesses.length === 0 && (
						<Text
							style={[styles.emptyText, { color: subTextColor }]}
						>
							Aún no tienes negocios registrados.
						</Text>
					)}

					{/* Botón final para agregar otro negocio */}
					<TouchableOpacity
						style={styles.optionRow}
						onPress={handleRegisterBusiness}
						activeOpacity={0.7}
					>
						<View style={styles.optionLeft}>
							<Ionicons
								name="add-circle"
								size={22}
								color={
									isDark
										? "rgba(255,255,255,0.7)"
										: "rgba(0,0,0,0.6)"
								}
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
							style={{ opacity: 0.8 }}
						/>
					</TouchableOpacity>
				</>
			)}

			{/* Botón final para agregar otro negocio */}
			{/* <TouchableOpacity
				style={styles.optionRow}
				onPress={handleRegisterBusiness}
				activeOpacity={0.7}
			>
				<View style={styles.optionLeft}>
					<Ionicons
						name="add-circle"
						size={22}
						color={
							isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)"
						}
					/>
					<Text
						style={[
							styles.optionLabel,
							{
								color: isDark
									? "rgba(255,255,255,0.9)"
									: "rgba(0,0,0,0.85)",
							},
						]}
					>
						Registrar otro negocio
					</Text>
				</View>
				<Ionicons
					name="chevron-forward"
					size={20}
					color={subTextColor}
					style={{ opacity: 0.8 }}
				/>
			</TouchableOpacity> */}
		</View>
	);
};

const styles = StyleSheet.create({
	optionsCard: {
		borderRadius: BorderRadius.lg,
		paddingHorizontal: Spacing.md,
		paddingVertical: Spacing.md,
		marginTop: Spacing.lg,
		...Shadow.md,
	},
	sectionTitle: {
		fontSize: FontSize.sm,
		fontWeight: FontWeight.bold,
		textTransform: "uppercase",
		letterSpacing: 0.5,
		marginBottom: Spacing.sm,
	},
	optionRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: Spacing.md,
		paddingLeft: Spacing.lg,
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
		opacity: 0.8,
	},
});
