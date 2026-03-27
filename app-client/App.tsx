import React, { useEffect, useState } from "react";
import {
	StyleSheet,
	Text,
	View,
	ActivityIndicator,
	TouchableOpacity,
} from "react-native";

// IMPORT LOCAL: Usando tu infraestructura de Firebase
import { auth } from "@/infrastructure/firebase/config";
import { onAuthStateChanged, User } from "firebase/auth";
import { CocoLogo } from "@coco/shared/components/CocoLogo";
import { LoginScreen } from "@/screens/LoginScreen";
import { RegisterScreen } from "@/screens/RegisterScreen";
import { AuthService } from "@/infrastructure/firebase/auth.service";

export default function App() {
	const [loading, setLoading] = useState(true);
	const [user, setUser] = useState<User | null>(null);
	const [isRegistering, setIsRegistering] = useState(false);

	useEffect(() => {
		console.log("Checking Firebase connection (Client)...");

		const unsubscribe = onAuthStateChanged(
			auth,
			(currentUser) => {
				console.log(
					"Firebase Auth State Changed:",
					currentUser ? "User Logged In" : "Guest Mode",
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

	if (loading) return <ActivityIndicator />;

	// Si no hay usuario, mostramos el Login
	if (!user) {
		return isRegistering ? (
			<RegisterScreen onBack={() => setIsRegistering(false)} />
		) : (
			<LoginScreen onRegister={() => setIsRegistering(true)} />
		);
	}

	// Si ya hay usuario, mostramos la pantalla principal que ya tenías
	return (
		<View style={styles.container}>
			<CocoLogo size={150} />

			<Text style={styles.welcomeTitle}>
				¡Hola, {user.email?.split("@")[0]}! 🥥
			</Text>

			<View style={styles.infoCard}>
				<Text style={styles.infoText}>
					Sesión activa en Coco Tuxpan
				</Text>

				{/* BOTÓN DE CERRAR SESIÓN */}
				<TouchableOpacity
					style={styles.logoutButton}
					onPress={() => AuthService.logout()}
				>
					<Text style={styles.logoutText}>Cerrar Sesión</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#1A7A4A", // Verde Selva
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
		backgroundColor: "#E76F51", // Naranja acento (Interior del coco)
		marginVertical: 15,
		borderRadius: 2,
	},
	status: {
		fontSize: 18,
		color: "#1A7A4A",
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
	welcomeTitle: {
		fontSize: 26,
		fontWeight: "900",
		color: "white",
		marginTop: 20,
		marginBottom: 30,
	},
	infoCard: {
		backgroundColor: "rgba(255,255,255,0.15)",
		padding: 25,
		borderRadius: 20,
		width: "100%",
		alignItems: "center",
		borderWidth: 1,
		borderColor: "rgba(255,255,255,0.2)",
	},
	infoText: {
		color: "white",
		fontSize: 16,
		marginBottom: 20,
		opacity: 0.9,
	},
	logoutButton: {
		backgroundColor: "#E67E22", // Naranja para que resalte del fondo verde
		paddingVertical: 15,
		paddingHorizontal: 40,
		borderRadius: 12,
		elevation: 3,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
	},
	logoutText: {
		color: "white",
		fontWeight: "800",
		fontSize: 16,
		letterSpacing: 1,
	},
});
