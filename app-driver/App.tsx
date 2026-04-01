import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ActivityIndicator } from "react-native";

import { auth } from "./src/infrastructure/firebase/config";
import { onAuthStateChanged, User } from "firebase/auth";
import { CocoLogo } from "./src/components/CocoLogo";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "../shared/hooks/useTheme";

export default function App() {
	const [loading, setLoading] = useState(true);
	const [user, setUser] = useState<User | null>(null);
	const { isDark } = useTheme();
	useEffect(() => {
		console.log("Checking Firebase connection (Driver)...");
		const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
			setUser(currentUser);
			setLoading(false);
		});
		return () => unsubscribe();
	}, []);

	if (loading)
		return (
			<View style={[styles.container, { backgroundColor: "#eef2f3" }]}>
				<ActivityIndicator size="large" color="#0A4A7A" />
				<Text style={{ marginTop: 15, color: "#0A4A7A" }}>
					Localizando Repartidor...
				</Text>
			</View>
		);
	console.log(isDark);
	return (
		<View style={styles.container}>
			<StatusBar style={isDark ? "light" : "dark"} animated={true} />
			<CocoLogo size={280} />
			<Text style={styles.title}>Coco Driver</Text>

			<View style={styles.card}>
				<Text style={styles.status}>
					{user
						? `En servicio: ${user.email}`
						: "Estado: Fuera de Línea"}
				</Text>
				<View style={styles.separator} />
				<Text style={styles.buttonText}>
					{user ? "Ver Pedidos" : "Conectarse para Repartir"}
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
		backgroundColor: "#0A4A7A", // El azul profundo que pediste
		alignItems: "center",
		justifyContent: "center",
		padding: 25,
	},
	title: {
		fontSize: 36,
		fontWeight: "900",
		color: "white",
		marginBottom: 30,
		letterSpacing: 1,
	},
	card: {
		backgroundColor: "white",
		padding: 25,
		borderRadius: 30,
		width: "100%",
		alignItems: "center",
		elevation: 10,
	},
	separator: {
		height: 3,
		width: 40,
		backgroundColor: "#FF8C42",
		marginVertical: 15,
		borderRadius: 2,
	},
	status: { fontSize: 18, color: "#0A4A7A", fontWeight: FontWeight.bold },
	buttonText: { color: "#27AE60", fontWeight: "800", fontSize: 18 },
	footer: {
		position: "absolute",
		bottom: 40,
		color: "rgba(255,255,255,0.7)",
		fontSize: 12,
	},
});
