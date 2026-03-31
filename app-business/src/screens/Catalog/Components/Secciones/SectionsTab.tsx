import React, { useState } from "react";
import {
	FlatList,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	RefreshControl,
	TextInput,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "@/infrastructure/supabase/config";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { useSection } from "@coco/shared/hooks/supabase";
import {
	FontSize,
	FontWeight,
	Spacing,
	BorderRadius,
	Shadow,
} from "@coco/shared/config/theme";
import { EmptyState } from "../EmptyState"; // Ajusta la ruta según tu proyecto

// Importamos los componentes aislados
import { ProductListItem } from "../Products/ProductListItem";
import { ProductGridItem } from "../Products/ProductGridItem";
import { useContextMenu, useDialog } from "@coco/shared/providers";
import { Section } from "@coco/shared/core/entities";
import { ContextMenuItem } from "@coco/shared/components";

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
			{
				label: "Agregar Producto",
				icon: (
					<Ionicons
						name="fast-food-outline" // Puedes usar "add" o "fast-food-outline"
						size={20}
						color={colors.textPrimaryLight}
					/>
				),
				onPress: () =>
					navigation.navigate("ProductForm", {
						title: "Nuevo Producto",
						sectionId: section.id, // Pasamos el ID para asociarlo
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

	const renderSection = ({ item: section }: { item: any }) => {
		const isGrid = section.visualizationType === "grid";

		return (
			<View style={styles.sectionContainer}>
				{/* 1. Cabecera de la Sección (Título + Descripción + Botón de menú) */}
				<View
					style={[
						styles.sectionHeader,
						{ backgroundColor: colors.backgroundLight },
					]}
				>
					<View style={{ flex: 1, marginRight: 8 }}>
						<Text
							style={[
								styles.sectionTitle,
								{ color: colors.textPrimaryLight },
							]}
						>
							{section.name}
						</Text>

						{/* Agregando la descripción si existe */}
						{section.description ? (
							<Text
								style={{
									color: colors.textSecondaryLight,
									fontSize: 13,
									marginTop: 3,
								}}
								numberOfLines={2} // Limita a 2 líneas para que no rompa el diseño
							>
								{section.description}
							</Text>
						) : null}
					</View>

					<TouchableOpacity
						style={styles.menuIconButton}
						onPress={() => handleOpenMenu(section)}
					>
						<Ionicons
							name="ellipsis-vertical"
							size={20}
							color={colors.textSecondaryLight}
						/>
					</TouchableOpacity>
				</View>

				{/* 2. Contenedor de Productos */}
				{/* Si es grid aplica estilos envolventes de filas, si no se queda apilado */}
				<View
					style={[
						isGrid
							? styles.gridProductsContainer
							: styles.listProductsContainer,
						{ marginTop: 5 },
					]}
				>
					{section.products && section.products.length > 0 ? (
						section.products.map((product: any) => {
							const onPressItem = () =>
								navigation.navigate("ProductForm", {
									productId: product.id,
								});

							return isGrid ? (
								<ProductGridItem
									key={product.id}
									item={product}
									colors={colors}
									onPress={onPressItem}
								/>
							) : (
								<ProductListItem
									key={product.id}
									item={product}
									colors={colors}
									onPress={onPressItem}
								/>
							);
						})
					) : (
						/* Componente de estado vacío */
						<View style={styles.emptyProductsContainer}>
							<Ionicons
								name="basket-outline"
								size={24}
								color={colors.textSecondaryLight}
								style={{ marginBottom: 4 }}
							/>
							<Text
								style={{
									color: colors.textSecondaryLight,
									fontSize: 14,
									textAlign: "center",
								}}
							>
								No hay productos en esta sección
							</Text>
						</View>
					)}
				</View>
			</View>
		);
	};

	return (
		<>
			<View
				style={[
					styles.searchContainer,
					{ backgroundColor: colors.surfaceLight },
				]}
			>
				<Ionicons
					name="search"
					size={20}
					color={colors.textSecondaryLight}
					style={styles.searchIcon}
				/>
				<TextInput
					style={[
						styles.searchInput,
						{ color: colors.textPrimaryLight },
					]}
					placeholder="Buscar sección"
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
							size={18}
							color={colors.textSecondaryLight}
						/>
					</TouchableOpacity>
				)}
			</View>

			{/* Lista Principal (Usando FlatList para permitir vistas mixtas) */}
			<FlatList
				data={sections}
				keyExtractor={(item) => item.id}
				renderItem={renderSection}
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
			/>

			{/* Botón Flotante (FAB) para crear nueva sección */}
			<TouchableOpacity
				style={[styles.fab, { backgroundColor: colors.businessBg }]}
				onPress={() =>
					navigation.navigate("SectionForm", {
						title: "Nueva Sección",
					})
				}
			>
				<Ionicons name="add" size={32} color={colors.textOnPrimary} />
			</TouchableOpacity>
		</>
	);
};

// 🎨 HOJA DE ESTILOS
const styles = StyleSheet.create({
	listContent: {
		paddingHorizontal: Spacing.md,
		paddingBottom: 100, // Espacio para que el FAB no tape el último producto
	},
	sectionContainer: {
		marginBottom: Spacing.sm,
	},
	sectionHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: Spacing.sm,
		paddingHorizontal: Spacing.xs,
		marginTop: Spacing.md,
	},
	sectionTitle: {
		fontSize: FontSize.lg,
		fontWeight: FontWeight.bold,
	},
	menuIconButton: {
		padding: Spacing.xs,
	},

	// 🪄 Estilos clave para simular la cuadrícula de Uber Eats
	gridProductsContainer: {
		flexDirection: "row",
		flexWrap: "wrap", // Clave: permite que los elementos brinquen a la siguiente fila
		justifyContent: "space-between", // Espacio uniforme entre las 2 columnas
		marginTop: Spacing.xs,
	},
	listProductsContainer: {
		// No requiere estilos especiales ya que Flexbox por defecto apila en columna
	},

	// Estilos del buscador
	searchContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginHorizontal: Spacing.md,
		marginVertical: Spacing.sm,
		paddingHorizontal: Spacing.sm,
		height: 45,
		borderRadius: BorderRadius.md,
		...Shadow.sm,
	},
	searchIcon: {
		marginRight: Spacing.xs,
	},
	searchInput: {
		flex: 1,
		fontSize: FontSize.md,
	},

	// Estilos del FAB
	fab: {
		position: "absolute",
		bottom: Spacing.xl,
		right: Spacing.xl,
		width: 56,
		height: 56,
		borderRadius: 28,
		justifyContent: "center",
		alignItems: "center",
		...Shadow.md,
	},
	emptyProductsContainer: {
		paddingVertical: 20,
		alignItems: "center",
		justifyContent: "center",
		width: "100%",
	},
});
