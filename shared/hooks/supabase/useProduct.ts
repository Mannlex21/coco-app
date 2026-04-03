import { useState, useEffect, useCallback } from "react";
import { Product, Section } from "@coco/shared/core/entities";
import { useCatalogStore } from "@coco/shared/hooks/useCatalogStore";
import { TABLES } from "@coco/shared/constants";
import { useAppStore } from "@coco/shared/hooks/useAppStore";
import { useSupabaseContext } from "@coco/shared/providers/SupabaseContext";

export const useProduct = () => {
	const supabase = useSupabaseContext();
	const [searchTerm, setSearchTerm] = useState("");

	const { user, activeBusiness } = useAppStore();
	const products = useCatalogStore((state) => state.products);
	const setProducts = useCatalogStore((state) => state.setProducts);
	const sections = useCatalogStore((state) => state.sections);
	const setSections = useCatalogStore((state) => state.setSections);

	const [refreshing, setRefreshing] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchSectionsIfEmpty = useCallback(async () => {
		if (!activeBusiness?.id || sections.length > 0) return;

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
		}
	}, [supabase, activeBusiness, sections.length, setSections]);

	// 1. Obtener todos los productos con sus secciones (Muchos a Muchos)
	const fetchProducts = useCallback(
		async (searchQuery: string = "") => {
			if (!activeBusiness?.id) return;

			setLoading(true);
			setError(null);

			try {
				// ⚡ Modificamos el select para traer la relación de la tabla pivote
				let query = supabase
					.from(TABLES.PRODUCTS)
					.select(
						`
                        *,
                        product_sections(section_id)
                    `,
					)
					.eq("business_id", activeBusiness?.id)
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
				setLoading(false);
				setRefreshing(false);
			}
		},
		[supabase, activeBusiness, setProducts],
	);

	// 2. Obtener UN producto por ID (Adaptado para traer sus secciónes)
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

	// 3. Crear o Actualizar un producto (Muchos a Muchos)
	const saveProduct = async (
		productId?: string,
		dataToSave?: {
			sectionIds: string[]; // 👈 Ahora recibe un array de strings (puede estar vacío)
			name: string;
			description: string;
			price: number;
			imageUrl?: string;
			isAvailable: boolean;
		},
	) => {
		console.log(productId, dataToSave);
		setLoading(true);
		if (!user?.lastActiveBusinessId || !dataToSave)
			throw new Error(
				"No se pudo guardar: Falta businessId o dataToSave",
			);

		try {
			// ⚡ Eliminamos section_id del payload directo a la tabla de productos
			const payload: any = {
				business_id: activeBusiness?.id,
				name: dataToSave.name.trim(),
				description: dataToSave.description.trim(),
				price: dataToSave.price,
				image_url: dataToSave.imageUrl,
				is_available: dataToSave.isAvailable,
				updated_at: new Date().toISOString(),
			};

			let currentProductId = productId;

			if (productId) {
				// --- MODO EDICIÓN ---
				const { error: supabaseError } = await supabase
					.from(TABLES.PRODUCTS)
					.update(payload)
					.eq("id", productId);

				if (supabaseError) throw supabaseError;
			} else {
				// --- MODO CREACIÓN ---
				// Para simplificar (como comentas que la posición se arreglará después)
				// Usamos la posición global más alta del negocio para el nuevo producto
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
				currentProductId = data.id; // Capturamos el ID generado
			}

			// ⚡ FLUJO PARA GUARDAR LAS SECCIONES EN LA TABLA PIVOTE ⚡
			// 1. Limpiamos las relaciones viejas
			await supabase
				.from("product_sections")
				.delete()
				.eq("product_id", currentProductId);

			// 2. Insertamos las nuevas (si el usuario seleccionó alguna)
			// 2. Insertamos las nuevas (eliminando duplicados de forma segura)
			if (dataToSave.sectionIds && dataToSave.sectionIds.length > 0) {
				// 🔥 Array.from funciona perfecto en ES5 con Sets
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

			// Refrescamos la lista del store
			await fetchProducts("");
		} catch (err: any) {
			console.error("Error saving product:", err);
			throw err;
		} finally {
			setLoading(false);
		}
	};

	// 4. Eliminar un producto
	const deleteProduct = async (productId: string) => {
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
		}
	};

	// 5. Toggle de disponibilidad
	const toggleProductAvailability = async (
		productId: string,
		currentStatus: boolean,
	) => {
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
		// Dejamos este método con su lógica por defecto. Como dijiste que lo de las posiciones
		// y ordenamientos por sección lo resolveremos luego debido a las confusiones,
		// este método seguirá intentando swappear basándose en la posición global por ahora.
		const currentPos = currentProduct.position ?? 1;
		const targetPos = direction === "up" ? currentPos - 1 : currentPos + 1;

		if (targetPos < 1) {
			return {
				success: false,
				message: "Este producto ya está en la primera posición.",
			};
		}

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
		}
	};

	const onRefresh = async () => {
		setRefreshing(true);
		await fetchProducts(searchTerm);
		setRefreshing(false);
	};

	useEffect(() => {
		if (activeBusiness?.id) {
			fetchSectionsIfEmpty();
			fetchProducts("");
		}
	}, [activeBusiness, fetchProducts, fetchSectionsIfEmpty]);

	return {
		products,
		loadingProduct: loading,
		refreshing,
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
