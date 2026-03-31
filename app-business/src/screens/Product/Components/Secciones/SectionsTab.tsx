import React, { useState } from "react";
import { supabase } from "@/infrastructure/supabase/config";
import {
	BorderRadius,
	FontSize,
	FontWeight,
	Shadow,
	Spacing,
} from "@coco/shared/config/theme";
import { useSection } from "@coco/shared/hooks/supabase";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { useDialog } from "@coco/shared/providers/DialogContext";
import { useNavigation } from "@react-navigation/native";
import { ContextMenuItem } from "@coco/shared/components/CustomContextMenu";
import {
	FlatList,
	RefreshControl,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { Section } from "@coco/shared/core/entities/";

// 📦 1. Importamos los paquetes de iconos
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { EmptyState } from "../EmptyState";
import { useContextMenu } from "@coco/shared/providers";

export const SectionsTab = ({ businessId }: { businessId?: string }) => {
	const navigation = useNavigation<any>();
	const { colors } = useTheme();
	const { showDialog } = useDialog();
	const [isFirst, setIsFirst] = useState(false);
	const [isLast, setIsLast] = useState(false);

	const {
		sections,
		refreshing,
		onRefresh,
		searchTerm,
		setSearchTerm,
		deleteSection,
		toggleSectionAvailability,
		moveSection,
		fetchSections,
	} = useSection(supabase, businessId);
	const { showContextMenu } = useContextMenu();

	const handleOpenMenu = (section: Section) => {
		// 🔍 Buscamos el index real dentro de la lista que estamos viendo
		const index = sections.findIndex((s) => s.id === section.id);

		// ⚡ Cálculos síncronos e instantáneos
		setIsFirst(index === 0);
		setIsLast(index === sections.length - 1);

		showContextMenu(
			section?.name || "",
			getMenuOptions(section),
			section?.description || "Sin descripción",
		);
	};

	const handleMoveSection = async (
		currentSection: Section,
		direction: "up" | "down",
	) => {
		const result = await moveSection(currentSection, direction);

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
	const handleSearch = () => {
		fetchSections(searchTerm);
	};
	const handleClearSearch = () => {
		setSearchTerm("");
		fetchSections(""); // Trae todo de nuevo
	};
	const getMenuOptions = (section: Section): ContextMenuItem[] => {
		if (!section) return [];

		const options: ContextMenuItem[] = [];

		// 🎯 VALIDACIÓN: Solo permitir mover si el buscador está vacío
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

		// --- OPCIONES DE CRUD ---
		return [
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

	return (
		<>
			<View
				style={[
					styles.searchContainer,
					{ backgroundColor: colors.surfaceLight },
				]}
			>
				{/* 🔍 2. Icono de búsqueda en vez de emoji */}
				<Ionicons
					name="search-outline"
					size={20}
					color={colors.textSecondaryLight}
					style={styles.searchIcon}
				/>

				<TextInput
					style={[
						styles.searchInput,
						{ color: colors.textPrimaryLight },
					]}
					placeholder="Buscar sección por nombre o descripción..."
					placeholderTextColor={colors.textSecondaryLight}
					value={searchTerm}
					onChangeText={setSearchTerm}
					returnKeyType="search" // Cambia el botón "Enter/Intro" por una lupa o texto "Buscar"
					onSubmitEditing={handleSearch} // Se ejecuta al presionar ese botón del teclado
					clearButtonMode="while-editing"
				/>
				{searchTerm.length > 0 && (
					<TouchableOpacity onPress={handleClearSearch}>
						<Ionicons
							name="close-circle"
							size={20}
							color={colors.textSecondaryLight}
							style={styles.clearIcon}
						/>
					</TouchableOpacity>
				)}
			</View>

			<FlatList
				data={sections}
				keyExtractor={(item) => item.id}
				contentContainerStyle={styles.listContent}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						colors={[colors.businessBg]}
					/>
				}
				ListEmptyComponent={
					<EmptyState
						isFiltering={searchTerm.trim().length > 0}
						colors={colors}
					/>
				}
				renderItem={({ item }) => (
					<TouchableOpacity
						style={[
							styles.productCard,
							{
								backgroundColor: colors.surfaceLight,
								borderLeftWidth: 4,
								borderLeftColor: item.isAvailable
									? colors.businessBg
									: colors.textSecondaryLight,
							},
						]}
						activeOpacity={0.7}
						onPress={() => handleOpenMenu(item)}
					>
						<View style={styles.productInfo}>
							<View style={styles.headerRow}>
								<Text
									style={[
										styles.productName,
										{ color: colors.textPrimaryLight },
									]}
									numberOfLines={1}
								>
									{item.name}
								</Text>

								<View style={styles.badgesContainer}>
									<View
										style={[
											styles.positionBadge,
											{
												backgroundColor:
													colors.backgroundLight,
											},
										]}
									>
										<Text
											style={[
												styles.positionText,
												{
													color: colors.textSecondaryLight,
												},
											]}
										>
											#{item.position ?? 0}
										</Text>
									</View>

									<View
										style={[
											styles.statusBadge,
											{
												backgroundColor:
													item.isAvailable
														? colors.businessBg +
															"15"
														: colors.textSecondaryLight +
															"15",
											},
										]}
									>
										<View
											style={[
												styles.statusDot,
												{
													backgroundColor:
														item.isAvailable
															? colors.businessBg
															: colors.textSecondaryLight,
												},
											]}
										/>
										<Text
											style={[
												styles.statusText,
												{
													color: item.isAvailable
														? colors.businessBg
														: colors.textSecondaryLight,
												},
											]}
										>
											{item.isAvailable
												? "Activo"
												: "Pausado"}
										</Text>
									</View>
								</View>
							</View>

							<View style={styles.descriptionRow}>
								{/* 📝 4. Icono de descripción para las notas */}
								<MaterialIcons
									name="description"
									size={16}
									color={colors.textSecondaryLight}
									style={styles.descIcon}
								/>
								<Text
									style={[
										styles.productDesc,
										{ color: colors.textSecondaryLight },
									]}
									numberOfLines={2}
								>
									{item.description ||
										"Sin descripción asignada"}
								</Text>
							</View>
						</View>
					</TouchableOpacity>
				)}
			/>

			{/* <CustomContextMenu
				visible={menuVisible}
				onClose={() => setMenuVisible(false)}
				title={selectedSection?.name || ""}
				subtitle={selectedSection?.description || "Sin descripción"}
				items={menuOptions}
			/> */}

			<TouchableOpacity
				style={[styles.fab, { backgroundColor: colors.businessBg }]}
				onPress={() =>
					navigation.navigate("SectionForm", {
						title: "Nueva Sección",
					})
				}
			>
				{/* ➕ 5. Icono de suma para el FAB */}
				<Ionicons name="add" size={32} color={colors.textOnPrimary} />
			</TouchableOpacity>
		</>
	);
};
const styles = StyleSheet.create({
	listContent: {
		padding: Spacing.md,
		paddingBottom: 100,
	},
	productCard: {
		padding: Spacing.md,
		flexDirection: "row",
		alignItems: "center",
		marginBottom: Spacing.md,
		borderRadius: BorderRadius.lg,
		...Shadow.md,
		overflow: "hidden",
	},
	productInfo: {
		flex: 1,
		gap: 6,
	},
	headerRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	productName: {
		fontSize: FontSize.md,
		fontWeight: FontWeight.bold,
		flex: 1,
		marginRight: Spacing.sm,
	},
	badgesContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	positionBadge: {
		paddingHorizontal: Spacing.sm,
		paddingVertical: 3,
		borderRadius: BorderRadius.sm,
		borderWidth: 0.5,
		borderColor: "rgba(0,0,0,0.05)",
	},
	positionText: {
		fontSize: 11,
		fontWeight: FontWeight.bold,
	},
	statusBadge: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: Spacing.sm,
		paddingVertical: 3,
		borderRadius: BorderRadius.sm,
		gap: 4,
	},
	statusDot: {
		width: 6,
		height: 6,
		borderRadius: 3,
	},
	statusText: {
		fontSize: 11,
		fontWeight: FontWeight.bold,
		textTransform: "uppercase",
	},
	descriptionRow: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: 6,
	},
	descIcon: {
		marginTop: 1,
	},
	productDesc: {
		fontSize: FontSize.sm,
		flex: 1,
	},
	fab: {
		position: "absolute",
		bottom: 30,
		right: 30,
		width: 60,
		height: 60,
		borderRadius: 30,
		justifyContent: "center",
		alignItems: "center",
		...Shadow.lg,
	},
	searchContainer: {
		flexDirection: "row",
		alignItems: "center",
		margin: Spacing.md,
		marginBottom: Spacing.xs,
		paddingHorizontal: Spacing.md,
		height: 50,
		borderRadius: BorderRadius.lg,
		...Shadow.sm,
	},
	searchIcon: {
		marginRight: Spacing.sm,
	},
	searchInput: {
		flex: 1,
		fontSize: FontSize.md,
		height: "100%",
	},
	clearIcon: {
		padding: Spacing.xs,
	},
});
