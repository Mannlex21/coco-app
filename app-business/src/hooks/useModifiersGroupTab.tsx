import React from "react";
import { useNavigation } from "@react-navigation/native";
import { useContextMenu, useDialog } from "@coco/shared/providers";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { ContextMenuItem } from "@coco/shared/components/CustomContextMenu";
import { useModifiersGroup } from "@coco/shared/hooks/supabase/useModifiersGroup";
import { useTheme } from "@coco/shared/hooks/useTheme";

export const useModifiersGroupTab = () => {
	const navigation = useNavigation<any>();
	const { colors } = useTheme();
	const { showDialog } = useDialog();
	const { showContextMenu } = useContextMenu();

	// Traemos el hook base de Supabase para modificadores
	const {
		modifierGroups,
		onRefresh,
		searchTerm,
		setSearchTerm,
		deleteModifierGroup,
		toggleModifierStatus,
		refetch,
		loadings,
	} = useModifiersGroup();

	const handleSearch = () => {
		refetch(searchTerm);
	};

	const handleClearSearch = () => {
		setSearchTerm("");
		refetch("");
	};

	const handleDelete = (groupId: string, groupName: string) => {
		showDialog({
			title: "Eliminar Grupo",
			message: `¿Estás seguro de que quieres eliminar "${groupName}"? Esta acción borrará también sus opciones.`,
			intent: "warning",
			type: "options",
			onConfirm: async () => {
				try {
					await deleteModifierGroup(groupId);
					showDialog({
						title: "Eliminado",
						message: "Grupo de modificadores borrado con éxito.",
						intent: "success",
					});
				} catch (error) {
					console.error(error);
					showDialog({
						title: "Error",
						message: "No se pudo borrar el grupo de modificadores.",
						intent: "error",
					});
				}
			},
		});
	};

	const getMenuOptions = (group: any): ContextMenuItem[] => {
		if (!group || !colors) return [];
		const options: ContextMenuItem[] = [];

		// Cambiar estado entre activo e inactivo
		options.push({
			label: group.isAvailable ? "Pausar Grupo" : "Activar Grupo",
			icon: group.isAvailable ? (
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
			onPress: () => toggleModifierStatus(group.id, group.isAvailable),
		});

		// Opción de Editar
		options.push({
			label: "Editar Grupo",
			icon: (
				<MaterialIcons
					name="edit"
					size={20}
					color={colors.textPrimaryLight}
				/>
			),
			onPress: () =>
				navigation.navigate("ModifierGroupForm", {
					title: "Editar Grupo",
					groupId: group.id,
				}),
		});

		// Opción de Eliminar
		options.push({
			label: "Eliminar Grupo",
			icon: (
				<MaterialIcons name="delete" size={20} color={colors.error} />
			),
			textColor: colors.error,
			iconBg: colors.errorLight,
			onPress: () => handleDelete(group.id, group.name),
		});

		return options;
	};

	const handleOpenMenu = (group: any) => {
		showContextMenu(
			group?.name || "",
			getMenuOptions(group),
			group?.internal_name
				? `Nombre interno: ${group.internal_name}`
				: "Sin nombre interno",
		);
	};

	// Exponemos lo que la vista necesita
	return {
		modifierGroups,
		loadings,
		onRefresh,
		searchTerm,
		setSearchTerm,
		handleSearch,
		handleClearSearch,
		handleOpenMenu,
	};
};
