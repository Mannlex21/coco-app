import React, { useMemo } from "react";
import { Spacing } from "@coco/shared/config/theme";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { useNavigation } from "@react-navigation/native";
import {
	ActivityIndicator,
	FlatList,
	RefreshControl,
	StyleSheet,
	View,
} from "react-native";
import {
	EmptyState,
	FloatingButton,
	VisualizationPicker,
	CustomDropdown,
} from "@/components";
import { useAppStore, useProductStore } from "@coco/shared/hooks";
import { useCrossSellsTab } from "@/hooks/useCrossSellsTab";
import { CrossSellGridItem } from "./components/CrossSellGridItem";
import { CrossSellListItem } from "./components/CrossSellListItem";

export const CrossSellsTab = () => {
	const navigation = useNavigation<any>();
	const { colors } = useTheme();
	const { user } = useAppStore();

	// 💡 Traemos la lista completa de productos de tu tienda para llenar el select
	// (Ajusta de dónde sacas tus productos si los tienes en otro lado)
	const products = useProductStore((state) => state.products || []);

	const {
		crossSellGroups,
		onRefresh,
		handleOpenMenu,
		viewType,
		setViewType,
		loadings,
		selectedProductId, // 👈 Traído del hook modificado
		setSelectedProductId, // 👈 Traído del hook modificado
	} = useCrossSellsTab();

	// 💡 Mapeamos los productos para el dropdown
	const productOptions = useMemo(() => {
		return products.map((prod) => ({
			label: prod.name,
			value: prod.id,
		}));
	}, [products]);

	const flattenedProducts = useMemo(() => {
		if (!crossSellGroups) return [];

		return crossSellGroups.flatMap((group) =>
			group.items.map((item) => ({
				id: item.id,
				groupId: group.id,
				suggestedProductId: item.suggestedProductId,
				overridePrice: item.overridePrice,
				position: item.position ?? 0,
				createdAt: item.createdAt
					? new Date(item.createdAt)
					: new Date(),
				name: item.name,
				normalPrice: item.normalPrice,
				imageUrl: item.imageUrl,
				isAvailable: item.isAvailable,
			})),
		);
	}, [crossSellGroups]);

	// Quitamos el useEffect con el refetch() vacío porque el useCrossSellsTab
	// ya tiene un useEffect que dispara la búsqueda tan pronto como cambie selectedProductId.

	return (
		<>
			<View
				style={[
					styles.subHeaderContainer,
					{ borderBottomColor: colors.borderLight },
				]}
			>
				{/* 💡 Nuevo contenedor para el selector de Producto Origen */}
				<View style={styles.dropdownWrapper}>
					<CustomDropdown
						placeholder="Selecciona un producto origen"
						options={productOptions}
						value={selectedProductId}
						onChange={setSelectedProductId}
						colors={colors}
					/>
				</View>

				<View style={styles.pickerContainer}>
					<VisualizationPicker
						type={viewType}
						setType={setViewType}
						showLabel={false}
					/>
				</View>
			</View>

			<FlatList
				key={viewType === "grid" ? "g" : "l"}
				data={flattenedProducts}
				keyExtractor={(item) => item.id}
				numColumns={viewType === "grid" ? 2 : 1}
				contentContainerStyle={styles.listContent}
				columnWrapperStyle={
					viewType === "grid" ? styles.gridRow : undefined
				}
				refreshControl={
					<RefreshControl
						refreshing={loadings.refresh}
						onRefresh={onRefresh}
						colors={[colors.businessBg]}
					/>
				}
				ListEmptyComponent={
					loadings.fetch && !loadings.refresh ? (
						<View style={styles.loaderContainer}>
							<ActivityIndicator
								size="large"
								color={colors.businessBg}
							/>
						</View>
					) : (
						<EmptyState
							isFiltering={false}
							colors={colors}
							title={
								selectedProductId
									? "No hay ventas cruzadas"
									: "Selecciona un producto"
							}
							description={
								selectedProductId
									? "Este producto no tiene ventas cruzadas asociadas."
									: "Por favor elige un producto arriba para ver sus sugerencias."
							}
						/>
					)
				}
				renderItem={({ item }) =>
					viewType === "grid" ? (
						<CrossSellGridItem
							item={item}
							colors={colors}
							onPress={() => handleOpenMenu(item)}
							role={user?.role}
						/>
					) : (
						<CrossSellListItem
							item={item}
							colors={colors}
							onPress={() => handleOpenMenu(item)}
							role={user?.role}
						/>
					)
				}
			/>

			{/* 💡 Solo permitimos agregar sugerencias si ya hay un producto seleccionado */}
			{selectedProductId && (
				<FloatingButton
					label="Asociar Producto"
					iconName="add"
					colors={colors}
					onPress={() =>
						navigation.navigate("CrossSellItemsForm", {
							title: "Vincular Productos",
							originProductId: selectedProductId, // 👈 Se lo inyectamos a la navegación
						})
					}
				/>
			)}
		</>
	);
};

const styles = StyleSheet.create({
	subHeaderContainer: {
		paddingHorizontal: Spacing.md,
		paddingTop: Spacing.sm,
		paddingBottom: Spacing.md,
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	dropdownWrapper: {
		marginBottom: Spacing.xs,
	},
	pickerContainer: {
		marginTop: Spacing.xs,
		alignItems: "flex-end",
	},
	listContent: {
		paddingHorizontal: Spacing.md,
		paddingTop: Spacing.md,
		paddingBottom: 100,
		flexGrow: 1,
	},
	gridRow: {
		justifyContent: "space-between",
	},
	loaderContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		minHeight: 200,
	},
});
