import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	TouchableOpacity,
	Image,
	RefreshControl,
} from "react-native";
import {
	BorderRadius,
	Shadow,
	Spacing,
	FontSize,
	FontWeight,
} from "@coco/shared/config/theme";
import { useNavigation } from "@react-navigation/native";
import { Product } from "@coco/shared/core/entities/Product";
import { useCatalog } from "@coco/shared/hooks/supabase";
import { useAppStore } from "@coco/shared/hooks/useAppStore";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { useDialog } from "@coco/shared/providers/DialogContext";
import { supabase } from "@/infrastructure/supabase/config";
import { SectionsTab } from "./Components/Secciones/SectionsTab";
import { Ionicons } from "@expo/vector-icons";

// Tipado de las pestañas
type TabType = "productos" | "secciones" | "modificadores";

export const CatalogScreen = () => {
	const [search, setSearch] = useState("");
	const { user } = useAppStore();
	const { colors } = useTheme();

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
					{ backgroundColor: colors.surfaceLight },
				]}
			>
				<Text
					style={[styles.title, { color: colors.textPrimaryLight }]}
				>
					Mi Catálogo
				</Text>

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
						title="Modificadores"
						icon={<Ionicons name="add-circle-outline" size={16} />}
						active={activeTab === "modificadores"}
						onPress={() => setActiveTab("modificadores")}
					/>
				</View>
			</View>

			{/* =======================================================
                CONTENIDO DINÁMICO (Cambia según la pestaña activa)
               ======================================================= */}
			{activeTab === "secciones" && (
				<SectionsTab search={search} businessId={businessId} />
			)}
			{activeTab === "productos" && (
				<ProductsTab search={search} businessId={businessId} />
			)}

			{activeTab === "modificadores" && (
				<View style={styles.emptyContainer}>
					<Text style={{ color: colors.textSecondaryLight }}>
						🚧 Pestaña de Modificadores en construcción...
					</Text>
				</View>
			)}
		</View>
	);
};

/* ============================================================================
   📦 COMPONENTE: PESTAÑA DE PRODUCTOS
   ============================================================================ */
const ProductsTab = ({
	search,
	businessId,
}: {
	search: string;
	businessId?: string;
}) => {
	const navigation = useNavigation<any>();
	const { colors } = useTheme();
	const { showDialog } = useDialog();
	const [menuVisible, setMenuVisible] = useState(false);
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(
		null,
	);

	const {
		products,
		refreshing,
		onRefresh,
		deleteProduct,
		toggleAvailability,
	} = useCatalog(supabase, businessId);

	const filteredProducts = products.filter((p) =>
		p.name.toLowerCase().includes(search.toLowerCase()),
	);

	const handleDelete = (product: Product) => {
		showDialog({
			title: "Eliminar Producto",
			message: `¿Estás seguro de que quieres eliminar "${product.name}"?`,
			intent: "error",
			onConfirm: async () => {
				try {
					await deleteProduct(product.id);
					showDialog({
						title: "Eliminado",
						message: "Producto borrado.",
						intent: "success",
					});
				} catch (error) {
					showDialog({
						title: "Error",
						message: "No se pudo borrar.",
						intent: "error",
					});
				}
			},
		});
	};

	return (
		<>
			<FlatList
				data={filteredProducts}
				keyExtractor={(item) => item.id}
				contentContainerStyle={styles.listContent}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						colors={[colors.businessBg]}
					/>
				}
				renderItem={({ item }) => (
					<TouchableOpacity
						style={[
							styles.productCard,
							{
								backgroundColor: colors.surfaceLight,
								opacity: item.isAvailable ? 1 : 0.6,
							},
						]}
						onPress={() => {
							setSelectedProduct(item);
							setMenuVisible(true);
						}}
					>
						<View
							style={[
								styles.imagePlaceholder,
								{ backgroundColor: colors.backgroundLight },
							]}
						>
							{item.imageUrl ? (
								<Image
									source={{ uri: item.imageUrl }}
									style={styles.image}
								/>
							) : (
								<Text style={styles.imageText}>🍔</Text>
							)}
						</View>
						<View style={styles.productInfo}>
							<Text
								style={[
									styles.productName,
									{ color: colors.textPrimaryLight },
								]}
							>
								{item.name}
							</Text>
							<Text
								style={[
									styles.productDesc,
									{ color: colors.textSecondaryLight },
								]}
								numberOfLines={1}
							>
								{item.description || "Sin descripción"}
							</Text>
							<Text
								style={[
									styles.productPrice,
									{ color: colors.businessBg },
								]}
							>
								${item.price.toFixed(2)}
							</Text>
						</View>
						<View style={styles.rightProductInfo}>
							<Text
								style={[
									styles.statusText,
									{
										color: item.isAvailable
											? colors.success
											: colors.error,
									},
								]}
							>
								{item.isAvailable ? "Activo" : "Pausado"}
							</Text>
						</View>
					</TouchableOpacity>
				)}
			/>

			{/* FAB para Productos */}
			<TouchableOpacity
				style={[styles.fab, { backgroundColor: colors.businessBg }]}
				onPress={() =>
					navigation.navigate("ProductForm", {
						title: "Nuevo Producto",
					})
				}
			>
				<Text style={[styles.fabText, { color: colors.textOnPrimary }]}>
					+
				</Text>
			</TouchableOpacity>
		</>
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
				{/* 🎨 Clonamos el icono para inyectarle el color dinámico */}
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
	header: { padding: Spacing.md },
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
	searchBar: {
		padding: Spacing.md,
		borderRadius: BorderRadius.md,
		fontSize: FontSize.md,
		borderWidth: 1,
	},
	listContent: { padding: Spacing.md, paddingBottom: 100 },
	productCard: {
		padding: Spacing.md,
		flexDirection: "row",
		alignItems: "center",
		marginBottom: Spacing.md,
		borderRadius: BorderRadius.lg,
		...Shadow.md,
	},
	imagePlaceholder: {
		width: 60,
		height: 60,
		borderRadius: BorderRadius.md,
		justifyContent: "center",
		alignItems: "center",
	},
	image: { width: 60, height: 60, borderRadius: BorderRadius.md },
	imageText: { fontSize: FontSize.title },
	productInfo: { flex: 1, marginLeft: Spacing.md },
	productName: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
	productDesc: { fontSize: FontSize.sm, marginTop: 2 },
	productPrice: {
		fontSize: FontSize.md,
		fontWeight: FontWeight.bold,
		marginTop: 4,
	},
	rightProductInfo: { marginLeft: Spacing.sm },
	statusText: {
		textAlign: "right",
		fontSize: FontSize.xs,
		fontWeight: FontWeight.bold,
		marginTop: 4,
	},
	actionsContainer: { flexDirection: "row", gap: Spacing.xs },
	actionBtn: {
		width: 40,
		height: 40,
		borderRadius: BorderRadius.md,
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 1,
		borderColor: "rgba(0,0,0,0.05)",
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
	fabText: { fontSize: FontSize.title, fontWeight: FontWeight.bold },
	emptyContainer: { marginTop: 50, alignItems: "center" },
});
