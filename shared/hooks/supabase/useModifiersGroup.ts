import { useState, useEffect, useCallback } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { TABLES } from "@coco/shared/constants";
import { Modifier } from "core/entities/Modifier";
import { useAppStore } from "@coco/shared/hooks/useAppStore";

export const useModifiersGroup = (
	supabase: SupabaseClient,
	businessId?: string,
) => {
	const [searchTerm, setSearchTerm] = useState("");
	const { user } = useAppStore();

	// 💡 Puedes meter esto a un store global de Zustand en el futuro si gustas.
	// De momento, para no añadir dependencias, lo dejamos reactivo en el hook.
	const [modifierGroups, setModifierGroups] = useState<any[]>([]);

	const [refreshing, setRefreshing] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// 1. Obtener todos los grupos con sus opciones y el conteo de productos vinculados
	const fetchModifierGroups = useCallback(
		async (searchQuery: string = "") => {
			if (!businessId) return;

			setLoading(true);
			setError(null);

			try {
				// Traemos los grupos, sus opciones hijas (haciendo join)
				// y usamos .count() en la tabla pivote para saber a cuántos productos pertenece
				let query = supabase
					.from(TABLES.MODIFIER_GROUPS)
					.select(
						`
                        *,
                        modifier_options (*),
                        product_modifiers (count)
                    `,
					)
					.eq("business_id", businessId);

				// Filtrado por barra de búsqueda (por nombre público o interno)
				if (searchQuery.trim() !== "") {
					query = query.or(
						`name.ilike.%${searchQuery}%,internal_name.ilike.%${searchQuery}%`,
					);
				}

				const { data, error: supabaseError } = await query;

				if (supabaseError) throw supabaseError;

				// Mapeamos para que coincida con tus interfaces y lo que el useModifiersTab espera
				const mappedGroups = (data || []).map((item: any) => ({
					id: item.id,
					businessId: item.business_id,
					name: item.name,
					internal_name: item.internal_name,
					minSelectable: item.min_selectable,
					maxSelectable: item.max_selectable,
					isAvailable: item.is_available,
					// Conteo extraído de la relación muchos a muchos
					productsCount: item.product_modifiers?.[0]?.count || 0,
					// Mapeamos las opciones hijas
					choices: (item.modifier_options || []).map((opt: any) => ({
						id: opt.id,
						name: opt.name,
						extraPrice: opt.extra_price,
						isAvailable: opt.is_available,
					})),
				}));

				setModifierGroups(mappedGroups);
			} catch (err: any) {
				console.error("Error fetching modifier groups:", err);
				setError(
					err.message || "No se pudieron cargar los modificadores",
				);
			} finally {
				setLoading(false);
				setRefreshing(false);
			}
		},
		[supabase, businessId],
	);

	// 2. Obtener un grupo por ID para cuando entres al formulario a editar
	const getModifierGroupById = useCallback(
		async (groupId: string) => {
			const groupInMemory = modifierGroups.find((g) => g.id === groupId);
			if (groupInMemory) return groupInMemory;

			try {
				const { data, error: supabaseError } = await supabase
					.from(TABLES.MODIFIER_GROUPS)
					.select(
						`
                        *,
                        modifier_options (*)
                    `,
					)
					.eq("id", groupId)
					.single();

				if (supabaseError) throw supabaseError;

				if (data) {
					return {
						id: data.id,
						businessId: data.business_id,
						name: data.name,
						internal_name: data.internal_name,
						minSelectable: data.min_selectable,
						maxSelectable: data.max_selectable,
						isAvailable: data.is_available,
						choices: (
							data.modifier_options || ([] as Modifier[])
						).map((opt: any) => ({
							id: opt.id,
							name: opt.name,
							extraPrice: opt.extra_price,
							isAvailable: opt.is_available,
						})),
					};
				}
				return null;
			} catch (err: any) {
				console.error("Error fetching single modifier group:", err);
				throw err;
			}
		},
		[supabase, modifierGroups],
	);

	// 3. Crear o Actualizar un grupo con todas sus opciones de golpe (Patrón Upsert)
	const saveModifierGroup = async (
		groupId?: string,
		dataToSave?: {
			name: string;
			internal_name?: string;
			minSelectable: number;
			maxSelectable: number;
			isAvailable: boolean;
			choices: Omit<Modifier, "id">[]; // Creamos opciones sin necesidad de mandar ID
		},
	) => {
		if (!user?.lastActiveBusinessId || !dataToSave)
			throw new Error(
				"No se pudo guardar: Falta businessId o dataToSave",
			);

		try {
			const payload: any = {
				business_id: businessId,
				name: dataToSave.name.trim(),
				internal_name: dataToSave.internal_name?.trim() || null,
				min_selectable: dataToSave.minSelectable,
				max_selectable: dataToSave.maxSelectable,
				is_available: dataToSave.isAvailable,
				updated_at: new Date().toISOString(),
			};

			let currentGroupId = groupId;

			if (groupId) {
				// --- MODO EDICIÓN ---
				const { error: supabaseError } = await supabase
					.from(TABLES.MODIFIER_GROUPS)
					.update(payload)
					.eq("id", groupId);

				if (supabaseError) throw supabaseError;
			} else {
				console.log(payload);
				// --- MODO CREACIÓN ---
				const { data, error: supabaseError } = await supabase
					.from(TABLES.MODIFIER_GROUPS)
					.insert(payload)
					.select()
					.single();

				if (supabaseError) throw supabaseError;
				currentGroupId = data.id;
			}

			// ⚡ FLUJO PARA LAS OPCIONES HIJAS (CHOICES) ⚡
			// 1. Matamos las opciones que ya no existan o estén registradas para reescribir limpio
			await supabase
				.from("modifier_options")
				.delete()
				.eq("modifier_group_id", currentGroupId);

			// 2. Insertamos el listado nuevo que mande el cliente
			if (dataToSave.choices && dataToSave.choices.length > 0) {
				const optionsToInsert = dataToSave.choices.map((choice) => ({
					modifier_group_id: currentGroupId,
					name: choice.name.trim(),
					extra_price: choice.extraPrice || 0,
					is_available: choice.isAvailable,
				}));

				const { error: optionsError } = await supabase
					.from("modifier_options")
					.insert(optionsToInsert);

				if (optionsError) throw optionsError;
			}

			// Refrescamos la lista local del hook
			await fetchModifierGroups("");
		} catch (err: any) {
			console.error("Error saving modifier group:", err);
			throw err;
		}
	};

	// 4. Eliminar un grupo (Por cascada borrará también sus opciones hijas)
	const deleteModifierGroup = async (groupId: string) => {
		try {
			const { error: supabaseError } = await supabase
				.from(TABLES.MODIFIER_GROUPS)
				.delete()
				.eq("id", groupId);

			if (supabaseError) throw supabaseError;

			setModifierGroups(modifierGroups.filter((g) => g.id !== groupId));
		} catch (err: any) {
			console.error("Error deleting modifier group:", err);
			throw err;
		}
	};

	// 5. Toggle de estado (active / inactive)
	const toggleModifierStatus = async (
		groupId: string,
		currentStatus: boolean,
	) => {
		const newStatus = !currentStatus;

		try {
			const { error: supabaseError } = await supabase
				.from(TABLES.MODIFIER_GROUPS)
				.update({ is_available: newStatus })
				.eq("id", groupId);

			if (supabaseError) throw supabaseError;

			setModifierGroups(
				modifierGroups.map((g) =>
					g.id === groupId ? { ...g, isAvailable: newStatus } : g,
				),
			);
		} catch (err: any) {
			console.error("Error toggling modifier group isAvailable:", err);
			throw err;
		}
	};

	const onRefresh = async () => {
		setRefreshing(true);
		await fetchModifierGroups(searchTerm);
		setRefreshing(false);
	};

	useEffect(() => {
		if (businessId) {
			fetchModifierGroups("");
		}
	}, [businessId, fetchModifierGroups]);

	return {
		modifierGroups,
		loadingModifiers: loading,
		refreshing,
		error,
		onRefresh,
		getModifierGroupById,
		saveModifierGroup,
		deleteModifierGroup,
		toggleModifierStatus,
		refetch: fetchModifierGroups,
		searchTerm,
		setSearchTerm,
		fetchModifierGroups,
	};
};
