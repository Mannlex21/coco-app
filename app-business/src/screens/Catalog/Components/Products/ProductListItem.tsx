import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import {
	BorderRadius,
	FontSize,
	FontWeight,
	Shadow,
	Spacing,
} from "@coco/shared/config/theme";

interface ProductListItemProps {
	item: any;
	colors: any;
	onPress: () => void;
}

export const ProductListItem = ({
	item,
	colors,
	onPress,
}: ProductListItemProps) => {
	const hasImage = item.image_url && item.image_url.trim() !== "";

	return (
		<TouchableOpacity
			style={[
				styles.listProductCard,
				{
					backgroundColor: colors.surfaceLight,
					borderLeftColor: item.isAvailable
						? colors.businessBg
						: colors.textSecondaryLight,
				},
			]}
			activeOpacity={0.7}
			onPress={onPress}
		>
			<View style={styles.listProductInfo}>
				<Text
					style={[
						styles.productName,
						{ color: colors.textPrimaryLight },
					]}
					numberOfLines={1}
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

			<View style={styles.listActionColumn}>
				{hasImage ? (
					<View style={styles.listImageContainer}>
						<Image
							source={{ uri: item.image_url }}
							style={styles.listProductImage}
							resizeMode="cover"
						/>
						<View
							style={[
								styles.listEditBadge,
								{
									backgroundColor: colors.surfaceLight,
									borderColor: colors.backgroundLight,
								},
							]}
						>
							<MaterialIcons
								name="edit"
								size={12}
								color={colors.textSecondaryLight}
							/>
						</View>
					</View>
				) : (
					<View
						style={[
							styles.listAddCircleButton,
							{
								borderColor: colors.backgroundLight,
								backgroundColor: colors.surfaceLight,
							},
						]}
					>
						<MaterialIcons
							name="edit"
							size={18}
							color={colors.textSecondaryLight}
						/>
					</View>
				)}
			</View>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	listProductCard: {
		padding: Spacing.md,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: Spacing.sm,
		borderRadius: BorderRadius.lg,
		borderLeftWidth: 4,
		...Shadow.sm,
	},
	listProductInfo: {
		flex: 1,
		paddingRight: Spacing.md,
		gap: 2,
	},
	productName: {
		fontSize: FontSize.md,
		fontWeight: FontWeight.semibold,
	},
	priceRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	productPrice: {
		fontSize: FontSize.sm,
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
		width: 80,
		height: 80,
	},
	listProductImage: {
		width: "100%",
		height: "100%",
		borderRadius: BorderRadius.md,
	},
	listEditBadge: {
		position: "absolute",
		bottom: -4,
		right: -4,
		width: 24,
		height: 24,
		borderRadius: 12,
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 1,
		...Shadow.sm,
	},
	listAddCircleButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		borderWidth: 1,
		justifyContent: "center",
		alignItems: "center",
		...Shadow.sm,
	},
});
