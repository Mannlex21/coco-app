import { useState, useCallback } from "react";
import { TABLES } from "@coco/shared/constants";
import { useSupabaseContext } from "@coco/shared/providers";
import { useCrossSellStore } from "@coco/shared/hooks/useCrossSellStore";
import {
	DBProductCrossSellGroup,
	mapDBCrossSellToFrontend,
	VisualizationType,
} from "@coco/shared/core/entities";

// Interfaz para los items que vas a guardar
interface SaveItemsPayload {
	suggested_product_id: string;
	override_price?: number | null;
	position: number;
}

// Interfaz que acepta el nuevo valor is_available y visualization_type
interface SaveGroupPayload {
	name: string;
	is_available?: boolean;
	visualization_type?: VisualizationType;
	items?: SaveItemsPayload[];
}

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
	 * 🔄 FETCH: Obtiene los grupos filtrados por el producto seleccionado
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
                        id,
                        origin_product_id,
                        name,
                        position,
                        is_available, 
                        visualization_type, 
                        created_at,
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
					.eq("origin_product_id", originProductId)
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
	 * 💾 SAVE GROUP: Crea o actualiza un grupo de ventas cruzadas
	 */
	const saveCrossSellGroup = async (
		originProductId: string,
		groupId?: string,
		dataToSave?: SaveGroupPayload,
	) => {
		if (!dataToSave || !originProductId) return;

		setFunctionLoading("saveGroup", true);
		setFunctionLoading("saveItems", true);

		try {
			const payload: any = {
				origin_product_id: originProductId,
				name: dataToSave.name.trim(),
			};

			if (dataToSave.is_available !== undefined) {
				payload.is_available = dataToSave.is_available;
			}

			if (dataToSave.visualization_type !== undefined) {
				payload.visualization_type = dataToSave.visualization_type;
			}

			let finalGroupId = groupId;

			// --- PASO A: GUARDAR EL GRUPO ---
			if (groupId) {
				const { error: supabaseError } = await supabase
					.from(TABLES.PRODUCT_CROSS_SELL_GROUPS)
					.update(payload)
					.eq("id", groupId);

				if (supabaseError) throw supabaseError;
			} else {
				// Buscamos la última posición para el producto origen
				const { data: lastGroup } = await supabase
					.from(TABLES.PRODUCT_CROSS_SELL_GROUPS)
					.select("position")
					.eq("origin_product_id", originProductId)
					.order("position", { ascending: false })
					.limit(1)
					.maybeSingle();

				const newPosition = lastGroup ? lastGroup.position + 1 : 1;

				const { data: newGroup, error: supabaseError } = await supabase
					.from(TABLES.PRODUCT_CROSS_SELL_GROUPS)
					.insert({ ...payload, position: newPosition })
					.select("id")
					.single();

				if (supabaseError) throw supabaseError;
				finalGroupId = newGroup.id;
			}

			// --- PASO B: GUARDAR LOS ITEMS ---
			if (finalGroupId && dataToSave.items) {
				const newItems = dataToSave.items;
				const newProductIds = newItems.map(
					(item) => item.suggested_product_id,
				);

				// 1. Validar qué productos realmente existen en la BD 🛡️
				// Esto evita que la app truene por FK constraints si se borran productos.
				const { data: validProducts, error: checkError } =
					await supabase
						.from("products")
						.select("id")
						.in("id", newProductIds);

				if (checkError) throw checkError;

				const validProductIds =
					validProducts?.map((p: any) => p.id) || [];

				// 2. Limpiamos los items viejos de este grupo (Estrategia Clean Sweep)
				const { error: deleteError } = await supabase
					.from(TABLES.PRODUCT_CROSS_SELL_ITEMS)
					.delete()
					.eq("group_id", finalGroupId);

				if (deleteError) throw deleteError;

				// 3. Insertamos el nuevo set completo de items
				const itemsPayload = newItems
					.filter((item) =>
						validProductIds.includes(item.suggested_product_id),
					)
					.map((item) => ({
						group_id: finalGroupId,
						suggested_product_id: item.suggested_product_id,
						override_price: item.override_price ?? null,
						position: item.position,
					}));

				if (itemsPayload.length > 0) {
					const { error: insertError } = await supabase
						.from(TABLES.PRODUCT_CROSS_SELL_ITEMS)
						.insert(itemsPayload);

					if (insertError) throw insertError;
				}
			}

			// Refrescamos todo el store global una sola vez al final
			await fetchCrossSellByProduct(originProductId);
		} catch (err: any) {
			console.error("Error al guardar grupo e items:", err);
			throw err;
		} finally {
			setFunctionLoading("saveGroup", false);
			setFunctionLoading("saveItems", false);
		}
	};

	/**
	 * 🔗 SAVE ITEMS: Guarda (o pisa) los productos sugeridos de un grupo
	 */
	const saveCrossSellItems = async (
		originProductId: string,
		groupId: string,
		items: SaveItemsPayload[],
	) => {
		setFunctionLoading("saveItems", true);
		try {
			// 1. Borramos los items actuales del grupo para reescribirlos
			const { error: deleteError } = await supabase
				.from(TABLES.PRODUCT_CROSS_SELL_ITEMS)
				.delete()
				.eq("group_id", groupId);

			if (deleteError) throw deleteError;

			// 2. Si hay items nuevos, los insertamos
			if (items.length > 0) {
				const payload = items.map((item) => ({
					group_id: groupId,
					suggested_product_id: item.suggested_product_id,
					override_price: item.override_price ?? null,
					position: item.position,
				}));

				const { error: insertError } = await supabase
					.from(TABLES.PRODUCT_CROSS_SELL_ITEMS)
					.insert(payload);

				if (insertError) throw insertError;
			}

			await fetchCrossSellByProduct(originProductId);
		} catch (err: any) {
			console.error("Error saving cross-sell items:", err);
			throw err;
		} finally {
			setFunctionLoading("saveItems", false);
		}
	};

	/**
	 * ↕️ MOVE GROUPS: Guarda el nuevo orden de los grupos (Drag & Drop)
	 */
	const updateGroupsOrder = async (
		originProductId: string,
		orderedGroups: { id: string; position: number }[],
	) => {
		setFunctionLoading("move", true);
		try {
			const { error: supabaseError } = await supabase
				.from(TABLES.PRODUCT_CROSS_SELL_GROUPS)
				.upsert(orderedGroups);

			if (supabaseError) throw supabaseError;

			await fetchCrossSellByProduct(originProductId);
		} catch (err: any) {
			console.error("Error moving groups:", err);
			throw err;
		} finally {
			setFunctionLoading("move", false);
		}
	};

	/**
	 * 🗑️ DELETE: Elimina un grupo y sus items en cascada
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
		saveCrossSellItems,
		updateGroupsOrder,
		deleteCrossSellGroup,
		setError,
	};
};
