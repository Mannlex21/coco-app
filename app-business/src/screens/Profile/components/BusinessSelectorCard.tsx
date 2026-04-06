import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { useAppStore } from "@coco/shared/hooks";
import { useDialog, useContextMenu } from "@coco/shared/providers";
import { useNavigation } from "@react-navigation/native";
import { FontSize, FontWeight, Spacing } from "@coco/shared/config/theme";
import { useBusiness, useUser } from "@coco/shared/hooks/supabase";
import { Business } from "@coco/shared/core/entities";
import { ContextMenuItem } from "@coco/shared/components";

export const BusinessSelectorCard = () => {
	const { colors } = useTheme();
	const { showDialog } = useDialog();
	const { showContextMenu } = useContextMenu();
	const navigation = useNavigation<any>();

	const { activeBusiness, setActiveBusiness } = useAppStore();
	const { updateLastActiveBusiness } = useUser();
	const { businesses, loadings, toggleBusinessStatus } = useBusiness();

	const separatorColor = colors.borderLight;
	const textColor = colors.textPrimaryLight;
	const subTextColor = colors.textSecondaryLight;
	const iconColor = colors.textSecondaryLight;

	const handleSelectBusiness = async (business: Business) => {
		setActiveBusiness(business);
		await updateLastActiveBusiness(business);
		showDialog({
			title: "Negocio Seleccionado",
			message: `Ahora estás gestionando "${business.name}".`,
			intent: "success",
		});
	};

	const handleRegisterBusiness = () => {
		navigation.navigate("BusinessSetup", { title: "Registrar Negocio" });
	};

	const getMenuOptions = (business: Business): ContextMenuItem[] => {
		if (!business || !colors) return [];

		const isSelected = business.id === activeBusiness?.id;
		const options: ContextMenuItem[] = [];

		if (!isSelected) {
			options.push({
				label: "Gestionar Negocio",
				icon: (
					<Ionicons
						name="arrow-forward-circle"
						size={20}
						color={colors.businessBg}
					/>
				),
				onPress: () => handleSelectBusiness(business),
			});
		}

		return [
			...options,
			{
				label: "Información del negocio",
				icon: (
					<Ionicons
						name="pencil"
						size={20}
						color={colors.textPrimaryLight}
					/>
				),
				onPress: () => {
					navigation.navigate("BusinessSetup", { business });
				},
			},
			{
				label: "Horarios",
				icon: (
					<Ionicons
						name="hourglass-outline"
						size={20}
						color={colors.textPrimaryLight}
					/>
				),
				onPress: () => {
					navigation.navigate("BusinessSchedule", { business });
				},
			},
			{
				label: business.isOpen ? "Cerrar Negocio" : "Abrir Negocio",
				textColor: business.isOpen ? colors.error : colors.businessBg,
				iconBg: business.isOpen
					? colors.errorLight
					: colors.successLight,
				icon: (
					<Ionicons
						name={
							business.isOpen
								? "close-circle"
								: "checkmark-circle"
						}
						size={20}
						color={
							business.isOpen ? colors.error : colors.businessBg
						}
					/>
				),
				onPress: () => {
					(async () => {
						await toggleBusinessStatus(
							business.id,
							business.isOpen,
						);
					})();
				},
			},
		];
	};
	const handleOpenMenu = (business: Business) => {
		showContextMenu(business.name, getMenuOptions(business));
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
					{businesses.map((business: Business, index: number) => {
						const isSelected = business.id === activeBusiness?.id;
						const isLast = index === businesses.length - 1;

						return (
							<View
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
							>
								{/* Área clickeable para seleccionar el negocio */}
								<TouchableOpacity
									style={styles.optionLeft}
									onPress={() => handleOpenMenu(business)}
									activeOpacity={0.6}
								>
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
										numberOfLines={1}
									>
										{business.name}
									</Text>
								</TouchableOpacity>

								<View style={styles.menuButton}>
									{isSelected && (
										<Ionicons
											name="checkmark-circle"
											size={18}
											color={colors.businessBg}
											style={{ marginLeft: 6 }}
										/>
									)}
								</View>
							</View>
						);
					})}

					{businesses.length === 0 && (
						<Text
							style={[styles.emptyText, { color: subTextColor }]}
						>
							Aún no tienes negocios registrados.
						</Text>
					)}

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
						<View style={styles.menuButton}>
							<Ionicons
								name="chevron-forward"
								size={20}
								color={subTextColor}
							/>
						</View>
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
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	optionLeft: {
		flexDirection: "row",
		alignItems: "center",
		flex: 1,
		paddingVertical: Spacing.md,
		paddingHorizontal: Spacing.xs,
	},
	optionLabel: {
		fontSize: FontSize.md,
		marginLeft: Spacing.md,
		flexShrink: 1, // Previene que textos largos empujen el botón de menú
	},
	menuButton: {
		paddingVertical: Spacing.md,
		paddingHorizontal: Spacing.sm,
		justifyContent: "center",
		alignItems: "center",
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
