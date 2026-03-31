import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import {
	BorderRadius,
	FontSize,
	FontWeight,
	Shadow,
	Spacing,
} from "@coco/shared/config/theme";

interface ProductGridItemProps {
	item: any;
	colors: any;
	onPress: () => void;
}

export const ProductGridItem = ({
	item,
	colors,
	onPress,
}: ProductGridItemProps) => {
	const hasImage = item.image_url && item.image_url.trim() !== "";

	return (
		<TouchableOpacity
			style={[
				styles.gridProductCard,
				{ backgroundColor: colors.surfaceLight },
			]}
			activeOpacity={0.7}
			onPress={onPress}
		>
			{hasImage ? (
				<Image
					source={{ uri: item.image_url }}
					style={styles.gridProductImage}
					resizeMode="cover"
				/>
			) : (
				<View
					style={[
						styles.gridProductImagePlaceholder,
						{ backgroundColor: colors.backgroundLight },
					]}
				>
					<Ionicons
						name="fast-food-outline"
						size={40}
						color={colors.textSecondaryLight}
					/>
				</View>
			)}

			<View
				style={[
					styles.gridEditBadge,
					{
						backgroundColor: colors.surfaceLight,
						borderColor: colors.backgroundLight,
					},
				]}
			>
				<MaterialIcons
					name="edit"
					size={14}
					color={colors.textSecondaryLight}
				/>
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
				<Text
					style={[
						styles.gridProductPrice,
						{ color: colors.textPrimaryLight },
					]}
				>
					MXN${item.price?.toFixed(2) || "0.00"}
				</Text>
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
		borderRadius: BorderRadius.xl,
		marginBottom: Spacing.md,
		position: "relative",
		overflow: "hidden",
		...Shadow.sm,
	},
	gridProductImage: {
		width: "100%",
		height: 160,
	},
	gridProductImagePlaceholder: {
		width: "100%",
		height: 160,
		justifyContent: "center",
		alignItems: "center",
	},
	gridEditBadge: {
		position: "absolute",
		top: 10,
		right: 10,
		width: 32,
		height: 32,
		borderRadius: 16,
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 1,
		...Shadow.md,
	},
	gridProductInfo: {
		padding: Spacing.md,
		gap: 2,
	},
	gridProductName: {
		fontSize: FontSize.md,
		fontWeight: FontWeight.bold,
	},
	gridProductPrice: {
		fontSize: FontSize.sm,
		fontWeight: FontWeight.bold,
	},
	gridProductDesc: {
		fontSize: FontSize.sm,
		marginTop: 2,
	},
});
