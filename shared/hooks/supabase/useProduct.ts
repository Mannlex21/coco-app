import { useState, useEffect, useCallback, useMemo } from "react";
import { Product, Section } from "@coco/shared/core/entities";
import { TABLES } from "@coco/shared/constants";
import { useSupabaseContext } from "@coco/shared/providers";
import {
	useAppStore,
	useProductStore,
	useSectionStore,
} from "@coco/shared/hooks";
import { StorageRepository } from "../../infrastructure/supabase/StorageRepository";

export const useProduct = () => {
	const supabase = useSupabaseContext();

	const storageRepository = useMemo(
		() => new StorageRepository(supabase),
		[supabase],
	);
	const searchTerm = useProductStore((state) => state.searchTerm);
	const setSearchTerm = useProductStore((state) => state.setSearchTerm);
	const { user, activeBusiness } = useAppStore();
	const products = useProductStore((state) => state.products);
	const setProducts = useProductStore((state) => state.setProducts);
	const sections = useSectionStore((state) => state.sections);
	const setSections = useSectionStore((state) => state.setSections);

	// ⚡ 1. Agrupamos todos los loadings. Agregué "move" y "sections".
	const [loadings, setLoadings] = useState({
		fetch: true, // Para la carga de productos
		sections: false, // Para la carga inicial de secciones
		save: false, // Guardar (crear o actualizar)
		delete: false, // Eliminar
		toggle: false, // Cambiar disponibilidad
		move: false, // Reordenar posiciones
		refresh: false, // Pull-to-refresh
	});

	const [error, setError] = useState<string | null>(null);

	// Función auxiliar para manipular los estados de carga
	const setFunctionLoading = (key: keyof typeof loadings, value: boolean) => {
		setLoadings((prev) => ({ ...prev, [key]: value }));
	};

	const fetchSectionsIfEmpty = useCallback(async () => {
		if (!activeBusiness?.id || sections.length > 0) return;

		setFunctionLoading("sections", true);
		try {
			const { data, error: supabaseError } = await supabase
				.from(TABLES.SECTIONS)
				.select("*")
				.eq("business_id", activeBusiness.id)
				.order("position", { ascending: true });

			if (supabaseError) throw supabaseError;

			const mappedSections: Section[] = (data || []).map((item: any) => ({
				id: item.id,
				businessId: item.business_id,
				name: item.name,
				description: item.description,
				position: item.position,
				isAvailable: item.is_available,
				visualizationType: item.visualization_type,
				createdAt: new Date(item.created_at),
				updatedAt: new Date(item.updated_at),
			}));
			setSections(mappedSections);
		} catch (err) {
			console.error(
				"Error fetching fallback sections in useProduct:",
				err,
			);
		} finally {
			setFunctionLoading("sections", false);
		}
	}, [supabase, activeBusiness?.id, sections.length, setSections]);

	const fetchProducts = useCallback(
		async (searchQuery: string = "") => {
			if (!activeBusiness?.id) return;

			setFunctionLoading("fetch", true);
			setError(null);

			try {
				let query = supabase
					.from(TABLES.PRODUCTS)
					.select(
						`
                        *,
                        product_sections(section_id),
						product_modifiers(modifier_group_id)
                    `,
					)
					.eq("business_id", activeBusiness.id)
					.order("position", { ascending: true });

				if (searchQuery.trim() !== "") {
					query = query.or(
						`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`,
					);
				}

				const { data, error: supabaseError } = await query;

				if (supabaseError) throw supabaseError;

				const mappedProducts: Product[] = (data || []).map(
					(item: any) => ({
						id: item.id,
						businessId: item.business_id,
						sectionIds:
							item.product_sections?.map(
								(ps: any) => ps.section_id,
							) || [],
						modifierGroupIds:
							item.product_modifiers?.map(
								(pm: any) => pm.modifier_group_id,
							) || [],
						name: item.name,
						description: item.description,
						price: item.price,
						imageUrl: item.image_url,
						isAvailable: item.is_available,
						position: item.position,
						createdAt: new Date(item.created_at),
						updatedAt: new Date(item.updated_at),
					}),
				);
				setProducts(mappedProducts);
			} catch (err: any) {
				console.error("Error fetching products:", err);
				setError(err.message || "No se pudieron cargar los productos");
			} finally {
				setFunctionLoading("fetch", false);
			}
		},
		[supabase, activeBusiness?.id, setProducts],
	);

	const getProductById = useCallback(
		async (productId: string) => {
			const productInMemory = products.find((p) => p.id === productId);
			if (productInMemory) return productInMemory;

			try {
				const { data, error: supabaseError } = await supabase
					.from(TABLES.PRODUCTS)
					.select(
						`
                        *,
                        product_sections(section_id)
                    `,
					)
					.eq("id", productId)
					.single();

				if (supabaseError) throw supabaseError;

				if (data) {
					return {
						id: data.id,
						businessId: data.business_id,
						sectionIds:
							data.product_sections?.map(
								(ps: any) => ps.section_id,
							) || [],
						name: data.name,
						description: data.description,
						price: data.price,
						imageUrl: data.image_url,
						isAvailable: data.is_available,
						position: data.position,
						createdAt: new Date(data.created_at),
						updatedAt: new Date(data.updated_at),
					};
				}
				return null;
			} catch (err: any) {
				console.error("Error fetching single product:", err);
				throw err;
			}
		},
		[supabase, products],
	);

	const saveProduct = async (
		productId?: string,
		dataToSave?: {
			sectionIds: string[];
			modifierGroupIds?: string[];
			name: string;
			description: string;
			price: number;
			imageUrl?: string; // Aquí puede venir un "file://..." de ImagePicker o una URL de red
			isAvailable: boolean;
		},
	) => {
		if (!user?.lastActiveBusinessId || !dataToSave)
			throw new Error(
				"No se pudo guardar: Falta businessId o dataToSave",
			);

		setFunctionLoading("save", true);
		try {
			let finalImageUrl = dataToSave.imageUrl || "";

			// 🌟 1. Si viene una nueva imagen local (de ImagePicker)
			if (dataToSave?.imageUrl?.startsWith("file://")) {
				const entityFolder = "merchants"; // O la carpeta que uses para productos

				// Generamos un identificador único para la imagen si es un producto nuevo
				const fileNameId = productId || `new-${Date.now()}`;

				const imageResult = await storageRepository.uploadImage(
					dataToSave.imageUrl,
					entityFolder,
					activeBusiness?.id || user.lastActiveBusinessId, // Usamos el ID del negocio como agrupador
					["products"], // Subcarpetas
					`product-${fileNameId}`, // Nombre del archivo
				);

				if (imageResult.error) throw new Error(imageResult.error);

				finalImageUrl = imageResult.url || "";
			}

			const payload: any = {
				business_id: activeBusiness?.id,
				name: dataToSave.name.trim(),
				description: dataToSave.description.trim(),
				price: dataToSave.price,
				image_url: finalImageUrl, // 🎯 Guardamos la URL final
				is_available: dataToSave.isAvailable,
				updated_at: new Date().toISOString(),
			};

			let currentProductId = productId;

			// 2. Crear o actualizar el producto base
			if (productId) {
				const { error: supabaseError } = await supabase
					.from(TABLES.PRODUCTS)
					.update(payload)
					.eq("id", productId);

				if (supabaseError) throw supabaseError;
			} else {
				const { data: lastProduct } = await supabase
					.from(TABLES.PRODUCTS)
					.select("position")
					.eq("business_id", activeBusiness?.id)
					.order("position", { ascending: false })
					.limit(1)
					.maybeSingle();

				payload.position = lastProduct ? lastProduct.position + 1 : 1;

				const { data, error: supabaseError } = await supabase
					.from(TABLES.PRODUCTS)
					.insert(payload)
					.select()
					.single();

				if (supabaseError) throw supabaseError;
				currentProductId = data.id;
			}

			await supabase
				.from("product_sections")
				.delete()
				.eq("product_id", currentProductId);

			if (dataToSave.sectionIds && dataToSave.sectionIds.length > 0) {
				const uniqueSectionIds = Array.from(
					new Set(dataToSave.sectionIds),
				);

				const relationsToInsert = uniqueSectionIds.map((secId) => ({
					product_id: currentProductId,
					section_id: secId,
				}));

				const { error: relError } = await supabase
					.from("product_sections")
					.insert(relationsToInsert);

				if (relError) throw relError;
			}

			// ⚡ 3. Gestionar relaciones con GRUPOS DE MODIFICADORES (Nueva sección)
			// Primero limpiamos las relaciones existentes para este producto
			await supabase
				.from("product_modifiers")
				.delete()
				.eq("product_id", currentProductId);

			if (
				dataToSave.modifierGroupIds &&
				dataToSave.modifierGroupIds.length > 0
			) {
				const uniqueModifierGroupIds = Array.from(
					new Set(dataToSave.modifierGroupIds),
				);

				const modifiersToInsert = uniqueModifierGroupIds.map(
					(modGroupId) => ({
						product_id: currentProductId,
						modifier_group_id: modGroupId,
					}),
				);

				const { error: modError } = await supabase
					.from("product_modifiers")
					.insert(modifiersToInsert);

				if (modError) throw modError;
			}

			// 4. Refrescar la lista de productos
			await fetchProducts(searchTerm);
		} catch (err: any) {
			console.error("Error saving product:", err);
			throw err;
		} finally {
			setFunctionLoading("save", false);
		}
	};

	const deleteProduct = async (productId: string) => {
		setFunctionLoading("delete", true);
		try {
			const { error: supabaseError } = await supabase
				.from(TABLES.PRODUCTS)
				.delete()
				.eq("id", productId);

			if (supabaseError) throw supabaseError;

			setProducts(products.filter((p) => p.id !== productId));
		} catch (err: any) {
			console.error("Error deleting product:", err);
			throw err;
		} finally {
			setFunctionLoading("delete", false);
		}
	};

	const toggleProductAvailability = async (
		productId: string,
		currentStatus: boolean,
	) => {
		if (loadings.toggle) return;

		setFunctionLoading("toggle", true);
		const newStatus = !currentStatus;

		try {
			const { error: supabaseError } = await supabase
				.from(TABLES.PRODUCTS)
				.update({ is_available: newStatus })
				.eq("id", productId);

			if (supabaseError) throw supabaseError;

			setProducts(
				products.map((p) =>
					p.id === productId ? { ...p, isAvailable: newStatus } : p,
				),
			);
		} catch (err: any) {
			console.error("Error toggling product availability:", err);
			throw err;
		} finally {
			setFunctionLoading("toggle", false);
		}
	};

	const updateProductPosition = async (
		productId: string,
		newPosition: number,
	) => {
		try {
			const { error } = await supabase
				.from(TABLES.PRODUCTS)
				.update({ position: newPosition })
				.eq("id", productId);

			if (error) throw error;
		} catch (error) {
			console.error(
				`Error al actualizar posición del producto ${productId}:`,
				error,
			);
			throw error;
		}
	};

	const moveProduct = async (
		currentProduct: Product,
		direction: "up" | "down",
	) => {
		const currentPos = currentProduct.position ?? 1;
		const targetPos = direction === "up" ? currentPos - 1 : currentPos + 1;

		if (targetPos < 1) {
			return {
				success: false,
				message: "Este producto ya está en la primera posición.",
			};
		}

		setFunctionLoading("move", true);
		try {
			const { data, error } = await supabase
				.from(TABLES.PRODUCTS)
				.select("id, position")
				.eq("business_id", activeBusiness?.id)
				.eq("position", targetPos)
				.single();

			if (error || !data) {
				return {
					success: false,
					message: "No hay más productos en esa dirección.",
				};
			}

			const swappingProductId = data.id;

			await Promise.all([
				updateProductPosition(currentProduct.id, targetPos),
				updateProductPosition(swappingProductId, currentPos),
			]);

			await fetchProducts(searchTerm);

			return { success: true };
		} catch (error) {
			console.error("Error al reordenar los productos:", error);
			return {
				success: false,
				message: "No se pudo actualizar la posición en el servidor.",
			};
		} finally {
			setFunctionLoading("move", false);
		}
	};

	const onRefresh = useCallback(async () => {
		setFunctionLoading("refresh", true);
		try {
			await Promise.all([
				fetchProducts(searchTerm),
				new Promise((resolve) =>
					setTimeout(() => resolve(undefined), 800),
				),
			]);
		} catch (err) {
			console.error("Error al refrescar productos:", err);
		} finally {
			setFunctionLoading("refresh", false);
		}
	}, [fetchProducts, searchTerm]);

	useEffect(() => {
		if (activeBusiness?.id) {
			fetchSectionsIfEmpty();
			fetchProducts(searchTerm);
		}
	}, [activeBusiness?.id]);

	return {
		products,
		loadings,
		error,
		onRefresh,
		getProductById,
		saveProduct,
		deleteProduct,
		toggleProductAvailability,
		refetch: fetchProducts,
		searchTerm,
		setSearchTerm,
		fetchProducts,
		moveProduct,
		updateProductPosition,
	};
};
