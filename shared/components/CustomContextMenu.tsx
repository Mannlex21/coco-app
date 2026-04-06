import React, { useEffect, useRef } from "react";
import {
	Modal,
	View,
	Text,
	TouchableOpacity,
	TouchableWithoutFeedback,
	StyleSheet,
	Animated,
	Dimensions,
} from "react-native";
import {
	BorderRadius,
	FontSize,
	FontWeight,
	Shadow,
	Spacing,
} from "../config/theme";
import { useTheme } from "@coco/shared/hooks/useTheme";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export interface ContextMenuItem {
	label: string;
	icon: string | React.ReactNode; // Soporta un string (emojis) o un elemento React (Iconos)
	textColor?: string;
	iconBg?: string;
	onPress: () => void;
}

interface CustomContextMenuProps {
	visible: boolean;
	onClose: () => void;
	title: string;
	subtitle?: string;
	items: ContextMenuItem[];
}

export const CustomContextMenu = ({
	visible,
	onClose,
	title,
	subtitle,
	items,
}: CustomContextMenuProps) => {
	const { colors } = useTheme();

	// 🧠 Valores de referencia para las animaciones
	const fadeAnim = useRef(new Animated.Value(0)).current; // Opacidad del overlay
	const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current; // Posición Y de la tarjeta

	useEffect(() => {
		if (visible) {
			// 🎬 Cuando se abre: Fade in del fondo + Slide up de la tarjeta en paralelo
			Animated.parallel([
				Animated.timing(fadeAnim, {
					toValue: 1,
					duration: 300,
					useNativeDriver: true,
				}),
				Animated.timing(slideAnim, {
					toValue: 0,
					duration: 350,
					useNativeDriver: true,
				}),
			]).start();
		}
	}, [visible]);

	// 🏃‍♂️ Función para cerrar con animación antes de desmontar el modal
	const handleClose = () => {
		Animated.parallel([
			Animated.timing(fadeAnim, {
				toValue: 0,
				duration: 250,
				useNativeDriver: true,
			}),
			Animated.timing(slideAnim, {
				toValue: SCREEN_HEIGHT,
				duration: 300,
				useNativeDriver: true,
			}),
		]).start(() => {
			onClose(); // Le avisa al padre que ya puede cambiar el estado visible a false
		});
	};

	return (
		<Modal
			visible={visible}
			transparent
			animationType="none"
			onRequestClose={handleClose}
			statusBarTranslucent={true}
		>
			<TouchableWithoutFeedback onPress={handleClose}>
				<Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
					<TouchableWithoutFeedback>
						<Animated.View
							style={[
								styles.container,
								{
									backgroundColor: colors.surfaceLight,
									transform: [{ translateY: slideAnim }],
								},
							]}
						>
							<View style={styles.menuHeader}>
								<Text
									style={[
										styles.titleText,
										{ color: colors.textPrimaryLight },
									]}
									numberOfLines={1}
								>
									{title}
								</Text>
								{subtitle ? (
									<Text
										style={[
											styles.subtitleText,
											{
												color: colors.textSecondaryLight,
											},
										]}
										numberOfLines={1}
									>
										{subtitle}
									</Text>
								) : null}
							</View>

							{/* Mapeo dinámico de acciones */}
							{items.map((item, index) => (
								<TouchableOpacity
									key={index}
									style={[
										styles.menuItem,
										{
											borderBottomColor:
												colors.borderLight,
											borderBottomWidth:
												index === items.length - 1
													? 0
													: 0.5,
										},
									]}
									onPress={() => {
										handleClose();
										setTimeout(item.onPress, 350);
									}}
									activeOpacity={0.7}
								>
									<View
										style={[
											styles.iconWrapper,
											{
												backgroundColor:
													item.iconBg ??
													colors.backgroundLight,
											},
										]}
									>
										{typeof item.icon === "string" ? (
											<Text style={styles.icon}>
												{item.icon}
											</Text>
										) : (
											item.icon
										)}
									</View>
									<Text
										style={[
											styles.itemLabel,
											{
												color:
													item.textColor ??
													colors.textPrimaryLight,
											},
										]}
									>
										{item.label}
									</Text>
								</TouchableOpacity>
							))}

							{/* Botón Cancelar */}
							<TouchableOpacity
								style={[
									styles.cancelBtn,
									{
										backgroundColor: colors.errorLight,
										borderColor: colors.error,
										borderWidth: StyleSheet.hairlineWidth,
									},
								]}
								onPress={handleClose}
								activeOpacity={0.7}
							>
								<Text
									style={[
										styles.cancelText,
										{ color: colors.error },
									]}
								>
									Cancelar
								</Text>
							</TouchableOpacity>
						</Animated.View>
					</TouchableWithoutFeedback>
				</Animated.View>
			</TouchableWithoutFeedback>
		</Modal>
	);
};

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		justifyContent: "flex-end", // Mantiene la tarjeta pegada abajo
		backgroundColor: "rgba(0, 0, 0, 0.1)", // Fondo oscuro semitransparente
	},
	container: {
		width: "100%",
		padding: Spacing.lg,
		borderTopLeftRadius: BorderRadius.xl,
		borderTopRightRadius: BorderRadius.xl,
		...Shadow.xl,
	},
	menuHeader: {
		paddingBottom: Spacing.md,
		marginBottom: Spacing.sm,
	},
	titleText: {
		fontSize: FontSize.lg,
		fontWeight: FontWeight.bold,
	},
	subtitleText: {
		fontSize: FontSize.sm,
		marginTop: 2,
	},
	menuItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.md,
		paddingVertical: Spacing.md,
		paddingHorizontal: Spacing.sm,
	},
	iconWrapper: {
		width: 32,
		height: 32,
		borderRadius: BorderRadius.md,
		justifyContent: "center",
		alignItems: "center",
	},
	icon: {
		fontSize: FontSize.md,
	},
	itemLabel: {
		fontSize: FontSize.md,
		fontWeight: FontWeight.medium,
	},
	cancelBtn: {
		padding: Spacing.md,
		alignItems: "center",
		marginTop: Spacing.lg,
		borderRadius: BorderRadius.md,
	},
	cancelText: {
		fontSize: FontSize.md,
		fontWeight: FontWeight.bold,
	},
});
