import React, { useState, useRef } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Platform,
	ScrollView,
} from "react-native";
import { Spacing, FontSize, FontWeight } from "@coco/shared/config/theme";
import { useAppStore } from "@coco/shared/hooks/useAppStore";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { SectionsTab } from "./Tabs/Secciones/SectionsTab";
import { Ionicons } from "@expo/vector-icons";
import { ProductsTab } from "./Tabs/Products/ProductsTab";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ModifiersGroupTab } from "./Tabs/ModifiersGroup/ModifiersGroupTab";

type TabType = "secciones" | "productos" | "grupoModificadores";

interface TabItem {
	id: TabType;
	title: string;
	icon: React.ComponentProps<typeof Ionicons>["name"];
}

export const CatalogScreen = () => {
	const { user } = useAppStore();
	const { colors } = useTheme();
	const insets = useSafeAreaInsets();

	const [activeTab, setActiveTab] = useState<TabType>("secciones");
	const businessId = user?.lastActiveBusinessId;

	// 🔥 1. REFERENCIAS Y ESTADOS PARA EL SCROLL AUTOMÁTICO
	const scrollViewRef = useRef<ScrollView>(null);
	const [scrollViewWidth, setScrollViewWidth] = useState(0);
	// Guardamos las coordenadas X y el ancho de cada pestaña
	const tabsLayouts = useRef<Record<string, { x: number; width: number }>>(
		{},
	);

	// Definimos las pestañas en un arreglo para mapearlas fácilmente
	const TABS: TabItem[] = [
		{ id: "secciones", title: "Secciones", icon: "folder-open-outline" },
		{ id: "productos", title: "Productos", icon: "cube-outline" },
		{
			id: "grupoModificadores",
			title: "Grupo de modificadores",
			icon: "add-circle-outline",
		},
	];

	// 🔥 2. FUNCIÓN PARA ENFOCAR EL TAB
	const handleTabPress = (tabId: TabType) => {
		setActiveTab(tabId);

		const tabLayout = tabsLayouts.current[tabId];
		if (tabLayout && scrollViewRef.current) {
			// Calculamos el centro de la pestaña
			const tabCenter = tabLayout.x + tabLayout.width / 2;
			// Calculamos cuánto debemos mover el scroll para que el centro de la pestaña
			// quede justo en el centro visible del ScrollView
			const scrollToX = tabCenter - scrollViewWidth / 2;

			scrollViewRef.current.scrollTo({
				x: Math.max(0, scrollToX), // Evitamos valores negativos
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
						paddingTop:
							Platform.OS === "android"
								? insets.top - 10
								: insets.top,
						borderBottomColor: colors.borderLight,
					},
				]}
			>
				<ScrollView
					ref={scrollViewRef} // 👈 Asignamos la referencia
					horizontal={true}
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={styles.tabsContainer}
					// 🔥 Guardamos el ancho de la pantalla/contenedor visible
					onLayout={(e) =>
						setScrollViewWidth(e.nativeEvent.layout.width)
					}
				>
					{TABS.map((tab) => {
						const active = activeTab === tab.id;
						const tintColor = active
							? colors.businessBg
							: colors.textPrimaryLight;

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
								// 🔥 Guardamos la posición exacta de este tab en el eje X
								onLayout={(e) => {
									tabsLayouts.current[tab.id] = {
										x: e.nativeEvent.layout.x,
										width: e.nativeEvent.layout.width,
									};
								}}
							>
								<View style={styles.tabContent}>
									<Ionicons
										name={tab.icon}
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

			{/* =======================================================
                CONTENIDO DINÁMICO
               ======================================================= */}
			{activeTab === "secciones" && (
				<SectionsTab businessId={businessId} />
			)}
			{activeTab === "productos" && (
				<ProductsTab businessId={businessId} />
			)}
			{activeTab === "grupoModificadores" && (
				<ModifiersGroupTab businessId={businessId} />
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1 },
	header: {
		paddingTop: Spacing.md,
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
