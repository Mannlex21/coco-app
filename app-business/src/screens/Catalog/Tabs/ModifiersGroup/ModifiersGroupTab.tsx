import React from "react";
import { Spacing } from "@coco/shared/config/theme";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { useNavigation } from "@react-navigation/native";
import {
	ActivityIndicator,
	FlatList,
	RefreshControl,
	StyleSheet,
	View,
} from "react-native";
import { EmptyState, SearchInput, FloatingButton } from "@/components/";
import { ModifierGroupListItem } from "@/screens/Catalog/Tabs/ModifiersGroup/components/ModifierGroupListItem";
import { useModifiersGroupTab } from "@/hooks/useModifiersGroupTab";
import { useAppStore } from "@coco/shared/hooks";

export const ModifiersGroupTab = () => {
	const navigation = useNavigation<any>();
	const { colors } = useTheme();
	const { user } = useAppStore();

	const {
		modifierGroups,
		loadings,
		onRefresh,
		searchTerm,
		setSearchTerm,
		handleSearch,
		handleClearSearch,
		handleOpenMenu,
	} = useModifiersGroupTab();

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
						refreshing={loadings.refresh}
						onRefresh={onRefresh}
						colors={[colors.businessBg]}
					/>
				}
				ListEmptyComponent={
					loadings.fetch && !loadings.refresh ? (
						<View style={styles.loaderContainer}>
							<ActivityIndicator
								size="large"
								color={colors.businessBg}
							/>
						</View>
					) : (
						<EmptyState
							isFiltering={searchTerm.trim().length > 0}
							colors={colors}
						/>
					)
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
		paddingTop: Spacing.md,
		paddingBottom: Spacing.md,
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	listContent: {
		paddingHorizontal: Spacing.md,
		paddingBottom: 100,
	},
	loaderContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		minHeight: 200,
	},
});
