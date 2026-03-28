import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	TouchableOpacity,
	Image,
	Switch,
	TextInput,
	RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@coco/shared/config/theme";
import { useNavigation } from "@react-navigation/native";
import { Product } from "@coco/shared/core/entities/Product";
import { useProducts } from "../../../shared/hooks/useProducts";
import { db } from "@/infrastructure/firebase/config";
import { useBusiness } from "@coco/shared/hooks/useBusiness";
import { useAppStore } from "@coco/shared/hooks/useAppStore";

export const ProductCatalogScreen = () => {
	const navigation = useNavigation<any>();
	const [search, setSearch] = useState("");
	const { user } = useAppStore();

	const { activeBusiness } = useBusiness(db, user?.id);
	const { products, refreshing, onRefresh } = useProducts(
		db,
		activeBusiness?.id,
	);

	const renderProductItem = ({ item }: { item: Product }) => (
		<TouchableOpacity
			style={styles.productCard}
			onPress={() =>
				navigation.navigate("ProductForm", { productId: item.id })
			}
		>
			<View style={styles.imagePlaceholder}>
				{item.imageUrl ? (
					<Image
						source={{ uri: item.imageUrl }}
						style={styles.image}
					/>
				) : (
					<Text style={styles.imageText}>🌮</Text>
				)}
			</View>

			<View style={styles.productInfo}>
				<View style={styles.titleRow}>
					<Text style={styles.productName}>{item.name}</Text>
					<Text style={styles.categoryBadge}>{item.category}</Text>
				</View>
				<Text style={styles.productDesc} numberOfLines={1}>
					{item.description || "Sin descripción"}
				</Text>
				<Text style={styles.productPrice}>
					${item.price.toFixed(2)}
				</Text>
			</View>

			<View style={styles.statusContainer}>
				<Switch
					value={item.isAvailable}
					onValueChange={() => {
						/* Lógica de toggle posterior */
					}}
					trackColor={{ false: "#D1D1D1", true: "#C45E1A" }}
					thumbColor="white"
				/>
				<Text
					style={[
						styles.statusText,
						{ color: item.isAvailable ? "#2D6A4F" : "#E76F51" },
					]}
				>
					{item.isAvailable ? "Activo" : "Pausado"}
				</Text>
			</View>
		</TouchableOpacity>
	);

	return (
		<SafeAreaView style={styles.container} edges={["top"]}>
			<View style={styles.header}>
				<Text style={styles.title}>Mi Catálogo</Text>
				<TextInput
					style={styles.searchBar}
					placeholder="Buscar producto..."
					value={search}
					onChangeText={setSearch}
				/>
			</View>

			<FlatList
				data={products}
				keyExtractor={(item) => item.id}
				renderItem={renderProductItem}
				contentContainerStyle={styles.listContent}
				ListEmptyComponent={
					<View style={styles.emptyContainer}>
						<Text style={styles.emptyText}>
							No tienes productos registrados.
						</Text>
					</View>
				}
				refreshing={refreshing}
				onRefresh={onRefresh}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						colors={[Colors.businessBg]} // Android
						tintColor={Colors.businessBg} // iOS
					/>
				}
			/>

			{/* Floating Action Button (FAB) */}
			<TouchableOpacity
				style={styles.fab}
				onPress={() => navigation.navigate("ProductForm")}
			>
				<Text style={styles.fabText}>+</Text>
			</TouchableOpacity>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#F8F9FA" },
	header: { padding: 20, backgroundColor: "white" },
	title: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 15,
	},
	searchBar: {
		backgroundColor: "#F1F3F5",
		padding: 12,
		borderRadius: 10,
		fontSize: 16,
	},
	listContent: { padding: 20, paddingBottom: 100 },
	productCard: {
		backgroundColor: "white",
		borderRadius: 15,
		padding: 12,
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 15,
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 3,
	},
	imagePlaceholder: {
		width: 60,
		height: 60,
		borderRadius: 10,
		backgroundColor: "#FFF5EB",
		justifyContent: "center",
		alignItems: "center",
	},
	image: { width: 60, height: 60, borderRadius: 10 },
	imageText: { fontSize: 30 },
	productInfo: { flex: 1, marginLeft: 15 },
	titleRow: { flexDirection: "row", alignItems: "center" },
	productName: { fontSize: 16, fontWeight: "bold", color: "#333" },
	categoryBadge: {
		fontSize: 10,
		backgroundColor: "#EEE",
		paddingHorizontal: 6,
		paddingVertical: 2,
		borderRadius: 4,
		marginLeft: 8,
		color: "#666",
		textTransform: "uppercase",
	},
	productDesc: { fontSize: 13, color: "#888", marginTop: 2 },
	productPrice: {
		fontSize: 15,
		fontWeight: "bold",
		color: Colors.businessBg,
		marginTop: 4,
	},
	statusContainer: { alignItems: "center", marginLeft: 10 },
	statusText: { fontSize: 10, fontWeight: "bold", marginTop: 4 },
	fab: {
		position: "absolute",
		bottom: 30,
		right: 30,
		backgroundColor: Colors.businessBg,
		width: 60,
		height: 60,
		borderRadius: 30,
		justifyContent: "center",
		alignItems: "center",
		elevation: 5,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 5,
	},
	fabText: { color: "white", fontSize: 30, fontWeight: "bold" },
	emptyContainer: { marginTop: 50, alignItems: "center" },
	emptyText: { color: "#999", fontSize: 16 },
});
