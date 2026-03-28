import React from "react";
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
import { Colors } from "@coco/shared/config/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppStore } from "@coco/shared/hooks/useAppStore";
import { useBusiness } from "@coco/shared/hooks/useBusiness";
import { db } from "@/infrastructure/firebase/config";
import { useNavigation } from "@react-navigation/native";

export const DashboardScreen = () => {
	const navigation = useNavigation<any>();
	// 1. Obtenemos el usuario actual del store global
	const { user } = useAppStore();

	const {
		activeBusiness,
		businesses: allBusinesses,
		toggleBusinessStatus,
		loading,
		refreshing,
		onRefresh,
		deleteBusiness,
	} = useBusiness(db, user?.id);
	console.log(activeBusiness);
	const handleToggle = async () => {
		if (!activeBusiness) return;

		try {
			// Llamamos a la función del hook
			await toggleBusinessStatus(
				activeBusiness.id,
				activeBusiness.isOpen,
			);
		} catch (error) {
			console.log("Error", error);
			Alert.alert("Error", "No se pudo cambiar el estado del negocio.");
		}
	};
	const handleDelete = () => {
		if (!activeBusiness) return;

		Alert.alert(
			"BORRAR NEGOCIO (MODO PRUEBAS)",
			"¿Estás seguro? Esto eliminará el negocio de Firebase permanentemente.",
			[
				{ text: "Cancelar", style: "cancel" },
				{
					text: "Eliminar",
					style: "destructive",
					onPress: async () => {
						try {
							await deleteBusiness(activeBusiness.id);
							Alert.alert(
								"Eliminado",
								"El negocio ha sido borrado.",
							);
						} catch (e) {
							Alert.alert("Error", "No se pudo borrar.");
						}
					},
				},
			],
		);
	};
	if (loading) {
		return (
			<SafeAreaView style={styles.container}>
				<Text style={{ textAlign: "center", marginTop: 20 }}>
					Cargando datos...
				</Text>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container} edges={["top"]}>
			<View style={styles.header}>
				<Text style={styles.welcomeText}>
					Hola, {user?.name.split(" ")[0]} 👋
				</Text>
				<TouchableOpacity
					style={styles.selector}
					disabled={allBusinesses.length <= 1}
				>
					<View style={styles.row}>
						<Text style={styles.businessName}>
							{activeBusiness
								? activeBusiness.name
								: "Configurar mi negocio"}
						</Text>
						{allBusinesses.length > 1 && (
							<Text style={styles.chevron}> ▾</Text>
						)}
					</View>
				</TouchableOpacity>
			</View>

			<ScrollView
				contentContainerStyle={styles.content}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						colors={["#C45E1A"]} // Color del círculo en Android
						tintColor={"#C45E1A"} // Color del círculo en iOS
					/>
				}
			>
				{activeBusiness ? (
					<View
						style={[
							styles.mainCard,
							{
								borderLeftColor: activeBusiness.isOpen
									? "#2D6A4F"
									: "#E76F51",
							},
						]}
					>
						<View>
							<Text style={styles.cardLabel}>
								Estado del Negocio
							</Text>
							<Text
								style={[
									styles.statusTitle,
									{
										color: activeBusiness.isOpen
											? "#2D6A4F"
											: "#E76F51",
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
							trackColor={{ false: "#D1D1D1", true: "#C45E1A" }}
							thumbColor={"#FFF"}
							ios_backgroundColor="#D1D1D1"
						/>
					</View>
				) : (
					/* Banner de Registro si no hay negocio */
					<TouchableOpacity
						style={styles.registerBanner}
						onPress={() => navigation.navigate("BusinessSetup")}
					>
						<Text style={styles.bannerTitle}>
							¡Haz crecer tu negocio!
						</Text>
						<Text style={styles.bannerSub}>
							Registra tu establecimiento para empezar.
						</Text>
						<View style={styles.bannerButton}>
							<Text style={styles.bannerButtonText}>
								Comenzar
							</Text>
						</View>
					</TouchableOpacity>
				)}

				{/* 2. FILA DE ESTADÍSTICAS */}
				<View style={styles.statsRow}>
					<View style={styles.miniCard}>
						<Text style={styles.miniCardLabel}>Ventas hoy</Text>
						<Text style={styles.bigAmount}>
							{activeBusiness ? "$0.00" : "--"}
						</Text>
						<Text style={styles.infoNote}>0 pedidos</Text>
					</View>

					<View style={styles.miniCard}>
						<Text style={styles.miniCardLabel}>Fee Coco</Text>
						<Text style={[styles.bigAmount, { color: "#E76F51" }]}>
							{activeBusiness
								? `$${activeBusiness.weeklyDebt}`
								: "--"}
						</Text>
						<Text style={styles.infoNote}>Corte: Lunes</Text>
					</View>
				</View>

				{/* 3. ACCESOS RÁPIDOS (Próximamente) */}
				<Text style={styles.sectionTitle}>Gestión</Text>
				<TouchableOpacity style={styles.menuItem}>
					<Text style={styles.menuItemText}>
						📦 Gestionar Catálogo
					</Text>
					<Text style={styles.chevron}>›</Text>
				</TouchableOpacity>

				{activeBusiness && (
					<TouchableOpacity
						style={styles.deleteBtn}
						onPress={handleDelete}
					>
						<Text style={styles.deleteBtnText}>
							⚠️ Borrar Negocio (Debug)
						</Text>
					</TouchableOpacity>
				)}
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#F8F9FA" },
	header: {
		padding: 20,
		paddingTop: 60,
		backgroundColor: "white",
		borderBottomWidth: 1,
		borderBottomColor: "#EEE",
	},
	welcomeText: { fontSize: 14, color: "#666" },
	// AQUÍ AGREGAMOS EL SELECTOR QUE FALTABA
	selector: {
		marginTop: 5,
		alignSelf: "flex-start",
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
	},
	businessName: {
		fontSize: 22,
		fontWeight: "bold",
		color: Colors.businessBg,
	},
	chevron: {
		fontSize: 18,
		color: Colors.businessBg,
		marginLeft: 5,
	},
	content: { padding: 20 },
	registerBanner: {
		backgroundColor: Colors.businessBg,
		padding: 20,
		borderRadius: 15,
		marginBottom: 20,
	},
	bannerTitle: { color: "white", fontSize: 18, fontWeight: "bold" },
	bannerSub: { color: "rgba(255,255,255,0.8)", marginTop: 5, lineHeight: 20 },
	bannerButton: {
		backgroundColor: "white",
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 8,
		marginTop: 15,
		alignSelf: "flex-start",
	},
	bannerButtonText: { color: Colors.businessBg, fontWeight: "bold" },
	bigAmount: { fontSize: 32, fontWeight: "bold", color: "#333" },
	infoNote: { color: "#999", fontSize: 12, marginTop: 10 },

	statsRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 20,
	},
	miniCard: {
		backgroundColor: "white",
		padding: 15,
		borderRadius: 15,
		width: "48%",
		elevation: 3,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
	},
	mainCard: {
		backgroundColor: "white",
		padding: 20,
		borderRadius: 16,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 20,
		elevation: 4,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 6,
		borderLeftWidth: 5, // Indicador de color lateral
	},
	cardLabel: {
		fontSize: 12,
		color: "#888",
		fontWeight: "600",
		textTransform: "uppercase",
	},
	statusTitle: { fontSize: 16, fontWeight: "800", marginTop: 4 },
	miniCardLabel: { fontSize: 13, color: "#666", fontWeight: "600" },
	sectionTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#333",
		marginTop: 10,
		marginBottom: 15,
	},
	menuItem: {
		backgroundColor: "white",
		padding: 18,
		borderRadius: 12,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 10,
	},
	menuItemText: { fontSize: 16, fontWeight: "500", color: "#444" },
	deleteBtn: {
		marginTop: 40,
		padding: 15,
		backgroundColor: "#FFE5E5",
		borderRadius: 12,
		borderWidth: 1,
		borderColor: "#FFBABA",
		alignItems: "center",
	},
	deleteBtnText: {
		color: "#D8000C",
		fontWeight: "bold",
		fontSize: 14,
	},
});
