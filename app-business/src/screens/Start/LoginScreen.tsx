import React, { useState } from "react";
import {
	StyleSheet,
	Text,
	View,
	TextInput,
	TouchableOpacity,
	KeyboardAvoidingView,
	Platform,
} from "react-native";
import { CocoLogo } from "@coco/shared/components/CocoLogo";
import { AuthService } from "@/infrastructure/auth/AuthService";
import GoogleButton from "@coco/shared/components/GoogleButton";
import {
	BorderRadius,
	FontSize,
	FontWeight,
	Shadow,
	Spacing,
	Colors,
} from "@coco/shared/config/theme";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { useDialog } from "@coco/shared/providers/DialogContext";
import { StatusBar } from "expo-status-bar";

interface LoginProps {
	onRegister: () => void;
}

export const LoginScreen: React.FC<LoginProps> = ({ onRegister }) => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const { colors } = useTheme();
	const { showDialog } = useDialog();

	const handleLogin = async () => {
		try {
			await AuthService.login(email, password);

			showDialog({
				title: "¡Bienvenido!",
				message: "Ya puedes pedir tu coco",
				intent: "success",
			});
		} catch (error: any) {
			console.error(error);

			showDialog({
				title: "Error",
				message: "Revisa tus datos o regístrate.",
				intent: "error",
			});
		}
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={styles.container}
		>
			<StatusBar style={"light"} animated={true} />

			<CocoLogo variant="business" />
			<Text style={styles.title}>Coco</Text>

			<View style={styles.inputContainer}>
				<TextInput
					style={styles.input}
					placeholder="Correo electrónico"
					placeholderTextColor="rgba(255,255,255,0.7)"
					value={email}
					onChangeText={setEmail}
					autoCapitalize="none"
					keyboardType="email-address"
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
					<Text
						style={[
							styles.buttonText,
							{ color: colors.businessBg },
						]}
					>
						Iniciar Sesión
					</Text>
				</TouchableOpacity>

				{/* Separador visual */}
				<View style={styles.dividerContainer}>
					<View style={styles.line} />
					<Text style={styles.dividerText}>O</Text>
					<View style={styles.line} />
				</View>

				<GoogleButton />

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
		backgroundColor: Colors.light.businessBg,
		alignItems: "center",
		justifyContent: "center",
		padding: Spacing.lg,
	},
	title: {
		fontSize: FontSize.hero,
		fontWeight: FontWeight.black,
		color: Colors.light.backgroundLight,
		marginBottom: Spacing.xl,
		letterSpacing: 2,
	},
	inputContainer: { width: "100%" },
	input: {
		backgroundColor: "rgba(255,255,255,0.15)",
		borderRadius: BorderRadius.md,
		padding: Spacing.md,
		color: Colors.light.backgroundLight,
		marginBottom: Spacing.sm,
		fontSize: FontSize.md,
		borderWidth: 1,
		borderColor: "rgba(255,255,255,0.2)",
	},
	button: {
		backgroundColor: Colors.light.backgroundLight,
		padding: Spacing.md,
		borderRadius: BorderRadius.md,
		alignItems: "center",
		marginTop: Spacing.sm,
		...Shadow.md,
	},
	buttonText: {
		fontWeight: FontWeight.bold,
		fontSize: FontSize.lg,
	},
	dividerContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginVertical: Spacing.lg,
	},
	line: {
		flex: 1,
		height: 1,
		backgroundColor: "rgba(255,255,255,0.3)",
	},
	dividerText: {
		color: Colors.light.backgroundLight,
		paddingHorizontal: Spacing.md,
		fontWeight: FontWeight.semibold,
		opacity: 0.8,
	},
	registerBtn: {
		marginTop: Spacing.xl,
		alignItems: "center",
	},
	registerText: {
		color: Colors.light.backgroundLight,
		fontWeight: FontWeight.semibold,
		opacity: 0.9,
		textDecorationLine: "underline",
	},
});
