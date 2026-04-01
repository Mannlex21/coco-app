import React, { useState, useCallback } from "react";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { supabase } from "@/infrastructure/supabase/config";
import { useProduct } from "@coco/shared/hooks/supabase";
import { useContextMenu, useDialog } from "@coco/shared/providers";
import { Product } from "@coco/shared/core/entities";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { ContextMenuItem } from "@coco/shared/components/CustomContextMenu";

export const useProductsTab = (businessId?: string, colors?: any) => {
	const navigation = useNavigation<any>();
	const { showDialog } = useDialog();
	const { showContextMenu } = useContextMenu();

	// 👁️ Estado para controlar la visualización (se queda en el hook)
	const [viewType, setViewType] = useState<"list" | "grid">("list");

	// Estados para saber si el producto está en los extremos (para deshabilitar flechas de mover)
	const [isFirst, setIsFirst] = useState(false);
	const [isLast, setIsLast] = useState(false);
	const [movingProductId, setMovingProductId] = useState<string | null>(null);

	// Traemos el hook base de Supabase que ya tenías
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

	// useFocusEffect para recargar cuando la pestaña vuelva a estar activa
	useFocusEffect(
		useCallback(() => {
			fetchProducts(searchTerm);
		}, [businessId, searchTerm, fetchProducts]),
	);

	const handleSearch = () => {
		fetchProducts(searchTerm);
	};

	const handleClearSearch = () => {
		setSearchTerm("");
		fetchProducts("");
	};

	const handleMoveProduct = async (
		currentProduct: Product,
		direction: "up" | "down",
	) => {
		setMovingProductId(currentProduct.id);
		const result = await moveProduct(currentProduct, direction);
		setMovingProductId(null);

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

	const getMenuOptions = (product: Product): ContextMenuItem[] => {
		if (!product || !colors) return [];
		const options: ContextMenuItem[] = [];
		const isFiltering = searchTerm.trim().length > 0;

		// Solo permitimos mover si el usuario no está filtrando (misma regla que secciones)
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

		return [
			...options, // Primero las opciones de mover si aplican
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

	const handleOpenMenu = (product: Product) => {
		const index = products.findIndex((p) => p.id === product.id);
		setIsFirst(index === 0);
		setIsLast(index === products.length - 1);

		showContextMenu(
			product?.name || "",
			getMenuOptions(product),
			product?.description || "Sin descripción",
		);
	};

	// Exponemos lo que la vista necesita
	return {
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
		movingProductId,
	};
};
