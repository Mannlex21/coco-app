import React, { useState } from "react";
import {
	StyleSheet,
	Text,
	View,
	TextInput,
	TouchableOpacity,
	Alert,
	StatusBar,
} from "react-native";
import { CocoLogo } from "@coco/shared/components/CocoLogo";
import { AuthService } from "@/infrastructure/auth/AuthService";
import {
	BorderRadius,
	Colors,
	FontSize,
	FontWeight,
	Shadow,
	Spacing,
} from "@coco/shared/config/theme";

export const RegisterScreen = ({ onBack }: { onBack: () => void }) => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const handleRegister = async () => {
		// .trim() elimina espacios al inicio y al final
		const cleanEmail = email.trim();

		if (cleanEmail === "" || password === "") {
			Alert.alert("Error", "Por favor llena todos los campos.");
			return;
		}

		if (password.length < 6) {
			Alert.alert(
				"Error",
				"La contraseña debe tener al menos 6 caracteres.",
			);
			return;
		}

		try {
			// Usamos el correo limpio
			await AuthService.register(cleanEmail, password);
			Alert.alert("¡Éxito!", "Cuenta creada");
		} catch (error: any) {
			console.log("Error detallado de Firebase:", error.code); // Para que lo veas en la terminal

			if (error.code === "auth/email-already-in-use") {
				Alert.alert("Error", "Este correo ya está registrado.");
			} else if (error.code === "auth/invalid-email") {
				Alert.alert("Error", "El formato del correo es inválido.");
			} else {
				Alert.alert("Error", "Ocurrió un problema al registrarte.");
			}
		}
	};

	return (
		<View style={styles.container}>
			<StatusBar barStyle="light-content" />
			<CocoLogo variant="business" />
			<Text style={styles.title}>Registro</Text>

			<View style={styles.inputContainer}>
				<TextInput
					style={styles.input}
					placeholder="Correo electrónico"
					placeholderTextColor="rgba(255,255,255,0.7)"
					value={email}
					onChangeText={setEmail}
					autoCapitalize="none"
				/>
				<TextInput
					style={styles.input}
					placeholder="Contraseña (6+ caracteres)"
					placeholderTextColor="rgba(255,255,255,0.7)"
					secureTextEntry
					value={password}
					onChangeText={setPassword}
				/>

				<TouchableOpacity
					style={styles.button}
					onPress={handleRegister}
				>
					<Text style={styles.buttonText}>Crear cuenta</Text>
				</TouchableOpacity>

				<TouchableOpacity style={styles.backBtn} onPress={onBack}>
					<Text style={styles.backText}>
						Regresar a Iniciar Sesión
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.businessBg, // Naranja oscuro oficial
		alignItems: "center",
		justifyContent: "center",
		padding: Spacing.lg,
	},
	title: {
		fontSize: FontSize.hero,
		fontWeight: FontWeight.black,
		color: Colors.surfaceLight, // Blanco #FFFFFF
		marginBottom: Spacing.lg,
		letterSpacing: 1,
	},
	inputContainer: { width: "100%" },
	input: {
		backgroundColor: "rgba(255,255,255,0.15)",
		borderRadius: BorderRadius.md,
		padding: Spacing.md,
		color: Colors.surfaceLight,
		marginBottom: Spacing.sm,
		fontSize: FontSize.md,
		borderWidth: 1,
		borderColor: "rgba(255,255,255,0.2)",
	},
	button: {
		backgroundColor: Colors.surfaceLight,
		padding: Spacing.md,
		borderRadius: BorderRadius.md,
		alignItems: "center",
		marginTop: Spacing.sm,
		...Shadow.md,
	},
	buttonText: {
		color: Colors.businessBg, // Texto naranja sobre botón blanco
		fontWeight: FontWeight.bold,
		fontSize: FontSize.lg,
	},
	backBtn: {
		marginTop: Spacing.xl,
		alignItems: "center",
	},
	backText: {
		color: Colors.surfaceLight,
		fontWeight: FontWeight.semibold,
		opacity: 0.9,
		textDecorationLine: "underline",
	},
});
