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
import { EmptyState, FloatingButton, CustomDropdown } from "@/components";
import { useProductStore } from "@coco/shared/hooks";
import { useCrossSellsTab } from "@/hooks/useCrossSellsTab";
import { CrossSellGroupItem } from "./components/CrossSellGroupItem";

export const CrossSellsTab = () => {
	const navigation = useNavigation<any>();
	const { colors } = useTheme();

	const products = useProductStore((state) => state.products || []);

	const {
		crossSellGroups,
		onRefresh,
		handleOpenMenu,
		// 1️⃣ Eliminamos 'viewType' de aquí porque ya no viene del hook
		loadings,
		selectedProductId,
		setSelectedProductId,
	} = useCrossSellsTab();

	const productOptions = useMemo(() => {
		return products.map((prod) => ({
			label: prod.name,
			value: prod.id,
		}));
	}, [products]);

	const renderEmptyComponent = () => {
		if (!selectedProductId) {
			return (
				<EmptyState
					isFiltering={false}
					colors={colors}
					title="Selecciona un producto"
					description="Por favor elige un producto arriba para ver sus ventas cruzadas."
				/>
			);
		}

		if (loadings.fetch && !loadings.refresh) {
			return (
				<View style={styles.loaderContainer}>
					<ActivityIndicator size="large" color={colors.businessBg} />
				</View>
			);
		}

		return (
			<EmptyState
				isFiltering={false}
				colors={colors}
				title="No hay ventas cruzadas"
				description="Este producto no tiene ventas cruzadas asociadas."
			/>
		);
	};

	return (
		<>
			<View
				style={[
					styles.subHeaderContainer,
					{ borderBottomColor: colors.borderLight },
				]}
			>
				<CustomDropdown
					placeholder="Selecciona un producto origen"
					options={productOptions}
					value={selectedProductId}
					onChange={setSelectedProductId}
					colors={colors}
				/>
			</View>

			<FlatList
				data={selectedProductId ? crossSellGroups : []}
				keyExtractor={(item) => item.id}
				contentContainerStyle={styles.listContent}
				refreshControl={
					selectedProductId ? (
						<RefreshControl
							refreshing={loadings.refresh}
							onRefresh={onRefresh}
							colors={[colors.businessBg]}
						/>
					) : undefined
				}
				ListEmptyComponent={renderEmptyComponent()}
				renderItem={({ item }) => (
					<CrossSellGroupItem
						group={item}
						colors={colors}
						onOpenMenu={handleOpenMenu}
					/>
				)}
			/>
			<FloatingButton
				label="Asociar Producto"
				iconName="add"
				disabled={!selectedProductId}
				onPress={() =>
					navigation.navigate("CrossSellAssociation", {
						title: "Vincular Productos",
						originProductId: selectedProductId,
					})
				}
			/>
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
	listContent: {
		paddingTop: Spacing.xs,
		paddingBottom: 100,
		flexGrow: 1,
	},
	loaderContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		minHeight: 200,
	},
});
