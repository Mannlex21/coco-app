import React from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ScrollView,
	Switch,
	Alert,
} from "react-native";
import { Colors } from "@coco/shared/config/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppStore } from "@coco/shared/hooks/useAppStore";
import { useBusiness } from "@coco/shared/hooks/useBusiness";
import { db } from "@/infrastructure/firebase/config";

// Definimos la forma de las props
interface DashboardProps {
	onRegisterPress: () => void;
}

export const DashboardScreen: React.FC<DashboardProps> = ({
	onRegisterPress,
}) => {
	// 1. Obtenemos el usuario actual del store global
	const { user } = useAppStore();

	const {
		activeBusiness,
		businesses: allBusinesses,
		toggleBusinessStatus,
		loading,
	} = useBusiness(db, user?.id);

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
			<View>
				<View style={styles.header}>
					<Text style={styles.welcomeText}>Hola, 👋</Text>

					<TouchableOpacity
						style={styles.selector}
						disabled={allBusinesses.length <= 1} // Solo clickable si hay varios
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

				<ScrollView contentContainerStyle={styles.content}>
					{!activeBusiness && (
						<TouchableOpacity
							style={styles.registerBanner}
							onPress={onRegisterPress}
						>
							<Text style={styles.bannerTitle}>
								¡Haz crecer tu negocio!
							</Text>
							<Text style={styles.bannerSub}>
								Registra tu establecimiento para empezar a
								recibir pedidos.
							</Text>
							<View style={styles.bannerButton}>
								<Text style={styles.bannerButtonText}>
									Comenzar registro
								</Text>
							</View>
						</TouchableOpacity>
					)}

					{/* TARJETAS DE MÉTRICAS (Monetización 5.1) */}
					<View style={styles.statsRow}>
						{activeBusiness && (
							<View style={styles.statusContainer}>
								<Text
									style={[
										styles.statusText,
										{
											color: activeBusiness.isOpen
												? "#2D6A4F"
												: "#999",
										},
									]}
								>
									{activeBusiness.isOpen
										? "Abierto"
										: "Cerrado"}
								</Text>
								<Switch
									value={activeBusiness.isOpen}
									onValueChange={handleToggle} // <--- Conectado aquí
									trackColor={{
										false: "#767577",
										true: "#C45E1A",
									}}
									thumbColor={
										activeBusiness.isOpen
											? "#fff"
											: "#f4f3f4"
									}
								/>
							</View>
						)}
						<View style={styles.miniCard}>
							<Text style={styles.cardTitle}>Ventas hoy</Text>
							<Text style={styles.bigAmount}>
								{activeBusiness ? "$0.00" : "--"}
							</Text>
						</View>

						<View style={styles.miniCard}>
							<Text style={styles.cardTitle}>Fee Coco</Text>
							<Text
								style={[styles.bigAmount, { color: "#E76F51" }]}
							>
								{activeBusiness
									? `$${activeBusiness.weeklyDebt}`
									: "--"}
							</Text>
							<Text style={styles.infoNote}>Corte: Lunes</Text>
						</View>
					</View>
				</ScrollView>
			</View>
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
	card: {
		backgroundColor: "white",
		padding: 20,
		borderRadius: 12,
		// Sombras básicas para Android/iOS
		elevation: 3,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
	},
	cardTitle: {
		color: "#666",
		marginBottom: 10,
		fontSize: 14,
		fontWeight: "600",
	},
	bigAmount: { fontSize: 32, fontWeight: "bold", color: "#333" },
	infoNote: { color: "#999", fontSize: 12, marginTop: 10 },
	headerRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	statusContainer: {
		alignItems: "center",
	},
	statusText: {
		fontSize: 10,
		fontWeight: "bold",
		marginBottom: 2,
		textTransform: "uppercase",
	},
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
});
