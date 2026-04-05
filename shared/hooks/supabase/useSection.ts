import { useState, useEffect, useCallback } from "react";
import { Product, Section } from "@coco/shared/core/entities";
import { TABLES } from "@coco/shared/constants";
import { useAppStore } from "@coco/shared/hooks/useAppStore";
import { useSectionStore } from "@coco/shared/hooks/useSectionStore";

import { useSupabaseContext } from "@coco/shared/providers";

export const useSection = () => {
	const supabase = useSupabaseContext();
	const { activeBusiness } = useAppStore();
	const searchTerm = useSectionStore((state) => state.searchTerm);
	const setSearchTerm = useSectionStore((state) => state.setSearchTerm);

	const sections = useSectionStore((state) => state.sections);
	const setSections = useSectionStore((state) => state.setSections);

	// ⚡ 1. Agrupamos todos los loadings bajo el mismo estándar
	const [loadings, setLoadings] = useState({
		fetch: true, // Para la carga de secciones
		save: false, // Guardar (crear o actualizar)
		delete: false, // Eliminar
		toggle: false, // Cambiar disponibilidad
		move: false, // Reordenar posiciones (swap o masivo)
		refresh: false, // Pull-to-refresh
	});

	const [error, setError] = useState<string | null>(null);

	// Función auxiliar para manipular los estados de carga
	const setFunctionLoading = (key: keyof typeof loadings, value: boolean) => {
		setLoadings((prev) => ({ ...prev, [key]: value }));
	};

	// 1. Obtener todas las secciones
	const fetchSections = useCallback(
		async (searchQuery: string = "") => {
			if (!activeBusiness?.id) return;

			setFunctionLoading("fetch", true);
			setError(null);

			try {
				let query = supabase
					.from(TABLES.SECTIONS)
					.select(
						`
                        id,
                        business_id,
                        name,
                        description,
                        position,
                        is_available,
                        visualization_type,
                        created_at,
                        updated_at,
                        product_sections (
                            products (
                                id,
                                business_id,
                                name,
                                description,
                                price,
                                image_url,
                                is_available,
                                position,
                                created_at,
                                updated_at
                            )
                        )
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

				const mappedSections = (data || []).map((item: any) => {
					const rawProducts =
						item.product_sections?.map((ps: any) => ps.products) ||
						[];

					const mappedProducts: Product[] = rawProducts
						.filter((p: any) => p !== null && p !== undefined)
						.map((p: any) => ({
							id: p.id,
							businessId: p.business_id,
							sectionIds: [item.id],
							name: p.name,
							description: p.description,
							price: p.price,
							imageUrl: p.image_url,
							isAvailable: p.is_available,
							position: p.position,
							createdAt: new Date(p.created_at),
							updatedAt: new Date(p.updated_at),
						}));

					return {
						id: item.id,
						businessId: item.business_id,
						name: item.name,
						description: item.description,
						position: item.position,
						isAvailable: item.is_available,
						visualizationType: item.visualization_type,
						createdAt: new Date(item.created_at),
						updatedAt: new Date(item.updated_at),
						products: mappedProducts,
					};
				});
				setSections(mappedSections);
			} catch (err: any) {
				console.error("Error fetching sections:", err);
				setError(err.message || "No se pudieron cargar las secciones");
			} finally {
				setFunctionLoading("fetch", false);
			}
		},
		[supabase, activeBusiness?.id, setSections],
	);

	const getSectionById = useCallback(
		async (sectionId: string) => {
			const sectionInMemory = sections.find((s) => s.id === sectionId);
			if (sectionInMemory) return sectionInMemory;

			try {
				const { data, error: supabaseError } = await supabase
					.from(TABLES.SECTIONS)
					.select(
						`
                    id,
                    business_id,
                    name,
                    description,
                    position,
                    is_available,
                    visualization_type,
                    created_at,
                    updated_at,
                    product_sections (
                        products (
                            id,
                            business_id,
                            name,
                            description,
                            price,
                            image_url,
                            is_available,
                            position,
                            created_at,
                            updated_at
                        )
                    )
                `,
					)
					.eq("id", sectionId)
					.single();

				if (supabaseError) throw supabaseError;

				if (data) {
					// Mapeamos los productos igual que lo haces en fetchSections
					const rawProducts =
						data.product_sections?.map((ps: any) => ps.products) ||
						[];

					const mappedProducts = rawProducts
						.filter((p: any) => p !== null && p !== undefined)
						.map((p: any) => ({
							id: p.id,
							businessId: p.business_id,
							sectionIds: [data.id],
							name: p.name,
							description: p.description,
							price: p.price,
							imageUrl: p.image_url,
							isAvailable: p.is_available,
							position: p.position,
							createdAt: new Date(p.created_at),
							updatedAt: new Date(p.updated_at),
						}));

					return {
						id: data.id,
						businessId: data.business_id,
						name: data.name,
						description: data.description,
						position: data.position,
						isAvailable: data.is_available,
						visualizationType: data.visualization_type,
						createdAt: new Date(data.created_at),
						updatedAt: new Date(data.updated_at),
						products: mappedProducts, // 👈 Añadidos los productos mapeados
					};
				}
				return null;
			} catch (err: any) {
				console.error("Error fetching single section:", err);
				throw err;
			}
		},
		[supabase, sections],
	);

	const saveSection = async (
		sectionId?: string,
		dataToSave?: {
			name: string;
			description: string;
			isAvailable: boolean;
			visualizationType: string;
			productIds?: string[];
		},
	) => {
		if (!activeBusiness?.id || !dataToSave) return;

		setFunctionLoading("save", true);
		try {
			const {
				name,
				description,
				isAvailable,
				visualizationType,
				productIds = [],
			} = dataToSave;

			let targetSectionId = sectionId;

			if (sectionId) {
				const { error: supabaseError } = await supabase
					.from(TABLES.SECTIONS)
					.update({
						name: name.trim(),
						description: description.trim(),
						is_available: isAvailable,
						visualization_type: visualizationType,
						updated_at: new Date().toISOString(),
					})
					.eq("id", sectionId);

				if (supabaseError) throw supabaseError;

				const { error: deleteError } = await supabase
					.from("product_sections")
					.delete()
					.eq("section_id", sectionId);

				if (deleteError) throw deleteError;
			} else {
				const { data: lastSection } = await supabase
					.from(TABLES.SECTIONS)
					.select("position")
					.eq("business_id", activeBusiness.id)
					.order("position", { ascending: false })
					.limit(1)
					.maybeSingle();

				const nextPosition = lastSection ? lastSection.position + 1 : 1;

				const { data: newSectionData, error: supabaseError } =
					await supabase
						.from(TABLES.SECTIONS)
						.insert({
							business_id: activeBusiness.id,
							name: name.trim(),
							description: description.trim(),
							position: nextPosition,
							is_available: isAvailable,
							visualization_type: visualizationType,
						})
						.select()
						.single();

				if (supabaseError) throw supabaseError;

				targetSectionId = newSectionData.id;
			}

			if (productIds.length > 0 && targetSectionId) {
				const relationRows = productIds.map((productId) => ({
					section_id: targetSectionId,
					product_id: productId,
				}));

				const { error: relationError } = await supabase
					.from("product_sections")
					.insert(relationRows);

				if (relationError) throw relationError;
			}

			await fetchSections(searchTerm);
		} catch (err: any) {
			console.error("Error saving section with products:", err);
			setError(err.message || "No se pudo guardar la sección");
			throw err;
		} finally {
			setFunctionLoading("save", false);
		}
	};

	const deleteSection = async (sectionId: string) => {
		setFunctionLoading("delete", true);
		try {
			const { error: supabaseError } = await supabase
				.from(TABLES.SECTIONS)
				.delete()
				.eq("id", sectionId);

			if (supabaseError) throw supabaseError;

			setSections(sections.filter((s) => s.id !== sectionId));
		} catch (err: any) {
			console.error("Error deleting section:", err);
			throw err;
		} finally {
			setFunctionLoading("delete", false);
		}
	};

	const toggleSectionAvailability = async (
		sectionId: string,
		currentStatus: boolean,
	) => {
		if (loadings.toggle) return;

		setFunctionLoading("toggle", true);
		const newStatus = !currentStatus;

		try {
			const { error: supabaseError } = await supabase
				.from(TABLES.SECTIONS)
				.update({ is_available: newStatus })
				.eq("id", sectionId);

			if (supabaseError) throw supabaseError;

			setSections(
				sections.map((s) =>
					s.id === sectionId ? { ...s, isAvailable: newStatus } : s,
				),
			);
		} catch (err: any) {
			console.error("Error toggling section availability:", err);
			throw err;
		} finally {
			setFunctionLoading("toggle", false);
		}
	};

	const updateSectionsOrder = async (updatedSections: Section[]) => {
		setFunctionLoading("move", true);
		try {
			setSections(updatedSections);

			const updates = updatedSections.map((section) => ({
				id: section.id,
				position: section.position,
				business_id: activeBusiness?.id,
			}));

			const { error } = await supabase
				.from(TABLES.SECTIONS)
				.upsert(updates, { onConflict: "id" });

			if (error) throw error;
		} catch (error) {
			console.error("Error al actualizar el orden masivo:", error);
			throw error;
		} finally {
			setFunctionLoading("move", false);
		}
	};

	const updateSectionPosition = async (
		sectionId: string,
		newPosition: number,
	) => {
		try {
			const { error } = await supabase
				.from(TABLES.SECTIONS)
				.update({ position: newPosition })
				.eq("id", sectionId);

			if (error) throw error;

			const updatedSections = sections.map((section) =>
				section.id === sectionId
					? { ...section, position: newPosition }
					: section,
			);

			setSections(updatedSections);
		} catch (error) {
			console.error(
				`Error al actualizar la posición de la sección ${sectionId}:`,
				error,
			);
			throw error;
		}
	};

	const moveSection = async (
		currentSection: Section,
		direction: "up" | "down",
	) => {
		const currentIndex = sections.findIndex(
			(s) => s.id === currentSection.id,
		);

		if (currentIndex === -1) {
			return { success: false, message: "No se encontró la sección." };
		}

		const targetIndex =
			direction === "up" ? currentIndex - 1 : currentIndex + 1;

		if (targetIndex < 0) {
			return {
				success: false,
				message: "Esta sección ya está en la primera posición visual.",
			};
		}

		if (targetIndex >= sections.length) {
			return {
				success: false,
				message: "Esta sección ya está en la última posición visual.",
			};
		}

		const targetSection = sections[targetIndex];

		setFunctionLoading("move", true);
		try {
			const currentPos = Number(currentSection.position) || 0;
			const targetPos = Number(targetSection.position) || 0;

			const { error: rpcError } = await supabase.rpc(
				"swap_sections_position",
				{
					current_id: currentSection.id,
					current_pos: currentPos,
					target_id: targetSection.id,
					target_pos: targetPos,
				},
			);

			if (rpcError) throw rpcError;

			await fetchSections(searchTerm);

			return { success: true };
		} catch (error) {
			console.error("Error al reordenar las secciones:", error);
			return {
				success: false,
				message: "No se pudo actualizar la posición.",
			};
		} finally {
			setFunctionLoading("move", false);
		}
	};

	const onRefresh = useCallback(async () => {
		setFunctionLoading("refresh", true);
		try {
			await Promise.all([
				fetchSections(searchTerm),
				new Promise((resolve) =>
					setTimeout(() => resolve(undefined), 800),
				),
			]);
		} catch (err) {
			console.error("Error al refrescar secciones:", err);
		} finally {
			setFunctionLoading("refresh", false);
		}
	}, [fetchSections, searchTerm]);

	useEffect(() => {
		if (activeBusiness?.id) {
			fetchSections(searchTerm);
		}
	}, [activeBusiness?.id]);

	return {
		sections,
		loadings,
		error,
		onRefresh,
		getSectionById,
		saveSection,
		deleteSection,
		toggleSectionAvailability,
		refetch: fetchSections,
		updateSectionsOrder,
		updateSectionPosition,
		searchTerm,
		setSearchTerm,
		moveSection,
		fetch: fetchSections,
	};
};
