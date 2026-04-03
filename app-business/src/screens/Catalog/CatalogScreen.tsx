import { useState, useRef } from "react";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ScrollView,
} from "react-native";
import { Spacing, FontSize, FontWeight } from "@coco/shared/config/theme";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { SectionsTab } from "@/screens/Catalog/Tabs/Sections/SectionsTab";
import { ProductsTab } from "@/screens/Catalog/Tabs/Products/ProductsTab";
import { ModifiersGroupTab } from "@/screens/Catalog/Tabs/ModifiersGroup/ModifiersGroupTab";

type TabType = "secciones" | "productos" | "grupoModificadores";

interface TabItem {
	id: TabType;
	title: string;
	IconComponent: typeof Ionicons | typeof MaterialIcons;
	iconName: React.ComponentProps<
		typeof Ionicons | typeof MaterialIcons
	>["name"];
}

export const CatalogScreen = () => {
	const { colors } = useTheme();
	const [activeTab, setActiveTab] = useState<TabType>("secciones");
	const scrollViewRef = useRef<ScrollView>(null);
	const [scrollViewWidth, setScrollViewWidth] = useState(0);
	const tabsLayouts = useRef<Record<string, { x: number; width: number }>>(
		{},
	);

	const TABS: TabItem[] = [
		{
			id: "secciones",
			title: "Secciones",
			IconComponent: Ionicons,
			iconName: "folder-open-outline",
		},
		{
			id: "productos",
			title: "Productos",
			IconComponent: Ionicons,
			iconName: "cube-outline",
		},
		{
			id: "grupoModificadores",
			title: "Grupo de modificadores",
			IconComponent: MaterialIcons,
			iconName: "add-chart",
		},
	];

	const handleTabPress = (tabId: TabType) => {
		setActiveTab(tabId);

		const tabLayout = tabsLayouts.current[tabId];
		if (tabLayout && scrollViewRef.current) {
			const tabCenter = tabLayout.x + tabLayout.width / 2;
			const scrollToX = tabCenter - scrollViewWidth / 2;

			scrollViewRef.current.scrollTo({
				x: Math.max(0, scrollToX),
				animated: true,
			});
		}
	};

	return (
		<View style={styles.container}>
			<View
				style={[
					styles.header,
					{
						backgroundColor: colors.surfaceLight,
						borderBottomColor: colors.borderLight,
					},
				]}
			>
				<ScrollView
					ref={scrollViewRef}
					horizontal={true}
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={styles.tabsContainer}
					onLayout={(e) =>
						setScrollViewWidth(e.nativeEvent.layout.width)
					}
				>
					{TABS.map((tab) => {
						const active = activeTab === tab.id;
						const tintColor = active
							? colors.businessBg
							: colors.textPrimaryLight;
						const { IconComponent } = tab;

						return (
							<TouchableOpacity
								key={tab.id}
								style={[
									styles.tabButton,
									active && {
										borderBottomColor: colors.businessBg,
									},
								]}
								onPress={() => handleTabPress(tab.id)}
								activeOpacity={0.8}
								onLayout={(e) => {
									tabsLayouts.current[tab.id] = {
										x: e.nativeEvent.layout.x,
										width: e.nativeEvent.layout.width,
									};
								}}
							>
								<View style={styles.tabContent}>
									<IconComponent
										name={tab.iconName as any}
										size={16}
										color={tintColor}
									/>
									<Text
										style={[
											styles.tabText,
											{
												color: tintColor,
												fontWeight: active
													? FontWeight.bold
													: FontWeight.medium,
											},
										]}
									>
										{tab.title}
									</Text>
								</View>
							</TouchableOpacity>
						);
					})}
				</ScrollView>
			</View>

			{activeTab === "secciones" && <SectionsTab />}
			{activeTab === "productos" && <ProductsTab />}
			{activeTab === "grupoModificadores" && <ModifiersGroupTab />}
		</View>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1 },
	header: {
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	tabsContainer: {
		flexDirection: "row",
		paddingHorizontal: Spacing.md,
	},
	tabButton: {
		paddingVertical: Spacing.sm + 2,
		paddingHorizontal: Spacing.md,
		alignItems: "center",
		justifyContent: "center",
		borderBottomWidth: 3,
		borderBottomColor: "transparent",
	},
	tabContent: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	tabText: {
		fontSize: FontSize.sm,
	},
});
