import React from "react";
import { Spacing } from "@coco/shared/config/theme";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { useNavigation } from "@react-navigation/native";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { EmptyState } from "../../components/EmptyState";
import { SearchInput } from "../../components/SearchInput";
import { FloatingButton } from "../../components/FloatingButton";
import { ModifierGroupListItem } from "./components/ModifierGroupListItem";
import { useModifiersGroupTab } from "@/hooks/useModifiersGroupTab";
import { useAppStore } from "@coco/shared/hooks/useAppStore";

export const ModifiersGroupTab = ({ businessId }: { businessId?: string }) => {
	const navigation = useNavigation<any>();
	const { colors } = useTheme();
	const { user } = useAppStore();

	// Asumimos que crearás un hook similar al de productos para separar la lógica
	const {
		modifierGroups,
		refreshing,
		onRefresh,
		searchTerm,
		setSearchTerm,
		handleSearch,
		handleClearSearch,
		handleOpenMenu,
	} = useModifiersGroupTab(businessId, colors);

	return (
		<>
			<View
				style={[
					styles.subHeaderContainer,
					{ borderBottomColor: colors.borderLight },
				]}
			>
				<SearchInput
					value={searchTerm}
					onChangeText={setSearchTerm}
					onSearch={handleSearch}
					onClear={handleClearSearch}
					colors={colors}
					placeholder="Buscar grupo de modificadores"
				/>
			</View>

			<FlatList
				data={modifierGroups}
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
					<ModifierGroupListItem
						item={item}
						colors={colors}
						onPress={() => handleOpenMenu(item)}
						role={user?.role}
					/>
				)}
			/>

			<FloatingButton
				label="Nuevo Grupo"
				iconName="add"
				colors={colors}
				onPress={() =>
					navigation.navigate("ModifierGroupForm", {
						title: "Nuevo Grupo de Modificadores",
					})
				}
			/>
		</>
	);
};

const styles = StyleSheet.create({
	subHeaderContainer: {
		paddingHorizontal: Spacing.md,
		paddingTop: Spacing.xs,
		paddingBottom: Spacing.md,
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	listContent: {
		paddingHorizontal: Spacing.md,
		paddingBottom: 100,
	},
});
