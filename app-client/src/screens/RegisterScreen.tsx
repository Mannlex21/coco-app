import React, { useState } from "react";
import {
	StyleSheet,
	Text,
	View,
	TextInput,
	TouchableOpacity,
} from "react-native";
import { CocoLogo } from "@coco/shared/components/CocoLogo";
import { AuthService } from "@/infrastructure/auth/AuthService";
import { useDialog } from "@coco/shared/providers/DialogContext";

export const RegisterScreen = ({ onBack }: { onBack: () => void }) => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const { showDialog } = useDialog();

	const handleRegister = async () => {
		const cleanEmail = email.trim();

		if (cleanEmail === "" || password === "") {
			showDialog({
				title: "Error",
				message: "Por favor llena todos los campos.",
				intent: "error",
			});
			return;
		}

		if (password.length < 6) {
			showDialog({
				title: "Error",
				message: "La contraseña debe tener al menos 6 caracteres.",
				intent: "error",
			});
			return;
		}

		try {
			await AuthService.register(cleanEmail, password);
			showDialog({
				title: "¡Éxito!",
				message: "Cuenta creada",
				intent: "success",
			});
		} catch (error: any) {
			console.error(error);

			let errorMessage = "Ocurrió un problema al registrarte.";
			if (error.code === "auth/email-already-in-use") {
				errorMessage = "Este correo ya está registrado.";
			} else if (error.code === "auth/invalid-email") {
				errorMessage = "El formato del correo es inválido.";
			}

			showDialog({
				title: "Error",
				message: errorMessage,
				intent: "error",
			});
		}
	};

	return (
		<View style={styles.container}>
			<CocoLogo size={120} />
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
		backgroundColor: "#1A7A4A",
		alignItems: "center",
		justifyContent: "center",
		padding: 30,
	},
	title: {
		fontSize: 40,
		fontWeight: "900",
		color: "white",
		marginBottom: 30,
	},
	inputContainer: { width: "100%" },
	input: {
		backgroundColor: "rgba(255,255,255,0.2)",
		borderRadius: 15,
		padding: 18,
		color: "white",
		marginBottom: 15,
	},
	button: {
		backgroundColor: "white",
		padding: 20,
		borderRadius: 15,
		alignItems: "center",
		marginTop: 10,
		elevation: 5,
	},
	buttonText: {
		color: "#444",
		fontWeight: "800",
		fontSize: 20,
		letterSpacing: 1,
	},
	backBtn: { marginTop: 20, alignItems: "center" },
	backText: { color: "white", fontWeight: "600", opacity: 0.9 },
});
