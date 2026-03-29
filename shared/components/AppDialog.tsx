import React, { useEffect, useRef } from "react";
import {
	Modal,
	View,
	Text,
	TouchableOpacity,
	TouchableWithoutFeedback,
	StyleSheet,
	Animated, // 👈 Seguimos usando Animated
} from "react-native";
import {
	BorderRadius,
	FontSize,
	FontWeight,
	Shadow,
	Spacing,
} from "../config/theme";
import { useTheme } from "@coco/shared/hooks/useTheme";

interface AppDialogProps {
	visible: boolean;
	onClose: () => void;
	title: string;
	message: string;
	type?: "info" | "options";
	intent?: "primary" | "success" | "warning" | "error" | "info";
	confirmText?: string;
	cancelText?: string;
	onConfirm: () => void;
}

export const AppDialog = ({
	visible,
	onClose,
	title,
	message,
	type = "info",
	intent = "primary",
	confirmText = "Aceptar",
	cancelText = "Cancelar",
	onConfirm,
}: AppDialogProps) => {
	const { colors } = useTheme();

	// 💡 Dos valores animados: Uno para desvanecer y otro para escalar
	const fadeAnim = useRef(new Animated.Value(0)).current;
	const scaleAnim = useRef(new Animated.Value(0.95)).current; // Arranca un pelín más pequeño

	useEffect(() => {
		if (visible) {
			// Reset de valores al abrir
			fadeAnim.setValue(0);
			scaleAnim.setValue(0.95);

			// Animación en paralelo de opacidad y escala (150ms)
			Animated.parallel([
				Animated.timing(fadeAnim, {
					toValue: 1,
					duration: 150,
					useNativeDriver: true,
				}),
				Animated.timing(scaleAnim, {
					toValue: 1,
					duration: 150,
					useNativeDriver: true,
				}),
			]).start();
		}
	}, [visible]);

	const handleClose = () => {
		// Salida rápida (120ms)
		Animated.parallel([
			Animated.timing(fadeAnim, {
				toValue: 0,
				duration: 120,
				useNativeDriver: true,
			}),
			Animated.timing(scaleAnim, {
				toValue: 0.95,
				duration: 120,
				useNativeDriver: true,
			}),
		]).start(() => {
			onClose(); // Se desmonta el modal al terminar
		});
	};

	const handleConfirm = () => {
		handleClose();
		setTimeout(onConfirm, 130);
	};

	const getConfirmColor = () => {
		switch (intent) {
			case "success":
				return colors.success;
			case "warning":
				return colors.warning;
			case "error":
				return colors.error;
			case "info":
				return colors.info;
			default:
				return colors.businessBg;
		}
	};

	const confirmBgColor = getConfirmColor();

	return (
		<Modal
			visible={visible}
			transparent
			animationType="none"
			onRequestClose={handleClose}
		>
			<TouchableWithoutFeedback
				onPress={type === "info" ? handleClose : undefined}
			>
				{/* 💡 El overlay ya no se anima, así evitamos el parpadeo del fondo */}
				<View style={styles.overlay}>
					<TouchableWithoutFeedback>
						{/* 💡 Solo animamos la tarjeta del diálogo */}
						<Animated.View
							style={[
								styles.alertContainer,
								{
									backgroundColor: colors.surfaceLight,
									opacity: fadeAnim, // Se desvanece solita
									transform: [{ scale: scaleAnim }], // Crece un poquito al entrar
								},
							]}
						>
							<View style={styles.header}>
								<Text
									style={[
										styles.title,
										{ color: colors.textPrimaryLight },
									]}
								>
									{title}
								</Text>
								<Text
									style={[
										styles.message,
										{ color: colors.textSecondaryLight },
									]}
								>
									{message}
								</Text>
							</View>

							<View
								style={[
									styles.footer,
									type === "info"
										? styles.footerVertical
										: styles.footerHorizontal,
								]}
							>
								{type === "options" && (
									<TouchableOpacity
										style={[
											styles.btn,
											styles.flexBtn,
											{
												backgroundColor:
													colors.backgroundLight,
												borderColor: colors.borderLight,
												borderWidth: 1,
												borderRadius: BorderRadius.md,
											},
										]}
										onPress={handleClose}
										activeOpacity={0.7}
									>
										<Text
											style={[
												styles.btnText,
												{
													color: colors.textPrimaryLight,
												},
											]}
										>
											{cancelText}
										</Text>
									</TouchableOpacity>
								)}

								<TouchableOpacity
									style={[
										styles.btn,
										type === "options"
											? styles.flexBtn
											: styles.infoBtn,
										{
											backgroundColor: confirmBgColor,
											borderRadius: BorderRadius.md,
										},
									]}
									onPress={handleConfirm}
									activeOpacity={0.7}
								>
									<Text
										style={[
											styles.btnText,
											{ color: colors.textOnPrimary },
										]}
									>
										{confirmText}
									</Text>
								</TouchableOpacity>
							</View>
						</Animated.View>
					</TouchableWithoutFeedback>
				</View>
			</TouchableWithoutFeedback>
		</Modal>
	);
};

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: Spacing.xl,
		backgroundColor: "rgba(0, 0, 0, 0.1)", // 👈 El color oscuro se queda fijo aquí
	},
	alertContainer: {
		width: "100%",
		maxWidth: 340,
		borderRadius: BorderRadius.lg,
		padding: Spacing.lg,
		...Shadow.md, // 👈 Ahora la sombra no hará cosas raras
	},
	header: {
		alignItems: "flex-start",
		marginBottom: Spacing.lg,
	},
	title: {
		fontSize: FontSize.md,
		fontWeight: FontWeight.bold,
		textAlign: "left",
		marginBottom: Spacing.sm,
	},
	message: {
		fontSize: FontSize.sm,
		textAlign: "left",
		lineHeight: 20,
	},
	footer: {
		gap: Spacing.sm,
	},
	footerHorizontal: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	footerVertical: {
		flexDirection: "column",
		alignItems: "center",
	},
	btn: {
		height: 44,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: Spacing.lg,
	},
	flexBtn: {
		flex: 1,
	},
	infoBtn: {
		minWidth: 120,
		alignSelf: "center",
	},
	btnText: {
		fontSize: FontSize.sm,
		fontWeight: FontWeight.semibold,
	},
});
