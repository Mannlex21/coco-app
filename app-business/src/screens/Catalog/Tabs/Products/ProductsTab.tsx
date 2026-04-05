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
	SearchInput,
	FloatingButton,
	VisualizationPicker,
} from "@/components";
import { ProductListItem } from "@/screens/Catalog/Tabs/Products/components/ProductListItem";
import { ProductGridItem } from "@/screens/Catalog/Tabs/Products/components/ProductGridItem";
import { useProductsTab } from "@/hooks/useProductsTab";
import { useAppStore } from "@coco/shared/hooks";

export const ProductsTab = () => {
	const navigation = useNavigation<any>();
	const { colors } = useTheme();
	const { user } = useAppStore();
	const {
		products,
		onRefresh,
		searchTerm,
		setSearchTerm,
		handleSearch,
		handleClearSearch,
		handleOpenMenu,
		viewType,
		setViewType,
		loadings,
	} = useProductsTab();
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
							isFiltering={searchTerm.trim().length > 0}
							colors={colors}
						/>
					)
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
		paddingTop: Spacing.md,
		paddingBottom: Spacing.md,
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	pickerContainer: {
		marginTop: Spacing.xs,
	},
	listContent: {
		paddingHorizontal: Spacing.md,
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
