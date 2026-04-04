import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { useProduct, useSection } from "@coco/shared/hooks/supabase";
import { useContextMenu, useDialog } from "@coco/shared/providers";
import { Section } from "@coco/shared/core/entities";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { ContextMenuItem } from "@coco/shared/components";
import { useTheme } from "@coco/shared/hooks/useTheme";

export const useSectionsTab = () => {
	const navigation = useNavigation<any>();
	const { colors } = useTheme();
	const { showDialog } = useDialog();
	const { showContextMenu } = useContextMenu();
	const [isFirst, setIsFirst] = useState(false);
	const [isLast, setIsLast] = useState(false);
	const [movingSectionId, setMovingSectionId] = useState<string | null>(null);
	// Traemos el hook base de Supabase que ya tenías
	const {
		sections,
		onRefresh,
		searchTerm,
		setSearchTerm,
		deleteSection,
		toggleSectionAvailability,
		moveSection,
		fetch,
		loadings,
	} = useSection();
	const { onRefresh: fetchSections } = useProduct();

	const handleRefresh = () => {
		onRefresh();
		fetchSections();
	};
	const handleSearch = () => {
		fetch(searchTerm);
	};

	const handleClearSearch = () => {
		setSearchTerm("");
		fetch("");
	};

	const handleMoveSection = async (
		currentSection: Section,
		direction: "up" | "down",
	) => {
		setMovingSectionId(currentSection.id);
		const result = await moveSection(currentSection, direction);
		setMovingSectionId(null);

		if (!result.success) {
			showDialog({
				title: "¡Atención!",
				message: result.message || "Ocurrió un error inesperado.",
				intent: "info",
			});
			return;
		}

		showDialog({
			title: "¡Éxito!",
			message: "Posición actualizada correctamente.",
			intent: "success",
		});
	};

	const handleDelete = (sectionId: string, sectionName: string) => {
		showDialog({
			title: "Eliminar Sección",
			message: `¿Estás seguro de que quieres eliminar "${sectionName}"?`,
			intent: "warning",
			type: "options",
			onConfirm: async () => {
				try {
					await deleteSection(sectionId);
					showDialog({
						title: "Eliminado",
						message: "Sección borrada.",
						intent: "success",
					});
				} catch (error) {
					console.log(error);
					showDialog({
						title: "Error",
						message: "No se pudo borrar.",
						intent: "error",
					});
				}
			},
		});
	};

	const getMenuOptions = (section: Section): ContextMenuItem[] => {
		if (!section || !colors) return [];
		const options: ContextMenuItem[] = [];
		const isFiltering = searchTerm.trim().length > 0;

		if (!isFiltering) {
			if (!isFirst) {
				options.push({
					label: "Subir Posición",
					icon: (
						<MaterialIcons
							name="arrow-upward"
							size={20}
							color={colors.textPrimaryLight}
						/>
					),
					onPress: () => handleMoveSection(section, "up"),
				});
			}

			if (!isLast) {
				options.push({
					label: "Bajar Posición",
					icon: (
						<MaterialIcons
							name="arrow-downward"
							size={20}
							color={colors.textPrimaryLight}
						/>
					),
					onPress: () => handleMoveSection(section, "down"),
				});
			}
		}

		return [
			{
				label: "Agregar Producto",
				icon: (
					<Ionicons
						name="fast-food-outline"
						size={20}
						color={colors.textPrimaryLight}
					/>
				),
				onPress: () =>
					navigation.navigate("ProductForm", {
						title: "Nuevo Producto",
						sectionId: section.id,
					}),
			},
			...options,
			{
				label: section.isAvailable
					? "Pausar Sección"
					: "Activar Sección",
				icon: section.isAvailable ? (
					<Ionicons
						name="pause"
						size={20}
						color={colors.textPrimaryLight}
					/>
				) : (
					<Ionicons
						name="play"
						size={20}
						color={colors.textPrimaryLight}
					/>
				),
				onPress: () =>
					toggleSectionAvailability(section.id, section.isAvailable),
			},
			{
				label: "Editar Sección",
				icon: (
					<MaterialIcons
						name="edit"
						size={20}
						color={colors.textPrimaryLight}
					/>
				),
				onPress: () =>
					navigation.navigate("SectionForm", {
						title: "Editar Sección",
						sectionId: section.id,
					}),
			},
			{
				label: "Eliminar Sección",
				icon: (
					<MaterialIcons
						name="delete"
						size={20}
						color={colors.error}
					/>
				),
				textColor: colors.error,
				iconBg: colors.errorLight,
				onPress: () => handleDelete(section.id, section.name),
			},
		];
	};

	const handleOpenMenu = (section: Section) => {
		const index = sections.findIndex((s) => s.id === section.id);
		setIsFirst(index === 0);
		setIsLast(index === sections.length - 1);

		showContextMenu(
			section?.name || "",
			getMenuOptions(section),
			section?.description || "Sin descripción",
		);
	};

	// Exponemos solo lo que la vista necesita para renderizar
	return {
		sections,
		onRefresh,
		searchTerm,
		setSearchTerm,
		handleSearch,
		handleClearSearch,
		handleOpenMenu,
		movingSectionId,
		loadings,
		handleRefresh,
	};
};
