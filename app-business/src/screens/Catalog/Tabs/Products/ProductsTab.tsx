import React from "react";
import { Spacing } from "@coco/shared/config/theme";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { useNavigation } from "@react-navigation/native";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { EmptyState } from "../../components/EmptyState";
import { SearchInput } from "../../components/SearchInput";
import { FloatingButton } from "../../components/FloatingButton";
import { ProductListItem } from "./components/ProductListItem";
import { ProductGridItem } from "./components/ProductGridItem";
import { VisualizationPicker } from "../../components/VisualizationPicker";
import { useProductsTab } from "@/hooks/useProductsTab";
import { useAppStore } from "@coco/shared/hooks/useAppStore";

export const ProductsTab = ({ businessId }: { businessId?: string }) => {
	const navigation = useNavigation<any>();
	const { colors } = useTheme();
	const { user } = useAppStore();
	const {
		products,
		refreshing,
		onRefresh,
		searchTerm,
		setSearchTerm,
		handleSearch,
		handleClearSearch,
		handleOpenMenu,
		viewType,
		setViewType,
	} = useProductsTab(businessId, colors);

	return (
		<>
			<View
				style={[
					styles.subHeaderContainer,
					{ borderBottomColor: colors.borderLight },
				]}
			>
				<SearchInput
					value={searchTerm}
					onChangeText={setSearchTerm}
					onSearch={handleSearch}
					onClear={handleClearSearch}
					colors={colors}
					placeholder="Buscar producto"
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
							role={user?.role}
						/>
					) : (
						<ProductListItem
							item={item}
							colors={colors}
							onPress={() => handleOpenMenu(item)}
							role={user?.role}
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
		justifyContent: "space-between",
	},
});
