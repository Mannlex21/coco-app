import { useState, useEffect, useCallback } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { Section } from "core/entities";
// Importamos el nuevo store en lugar del anterior
import { useCatalogStore } from "@coco/shared/hooks/useCatalogStore";
import { TABLES } from "@coco/shared/constants";

export const useSection = (supabase: SupabaseClient, businessId?: string) => {
	const [searchTerm, setSearchTerm] = useState("");

	// Leemos las secciones y la función setSections de useCatalogStore
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
				// 🚨 MODIFICACIÓN 1: Cambiamos el select para traer relaciones
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
									name,
									description,
									price,
									is_available
								)
							)
						`,
					)
					.eq("business_id", businessId)
					.order("position", { ascending: true });

				// 🔍 Si el usuario escribió algo en el buscador, aplicamos el filtro
				if (searchQuery.trim() !== "") {
					query = query.or(
						`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`,
					);
				}

				const { data, error: supabaseError } = await query;

				if (supabaseError) throw supabaseError;

				const mappedSections = (data || []).map((item: any) => {
					// 1. Extraemos los productos si es que existen, si no, devolvemos un arreglo vacío
					const rawProducts =
						item.product_sections?.map((ps: any) => ps.products) ||
						[];

					// 2. Quitamos nulos por si acaso
					const validProducts = rawProducts.filter(
						(p: any) => p !== null && p !== undefined,
					);

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
						// 🚨 Aquí está la clave para el SectionList:
						products: validProducts, // Al ser un array (aunque esté vacío), React Native ya no chilla.
					};
				});

				// Guardamos en Zustand en el store volátil (sin persistencia)
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

	const getSectionById = useCallback(
		async (sectionId: string) => {
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
						visualizationType: data.visualization_type,
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

	const saveSection = async (
		sectionId?: string,
		dataToSave?: {
			name: string;
			description: string;
			isAvailable: boolean;
			visualizationType: string;
			productIds?: string[]; // 👈 Aquí recibimos los IDs
		},
	) => {
		if (!businessId || !dataToSave) return;

		try {
			setLoading(true);
			const {
				name,
				description,
				isAvailable,
				visualizationType,
				productIds = [],
			} = dataToSave;

			let targetSectionId = sectionId;

			if (sectionId) {
				// 1. Actualizar la sección existente
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

				// 2. Limpiar las relaciones viejas en la tabla intermedia para esta sección
				const { error: deleteError } = await supabase
					.from("product_sections") // Ajusta el nombre de la tabla si no es exactamente este
					.delete()
					.eq("section_id", sectionId);

				if (deleteError) throw deleteError;
			} else {
				// 1. Obtener la última posición para la nueva sección
				const { data: lastSection } = await supabase
					.from(TABLES.SECTIONS)
					.select("position")
					.eq("business_id", businessId)
					.order("position", { ascending: false })
					.limit(1)
					.maybeSingle();

				const nextPosition = lastSection ? lastSection.position + 1 : 1;

				// 2. Insertar la nueva sección
				const { data: newSectionData, error: supabaseError } =
					await supabase
						.from(TABLES.SECTIONS)
						.insert({
							business_id: businessId,
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

			// 3. Si hay productos seleccionados, los insertamos en la tabla intermedia
			if (productIds.length > 0 && targetSectionId) {
				const relationRows = productIds.map((productId) => ({
					section_id: targetSectionId,
					product_id: productId,
				}));

				const { error: relationError } = await supabase
					.from("product_sections") // Ajusta el nombre de la tabla si no es exactamente este
					.insert(relationRows);

				if (relationError) throw relationError;
			}

			// 4. Volvemos a sincronizar todo con fetchSections para que traiga los productos
			// mapeados con su nombre, precio, etc., tal cual lo espera tu SectionList.
			await fetchSections(searchTerm);
		} catch (err: any) {
			console.error("Error saving section with products:", err);
			setError(err.message || "No se pudo guardar la sección");
			throw err;
		} finally {
			setLoading(false);
		}
	};

	const deleteSection = async (sectionId: string) => {
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
		}
	};

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

	const updateSectionsOrder = async (updatedSections: Section[]) => {
		try {
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
