import React from "react";
import {
	ActivityIndicator,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FontSize, FontWeight, Spacing } from "@coco/shared/config/theme";
import { ProductListItem } from "../../Products/components/ProductListItem";
import { ProductGridItem } from "../../Products/components/ProductGridItem";
import { useAppStore } from "@coco/shared/hooks/useAppStore";

// Tipamos las props que necesita el componente para funcionar
interface SectionItemProps {
	section: any;
	colors: any;
	navigation: any;
	onOpenMenu: (section: any) => void;
	isMoving: boolean;
}

export const SectionItem = ({
	section,
	colors,
	navigation,
	onOpenMenu,
	isMoving,
}: SectionItemProps) => {
	const { user } = useAppStore();
	const isGrid = section.visualizationType === "grid";

	const onPressItem = (productId: string) => {
		navigation.navigate("ProductForm", { productId });
	};

	return (
		<View style={styles.sectionContainer}>
			{/* 1. Cabecera de la Sección */}
			<View
				style={[
					styles.sectionHeader,
					{ backgroundColor: colors.backgroundLight },
				]}
			>
				<View style={{ flex: 1, marginRight: 8 }}>
					<Text
						style={[
							styles.sectionTitle,
							{ color: colors.textPrimaryLight },
						]}
					>
						{section.name}
					</Text>
					{section.description ? (
						<Text
							style={[
								styles.sectionDesc,
								{ color: colors.textSecondaryLight },
							]}
							numberOfLines={2}
						>
							{section.description}
						</Text>
					) : null}
				</View>

				<TouchableOpacity
					disabled={isMoving}
					style={[
						styles.menuIconButton,
						isMoving && { opacity: 0.5 },
					]}
					onPress={() => onOpenMenu(section)}
				>
					<View style={styles.content}>
						{/* Opcional: Si se está moviendo, muestra un pequeño spinner al lado */}
						{isMoving ? (
							<ActivityIndicator
								size="small"
								color={colors.businessBg}
								style={styles.spinner}
							/>
						) : (
							<Ionicons
								name="ellipsis-vertical"
								size={18}
								color={colors.textSecondaryLight}
							/>
						)}
					</View>
				</TouchableOpacity>
			</View>

			{/* 2. Contenedor de Productos */}
			<View
				style={
					isGrid
						? styles.gridProductsContainer
						: styles.listProductsContainer
				}
			>
				{section.products && section.products.length > 0 ? (
					section.products.map((product: any) =>
						isGrid ? (
							<ProductGridItem
								key={product.id}
								item={product}
								colors={colors}
								onPress={() => onPressItem(product.id)}
								role={user?.role}
							/>
						) : (
							<ProductListItem
								key={product.id}
								item={product}
								colors={colors}
								onPress={() => onPressItem(product.id)}
								role={user?.role}
							/>
						),
					)
				) : (
					/* Estado vacío de productos */
					<View
						style={[
							styles.emptyProductsContainer,
							{ borderBottomColor: colors.borderLight },
						]}
					>
						<Ionicons
							name="basket-outline"
							size={22}
							color={colors.textSecondaryLight}
							style={{ marginBottom: 4 }}
						/>
						<Text
							style={[
								styles.emptyProductsText,
								{ color: colors.textSecondaryLight },
							]}
						>
							No hay productos en esta sección
						</Text>
					</View>
				)}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	sectionContainer: {
		marginBottom: Spacing.md,
	},
	sectionHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: Spacing.sm,
		paddingHorizontal: Spacing.md,
		marginTop: Spacing.xs,
	},
	sectionTitle: {
		fontSize: FontSize.xxl,
		fontWeight: FontWeight.bold,
	},
	sectionDesc: {
		fontSize: FontSize.xs,
		marginTop: 1,
	},
	menuIconButton: {
		padding: Spacing.xs,
	},
	gridProductsContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
		paddingHorizontal: Spacing.md,
	},
	listProductsContainer: {
		paddingHorizontal: Spacing.md,
	},
	emptyProductsContainer: {
		paddingVertical: 20,
		alignItems: "center",
		justifyContent: "center",
		width: "100%",
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	emptyProductsText: {
		fontSize: FontSize.sm,
		textAlign: "center",
	},
	container: {
		padding: 16,
		marginVertical: 4,
		marginHorizontal: 16,
		borderRadius: 12,
		flexDirection: "row",
		alignItems: "center",
	},
	content: {
		flex: 1,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	title: {
		fontSize: 16,
		fontWeight: "600",
	},
	spinner: {
		marginLeft: 10,
	},
});
