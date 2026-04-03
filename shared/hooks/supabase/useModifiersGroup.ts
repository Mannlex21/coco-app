import { useState, useEffect, useCallback } from "react";
import { TABLES } from "@coco/shared/constants";
import { Modifier } from "core/entities/Modifier";
import { useAppStore, useModifierStore } from "@coco/shared/hooks";
import { useSupabaseContext } from "@coco/shared/providers/SupabaseContext";

export const useModifiersGroup = () => {
	const supabase = useSupabaseContext();
	const [searchTerm, setSearchTerm] = useState("");
	const { user, activeBusiness } = useAppStore();
	const modifierGroups = useModifierStore((state) => state.modifiersGroup);
	const setModifierGroups = useModifierStore(
		(state) => state.setModifiersGroup,
	);
	const [loadings, setLoadings] = useState({
		fetch: true, // Para la carga inicial o búsquedas
		save: false, // Guardar (crear o actualizar)
		delete: false, // Eliminar
		toggle: false, // Cambiar disponibilidad
		refresh: false, // Pull-to-refresh
	});

	const [error, setError] = useState<string | null>(null);

	// Función auxiliar para manipular los estados de carga de forma segura
	const setFunctionLoading = (key: keyof typeof loadings, value: boolean) => {
		setLoadings((prev) => ({ ...prev, [key]: value }));
	};

	const fetchModifierGroups = useCallback(
		async (searchQuery: string = "") => {
			if (!activeBusiness?.id) return;

			setFunctionLoading("fetch", true);
			setError(null);

			try {
				let query = supabase
					.from(TABLES.MODIFIER_GROUPS)
					.select(
						`
                        *,
                        modifier_options (*),
                        product_modifiers (count)
                    `,
					)
					.eq("business_id", activeBusiness.id);

				if (searchQuery.trim() !== "") {
					query = query.or(
						`name.ilike.%${searchQuery}%,internal_name.ilike.%${searchQuery}%`,
					);
				}

				const { data, error: supabaseError } = await query;

				if (supabaseError) throw supabaseError;

				const mappedGroups = (data || []).map((item: any) => ({
					id: item.id,
					businessId: item.business_id,
					name: item.name,
					internal_name: item.internal_name,
					minSelectable: item.min_selectable,
					maxSelectable: item.max_selectable,
					isAvailable: item.is_available,
					productsCount: item.product_modifiers?.[0]?.count || 0,
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
				setFunctionLoading("fetch", false);
			}
		},
		[supabase, activeBusiness?.id, setModifierGroups],
	);

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

	const saveModifierGroup = async (
		groupId?: string,
		dataToSave?: {
			name: string;
			internal_name?: string;
			minSelectable: number;
			maxSelectable: number;
			isAvailable: boolean;
			choices: Omit<Modifier, "id">[];
		},
	) => {
		if (!user?.lastActiveBusinessId || !dataToSave)
			throw new Error(
				"No se pudo guardar: Falta businessId o dataToSave",
			);

		setFunctionLoading("save", true);
		try {
			const payload: any = {
				business_id: activeBusiness?.id,
				name: dataToSave.name.trim(),
				internal_name: dataToSave.internal_name?.trim() || null,
				min_selectable: dataToSave.minSelectable,
				max_selectable: dataToSave.maxSelectable,
				is_available: dataToSave.isAvailable,
				updated_at: new Date().toISOString(),
			};

			let currentGroupId = groupId;

			if (groupId) {
				const { error: supabaseError } = await supabase
					.from(TABLES.MODIFIER_GROUPS)
					.update(payload)
					.eq("id", groupId);

				if (supabaseError) throw supabaseError;
			} else {
				const { data, error: supabaseError } = await supabase
					.from(TABLES.MODIFIER_GROUPS)
					.insert(payload)
					.select()
					.single();

				if (supabaseError) throw supabaseError;
				currentGroupId = data.id;
			}

			await supabase
				.from("modifier_options")
				.delete()
				.eq("modifier_group_id", currentGroupId);

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

			await fetchModifierGroups("");
		} catch (err: any) {
			console.error("Error saving modifier group:", err);
			throw err;
		} finally {
			setFunctionLoading("save", false);
		}
	};

	const deleteModifierGroup = async (groupId: string) => {
		setFunctionLoading("delete", true);
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
		} finally {
			setFunctionLoading("delete", false);
		}
	};

	const toggleModifierStatus = async (
		groupId: string,
		currentStatus: boolean,
	) => {
		if (loadings.toggle) return;

		setFunctionLoading("toggle", true);
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
		} finally {
			setFunctionLoading("toggle", false);
		}
	};

	// ⚡ 2. Optimizamos onRefresh (con el delay estético y useCallback)
	const onRefresh = useCallback(async () => {
		setFunctionLoading("refresh", true);
		try {
			await Promise.all([
				fetchModifierGroups(searchTerm),
				new Promise((resolve) => setTimeout(resolve, 800)),
			]);
		} catch (err) {
			console.error("Error al refrescar modificadores:", err);
		} finally {
			setFunctionLoading("refresh", false);
		}
	}, [fetchModifierGroups, searchTerm]);

	useEffect(() => {
		if (activeBusiness?.id) {
			fetchModifierGroups("");
		}
	}, [activeBusiness?.id, fetchModifierGroups]);

	return {
		modifierGroups,
		loadings,
		error,
		onRefresh,
		getModifierGroupById,
		saveModifierGroup,
		deleteModifierGroup,
		toggleModifierStatus,
		refetch: fetchModifierGroups,
		searchTerm,
		setSearchTerm,
	};
};
