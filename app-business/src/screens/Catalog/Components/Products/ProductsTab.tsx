import React, { useCallback, useState } from "react";
import { supabase } from "@/infrastructure/supabase/config";
import {
	BorderRadius,
	FontSize,
	FontWeight,
	Shadow,
	Spacing,
} from "@coco/shared/config/theme";
import { useProduct } from "@coco/shared/hooks/supabase"; // 🔄 Cambiado a useProduct
import { useTheme } from "@coco/shared/hooks/useTheme";
import { useDialog } from "@coco/shared/providers/DialogContext";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { ContextMenuItem } from "@coco/shared/components/CustomContextMenu";
import {
	FlatList,
	RefreshControl,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { Product } from "@coco/shared/core/entities/"; // 🔄 Cambiado a Product
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { EmptyState } from "../EmptyState";
import { useContextMenu } from "@coco/shared/providers";

export const ProductsTab = ({ businessId }: { businessId?: string }) => {
	const navigation = useNavigation<any>();
	const { colors } = useTheme();
	const { showDialog } = useDialog();
	const [isFirst, setIsFirst] = useState(false);
	const [isLast, setIsLast] = useState(false);

	// 🔄 Adaptado para usar el hook de productos
	const {
		products,
		refreshing,
		onRefresh,
		searchTerm,
		setSearchTerm,
		deleteProduct,
		toggleProductAvailability,
		moveProduct,
		fetchProducts,
	} = useProduct(supabase, businessId);
	const { showContextMenu } = useContextMenu();
	useFocusEffect(
		useCallback(() => {
			fetchProducts(searchTerm);
		}, [businessId, searchTerm, fetchProducts]),
	);
	const handleOpenMenu = (product: Product) => {
		// 🔍 Buscamos el index real dentro de la lista que estamos viendo
		const index = products.findIndex((p) => p.id === product.id);

		// ⚡ Cálculos síncronos e instantáneos
		setIsFirst(index === 0);
		setIsLast(index === products.length - 1);

		showContextMenu(
			product?.name || "",
			getMenuOptions(product),
			product?.description || "Sin descripción",
		);
	};

	const handleMoveProduct = async (
		currentProduct: Product,
		direction: "up" | "down",
	) => {
		const result = await moveProduct(currentProduct, direction);

		if (!result.success) {
			showDialog({
				title: "¡Atención!",
				message: result.message || "Ocurrió un error inesperado.",
				intent: "info",
			});
			return;
		}

		showDialog({
			title: "¡Éxito!",
			message: "Posición actualizada correctamente.",
			intent: "success",
		});
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
		fetchProducts(""); // Trae todo de nuevo
	};

	const getMenuOptions = (product: Product): ContextMenuItem[] => {
		if (!product) return [];

		const options: ContextMenuItem[] = [];

		// 🎯 VALIDACIÓN: Solo permitir mover si el buscador está vacío
		const isFiltering = searchTerm.trim().length > 0;

		if (!isFiltering) {
			if (!isFirst) {
				options.push({
					label: "Subir Posición",
					icon: (
						<MaterialIcons
							name="arrow-upward"
							size={20}
							color={colors.textPrimaryLight}
						/>
					),
					onPress: () => handleMoveProduct(product, "up"),
				});
			}

			if (!isLast) {
				options.push({
					label: "Bajar Posición",
					icon: (
						<MaterialIcons
							name="arrow-downward"
							size={20}
							color={colors.textPrimaryLight}
						/>
					),
					onPress: () => handleMoveProduct(product, "down"),
				});
			}
		}

		// --- OPCIONES DE CRUD ---
		return [
			...options,
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
					styles.searchContainer,
					{ backgroundColor: colors.surfaceLight },
				]}
			>
				<Ionicons
					name="search-outline"
					size={20}
					color={colors.textSecondaryLight}
					style={styles.searchIcon}
				/>

				<TextInput
					style={[
						styles.searchInput,
						{ color: colors.textPrimaryLight },
					]}
					placeholder="Buscar producto por nombre..."
					placeholderTextColor={colors.textSecondaryLight}
					value={searchTerm}
					onChangeText={setSearchTerm}
					returnKeyType="search"
					onSubmitEditing={handleSearch}
					clearButtonMode="while-editing"
				/>
				{searchTerm.length > 0 && (
					<TouchableOpacity onPress={handleClearSearch}>
						<Ionicons
							name="close-circle"
							size={20}
							color={colors.textSecondaryLight}
							style={styles.clearIcon}
						/>
					</TouchableOpacity>
				)}
			</View>

			<FlatList
				data={products}
				keyExtractor={(item) => item.id}
				contentContainerStyle={styles.listContent}
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
				renderItem={({ item }) => (
					<TouchableOpacity
						style={[
							styles.productCard,
							{
								backgroundColor: colors.surfaceLight,
								borderLeftWidth: 4,
								borderLeftColor: item.isAvailable
									? colors.businessBg
									: colors.textSecondaryLight,
							},
						]}
						activeOpacity={0.7}
						onPress={() => handleOpenMenu(item)}
					>
						<View style={styles.productInfo}>
							<View style={styles.headerRow}>
								<Text
									style={[
										styles.productName,
										{ color: colors.textPrimaryLight },
									]}
									numberOfLines={1}
								>
									{item.name}
								</Text>

								<View style={styles.badgesContainer}>
									{/* 🏷️ Badge de Precio (Opcional pero recomendado para productos) */}
									{item.price !== undefined && (
										<View
											style={[
												styles.positionBadge,
												{
													backgroundColor:
														colors.backgroundLight,
												},
											]}
										>
											<Text
												style={[
													styles.positionText,
													{
														color: colors.textPrimaryLight,
													},
												]}
											>
												${item.price.toFixed(2)}
											</Text>
										</View>
									)}

									<View
										style={[
											styles.positionBadge,
											{
												backgroundColor:
													colors.backgroundLight,
											},
										]}
									>
										<Text
											style={[
												styles.positionText,
												{
													color: colors.textSecondaryLight,
												},
											]}
										>
											#{item.position ?? 0}
										</Text>
									</View>

									<View
										style={[
											styles.statusBadge,
											{
												backgroundColor:
													item.isAvailable
														? colors.businessBg +
															"15"
														: colors.textSecondaryLight +
															"15",
											},
										]}
									>
										<View
											style={[
												styles.statusDot,
												{
													backgroundColor:
														item.isAvailable
															? colors.businessBg
															: colors.textSecondaryLight,
												},
											]}
										/>
										<Text
											style={[
												styles.statusText,
												{
													color: item.isAvailable
														? colors.businessBg
														: colors.textSecondaryLight,
												},
											]}
										>
											{item.isAvailable
												? "Activo"
												: "Pausado"}
										</Text>
									</View>
								</View>
							</View>

							<View style={styles.descriptionRow}>
								<MaterialIcons
									name="description"
									size={16}
									color={colors.textSecondaryLight}
									style={styles.descIcon}
								/>
								<Text
									style={[
										styles.productDesc,
										{ color: colors.textSecondaryLight },
									]}
									numberOfLines={2}
								>
									{item.description ||
										"Sin descripción asignada"}
								</Text>
							</View>
						</View>
					</TouchableOpacity>
				)}
			/>

			<TouchableOpacity
				style={[styles.fab, { backgroundColor: colors.businessBg }]}
				onPress={() =>
					navigation.navigate("ProductForm", {
						title: "Nuevo Producto",
					})
				}
			>
				<Ionicons name="add" size={32} color={colors.textOnPrimary} />
			</TouchableOpacity>
		</>
	);
};

