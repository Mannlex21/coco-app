import { useState, useCallback } from "react";
import { TABLES } from "@coco/shared/constants";
import { useSupabaseContext } from "@coco/shared/providers";
import { useCrossSellStore } from "@coco/shared/hooks/useCrossSellStore";
import {
	DBProductCrossSellGroup,
	mapDBCrossSellToFrontend,
} from "@coco/shared/core/entities";

export const useCrossSells = () => {
	const supabase = useSupabaseContext();

	// Persistimos los grupos en el store global
	const crossSellGroups = useCrossSellStore((state) => state.crossSellGroups);
	const setCrossSellGroups = useCrossSellStore(
		(state) => state.setCrossSellGroups,
	);

	const [loadings, setLoadings] = useState({
		fetch: false,
		saveGroup: false,
		saveItems: false,
		delete: false,
		move: false,
		refresh: false,
	});

	const [error, setError] = useState<string | null>(null);

	const setFunctionLoading = (key: keyof typeof loadings, value: boolean) => {
		setLoadings((prev) => ({ ...prev, [key]: value }));
	};

	/**
	 * 🔄 FETCH: Obtiene los grupos filtrados por el producto seleccionado en tu Select
	 */
	const fetchCrossSellByProduct = useCallback(
		async (originProductId: string) => {
			if (!originProductId) {
				setCrossSellGroups([]); // Limpiamos si no hay producto seleccionado
				return;
			}

			setFunctionLoading("fetch", true);
			setError(null);

			try {
				const { data, error: supabaseError } = await supabase
					.from(TABLES.PRODUCT_CROSS_SELL_GROUPS)
					.select(
						`
                        *,
                        product_cross_sell_items (
                            id,
                            group_id,
                            suggested_product_id,
                            override_price,
                            position,
                            created_at,
                            products:suggested_product_id (
                                id,
                                name,
                                price,
                                image_url,
                                is_available
                            )
                        )
                    `,
					)
					.eq("origin_product_id", originProductId) // 👈 Filtrado por producto
					.order("position", { ascending: true });

				if (supabaseError) throw supabaseError;

				const mappedData = mapDBCrossSellToFrontend(
					data as DBProductCrossSellGroup[],
				);

				setCrossSellGroups(mappedData);
			} catch (err: any) {
				console.error("Error fetching cross-sell groups:", err);
				setError(
					err.message || "No se pudieron cargar las sugerencias",
				);
			} finally {
				setFunctionLoading("fetch", false);
			}
		},
		[supabase, setCrossSellGroups],
	);

	/**
	 * 💾 SAVE: Crea o edita el título de un grupo para el producto actual
	 */
	const saveCrossSellGroup = async (
		originProductId: string,
		groupId?: string,
		dataToSave?: { name: string },
	) => {
		if (!dataToSave || !originProductId) return;

		setFunctionLoading("saveGroup", true);
		try {
			const payload = {
				origin_product_id: originProductId,
				name: dataToSave.name.trim(),
			};

			if (groupId) {
				const { error: supabaseError } = await supabase
					.from(TABLES.PRODUCT_CROSS_SELL_GROUPS)
					.update(payload)
					.eq("id", groupId);

				if (supabaseError) throw supabaseError;
			} else {
				// Insert: Buscamos la última posición de los grupos de ESTE producto
				const { data: lastGroup } = await supabase
					.from(TABLES.PRODUCT_CROSS_SELL_GROUPS)
					.select("position")
					.eq("origin_product_id", originProductId)
					.order("position", { ascending: false })
					.limit(1)
					.maybeSingle();

				const newPosition = lastGroup ? lastGroup.position + 1 : 1;

				const { error: supabaseError } = await supabase
					.from(TABLES.PRODUCT_CROSS_SELL_GROUPS)
					.insert({ ...payload, position: newPosition });

				if (supabaseError) throw supabaseError;
			}

			// Recargamos solo los grupos de ese producto
			await fetchCrossSellByProduct(originProductId);
		} catch (err: any) {
			console.error("Error saving cross-sell group:", err);
			throw err;
		} finally {
			setFunctionLoading("saveGroup", false);
		}
	};

	/**
	 * 🗑️ DELETE: Elimina un grupo
	 */
	const deleteCrossSellGroup = async (
		originProductId: string,
		groupId: string,
	) => {
		setFunctionLoading("delete", true);
		try {
			const { error: supabaseError } = await supabase
				.from(TABLES.PRODUCT_CROSS_SELL_GROUPS)
				.delete()
				.eq("id", groupId);

			if (supabaseError) throw supabaseError;

			// Filtramos en memoria para agilizar la UI
			setCrossSellGroups(crossSellGroups.filter((g) => g.id !== groupId));
		} catch (err: any) {
			console.error("Error deleting cross-sell group:", err);
			throw err;
		} finally {
			setFunctionLoading("delete", false);
		}
	};

	return {
		crossSellGroups,
		loadings,
		error,
		fetchCrossSellByProduct,
		saveCrossSellGroup,
		deleteCrossSellGroup,
		setError,
	};
};
