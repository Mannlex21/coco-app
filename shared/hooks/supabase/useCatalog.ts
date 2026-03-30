import { useState, useEffect, useCallback } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { Product } from "@coco/shared/core/entities/Product";

export const useCatalog = (supabase: SupabaseClient, businessId?: string) => {
	const [products, setProducts] = useState<Product[]>([]);
	const [refreshing, setRefreshing] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// 1. Función para cargar los productos desde Supabase
	const fetchProducts = useCallback(async () => {
		if (!businessId) return;

		setLoading(true);
		setError(null);

		try {
			// Hacemos la consulta a la tabla products filtrando por el negocio
			const { data, error: supabaseError } = await supabase
				.from("products")
				.select(
					`
                    *,
                    sections (id, name)
                `,
				) // Traemos el producto y de paso el nombre de su sección si lo necesitas
				.eq("business_id", businessId)
				.order("sort_order", { ascending: true });

			if (supabaseError) throw supabaseError;

			// Mapeamos los datos que vienen de Supabase al tipado de nuestra Entidad Product
			const mappedProducts: Product[] = (data || []).map((item: any) => ({
				id: item.id,
				businessId: item.business_id,
				sectionId: item.section_id,
				name: item.name,
				description: item.description,
				price: parseFloat(item.price),
				imageUrl: item.image_url,
				isAvailable: item.status === "active", // Mapeamos el string de base de datos a boolean
				sortOrder: item.position,
				createdAt: new Date(item.created_at),
				updatedAt: new Date(item.updated_at),
				// Las opciones las cargaremos bajo demanda o mediante un join más complejo luego
			}));

			setProducts(mappedProducts);
		} catch (err: any) {
			console.error("Error fetching products:", err);
			setError(err.message || "No se pudieron cargar los productos");
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	}, [supabase, businessId]);

	// 2. Función para eliminar un producto
	const deleteProduct = async (productId: string) => {
		try {
			const { error: supabaseError } = await supabase
				.from("products")
				.delete()
				.eq("id", productId);

			if (supabaseError) throw supabaseError;

			// Actualizamos el estado local quitando el producto borrado
			setProducts((prev) => prev.filter((p) => p.id !== productId));
		} catch (err: any) {
			console.error("Error deleting product:", err);
			throw err;
		}
	};

	// 3. Función para pausar o activar un producto (Toggle)
	const toggleAvailability = async (
		productId: string,
		currentStatus: boolean,
	) => {
		const newStatus = !currentStatus ? "active" : "inactive";

		try {
			const { error: supabaseError } = await supabase
				.from("products")
				.update({ status: newStatus })
				.eq("id", productId);

			if (supabaseError) throw supabaseError;

			// Actualizamos el estado local visualmente de inmediato
			setProducts((prev) =>
				prev.map((p) =>
					p.id === productId
						? { ...p, isAvailable: !currentStatus }
						: p,
				),
			);
		} catch (err: any) {
			console.error("Error toggling availability:", err);
			throw err;
		}
	};

	// 4. Manejador del Pull to Refresh
	const onRefresh = () => {
		setRefreshing(true);
		fetchProducts();
	};

	// Cargar los productos automáticamente al montar el hook o cambiar el businessId
	useEffect(() => {
		fetchProducts();
	}, [fetchProducts]);

	return {
		products,
		loading,
		refreshing,
		error,
		onRefresh,
		deleteProduct,
		toggleAvailability,
		refetch: fetchProducts, // Por si necesitas forzar la recarga desde la vista
	};
};
