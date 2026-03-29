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
	ButtonStyles,
	Colors,
	FontSize,
	FontWeight,
	Shadow,
	Spacing,
} from "../config/theme";

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
						<View style={styles.container}>
							{/* Menú */}
							<View style={styles.menu}>
								{/* Header */}
								<View style={styles.menuHeader}>
									<Text
										style={styles.productName}
										numberOfLines={1}
									>
										{productName}
									</Text>
									{productSubtitle ? (
										<Text
											style={styles.productSubtitle}
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
										style={styles.menuItem}
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
														"#F8F9FA",
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
														"#333",
												},
											]}
										>
											{item.label}
										</Text>
									</TouchableOpacity>
								))}
							</View>

							{/* Cancelar */}
							<TouchableOpacity
								style={[
									ButtonStyles.light.error,
									styles.cancelBtn,
								]}
								onPress={onClose}
								activeOpacity={0.7}
							>
								<Text style={styles.cancelText}>Cancelar</Text>
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
		backgroundColor: "rgba(0,0,0,0)",
		justifyContent: "flex-end",
	},
	container: {
		width: "100%",
		backgroundColor: Colors.surfaceLight,
		padding: Spacing.sm,
		borderTopLeftRadius: BorderRadius.xl,
		borderTopRightRadius: BorderRadius.xl,
		borderRadius: BorderRadius.md,
		...Shadow.md,
	},
	menu: {
		backgroundColor: Colors.surfaceLight,
	},
	menuHeader: {
		padding: Spacing.md,
		borderBottomWidth: 1,
		borderBottomColor: Colors.backgroundLight,
	},
	productName: {
		fontSize: FontSize.md,
		fontWeight: FontWeight.bold,
		color: Colors.textPrimaryLight,
	},
	productSubtitle: {
		fontSize: FontSize.xs,
		color: Colors.textSecondaryLight,
		marginTop: 2,
	},
	menuItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.sm,
		padding: Spacing.md,
		marginTop: Spacing.sm,
		borderRadius: BorderRadius.md,
		borderWidth: 1,
		borderColor: Colors.borderLight,
		backgroundColor: Colors.surfaceLight,
	},
	iconWrapper: {
		width: 25,
		height: 25,
		borderRadius: BorderRadius.sm,
		justifyContent: "center",
		alignItems: "center",
	},
	icon: {
		fontSize: FontSize.md,
	},
	itemLabel: {
		fontSize: FontSize.sm,
		fontWeight: FontWeight.semibold,
	},
	cancelBtn: {
		padding: Spacing.md,
		alignItems: "center",
		marginTop: Spacing.md,
	},
	cancelText: {
		fontSize: FontSize.sm,
		fontWeight: FontWeight.semibold,
		color: ButtonStyles.light.error.color,
	},
});
