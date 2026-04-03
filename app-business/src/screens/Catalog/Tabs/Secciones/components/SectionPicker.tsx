import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	TextInput,
	TouchableOpacity,
	ActivityIndicator,
	Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { useSection } from "@coco/shared/hooks/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Section } from "@coco/shared/core/entities/";
import {
	FontSize,
	FontWeight,
	BorderRadius,
	Spacing,
} from "@coco/shared/config/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenHeader } from "@/screens/Catalog/components/ScreenHeader";
import { PrimaryButton } from "@/screens/Catalog/components/PrimaryButton";

export const SectionPicker = () => {
	const navigation = useNavigation<any>();
	const route = useRoute<any>();
	const { colors, isDark } = useTheme();
	const insets = useSafeAreaInsets();

	// 🌟 Recibe las secciones ya seleccionadas para persistir la selección
	const { alreadySelectedSections = [], returnScreen = "ProductForm" } =
		route.params || {};

	const { sections, fetch, loadings, searchTerm, setSearchTerm } =
		useSection();

	const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>(
		alreadySelectedSections,
	);
	const textColor = colors.textPrimaryLight;
	const subTextColor = colors.textSecondaryLight;
	const borderColor = colors.borderLight;
	const bgApp = colors.backgroundLight;
	const bgSearchInput = colors.inputBg;

	useEffect(() => {
		fetch(searchTerm);
		// 🚀 Quitamos fetchSections de aquí abajo para evitar el bucle infinito
	}, [searchTerm]);

	const toggleSectionSelection = (sectionId: string) => {
		const isSelected = selectedSectionIds?.includes(sectionId);
		if (isSelected) {
			setSelectedSectionIds(
				selectedSectionIds.filter((id) => id !== sectionId),
			);
		} else {
			setSelectedSectionIds([...selectedSectionIds, sectionId]);
		}
	};

	const handleFinish = () => {
		// 🔥 Limpieza en un Set para garantizar unicidad de IDs de vuelta
		const uniqueIds = Array.from(new Set(selectedSectionIds));

		console.log("Regresando IDs únicos:", uniqueIds);

		// 🌟 Redirige mandando el arreglo finalizado de puros IDs
		navigation.popTo(returnScreen, {
			selectedSections: uniqueIds,
		});
	};

	const renderSectionItem = ({ item }: { item: Section }) => {
		const isSelected = selectedSectionIds?.includes(item.id);

		return (
			<TouchableOpacity
				style={[styles.card, { borderBottomColor: borderColor }]}
				activeOpacity={0.7}
				onPress={() => toggleSectionSelection(item.id)} // 🚀 Mandamos el ID
			>
				<View style={{ flex: 1 }}>
					<Text style={[styles.name, { color: textColor }]}>
						{item.name}
					</Text>
					<Text
						style={{ color: subTextColor, fontSize: FontSize.sm }}
						numberOfLines={1}
					>
						{item.description || "Sin descripción"}
					</Text>
				</View>

				<Ionicons
					name={isSelected ? "checkbox" : "square-outline"}
					size={24}
					color={isSelected ? colors.businessBg : subTextColor}
				/>
			</TouchableOpacity>
		);
	};

	return (
		<View style={{ flex: 1, backgroundColor: bgApp }}>
			<ScreenHeader
				title="Vincular Secciones"
				onBack={() => navigation.goBack()}
				fontSizeTitle={FontSize.xl}
			/>

			<View
				style={[
					styles.searchContainer,
					{
						backgroundColor: bgSearchInput,
						borderColor: borderColor,
					},
				]}
			>
				<Ionicons
					name="search-outline"
					size={18}
					color={subTextColor}
				/>
				<TextInput
					style={[styles.searchInput, { color: textColor }]}
					placeholder="Buscar sección por nombre..."
					placeholderTextColor={
						isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"
					}
					value={searchTerm}
					onChangeText={setSearchTerm}
				/>
				{searchTerm.length > 0 && (
					<TouchableOpacity onPress={() => setSearchTerm("")}>
						<Ionicons
							name="close-circle"
							size={18}
							color={subTextColor}
						/>
					</TouchableOpacity>
				)}
			</View>

			<Text style={[styles.headerSub, { color: subTextColor }]}>
				Busca y selecciona las secciones en las que se mostrará este
				producto.
			</Text>

			{loadings.fetch ? (
				<View style={styles.centered}>
					<ActivityIndicator size="large" color={colors.businessBg} />
				</View>
			) : (
				<FlatList
					data={sections}
					keyExtractor={(item) => item.id}
					renderItem={renderSectionItem}
					contentContainerStyle={styles.scrollContent}
					showsVerticalScrollIndicator={false}
					ListEmptyComponent={
						<Text
							style={[styles.emptyText, { color: subTextColor }]}
						>
							No se encontraron secciones.
						</Text>
					}
				/>
			)}

			<View
				style={[
					styles.bottomContainer,
					{ borderTopColor: borderColor, backgroundColor: bgApp },
				]}
			>
				<PrimaryButton
					title={`Guardar cambios (${selectedSectionIds.length})`}
					onPress={handleFinish}
					marginBottom={
						Platform.OS === "ios" ? insets.bottom : Spacing.md
					}
				/>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	scrollContent: {
		paddingHorizontal: Spacing.md,
		paddingBottom: Spacing.lg,
	},
	centered: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	headerSub: {
		fontSize: FontSize.md,
		marginBottom: Spacing.md,
		paddingHorizontal: Spacing.md,
	},
	searchContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginHorizontal: Spacing.md,
		marginBottom: Spacing.sm,
		paddingHorizontal: Spacing.md,
		height: 46,
		borderRadius: BorderRadius.md,
		borderWidth: StyleSheet.hairlineWidth,
	},
	searchInput: {
		flex: 1,
		marginLeft: Spacing.sm,
		fontSize: FontSize.md,
	},
	card: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: Spacing.md,
		paddingHorizontal: Spacing.xs,
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	name: {
		fontSize: FontSize.md,
		fontWeight: FontWeight.bold,
		marginBottom: Spacing.xs,
	},
	emptyText: {
		textAlign: "center",
		marginTop: Spacing.xxl,
		fontSize: FontSize.md,
	},
	bottomContainer: {
		padding: Spacing.md,
		borderTopWidth: 1,
	},
});
