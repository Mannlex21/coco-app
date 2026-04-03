import React, { useEffect, useState } from "react";
import {
	StyleSheet,
	Text,
	View,
	ActivityIndicator,
	TouchableOpacity,
} from "react-native";

import { CocoLogo } from "@coco/shared/components/CocoLogo";
import { LoginScreen } from "@/screens/LoginScreen";
import { RegisterScreen } from "@/screens/RegisterScreen";
import { FontWeight } from "@coco/shared/config/theme";
import { useAppStore } from "@coco/shared/hooks/useAppStore";
import { useSupabaseContext } from "@coco/shared/providers";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { User } from "@coco/shared/core/entities/User";
import { RolesApp } from "@coco/shared/constants";

export default function App() {
	const [loading, setLoading] = useState(true);
	const { user, setUser } = useAppStore();
	const [isRegistering, setIsRegistering] = useState(false);
	const supabase = useSupabaseContext();

	useEffect(() => {
		if (!supabase) return;

		const checkInitialSession = async () => {
			// 1. Forzamos a Supabase a leer el SecureStore manualmente al arrancar
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (session?.user) {
				console.log("Sesión inicial encontrada en SecureStore!");
				mapearYSetearUsuario(session.user);
			}

			// Ya sea que encontramos sesión o no, apagamos el loader inicial
			setLoading(false);
		};

		// Función reutilizable para no repetir código
		const mapearYSetearUsuario = (supabaseUser: any) => {
			const domainUser: User = {
				id: supabaseUser.id,
				email: supabaseUser.email || "",
				name:
					supabaseUser.user_metadata?.full_name ||
					supabaseUser.email?.split("@")[0] ||
					"Usuario",
				status: "active",
				createdAt: new Date(supabaseUser.created_at),
				updatedAt: supabaseUser.updated_at
					? new Date(supabaseUser.updated_at)
					: new Date(supabaseUser.created_at),
				phone: supabaseUser.phone || "",
				role: (supabaseUser.role as RolesApp) || "none",
			};
			setUser(domainUser);
		};

		// Ejecutamos la verificación inicial
		checkInitialSession();

		// 2. Dejamos el listener para futuros cambios (como logouts o logins)
		const { data: authListener } = supabase.auth.onAuthStateChange(
			async (event: AuthChangeEvent, session: Session | null) => {
				console.log("Evento AuthStateChange:", event);

				if (session?.user) {
					mapearYSetearUsuario(session.user);
				} else {
					setUser(null);
				}

				// Por si acaso, nos aseguramos de apagar el loading aquí también
				setLoading(false);
			},
		);

		// Limpieza del listener al desmontar el componente
		return () => {
			authListener.subscription.unsubscribe();
		};
	}, [supabase, setUser]);

	// Mientras Supabase nos dice si hay sesión o no, mostramos el spinner
	if (loading) {
		return (
			<View style={[styles.container, { justifyContent: "center" }]}>
				<ActivityIndicator size="large" color="white" />
			</View>
		);
	}

	// Si no hay usuario, mostramos el Login
	if (!user) {
		return isRegistering ? (
			<RegisterScreen onBack={() => setIsRegistering(false)} />
		) : (
			<LoginScreen onRegister={() => setIsRegistering(true)} />
		);
	}

	// Si ya hay usuario, mostramos la pantalla principal
	return (
		<View style={styles.container}>
			<CocoLogo size={150} />

			<Text style={styles.welcomeTitle}>
				¡Hola, {user.email?.split("@")[0]}!
			</Text>

			<View style={styles.infoCard}>
				<Text style={styles.infoText}>Sesión activa en Coco</Text>

				{/* BOTÓN DE CERRAR SESIÓN */}
				<TouchableOpacity
					style={styles.logoutButton}
					onPress={async () => await supabase.auth.signOut()}
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
		fontWeight: FontWeight.bold,
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