// He mantenido tus estilos intactos ya que usaban nombres genéricos orientados a 'product'
const styles = StyleSheet.create({
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
		overflow: "hidden",
	},
	productInfo: {
		flex: 1,
		gap: 6,
	},
	headerRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	productName: {
		fontSize: FontSize.md,
		fontWeight: FontWeight.bold,
		flex: 1,
		marginRight: Spacing.sm,
	},
	badgesContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	positionBadge: {
		paddingHorizontal: Spacing.sm,
		paddingVertical: 3,
		borderRadius: BorderRadius.sm,
		borderWidth: 0.5,
		borderColor: "rgba(0,0,0,0.05)",
	},
	positionText: {
		fontSize: 11,
		fontWeight: FontWeight.bold,
	},
	statusBadge: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: Spacing.sm,
		paddingVertical: 3,
		borderRadius: BorderRadius.sm,
		gap: 4,
	},
	statusDot: {
		width: 6,
		height: 6,
		borderRadius: 3,
	},
	statusText: {
		fontSize: 11,
		fontWeight: FontWeight.bold,
		textTransform: "uppercase",
	},
	descriptionRow: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: 6,
	},
	descIcon: {
		marginTop: 1,
	},
	productDesc: {
		fontSize: FontSize.sm,
		flex: 1,
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
	searchContainer: {
		flexDirection: "row",
		alignItems: "center",
		margin: Spacing.md,
		marginBottom: Spacing.xs,
		paddingHorizontal: Spacing.md,
		height: 50,
		borderRadius: BorderRadius.lg,
		...Shadow.sm,
	},
	searchIcon: {
		marginRight: Spacing.sm,
	},
	searchInput: {
		flex: 1,
		fontSize: FontSize.md,
		height: "100%",
	},
	clearIcon: {
		padding: Spacing.xs,
	},
});
