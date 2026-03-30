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
	icon: string;
	textColor?: string;
	iconBg?: string;
	onPress: () => void;
}

interface ProductContextMenuProps {
	visible: boolean;
	onClose: () => void;
	productName: string;
	productSubtitle?: string;
	items: ContextMenuItem[];
}

export const ProductContextMenu = ({
	visible,
	onClose,
	productName,
	productSubtitle,
	items,
}: ProductContextMenuProps) => {
	const { colors } = useTheme();

	return (
		<Modal
			visible={visible}
			transparent
			animationType="slide"
			onRequestClose={onClose}
		>
			<TouchableWithoutFeedback onPress={onClose}>
				<View
					style={[
						styles.overlay,
						{
							backgroundColor: "transparent",
						},
					]}
				>
					<TouchableWithoutFeedback>
						<View
							style={[
								styles.container,
								{ backgroundColor: colors.surfaceLight },
							]}
						>
							{/* Menú */}
							<View
								style={[
									styles.menu,
									{ backgroundColor: colors.surfaceLight },
								]}
							>
								{/* Header */}
								<View
									style={[
										styles.menuHeader,
										{
											borderBottomColor:
												colors.borderLight,
										},
									]}
								>
									<Text
										style={[
											styles.productName,
											{ color: colors.textPrimaryLight },
										]}
										numberOfLines={1}
									>
										{productName}
									</Text>
									{productSubtitle ? (
										<Text
											style={[
												styles.productSubtitle,
												{
													color: colors.textSecondaryLight,
												},
											]}
											numberOfLines={1}
										>
											{productSubtitle}
										</Text>
									) : null}
								</View>

								{/* Items */}
								{items.map((item, index) => (
									<TouchableOpacity
										key={index}
										style={[
											styles.menuItem,
											{
												borderBottomColor:
													colors.borderLight,
												backgroundColor:
													colors.surfaceLight,
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
											<Text style={styles.icon}>
												{item.icon}
											</Text>
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
							</View>

							{/* Cancelar (Botón adaptado dinámicamente) */}
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
		backgroundColor: "transparent",
	},
	container: {
		width: "100%",
		padding: Spacing.lg,
		borderTopLeftRadius: BorderRadius.xl,
		borderTopRightRadius: BorderRadius.xl,
		...Shadow.lg,
	},
	menu: {},
	menuHeader: {
		paddingBottom: Spacing.md,
		borderBottomWidth: 1,
		marginBottom: Spacing.sm,
	},
	productName: {
		fontSize: FontSize.lg,
		fontWeight: FontWeight.bold,
	},
	productSubtitle: {
		fontSize: FontSize.sm,
		marginTop: 2,
	},
	menuItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.md,
		paddingVertical: Spacing.md,
		paddingHorizontal: Spacing.sm,
		borderBottomWidth: 0.5,
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
