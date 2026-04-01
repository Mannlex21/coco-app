import React, { useCallback, useState } from "react";
import { supabase } from "@/infrastructure/supabase/config";
import { Spacing } from "@coco/shared/config/theme";
import { useProduct } from "@coco/shared/hooks/supabase";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { useDialog } from "@coco/shared/providers/DialogContext";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { ContextMenuItem } from "@coco/shared/components/CustomContextMenu";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { Product } from "@coco/shared/core/entities/";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { EmptyState } from "../../components/EmptyState";
import { useContextMenu } from "@coco/shared/providers";
import { SearchInput } from "../../components/SearchInput";
import { FloatingButton } from "../../components/FloatingButton";
import { ProductListItem } from "./components/ProductListItem";
import { ProductGridItem } from "./components/ProductGridItem"; // 👈 Tu componente de Grid
import { VisualizationPicker } from "../../components/VisualizationPicker"; // 👈 Tu picker externo

export const ProductsTab = ({ businessId }: { businessId?: string }) => {
	const navigation = useNavigation<any>();
	const { colors } = useTheme();
	const { showDialog } = useDialog();

	// 👁️ Estado para controlar la visualización
	const [viewType, setViewType] = useState<"list" | "grid">("list");

	const {
		products,
		refreshing,
		onRefresh,
		searchTerm,
		setSearchTerm,
		deleteProduct,
		toggleProductAvailability,
		fetchProducts,
	} = useProduct(supabase, businessId);

	const { showContextMenu } = useContextMenu();

	useFocusEffect(
		useCallback(() => {
			fetchProducts(searchTerm);
		}, [businessId, searchTerm, fetchProducts]),
	);

	const handleOpenMenu = (product: Product) => {
		showContextMenu(
			product?.name || "",
			getMenuOptions(product),
			product?.description || "Sin descripción",
		);
	};

	const handleDelete = (productId: string, productName: string) => {
		showDialog({
			title: "Eliminar Producto",
			message: `¿Estás seguro de que quieres eliminar "${productName}"?`,
			intent: "warning",
			type: "options",
			onConfirm: async () => {
				try {
					await deleteProduct(productId);
					showDialog({
						title: "Eliminado",
						message: "Producto borrado con éxito.",
						intent: "success",
					});
				} catch (error) {
					console.log(error);
					showDialog({
						title: "Error",
						message: "No se pudo borrar el producto.",
						intent: "error",
					});
				}
			},
		});
	};

	const handleSearch = () => {
		fetchProducts(searchTerm);
	};

	const handleClearSearch = () => {
		setSearchTerm("");
		fetchProducts("");
	};

	const getMenuOptions = (product: Product): ContextMenuItem[] => {
		if (!product) return [];

		return [
			{
				label: product.isAvailable
					? "Pausar Producto"
					: "Activar Producto",
				icon: product.isAvailable ? (
					<Ionicons
						name="pause"
						size={20}
						color={colors.textPrimaryLight}
					/>
				) : (
					<Ionicons
						name="play"
						size={20}
						color={colors.textPrimaryLight}
					/>
				),
				onPress: () =>
					toggleProductAvailability(product.id, product.isAvailable),
			},
			{
				label: "Editar Producto",
				icon: (
					<MaterialIcons
						name="edit"
						size={20}
						color={colors.textPrimaryLight}
					/>
				),
				onPress: () =>
					navigation.navigate("ProductForm", {
						title: "Editar Producto",
						productId: product.id,
					}),
			},
			{
				label: "Eliminar Producto",
				icon: (
					<MaterialIcons
						name="delete"
						size={20}
						color={colors.error}
					/>
				),
				textColor: colors.error,
				iconBg: colors.errorLight,
				onPress: () => handleDelete(product.id, product.name),
			},
		];
	};

	return (
		<>
			<View
				style={[
					styles.subHeaderContainer,
					{
						borderBottomColor: colors.borderLight,
					},
				]}
			>
				<SearchInput
					value={searchTerm}
					onChangeText={setSearchTerm}
					onSearch={handleSearch}
					onClear={handleClearSearch}
					colors={colors}
					placeholder="Buscar sección"
				/>
				<View style={styles.pickerContainer}>
					<VisualizationPicker
						type={viewType}
						setType={setViewType}
						subTextColor={colors.textSecondaryLight}
						textColor={colors.textPrimaryLight}
						borderColor={colors.borderLight}
						businessBg={colors.businessBg}
						showLabel={false}
					/>
				</View>
			</View>

			<FlatList
				key={viewType === "grid" ? "g" : "l"}
				data={products}
				keyExtractor={(item) => item.id}
				numColumns={viewType === "grid" ? 2 : 1}
				contentContainerStyle={styles.listContent}
				columnWrapperStyle={
					viewType === "grid" ? styles.gridRow : undefined
				}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						colors={[colors.businessBg]}
					/>
				}
				ListEmptyComponent={
					<EmptyState
						isFiltering={searchTerm.trim().length > 0}
						colors={colors}
					/>
				}
				renderItem={({ item }) =>
					viewType === "grid" ? (
						<ProductGridItem
							item={item}
							colors={colors}
							onPress={() => handleOpenMenu(item)}
						/>
					) : (
						<ProductListItem
							item={item}
							colors={colors}
							onPress={() => handleOpenMenu(item)}
						/>
					)
				}
			/>

			<FloatingButton
				label="Nuevo Producto"
				iconName="add"
				colors={colors}
				onPress={() =>
					navigation.navigate("ProductForm", {
						title: "Nuevo Producto",
					})
				}
			/>
		</>
	);
};

const styles = StyleSheet.create({
	subHeaderContainer: {
		paddingHorizontal: Spacing.md,
		paddingTop: Spacing.xs,
		paddingBottom: Spacing.md,
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	pickerContainer: {
		marginTop: Spacing.xs,
	},
	listContent: {
		paddingHorizontal: Spacing.md,
		paddingBottom: 100,
	},
	gridRow: {
		justifyContent: "space-between", // Separa las cartas al extremo de la pantalla
	},
});
