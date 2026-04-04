import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import {
	BorderRadius,
	FontSize,
	FontWeight,
	Spacing,
} from "@coco/shared/config/theme";
import { Product } from "@coco/shared/core/entities";
import { RolesApp } from "@coco/shared/constants";

interface ProductListItemProps {
	item: Product;
	colors: any;
	showImage?: boolean;
	onPress: () => void;
	onAdd?: () => void;
	showAddButton?: boolean;
	role?: RolesApp;
}

export const ProductListItem = React.memo(
	({
		item,
		colors,
		onPress,
		showImage = true,
		showAddButton = false,
		onAdd = () => {},
		role,
	}: ProductListItemProps) => {
		const hasImage = item.imageUrl && item.imageUrl.trim() !== "";

		return (
			<TouchableOpacity
				style={[
					styles.listProductCard,
					{
						backgroundColor: colors.surfaceLight,
						borderBottomWidth: 1,
						borderBottomColor: colors.borderLight,
					},
				]}
				activeOpacity={0.7}
				onPress={onPress}
			>
				{/* Información del Producto (Izquierda) */}
				<View style={styles.listProductInfo}>
					<Text
						style={[
							styles.productName,
							{ color: colors.textPrimaryLight },
						]}
						numberOfLines={2}
					>
						{item.name}
					</Text>

					<View style={styles.priceRow}>
						<Text
							style={[
								styles.productPrice,
								{ color: colors.textPrimaryLight },
							]}
						>
							MXN${item.price?.toFixed(2) || "0.00"}
						</Text>

						{!item.isAvailable && (
							<Text
								style={{
									color: colors.error,
									fontSize: FontSize.sm,
									fontWeight: FontWeight.medium,
								}}
							>
								{role === "client" && "• Agotado"}
								{role === "business" && "• Pausado"}
							</Text>
						)}
					</View>

					<Text
						style={[
							styles.productDesc,
							{ color: colors.textSecondaryLight },
						]}
						numberOfLines={2}
					>
						{item.description || "Sin descripción asignada"}
					</Text>
				</View>

				{/* Acción / Imagen (Derecha) */}
				<View style={styles.listActionColumn}>
					{showImage && (
						<View style={styles.listImageContainer}>
							{hasImage && (
								<Image
									source={{ uri: item.imageUrl }}
									style={styles.listProductImage}
									resizeMode="cover"
								/>
							)}

							{/* Badge de edición encima de la imagen (Estilo Uber) */}
						</View>
					)}
					{showAddButton && (
						<TouchableOpacity
							style={[
								styles.addBtn,
								{
									borderColor: colors.borderLight,
									backgroundColor: colors.surfaceLight,
								},
							]}
							activeOpacity={0.7}
							onPress={onAdd}
						>
							<MaterialIcons
								name="shopping-cart"
								size={14}
								color={colors.textPrimaryLight}
							/>
						</TouchableOpacity>
					)}
				</View>
			</TouchableOpacity>
		);
	},
);

const styles = StyleSheet.create({
	listProductCard: {
		paddingVertical: Spacing.md,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	listProductInfo: {
		flex: 1,
		paddingRight: Spacing.md,
		gap: 2,
	},
	productName: {
		fontSize: FontSize.lg,
		fontWeight: FontWeight.semibold,
	},
	priceRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		marginVertical: 2,
	},
	productPrice: {
		fontSize: FontSize.md,
		fontWeight: FontWeight.medium,
	},
	productDesc: {
		fontSize: FontSize.sm,
		marginTop: 2,
	},
	listActionColumn: {
		justifyContent: "center",
		alignItems: "center",
	},
	listImageContainer: {
		position: "relative",
		width: 88,
		height: 88,
	},
	listProductImage: {
		width: "100%",
		height: "100%",
		borderRadius: BorderRadius.md,
	},
	fallbackPlaceholder: {
		justifyContent: "center",
		alignItems: "center",
	},
	addBtn: {
		position: "absolute",
		bottom: 6,
		right: 6,
		width: 30,
		height: 30,
		borderRadius: 12,
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 1,
	},
	listAddCircleButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		borderWidth: 1,
		justifyContent: "center",
		alignItems: "center",
	},
});
