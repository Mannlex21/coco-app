import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ActivityIndicator } from "react-native";

// Importamos desde tu alias configurado
import { auth } from "@shared/infrastructure/firebase/config";
import { onAuthStateChanged, User } from "firebase/auth";

export default function App() {
	const [loading, setLoading] = useState(true);
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		console.log("Checking Firebase connection...");

		// Si llegamos aquí, el import de @shared funcionó
		const unsubscribe = onAuthStateChanged(
			auth,
			(currentUser) => {
				console.log(
					"Firebase Auth State Changed:",
					currentUser ? "User Logged In" : "No User",
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
				<ActivityIndicator size="large" color="#FF5A5F" />
				<Text style={{ marginTop: 10 }}>
					Cargando Coco desde Tuxpan...
				</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>🥥 Coco App</Text>
			<View style={styles.card}>
				<Text style={styles.status}>
					{user
						? `Bienvenido: ${user.email}`
						: "Estado: Desconectado"}
				</Text>
			</View>
			<Text style={styles.footer}>
				Proyecto: {auth.app.options.projectId}
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#FF5A5F",
		alignItems: "center",
		justifyContent: "center",
		padding: 20,
	},
	card: {
		backgroundColor: "white",
		padding: 20,
		borderRadius: 15,
		width: "100%",
		alignItems: "center",
		elevation: 5,
	},
	title: {
		fontSize: 40,
		fontWeight: "bold",
		color: "white",
		marginBottom: 20,
	},
	status: { fontSize: 18, color: "#333", fontWeight: "500" },
	footer: {
		position: "absolute",
		bottom: 40,
		fontSize: 12,
		color: "rgba(255,255,255,0.7)",
	},
});
