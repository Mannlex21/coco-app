import React, { useEffect, useState } from "react";
import {
	StyleSheet,
	Text,
	View,
	ActivityIndicator,
	StatusBar,
} from "react-native";

// IMPORT LOCAL: Manteniendo tu lógica de Firebase
import { auth } from "./src/infrastructure/firebase/config";
import { onAuthStateChanged, User } from "firebase/auth";
import { CocoLogo } from "./src/components/CocoLogo";

export default function App() {
	const [loading, setLoading] = useState(true);
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		console.log("Checking Firebase connection (Business)...");

		const unsubscribe = onAuthStateChanged(
			auth,
			(currentUser) => {
				console.log(
					"Firebase Auth State Changed:",
					currentUser ? "Admin Logged In" : "No Admin",
				);
				setUser(currentUser);
				setLoading(false);
			},
			(error) => {
				console.error("Firebase Auth Error:", error);
				setLoading(false);
			},
		);

		return () => unsubscribe();
	}, []);

	if (loading) {
		return (
			<View style={[styles.container, { backgroundColor: "#eef2f3" }]}>
				<ActivityIndicator size="large" color="#C45E1A" />
				<Text
					style={{
						marginTop: 15,
						color: "#C45E1A",
						fontWeight: "600",
					}}
				>
					Cargando Panel de Negocios...
				</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<StatusBar barStyle="light-content" />

			{/* Logo de Negocios con Sombrero de Chef */}
			<CocoLogo size={280} />

			<Text style={styles.title}>Coco Business</Text>

			<View style={styles.card}>
				<Text style={styles.status}>
					{user
						? `Bienvenido Chef: ${user.email}`
						: "Estado: Panel Desconectado"}
				</Text>

				{/* Divisor con el naranja oscuro del interior del coco */}
				<View style={styles.separator} />

				<Text style={styles.buttonText}>
					{user
						? "Gestionar Inventario"
						: "Iniciar Sesión Administrativa"}
				</Text>
			</View>

			<Text style={styles.footer}>
				Proyecto ID: {auth.app.options.projectId}
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#C45E1A", // El color óxido que pediste
		alignItems: "center",
		justifyContent: "center",
		padding: 25,
	},
	title: {
		fontSize: 36,
		fontWeight: "900",
		color: "white",
		marginTop: 10,
		marginBottom: 30,
		letterSpacing: 1,
		textTransform: "uppercase",
	},
	card: {
		backgroundColor: "white",
		padding: 25,
		borderRadius: 30,
		width: "100%",
		alignItems: "center",
		elevation: 12,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.3,
		shadowRadius: 10,
	},
	separator: {
		height: 3,
		width: 40,
		backgroundColor: "#E76F51", // Naranja acento
		marginVertical: 15,
		borderRadius: 2,
	},
	status: {
		fontSize: 18,
		color: "#C45E1A",
		fontWeight: "700",
		textAlign: "center",
	},
	buttonText: {
		color: "#27AE60",
		fontWeight: "800",
		fontSize: 18,
	},
	footer: {
		position: "absolute",
		bottom: 40,
		color: "rgba(255,255,255,0.7)",
		fontSize: 12,
		fontWeight: "600",
	},
});
