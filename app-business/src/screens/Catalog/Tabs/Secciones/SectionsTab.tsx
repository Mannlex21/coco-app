import React from "react";
import { FlatList, StyleSheet, RefreshControl, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { Spacing } from "@coco/shared/config/theme";
import { EmptyState } from "../../components/EmptyState";
import { useSectionsTab } from "@/hooks/useSectionsTab";
import { SectionItem } from "./components/SectionItem";
import { SearchInput } from "../../components/SearchInput";
import { FloatingButton } from "../../components/FloatingButton";

export const SectionsTab = ({ businessId }: { businessId?: string }) => {
	const navigation = useNavigation<any>();
	const { colors } = useTheme();

	const {
		sections,
		refreshing,
		onRefresh,
		searchTerm,
		setSearchTerm,
		handleSearch,
		handleClearSearch,
		handleOpenMenu,
		movingSectionId,
	} = useSectionsTab(businessId, colors);

	return (
		<>
			<View
				style={[
					styles.subHeaderContainer,
					{
						borderBottomColor: colors.borderLight,
					},
				]}
			>
				<SearchInput
					value={searchTerm}
					onChangeText={setSearchTerm}
					onSearch={handleSearch}
					onClear={handleClearSearch}
					colors={colors}
					placeholder="Buscar sección"
				/>
			</View>

			<FlatList
				data={sections}
				keyExtractor={(item) => item.id}
				contentContainerStyle={styles.listContent}
				renderItem={({ item }) => (
					<SectionItem
						section={item}
						colors={colors}
						navigation={navigation}
						onOpenMenu={handleOpenMenu}
						isMoving={movingSectionId === item.id}
					/>
				)}
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

			<FloatingButton
				label="Nueva Sección"
				iconName="add"
				colors={colors}
				onPress={() =>
					navigation.navigate("SectionForm", {
						title: "Nueva Sección",
					})
				}
			/>
		</>
	);
};

const styles = StyleSheet.create({
	subHeaderContainer: {
		paddingTop: Spacing.md,
		paddingHorizontal: Spacing.md,
		paddingVertical: Spacing.xs,
		paddingBottom: Spacing.md,
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	listContent: {
		paddingTop: Spacing.xs,
		paddingBottom: 100,
	},
});
