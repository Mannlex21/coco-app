import React, { useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ScrollView,
	Switch,
	Alert,
	RefreshControl,
} from "react-native";
import {
	FontSize,
	FontWeight,
	BorderRadius,
	Spacing,
	Shadow,
} from "@coco/shared/config/theme";
import { useAppStore } from "@coco/shared/hooks/useAppStore";
import { useBusiness } from "@coco/shared/hooks/useBusiness";
import { db } from "@/infrastructure/firebase/config";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { useDialog } from "@coco/shared/providers/DialogContext";
import { DashboardHeader } from "./components/DashboardHeader";
import { useUser } from "../../../../shared/hooks/useUser";

export const DashboardScreen = () => {
	const { colors } = useTheme();
	const navigation = useNavigation<any>();
	const { showDialog } = useDialog();
	const { user } = useAppStore();

	// 1. Traemos los datos extendidos del usuario en Firestore
	const { userData, loadingUser, updateLastActiveBusiness } = useUser(
		db,
		user?.id,
	);
	const {
		businesses,
		loadingBusinesses,
		activeBusiness,
		deleteBusiness,
		onRefresh,
		refreshing,
		toggleBusinessStatus,
	} = useBusiness(db, user?.id, userData?.lastActiveBusinessId);
	const handleToggle = async () => {
		if (!activeBusiness) return;

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
	const handleDelete = () => {
		if (!activeBusiness) return;

		showDialog({
			title: "Borrar Negocio",
			message:
				"¿Estás seguro? Esto eliminará el negocio de Firebase permanentemente.",
			intent: "error",
			onConfirm: () => {
				(async () => {
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
							message:
								"No se pudo borrar el negocio. Inténtalo de nuevo.",
							intent: "error",
						});
					}
				})();
			},
		});
	};
	useEffect(() => {
		const { activeBusiness } = useAppStore.getState(); // Leemos el store actual
		if (userData && !userData.lastActiveBusinessId && activeBusiness) {
			updateLastActiveBusiness(activeBusiness.id);
		}
	}, [userData, businesses]);
	if (loadingUser || loadingBusinesses) {
		return (
			<View>
				<Text
					style={[
						styles.loadingText,
						{ color: colors.textSecondaryLight },
					]}
				>
					Cargando datos...
				</Text>
			</View>
		);
	}

	return (
		<View style={{ flex: 1 }}>
			<DashboardHeader />

			<ScrollView
				contentContainerStyle={styles.content}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						colors={[colors.businessBg]} // Color dinámico de marca para Android
						tintColor={colors.businessBg} // Color dinámico de marca para iOS
					/>
				}
			>
				{activeBusiness ? (
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
						<View>
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
						<Switch
							value={activeBusiness.isOpen}
							onValueChange={handleToggle}
							trackColor={{
								false: colors.borderLight,
								true: colors.businessBg,
							}}
							thumbColor={colors.surfaceLight}
							ios_backgroundColor={colors.borderLight}
						/>
					</View>
				) : (
					/* Banner de Registro si no hay negocio */
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
							style={[
								styles.bannerSub,
								{ color: colors.textOnPrimary },
							]}
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
				)}

				{/* 2. FILA DE ESTADÍSTICAS */}
				<View style={styles.statsRow}>
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
						<Text
							style={[styles.bigAmount, { color: colors.error }]}
						>
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
				</View>

				{/* 3. ACCESOS RÁPIDOS */}
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
					onPress={() => navigation.navigate("Catálogo")} // 💡 Navegación directa al tab de catálogo
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
					>
						<Text
							style={[
								styles.deleteBtnText,
								{ color: colors.error },
							]}
						>
							Borrar Negocio (Debug)
						</Text>
					</TouchableOpacity>
				)}
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	header: {
		padding: Spacing.lg,
		paddingTop: Spacing.sm + 20,
		borderBottomWidth: 1,
	},
	loadingText: {
		textAlign: "center",
		marginTop: Spacing.lg,
		fontSize: FontSize.sm,
	},
	welcomeText: {
		fontSize: FontSize.sm,
		fontWeight: FontWeight.medium,
	},
	selector: { marginTop: Spacing.xs, alignSelf: "flex-start" },
	row: { flexDirection: "row", alignItems: "center" },
	businessName: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
	chevron: { fontSize: FontSize.lg, marginLeft: 5 },
	chevronInline: { fontSize: FontSize.lg },
	content: { padding: Spacing.lg },
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
	bigAmount: { fontSize: FontSize.xl + 4, fontWeight: FontWeight.bold },
	infoNote: { fontSize: FontSize.xs, marginTop: 10 },
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
	miniCardLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
	sectionTitle: {
		fontSize: FontSize.md,
		fontWeight: FontWeight.bold,
		marginTop: Spacing.sm,
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
	menuItemText: { fontSize: FontSize.md, fontWeight: FontWeight.medium },
	cancelBtn: {
		marginTop: Spacing.xl,
		padding: Spacing.md,
		borderRadius: BorderRadius.md,
		borderWidth: 1,
		alignItems: "center",
	},
	deleteBtnText: { fontWeight: FontWeight.bold, fontSize: FontSize.sm },
});
