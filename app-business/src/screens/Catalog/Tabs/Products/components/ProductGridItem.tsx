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

interface ProductGridItemProps {
	item: any;
	colors: any;
	onPress: () => void;
	onAdd?: () => void;
	showAddButton?: boolean;
	role?: RolesApp;
}

export const ProductGridItem = ({
	item,
	colors,
	onPress,
	showAddButton = false,
	onAdd = () => {},
	role,
}: ProductGridItemProps) => {
	const hasImage = item.imageUrl && item.imageUrl.trim() !== "";

	return (
		<TouchableOpacity
			style={styles.gridProductCard}
			activeOpacity={0.8}
			onPress={onPress}
		>
			{/* 🖼️ ÁREA DE IMAGEN */}
			<View style={styles.imageWrapper}>
				{hasImage ? (
					<Image
						source={{ uri: item.imageUrl }}
						style={styles.gridProductImage}
						resizeMode="cover"
					/>
				) : (
					<View
						style={[
							styles.gridProductImagePlaceholder,
							{ backgroundColor: colors.borderLight },
						]}
					>
						<Ionicons
							name="fast-food-outline"
							size={44}
							color={colors.textSecondaryLight}
						/>
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
							size={16}
							color={colors.textPrimaryLight}
						/>
					</TouchableOpacity>
				)}
			</View>

			{/* 📝 ÁREA DE INFORMACIÓN (Debajo de la imagen sin paddings forzados) */}
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
						MXN${item.price?.toFixed(2) || "0.00"}
					</Text>

					{/* Indicador de agotado */}
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
					{item.description || "Sin descripción asignada"}
				</Text>
			</View>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	gridProductCard: {
		width: "48.5%",
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
