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

export interface ContextMenuItem {
	label: string;
	icon: string | React.ReactNode; // 💥 Ahora soporta un string (emojis) o un elemento React (Iconos)
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

	return (
		<Modal
			visible={visible}
			transparent
			animationType="slide"
			onRequestClose={onClose}
		>
			<TouchableWithoutFeedback onPress={onClose}>
				<View style={styles.overlay}>
					<TouchableWithoutFeedback>
						<View
							style={[
								styles.container,
								{ backgroundColor: colors.surfaceLight },
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
										onClose();
										setTimeout(item.onPress, 200);
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
										{/* 💥 Validación de tipo de icono */}
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
										borderWidth: 1,
									},
								]}
								onPress={onClose}
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
		justifyContent: "flex-end",
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
