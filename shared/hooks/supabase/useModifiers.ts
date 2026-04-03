import { useState, useEffect, useCallback } from "react";
import { useCatalogStore } from "@coco/shared/hooks/useCatalogStore";
import { TABLES } from "@coco/shared/constants";
import { Modifier } from "@coco/shared/core/entities/Modifier";
import { useAppStore } from "@coco/shared/hooks/useAppStore";
import { useSupabaseContext } from "@coco/shared/providers/SupabaseContext";

export const useModifier = (modifierGroupId?: string) => {
	const supabase = useSupabaseContext();
	const { activeBusiness } = useAppStore();
	const [searchTerm, setSearchTerm] = useState("");
	const modifiers = useCatalogStore((state) => state.modifiers) || [];
	const setModifiers = useCatalogStore((state) => state.setModifiers);

	const [refreshing, setRefreshing] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// 1. Obtener los modificadores (Ya sea por Negocio o por Grupo)
	const fetchModifiers = useCallback(
		async (searchQuery: string = "") => {
			if (!activeBusiness?.id && !modifierGroupId) return;

			setLoading(true);
			setError(null);

			try {
				let query = supabase
					.from(TABLES.MODIFIER_OPTIONS)
					.select(
						`
                        *,
                        modifier_groups!inner(business_id)
                    `,
					)
					.order("name", { ascending: true });

				if (activeBusiness?.id) {
					query = query.eq(
						"modifier_groups.business_id",
						activeBusiness?.id,
					);
				} else if (modifierGroupId) {
					query = query.eq("modifier_group_id", modifierGroupId);
				}

				if (searchQuery.trim() !== "") {
					query = query.ilike("name", `%${searchQuery}%`);
				}

				const { data, error: supabaseError } = await query;

				if (supabaseError) throw supabaseError;

				const mappedModifiers: Modifier[] = (data || []).map(
					(item: any) => ({
						id: item.id,
						name: item.name,
						extraPrice: item.extra_price
							? parseFloat(item.extra_price)
							: undefined,
						isAvailable: item.is_available,
					}),
				);

				setModifiers(mappedModifiers);
			} catch (err: any) {
				console.error("Error fetching modifiers:", err);
				setError(
					err.message || "No se pudieron cargar los modificadores",
				);
			} finally {
				setLoading(false);
				setRefreshing(false);
			}
		},
		[supabase, activeBusiness, modifierGroupId, setModifiers],
	);

	// 2. Obtener UN modificador por ID
	const getModifierById = useCallback(
		async (modifierId: string) => {
			const modifierInMemory = modifiers.find((m) => m.id === modifierId);
			if (modifierInMemory) return modifierInMemory;

			try {
				const { data, error: supabaseError } = await supabase
					.from(TABLES.MODIFIER_OPTIONS)
					.select("*")
					.eq("id", modifierId)
					.single();

				if (supabaseError) throw supabaseError;

				if (data) {
					return {
						id: data.id,
						name: data.name,
						extraPrice: data.extra_price
							? parseFloat(data.extra_price)
							: undefined,
						isAvailable: data.is_available,
					};
				}
				return null;
			} catch (err: any) {
				console.error("Error fetching single modifier:", err);
				throw err;
			}
		},
		[supabase, modifiers],
	);

	// 3. Crear o Actualizar un modificador
	const saveModifier = async (
		modifierId?: string,
		dataToSave?: {
			name: string;
			extraPrice?: number;
			isAvailable: boolean;
		},
	) => {
		if (!modifierGroupId || !dataToSave)
			throw new Error(
				"No se pudo guardar: Falta modifierGroupId o dataToSave",
			);

		try {
			const payload: any = {
				modifier_group_id: modifierGroupId,
				name: dataToSave.name.trim(),
				extra_price: dataToSave.extraPrice ?? 0.0,
				is_available: dataToSave.isAvailable,
			};

			let responseData = null;

			if (modifierId) {
				const { error: supabaseError } = await supabase
					.from(TABLES.MODIFIER_OPTIONS)
					.update(payload)
					.eq("id", modifierId);

				if (supabaseError) throw supabaseError;
			} else {
				// 🔥 Modificado para retornar los datos insertados
				const { data, error: supabaseError } = await supabase
					.from(TABLES.MODIFIER_OPTIONS)
					.insert(payload)
					.select()
					.single();

				if (supabaseError) throw supabaseError;
				responseData = data;
			}

			// Refrescamos la lista del store
			await fetchModifiers("");

			// 🔥 Retornamos los datos para poder usar el ID real en la UI
			return responseData;
		} catch (err: any) {
			console.error("Error saving modifier:", err);
			throw err;
		}
	};

	// 4. Eliminar un modificador
	const deleteModifier = async (modifierId: string) => {
		try {
			const { error: supabaseError } = await supabase
				.from(TABLES.MODIFIER_OPTIONS)
				.delete()
				.eq("id", modifierId);

			if (supabaseError) throw supabaseError;

			setModifiers(modifiers.filter((m) => m.id !== modifierId));
		} catch (err: any) {
			console.error("Error deleting modifier:", err);
			throw err;
		}
	};

	// 5. Toggle de disponibilidad
	const toggleModifierAvailability = async (
		modifierId: string,
		currentStatus: boolean,
	) => {
		const newStatus = !currentStatus;

		try {
			const { error: supabaseError } = await supabase
				.from(TABLES.MODIFIER_OPTIONS)
				.update({ is_available: newStatus })
				.eq("id", modifierId);

			if (supabaseError) throw supabaseError;

			setModifiers(
				modifiers.map((m) =>
					m.id === modifierId ? { ...m, isAvailable: newStatus } : m,
				),
			);
		} catch (err: any) {
			console.error("Error toggling modifier availability:", err);
			throw err;
		}
	};

	const onRefresh = async () => {
		setRefreshing(true);
		await fetchModifiers(searchTerm);
		setRefreshing(false);
	};

	useEffect(() => {
		fetchModifiers("");
	}, [fetchModifiers]);

	return {
		modifiers,
		loadingModifier: loading,
		refreshing,
		error,
		onRefresh,
		getModifierById,
		saveModifier,
		deleteModifier,
		toggleModifierAvailability,
		refetch: fetchModifiers,
		searchTerm,
		setSearchTerm,
		fetchModifiers,
	};
};
