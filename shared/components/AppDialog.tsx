import React from "react";
import {
	Modal,
	View,
	Text,
	TouchableOpacity,
	TouchableWithoutFeedback,
	StyleSheet,
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

	const handleClose = () => {
		onClose(); // Cierre directo y desmontado inmediato
	};

	const handleConfirm = () => {
		onConfirm();
		onClose();
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
			animationType="none" // 👈 Cero animaciones nativas
			onRequestClose={handleClose}
		>
			<TouchableWithoutFeedback
				onPress={type === "info" ? handleClose : undefined}
			>
				<View style={styles.overlay}>
					<TouchableWithoutFeedback>
						{/* 💡 Ya no es un Animated.View, rinde al instante */}
						<View
							style={[
								styles.alertContainer,
								{ backgroundColor: colors.surfaceLight },
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
						</View>
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
		backgroundColor: "rgba(0, 0, 0, 0.1)",
	},
	alertContainer: {
		width: "100%",
		maxWidth: 340,
		borderRadius: BorderRadius.lg,
		padding: Spacing.lg,
		...Shadow.md,
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
