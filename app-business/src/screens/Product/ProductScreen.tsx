import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	TouchableOpacity,
	Image,
	TextInput,
	RefreshControl,
	Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
	BorderRadius,
	Shadow,
	Spacing,
	FontSize,
	FontWeight,
} from "@coco/shared/config/theme";
import { useNavigation } from "@react-navigation/native";
import { Product } from "@coco/shared/core/entities/Product";
import { useProducts } from "@coco/shared/hooks/useProducts";
import { db } from "@/infrastructure/firebase/config";
import { useBusiness } from "@coco/shared/hooks/useBusiness";
import { useAppStore } from "@coco/shared/hooks/useAppStore";
import { ProductContextMenu } from "@coco/shared/components/ProductContextMenu";
import { useTheme } from "@coco/shared/hooks/useTheme"; // 👈 Importamos el hook
import { useDialog } from "@coco/shared/providers/DialogContext";

export const ProductScreen = () => {
	const navigation = useNavigation<any>();
	const [search, setSearch] = useState("");
	const { user } = useAppStore();
	const { showDialog } = useDialog();
	const [menuVisible, setMenuVisible] = useState(false);
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(
		null,
	);
	const { colors } = useTheme();
	const { activeBusiness } = useBusiness(db, user?.id);
	const {
		products,
		refreshing,
		onRefresh,
		deleteProduct,
		toggleAvailability,
	} = useProducts(db, activeBusiness?.id);

	const handleDelete = (product: Product) => {
		showDialog({
			title: "Eliminar Producto",
			message: `¿Estás seguro de que quieres eliminar "${product.name}"?`,
			intent: "error",
			onConfirm: () => {
				(async () => {
					try {
						await deleteProduct(product.id);

						showDialog({
							title: "Eliminado",
							message: "El producto ha sido borrado con éxito.",
							intent: "success",
						});
					} catch (error) {
						console.error(error);

						showDialog({
							title: "Error",
							message: "No se pudo borrar el producto.",
							intent: "error",
						});
					}
				})();
			},
		});
	};

	const renderProductItem = ({ item }: { item: Product }) => (
		<TouchableOpacity
			style={[
				styles.productCard,
				{
					backgroundColor: colors.surfaceLight,
					opacity: item.isAvailable ? 1 : 0.6, // Bajamos un poco más la opacidad si está pausado
				},
			]}
			onPress={() => {
				setSelectedProduct(item);
				setMenuVisible(true);
			}}
		>
			<View
				style={[
					styles.imagePlaceholder,
					{ backgroundColor: colors.backgroundLight },
				]}
			>
				{item.imageUrl ? (
					<Image
						source={{ uri: item.imageUrl }}
						style={styles.image}
					/>
				) : (
					<Text style={styles.imageText}>🌮</Text>
				)}
			</View>

			<View style={styles.productInfo}>
				<View style={styles.titleRow}>
					<Text
						style={[
							styles.productName,
							{ color: colors.textPrimaryLight },
						]}
					>
						{item.name}
					</Text>
					<Text
						style={[
							styles.categoryBadge,
							{
								backgroundColor: colors.backgroundLight,
								color: colors.textSecondaryLight,
							},
						]}
					>
						{item.category}
					</Text>
				</View>
				<Text
					style={[
						styles.productDesc,
						{ color: colors.textSecondaryLight },
					]}
					numberOfLines={1}
				>
					{item.description || "Sin descripción"}
				</Text>
				<Text
					style={[styles.productPrice, { color: colors.businessBg }]}
				>
					${item.price.toFixed(2)}
				</Text>
			</View>

			<View style={styles.rightProductInfo}>
				<View style={styles.statusContainer}>
					<Text
						style={[
							styles.statusText,
							{
								color: item.isAvailable
									? colors.success
									: colors.error,
							},
						]}
					>
						{item.isAvailable ? "Activo" : "Pausado"}
					</Text>
				</View>
			</View>
		</TouchableOpacity>
	);

	return (
		<View style={styles.container}>
			<View
				style={[
					styles.header,
					{ backgroundColor: colors.surfaceLight },
				]}
			>
				<Text
					style={[styles.title, { color: colors.textPrimaryLight }]}
				>
					Mi Catálogo
				</Text>
				<TextInput
					style={[
						styles.searchBar,
						{
							backgroundColor: colors.backgroundLight,
							color: colors.textPrimaryLight,
							borderColor: colors.borderLight,
						},
					]}
					placeholder="Buscar producto..."
					placeholderTextColor={colors.textSecondaryLight}
					value={search}
					onChangeText={setSearch}
				/>
			</View>

			<FlatList
				data={products}
				keyExtractor={(item) => item.id}
				renderItem={renderProductItem}
				contentContainerStyle={styles.listContent}
				ListEmptyComponent={
					<View style={styles.emptyContainer}>
						<Text
							style={[
								styles.emptyText,
								{ color: colors.textSecondaryLight },
							]}
						>
							No tienes productos registrados.
						</Text>
					</View>
				}
				refreshing={refreshing}
				onRefresh={onRefresh}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						colors={[colors.businessBg]} // Android
						tintColor={colors.businessBg} // iOS
					/>
				}
			/>

			{/* Floating Action Button */}
			<TouchableOpacity
				style={[styles.fab, { backgroundColor: colors.businessBg }]}
				onPress={() =>
					navigation.navigate("ProductForm", {
						title: "Nuevo Producto",
					})
				}
			>
				<Text style={[styles.fabText, { color: colors.textOnPrimary }]}>
					+
				</Text>
			</TouchableOpacity>

			<ProductContextMenu
				visible={menuVisible}
				onClose={() => setMenuVisible(false)}
				productName={selectedProduct?.name ?? ""}
				productSubtitle={`$${selectedProduct?.price.toFixed(2)} · ${selectedProduct?.category}`}
				items={[
					{
						label: "Editar producto",
						icon: "✏️",
						iconBg: colors.warningLight,
						textColor: colors.textPrimaryLight,
						onPress: () => {
							setMenuVisible(false);
							navigation.navigate("ProductForm", {
								title: "Actualizar Producto",
								productId: selectedProduct?.id,
							});
						},
					},
					{
						label: selectedProduct?.isAvailable
							? "Pausar producto"
							: "Activar producto",
						icon: selectedProduct?.isAvailable ? "⏸️" : "▶️",
						iconBg: colors.infoLight,
						textColor: colors.info,
						onPress: () => {
							if (selectedProduct) {
								toggleAvailability(
									selectedProduct.id,
									selectedProduct.isAvailable,
								);
								setMenuVisible(false);
							}
						},
					},
					{
						label: "Eliminar producto",
						icon: "🗑️",
						iconBg: colors.errorLight,
						textColor: colors.error,
						onPress: () => {
							setMenuVisible(false);
							selectedProduct && handleDelete(selectedProduct);
						},
					},
				]}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		padding: Spacing.md,
	},
	title: {
		fontSize: FontSize.xxl,
		fontWeight: FontWeight.bold,
		marginBottom: Spacing.md,
	},
	searchBar: {
		padding: Spacing.md,
		borderRadius: BorderRadius.md,
		fontSize: FontSize.md,
		borderWidth: 1,
	},
	listContent: {
		padding: Spacing.md,
		paddingBottom: 100,
	},
	productCard: {
		padding: Spacing.md,
		flexDirection: "row",
		alignItems: "center",
		marginBottom: Spacing.md,
		borderRadius: BorderRadius.lg,
		...Shadow.md,
	},
	imagePlaceholder: {
		width: 60,
		height: 60,
		borderRadius: BorderRadius.md,
		justifyContent: "center",
		alignItems: "center",
	},
	image: {
		width: 60,
		height: 60,
		borderRadius: BorderRadius.md,
	},
	imageText: {
		fontSize: FontSize.title,
	},
	productInfo: {
		flex: 1,
		marginLeft: Spacing.md,
	},
	titleRow: {
		flexDirection: "row",
		alignItems: "center",
	},
	productName: {
		fontSize: FontSize.md,
		fontWeight: FontWeight.bold,
	},
	categoryBadge: {
		fontSize: FontSize.xs,
		paddingHorizontal: Spacing.sm,
		paddingVertical: 2,
		borderRadius: BorderRadius.sm,
		marginLeft: Spacing.sm,
		textTransform: "uppercase",
		fontWeight: FontWeight.semibold,
	},
	productDesc: {
		fontSize: FontSize.sm,
		marginTop: 2,
	},
	productPrice: {
		fontSize: FontSize.md,
		fontWeight: FontWeight.bold,
		marginTop: 4,
	},
	rightProductInfo: {
		marginLeft: Spacing.sm,
	},
	statusContainer: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "flex-start",
		alignItems: "flex-end",
		flex: 1,
		minWidth: 60,
	},
	statusText: {
		textAlign: "right",
		fontSize: FontSize.xs,
		fontWeight: FontWeight.bold,
		marginTop: 4,
	},
	fab: {
		position: "absolute",
		bottom: 30,
		right: 30,
		width: 60,
		height: 60,
		borderRadius: 30,
		justifyContent: "center",
		alignItems: "center",
		...Shadow.lg,
	},
	fabText: {
		fontSize: FontSize.title,
		fontWeight: FontWeight.bold,
	},
	emptyContainer: {
		marginTop: 50,
		alignItems: "center",
	},
	emptyText: {
		fontSize: FontSize.md,
	},
});
