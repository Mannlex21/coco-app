import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import {
	BorderRadius,
	FontSize,
	FontWeight,
	Spacing,
} from "@coco/shared/config/theme";
import { RolesApp } from "@coco/shared/constants";
import { ProductCrossSellItem } from "@coco/shared/core/entities";

interface CrossSellGridItemProps {
	item: ProductCrossSellItem; // 👈 Tu interfaz limpia
	colors: any;
	onPress: () => void;
	onAdd?: () => void;
	showAddButton?: boolean;
	role?: RolesApp;
}

export const CrossSellGridItem = React.memo(
	({
		item,
		colors,
		onPress,
		showAddButton = false,
		onAdd = () => {},
		role,
	}: CrossSellGridItemProps) => {
		const hasImage = item.imageUrl && item.imageUrl.trim() !== "";

		// 💰 Manejo de precios combo/normal
		const finalPrice = item.overridePrice ?? item.normalPrice;

		return (
			<TouchableOpacity
				style={styles.gridProductCard}
				activeOpacity={0.8}
				onPress={onPress}
			>
				<View style={styles.imageWrapper}>
					{/* (Código de la imagen idéntico...) */}
				</View>

				<View style={styles.gridProductInfo}>
					<Text
						style={[
							styles.gridProductName,
							{ color: colors.textPrimaryLight },
						]}
						numberOfLines={1}
					>
						{item.name}
					</Text>

					<View style={styles.priceRow}>
						<Text
							style={[
								styles.gridProductPrice,
								{ color: colors.textSecondaryLight },
							]}
						>
							MXN${finalPrice.toFixed(2)}{" "}
							{/* 👈 Aplicamos el precio final */}
						</Text>

						{!item.isAvailable && (
							<Text
								style={{
									color: colors.error,
									fontSize: FontSize.xs,
									fontWeight: FontWeight.medium,
								}}
								numberOfLines={1}
							>
								{role === "client" && "• Agotado"}
								{role === "business" && "• Pausado"}
							</Text>
						)}
					</View>

					<Text
						style={[
							styles.gridProductDesc,
							{ color: colors.textSecondaryLight },
						]}
						numberOfLines={2}
					>
						{"Producto sugerido para venta cruzada"}
					</Text>
				</View>
			</TouchableOpacity>
		);
	},
);

const styles = StyleSheet.create({
	gridProductCard: {
		width: "48.5%", // Dos columnas perfectas
		marginBottom: Spacing.lg,
		paddingVertical: Spacing.md,
	},
	imageWrapper: {
		position: "relative",
		width: "100%",
		height: 160,
		borderRadius: BorderRadius.xl,
		overflow: "hidden",
	},
	gridProductImage: {
		width: "100%",
		height: "100%",
	},
	gridProductImagePlaceholder: {
		width: "100%",
		height: "100%",
		justifyContent: "center",
		alignItems: "center",
	},
	addBtn: {
		position: "absolute",
		bottom: 10,
		right: 10,
		width: 32,
		height: 32,
		borderRadius: 16,
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 1,
	},
	gridProductInfo: {
		marginTop: Spacing.xs,
		gap: 1,
	},
	gridProductName: {
		fontSize: FontSize.md,
		fontWeight: FontWeight.semibold,
	},
	priceRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
	},
	gridProductPrice: {
		fontSize: FontSize.sm,
		fontWeight: FontWeight.medium,
	},
	gridProductDesc: {
		fontSize: FontSize.sm,
		marginTop: 1,
	},
});
