import React, { useState } from "react";
import {
	StyleSheet,
	Text,
	View,
	TextInput,
	TouchableOpacity,
	Alert,
	KeyboardAvoidingView,
	Platform,
} from "react-native";
import { CocoLogo } from "@/components/CocoLogo";
import { AuthService } from "@/infrastructure/auth/AuthService";
interface LoginProps {
	onRegister: () => void;
}
export const LoginScreen: React.FC<LoginProps> = ({ onRegister }) => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const handleLogin = async () => {
		try {
			await AuthService.login(email, password);
			Alert.alert("¡Bienvenido!", "Ya puedes pedir tu coco 🥥");
		} catch (error: any) {
			Alert.alert("Error", "Revisa tus datos o regístrate.");
		}
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={styles.container}
		>
			<CocoLogo size={180} />
			<Text style={styles.title}>COCO TUXPAN</Text>

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
					placeholder="Contraseña"
					placeholderTextColor="rgba(255,255,255,0.7)"
					secureTextEntry
					value={password}
					onChangeText={setPassword}
				/>

				<TouchableOpacity style={styles.button} onPress={handleLogin}>
					<Text style={styles.buttonText}>ENTRAR</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.registerBtn}
					onPress={onRegister}
				>
					<Text style={styles.registerText}>
						¿No tienes cuenta? Regístrate aquí
					</Text>
				</TouchableOpacity>
			</View>
		</KeyboardAvoidingView>
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
		fontSize: 28,
		fontWeight: "900",
		color: "white",
		marginBottom: 40,
		letterSpacing: 3,
	},
	inputContainer: { width: "100%" },
	input: {
		backgroundColor: "rgba(255,255,255,0.2)",
		borderRadius: 15,
		padding: 18,
		color: "white",
		marginBottom: 15,
		fontSize: 16,
		borderWidth: 1,
		borderColor: "rgba(255,255,255,0.3)",
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
		color: "#1A7A4A",
		fontWeight: "800",
		fontSize: 16,
		letterSpacing: 1,
	},
	registerBtn: { marginTop: 25, alignItems: "center" },
	registerText: { color: "white", fontWeight: "600", opacity: 0.9 },
});
