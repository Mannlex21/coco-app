import React, { useState } from "react";
import {
	StyleSheet,
	Text,
	View,
	TextInput,
	TouchableOpacity,
	ActivityIndicator,
} from "react-native";
import { CocoLogo } from "@coco/shared/components/CocoLogo";
import {
	BorderRadius,
	Colors,
	FontSize,
	FontWeight,
	Shadow,
	Spacing,
} from "@coco/shared/config/theme";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { useDialog } from "@coco/shared/providers/DialogContext";
import { StatusBar } from "expo-status-bar";
import { useSupabaseContext } from "@coco/shared/providers/SupabaseContext";

export const RegisterScreen = ({ onBack }: { onBack: () => void }) => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const supabase = useSupabaseContext();
	const { colors } = useTheme();
	const { showDialog } = useDialog();

	const handleRegister = async () => {
		const cleanEmail = email.trim();
		setLoading(true);
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
			const { error } = await supabase.auth.signUp({
				email: cleanEmail,
				password: password,
			});
			if (error) throw error;
			showDialog({
				title: "¡Éxito!",
				message: "Cuenta creada",
				intent: "success",
			});
		} catch (error: any) {
			console.error(error);

			let errorMessage = "Ocurrió un problema al registrarte.";

			if (error.message === "User already registered") {
				errorMessage = "Este correo ya está registrado.";
			} else if (
				error.message ===
				"Unable to validate email address: invalid format"
			) {
				errorMessage = "El formato del correo es inválido.";
			} else if (error.status === 429) {
				errorMessage =
					"Demasiados intentos. Por favor intenta más tarde.";
			}

			showDialog({
				title: "Error",
				message: errorMessage,
				intent: "error",
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<View style={styles.container}>
			<StatusBar style={"light"} animated={true} />
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
					keyboardType="email-address"
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
					{loading ? (
						<ActivityIndicator color={colors.businessBg} />
					) : (
						<Text
							style={[
								styles.buttonText,
								{ color: colors.businessBg },
							]}
						>
							Crear cuenta
						</Text>
					)}
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
		backgroundColor: Colors.light.businessBg,
		alignItems: "center",
		justifyContent: "center",
		padding: Spacing.lg,
	},
	title: {
		fontSize: FontSize.hero,
		fontWeight: FontWeight.black,
		color: Colors.light.backgroundLight,
		marginBottom: Spacing.lg,
		letterSpacing: 1,
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
	backBtn: {
		marginTop: Spacing.xl,
		alignItems: "center",
	},
	backText: {
		color: Colors.light.backgroundLight,
		fontWeight: FontWeight.semibold,
		opacity: 0.9,
		textDecorationLine: "underline",
	},
});
