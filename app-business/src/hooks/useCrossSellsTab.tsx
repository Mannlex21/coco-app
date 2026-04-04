import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { useContextMenu, useDialog } from "@coco/shared/providers";
import { ProductCrossSellGroup } from "@coco/shared/core/entities";
import { MaterialIcons } from "@expo/vector-icons";
import { ContextMenuItem } from "@coco/shared/components/CustomContextMenu";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { useCrossSells } from "@coco/shared/hooks/supabase";

export const useCrossSellsTab = () => {
	const navigation = useNavigation<any>();
	const { colors } = useTheme();
	const { showDialog } = useDialog();
	const { showContextMenu } = useContextMenu();

	const [viewType, setViewType] = useState<"list" | "grid">("list");
	const [isFirst, setIsFirst] = useState(false);
	const [isLast, setIsLast] = useState(false);
	const [movingGroupId, setMovingGroupId] = useState<string | null>(null);

	// 💡 Estado crucial para saber qué productos cruzados mostrar en base al Select
	const [selectedProductId, setSelectedProductId] = useState<string | null>(
		null,
	);

	const {
		crossSellGroups,
		deleteCrossSellGroup,
		fetchCrossSellByProduct, // 👈 Hook enfocado en el ID del producto
		loadings,
	} = useCrossSells();

	// 🔄 Cada que cambie el producto en el select, disparamos la búsqueda
	useEffect(() => {
		if (selectedProductId) {
			fetchCrossSellByProduct(selectedProductId);
		}
	}, [selectedProductId, fetchCrossSellByProduct]);

	const handleRefresh = () => {
		if (selectedProductId) {
			fetchCrossSellByProduct(selectedProductId);
		}
	};

	const handleMoveGroup = async (
		currentGroup: ProductCrossSellGroup,
		direction: "up" | "down",
	) => {
		// Asumiendo que tu hook useCrossSell tiene la función adaptada o la vas a implementar:
		setMovingGroupId(currentGroup.id);

		showDialog({
			title: "Próximamente",
			message:
				"La función para ordenar grupos está siendo actualizada para el nuevo esquema.",
			intent: "info",
		});

		setMovingGroupId(null);
	};

	const handleDeleteGroup = (groupId: string, groupName: string) => {
		if (!selectedProductId) return;

		showDialog({
			title: "Eliminar Grupo",
			message: `¿Estás seguro de que quieres eliminar la categoría "${groupName}" y todas sus sugerencias vinculadas?`,
			intent: "warning",
			type: "options",
			onConfirm: async () => {
				try {
					// 💡 Enviamos el originProductId y el groupId como pide tu hook actual
					await deleteCrossSellGroup(selectedProductId, groupId);
					showDialog({
						title: "Eliminado",
						message: "Categoría borrada con éxito.",
						intent: "success",
					});
				} catch (error) {
					console.log(error);
					showDialog({
						title: "Error",
						message: "No se pudo borrar la categoría.",
						intent: "error",
					});
				}
			},
		});
	};

	const getMenuOptions = (
		group: ProductCrossSellGroup,
	): ContextMenuItem[] => {
		if (!group || !colors) return [];
		const options: ContextMenuItem[] = [];

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
				onPress: () => handleMoveGroup(group, "up"),
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
				onPress: () => handleMoveGroup(group, "down"),
			});
		}

		return [
			...options,
			{
				label: "Editar Grupo",
				icon: (
					<MaterialIcons
						name="edit"
						size={20}
						color={colors.textPrimaryLight}
					/>
				),
				onPress: () => {
					navigation.navigate("CrossSellGroupForm", {
						title: "Editar Grupo",
						groupId: group.id,
						groupName: group.name,
						originProductId: selectedProductId, // 👈 Lo pasamos para el guardado
					});
				},
			},
			{
				label: "Gestionar Productos",
				icon: (
					<MaterialIcons
						name="playlist-add"
						size={20}
						color={colors.textPrimaryLight}
					/>
				),
				onPress: () => {
					navigation.navigate("CrossSellItemsForm", {
						title: `Sugerencias para: ${group.name}`,
						groupId: group.id,
						existingItems: group.items,
					});
				},
			},
			{
				label: "Eliminar Grupo",
				icon: (
					<MaterialIcons
						name="delete"
						size={20}
						color={colors.error}
					/>
				),
				textColor: colors.error,
				iconBg: colors.errorLight,
				onPress: () => handleDeleteGroup(group.id, group.name),
			},
		];
	};

	const handleOpenMenu = (group: any) => {
		const index = crossSellGroups.findIndex((g) => g.id === group.id);
		setIsFirst(index === 0);
		setIsLast(index === crossSellGroups.length - 1);

		showContextMenu(
			group?.name || "",
			getMenuOptions(group),
			`Contiene ${group.items?.length || 0} productos vinculados.`,
		);
	};

	return {
		crossSellGroups,
		onRefresh: handleRefresh,
		handleOpenMenu,
		viewType,
		setViewType,
		movingGroupId,
		loadings,
		selectedProductId, // 👈 Lo exponemos para conectarlo al select
		setSelectedProductId, // 👈 Para actualizarlo desde la UI
		refetch: () =>
			selectedProductId && fetchCrossSellByProduct(selectedProductId),
	};
};
