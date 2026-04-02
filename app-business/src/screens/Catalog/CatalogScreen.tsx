import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Platform,
} from "react-native";
import {
	BorderRadius,
	Spacing,
	FontSize,
	FontWeight,
} from "@coco/shared/config/theme";
import { useAppStore } from "@coco/shared/hooks/useAppStore";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { SectionsTab } from "./Tabs/Secciones/SectionsTab";
import { Ionicons } from "@expo/vector-icons";
import { ProductsTab } from "./Tabs/Products/ProductsTab";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ModifiersGroupTab } from "./Tabs/ModifiersGroup/ModifiersGroupTab";

// Tipado de las pestañas
type TabType = "productos" | "secciones" | "grupoModificadores";

export const CatalogScreen = () => {
	const { user } = useAppStore();
	const { colors } = useTheme();
	const insets = useSafeAreaInsets();
	// 1. ESTADO DE LA PESTAÑA ACTIVA
	const [activeTab, setActiveTab] = useState<TabType>("secciones");

	const businessId = user?.lastActiveBusinessId;

	return (
		<View style={styles.container}>
			{/* =======================================================
                HEADER FIJO (Se mantiene visible en todas las pestañas)
               ======================================================= */}
			<View
				style={[
					styles.header,
					{
						backgroundColor: colors.surfaceLight,
						paddingTop:
							Platform.OS === "android"
								? insets.top - 10
								: insets.top,
					},
				]}
			>
				{/* 🚀 TABS SIN NAVIGATE (Cambian el estado local) */}
				<View style={styles.tabsContainer}>
					<TabButton
						title="Secciones"
						icon={<Ionicons name="folder-open-outline" size={16} />}
						active={activeTab === "secciones"}
						onPress={() => setActiveTab("secciones")}
					/>
					<TabButton
						title="Productos"
						icon={<Ionicons name="cube-outline" size={16} />}
						active={activeTab === "productos"}
						onPress={() => setActiveTab("productos")}
					/>
					<TabButton
						title="Grupo de modificadores"
						icon={<Ionicons name="add-circle-outline" size={16} />}
						active={activeTab === "grupoModificadores"}
						onPress={() => setActiveTab("grupoModificadores")}
					/>
				</View>
			</View>

			{/* =======================================================
                CONTENIDO DINÁMICO (Cambia según la pestaña activa)
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
/* ============================================================================
   🔘 COMPONENTE AUXILIAR: BOTÓN DE PESTAÑA
   ============================================================================ */
type ExpoIconElement = React.ReactElement<
	React.ComponentProps<typeof Ionicons>
>;
const TabButton = ({
	title,
	icon, // 👈 Añadido el prop de icono
	active,
	onPress,
}: {
	title: string;
	icon: ExpoIconElement; // 👈 Tipado para ReactNode
	active: boolean;
	onPress: () => void;
}) => {
	const { colors } = useTheme();

	// 💡 Color dinámico para el texto y el icono basado en el estado activo
	const tintColor = active ? colors.businessBg : colors.textPrimaryLight;

	return (
		<TouchableOpacity
			style={[
				styles.tabButton,
				active && {
					backgroundColor: colors.backgroundLight,
					borderColor: colors.borderLight,
				},
			]}
			onPress={onPress}
		>
			<View
				style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
			>
				{icon && React.isValidElement(icon)
					? React.cloneElement(icon, { color: tintColor })
					: icon}

				<Text
					style={[
						styles.tabText,
						{
							color: tintColor,
							fontWeight: active
								? FontWeight.bold
								: FontWeight.regular,
						},
					]}
				>
					{title}
				</Text>
			</View>
		</TouchableOpacity>
	);
};

/* ============================================================================
   🎨 ESTILOS UNIFICADOS
   ============================================================================ */
const styles = StyleSheet.create({
	container: { flex: 1 },
	header: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
	title: {
		fontSize: FontSize.xxl,
		fontWeight: FontWeight.bold,
		marginBottom: Spacing.md,
	},
	tabsContainer: {
		flexDirection: "row",
		gap: Spacing.xs,
	},
	tabButton: {
		flex: 1,
		paddingVertical: Spacing.sm,
		borderRadius: BorderRadius.md,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 1,
		borderColor: "transparent",
	},
	tabText: { fontSize: FontSize.xs },
	image: { width: 60, height: 60, borderRadius: BorderRadius.md },
	emptyContainer: { marginTop: 50, alignItems: "center" },
});
