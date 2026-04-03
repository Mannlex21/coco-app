import React, { useState, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	TouchableOpacity,
	ActivityIndicator,
	Platform,
} from "react-native";

import { useTheme } from "@coco/shared/hooks/useTheme";
import { useSection } from "@coco/shared/hooks/supabase";
import { Section } from "@coco/shared/core/entities";
import { FontSize, FontWeight, Spacing } from "@coco/shared/config/theme";
import { PrimaryButton, ScreenHeader, SearchInput } from "@/components";

export const SectionPicker = () => {
	const navigation = useNavigation<any>();
	const route = useRoute<any>();
	const { colors } = useTheme();
	const insets = useSafeAreaInsets();

	const { alreadySelectedSections = [], returnScreen = "ProductForm" } =
		route.params || {};

	const { sections, fetch, loadings, searchTerm, setSearchTerm } =
		useSection();

	const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>(
		alreadySelectedSections,
	);

	const handleSearch = () => {
		fetch(searchTerm);
	};

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
		const uniqueIds = Array.from(new Set(selectedSectionIds));
		navigation.popTo(returnScreen, {
			selectedSections: uniqueIds,
		});
	};

	const renderSectionItem = ({ item }: { item: Section }) => {
		const isSelected = selectedSectionIds?.includes(item.id);

		return (
			<TouchableOpacity
				style={[styles.card, { borderBottomColor: colors.borderLight }]}
				activeOpacity={0.7}
				onPress={() => toggleSectionSelection(item.id)}
			>
				<View style={{ flex: 1 }}>
					<Text
						style={[
							styles.name,
							{ color: colors.textPrimaryLight },
						]}
					>
						{item.name}
					</Text>
					<Text
						style={{
							color: colors.textSecondaryLight,
							fontSize: FontSize.sm,
						}}
						numberOfLines={1}
					>
						{item.description || "Sin descripción"}
					</Text>
				</View>

				<Ionicons
					name={isSelected ? "checkbox" : "square-outline"}
					size={24}
					color={
						isSelected
							? colors.businessBg
							: colors.textSecondaryLight
					}
				/>
			</TouchableOpacity>
		);
	};

	return (
		<View style={{ flex: 1, backgroundColor: colors.backgroundLight }}>
			<ScreenHeader
				title="Vincular Secciones"
				onBack={() => navigation.goBack()}
				fontSizeTitle={FontSize.xl}
			/>

			<View style={styles.searchWrapper}>
				<SearchInput
					value={searchTerm}
					onChangeText={setSearchTerm}
					onSearch={handleSearch}
					colors={colors}
					placeholder="Buscar sección por nombre..."
					onClear={() => setSearchTerm("")}
				/>
			</View>

			<Text
				style={[styles.headerSub, { color: colors.textSecondaryLight }]}
			>
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
							style={[
								styles.emptyText,
								{ color: colors.textSecondaryLight },
							]}
						>
							No se encontraron secciones.
						</Text>
					}
				/>
			)}

			<View
				style={[
					styles.bottomContainer,
					{
						borderTopColor: colors.borderLight,
						backgroundColor: colors.backgroundLight,
					},
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
	searchWrapper: {
		marginHorizontal: Spacing.md,
		marginBottom: Spacing.sm,
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
