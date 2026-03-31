import { useState, useEffect, useCallback } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { Section } from "core/entities";
// 💥 Importamos el nuevo store en lugar del anterior
import { useCatalogStore } from "@coco/shared/hooks/useCatalogStore";
import { TABLES } from "@coco/shared/constants";

export const useSection = (supabase: SupabaseClient, businessId?: string) => {
	const [searchTerm, setSearchTerm] = useState("");

	// 💥 Leemos las secciones y la función setSections de useCatalogStore
	const sections = useCatalogStore((state) => state.sections);
	const setSections = useCatalogStore((state) => state.setSections);

	const [refreshing, setRefreshing] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// 1. Obtener todas las secciones
	const fetchSections = useCallback(
		async (searchQuery: string = "") => {
			if (!businessId) return;

			setLoading(true);
			setError(null);

			try {
				// 1. Iniciamos la query base apuntando a 'sections'
				let query = supabase
					.from(TABLES.SECTIONS)
					.select("*")
					.eq("business_id", businessId)
					.order("position", { ascending: true });

				// 🔍 2. Si el usuario escribió algo en el buscador, aplicamos el filtro
				if (searchQuery.trim() !== "") {
					// ILIKE no distingue entre mayúsculas y minúsculas.
					// El % al principio y al final busca coincidencias en cualquier parte del texto.
					query = query.or(
						`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`,
					);
				}

				const { data, error: supabaseError } = await query;

				if (supabaseError) throw supabaseError;

				const mappedSections: Section[] = (data || []).map(
					(item: any) => ({
						id: item.id,
						businessId: item.business_id,
						name: item.name,
						description: item.description,
						position: item.position,
						isAvailable: item.is_available,
						createdAt: new Date(item.created_at),
						updatedAt: new Date(item.updated_at),
					}),
				);

				// 💥 Guardamos en Zustand en el store volátil (sin persistencia)
				setSections(mappedSections);
			} catch (err: any) {
				console.error("Error fetching sections:", err);
				setError(err.message || "No se pudieron cargar las secciones");
			} finally {
				setLoading(false);
				setRefreshing(false);
			}
		},
		[
			supabase,
			businessId,
			setSections,
			setLoading,
			setError,
			setRefreshing,
		],
	);

	// 2. Obtener UNA sección por ID
	const getSectionById = useCallback(
		async (sectionId: string) => {
			// Optimización 💡: Primero buscamos si ya la tenemos en el store global
			const sectionInMemory = sections.find((s) => s.id === sectionId);
			if (sectionInMemory) return sectionInMemory;

			try {
				const { data, error: supabaseError } = await supabase
					.from(TABLES.SECTIONS)
					.select("*")
					.eq("id", sectionId)
					.single();

				if (supabaseError) throw supabaseError;

				if (data) {
					return {
						id: data.id,
						businessId: data.business_id,
						name: data.name,
						description: data.description,
						position: data.position,
						isAvailable: data.is_available,
						createdAt: new Date(data.created_at),
						updatedAt: new Date(data.updated_at),
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

	// 3. Crear o Actualizar una sección
	const saveSection = async (
		sectionId?: string,
		dataToSave?: {
			name: string;
			description: string;
			isAvailable: boolean;
		},
	) => {
		if (!businessId || !dataToSave) return;

		try {
			if (sectionId) {
				// Modo Edición
				const { error: supabaseError } = await supabase
					.from(TABLES.SECTIONS)
					.update({
						name: dataToSave.name.trim(),
						description: dataToSave.description.trim(),
						is_available: dataToSave.isAvailable,
						updated_at: new Date().toISOString(),
					})
					.eq("id", sectionId);

				if (supabaseError) throw supabaseError;
			} else {
				// Modo Creación
				const { data: lastSection } = await supabase
					.from(TABLES.SECTIONS)
					.select("position")
					.eq("business_id", businessId)
					.order("position", { ascending: false })
					.limit(1)
					.single();

				const nextPosition = lastSection ? lastSection.position + 1 : 1;

				const { error: supabaseError } = await supabase
					.from(TABLES.SECTIONS)
					.insert({
						business_id: businessId,
						name: dataToSave.name.trim(),
						description: dataToSave.description.trim(),
						position: nextPosition,
						is_available: dataToSave.isAvailable,
					});

				if (supabaseError) throw supabaseError;
			}

			// 💥 Actualizamos Zustand pidiendo los datos actualizados
			await fetchSections("");
		} catch (err: any) {
			console.error("Error saving section:", err);
			throw err;
		}
	};

	// 4. Eliminar una sección
	const deleteSection = async (sectionId: string) => {
		try {
			const { error: supabaseError } = await supabase
				.from(TABLES.SECTIONS)
				.delete()
				.eq("id", sectionId);

			if (supabaseError) throw supabaseError;

			// 💥 Actualizamos el store global filtrando la eliminada
			setSections(sections.filter((s) => s.id !== sectionId));
		} catch (err: any) {
			console.error("Error deleting section:", err);
			throw err;
		}
	};

	// 5. Toggle de disponibilidad
	const toggleSectionAvailability = async (
		sectionId: string,
		currentStatus: boolean,
	) => {
		const newStatus = !currentStatus;

		try {
			const { error: supabaseError } = await supabase
				.from(TABLES.SECTIONS)
				.update({ is_available: newStatus })
				.eq("id", sectionId);

			if (supabaseError) throw supabaseError;

			// 💥 Actualizamos el store global inmediatamente
			setSections(
				sections.map((s) =>
					s.id === sectionId ? { ...s, isAvailable: newStatus } : s,
				),
			);
		} catch (err: any) {
			console.error("Error toggling section availability:", err);
			throw err;
		}
	};

	/**
	 * 1. updateSectionsOrder (Actualización Masiva - Drag & Drop)
	 */
	const updateSectionsOrder = async (updatedSections: Section[]) => {
		try {
			// Optimistic Update: Actualizamos la UI primero para que se sienta instantáneo
			setSections(updatedSections);

			const updates = updatedSections.map((section) => ({
				id: section.id,
				position: section.position,
				business_id: businessId,
			}));

			const { error } = await supabase
				.from(TABLES.SECTIONS)
				.upsert(updates, { onConflict: "id" });

			if (error) throw error;
		} catch (error) {
			console.error("Error al actualizar el orden masivo:", error);
			throw error;
		}
	};

	/**
	 * 2. updateSectionPosition (Actualización Individual - Flechas o Input)
	 */
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

	// 🧠 Toda la lógica pesada de base de datos se muda para acá
	const moveSection = async (
		currentSection: Section,
		direction: "up" | "down",
	) => {
		const currentPos = currentSection.position ?? 0;
		const targetPos = direction === "up" ? currentPos - 1 : currentPos + 1;

		if (targetPos < 1) {
			return {
				success: false,
				message: "Esta sección ya está en la primera posición.",
			};
		}

		try {
			const { data, error } = await supabase
				.from(TABLES.SECTIONS)
				.select("id, position")
				.eq("business_id", businessId)
				.eq("position", targetPos)
				.single();

			if (error || !data) {
				return {
					success: false,
					message:
						direction === "up"
							? "Esta sección ya está en la primera posición."
							: "Esta sección ya está en la última posición.",
				};
			}

			const swappingSectionId = data.id;

			await updateSectionPosition(currentSection.id, targetPos);
			await updateSectionPosition(swappingSectionId, currentPos);

			await fetchSections(searchTerm);

			return { success: true };
		} catch (error) {
			console.error(
				"Error al reordenar las secciones en el hook:",
				error,
			);
			return {
				success: false,
				message: "No se pudo actualizar la posición en el servidor.",
			};
		}
	};

	const onRefresh = async () => {
		setRefreshing(true);
		await fetchSections(searchTerm);
		setRefreshing(false);
	};

	useEffect(() => {
		if (businessId) {
			fetchSections("");
		}
	}, [businessId, fetchSections]);

	return {
		sections,
		loadingSection: loading,
		refreshing,
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
		fetchSections,
	};
};
