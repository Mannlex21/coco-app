import React, { useCallback } from "react";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useContextMenu, useDialog } from "@coco/shared/providers";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { ContextMenuItem } from "@coco/shared/components/CustomContextMenu";
import { useModifier } from "@coco/shared/hooks/supabase/useModifiers";
import { Modifier } from "@coco/shared/core/entities/Modifier";

export const useModifiersTab = (colors?: any) => {
	const navigation = useNavigation<any>();
	const { showDialog } = useDialog();
	const { showContextMenu } = useContextMenu();

	// Traemos el hook base de Supabase para modificadores
	const {
		modifiers,
		loadingModifier: refreshing, // Ajustado al nombre que retorna tu hook
		fetchModifiers,
		searchTerm,
		setSearchTerm,
		deleteModifier,
		toggleModifierAvailability,
	} = useModifier();

	// useFocusEffect para recargar cuando la pestaña de modificadores vuelva a estar activa
	useFocusEffect(
		useCallback(() => {
			fetchModifiers(searchTerm);
		}, [searchTerm, fetchModifiers]),
	);

	const handleSearch = () => {
		fetchModifiers(searchTerm);
	};

	const handleClearSearch = () => {
		setSearchTerm("");
		fetchModifiers("");
	};

	const handleDelete = (modifierId: string, modifierName: string) => {
		showDialog({
			title: "Eliminar Modificador",
			message: `¿Estás seguro de que quieres eliminar "${modifierName}"?`,
			intent: "warning",
			type: "options",
			onConfirm: async () => {
				try {
					await deleteModifier(modifierId);
					showDialog({
						title: "Eliminado",
						message: "Modificador borrado con éxito.",
						intent: "success",
					});
				} catch (error) {
					console.log(error);
					showDialog({
						title: "Error",
						message: "No se pudo borrar el modificador.",
						intent: "error",
					});
				}
			},
		});
	};

	const getMenuOptions = (modifier: Modifier): ContextMenuItem[] => {
		if (!modifier || !colors) return [];

		return [
			{
				label: modifier.isAvailable
					? "Pausar Modificador"
					: "Activar Modificador",
				icon: modifier.isAvailable ? (
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
					toggleModifierAvailability(
						modifier.id,
						modifier.isAvailable,
					),
			},
			{
				label: "Editar Modificador",
				icon: (
					<MaterialIcons
						name="edit"
						size={20}
						color={colors.textPrimaryLight}
					/>
				),
				onPress: () =>
					navigation.navigate("ModifierForm", {
						// Redirección a su propio formulario
						title: "Editar Modificador",
						modifierId: modifier.id,
					}),
			},
			{
				label: "Eliminar Modificador",
				icon: (
					<MaterialIcons
						name="delete"
						size={20}
						color={colors.error}
					/>
				),
				textColor: colors.error,
				iconBg: colors.errorLight,
				onPress: () => handleDelete(modifier.id, modifier.name),
			},
		];
	};

	const handleOpenMenu = (modifier: Modifier) => {
		showContextMenu(
			modifier?.name || "",
			getMenuOptions(modifier),
			modifier?.extraPrice
				? `Precio: +$${modifier.extraPrice.toFixed(2)}`
				: "Sin costo extra",
		);
	};

	// Exponemos lo que la vista necesita
	return {
		modifiers,
		refreshing,
		onRefresh: () => fetchModifiers(searchTerm), // Ajustado para reusar el fetch
		searchTerm,
		setSearchTerm,
		handleSearch,
		handleClearSearch,
		handleOpenMenu,
	};
};
