import React, { useState, useEffect, useCallback } from "react";
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	TextInput,
	TouchableOpacity,
	ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { useProduct } from "@coco/shared/hooks/supabase";
import { supabase } from "@/infrastructure/supabase/config";
import { Ionicons } from "@expo/vector-icons";
import { Product } from "@coco/shared/core/entities/";
import { FontWeight } from "@coco/shared/config/theme";

export const ProductPickerScreen = () => {
	const navigation = useNavigation<any>();
	const route = useRoute<any>();
	const { colors, isDark } = useTheme();

	const { businessId, alreadySelectedProducts = [] } = route.params || {};

	const { products, refreshing, fetchProducts, searchTerm, setSearchTerm } =
		useProduct(supabase, businessId);

	// Estado local para los productos seleccionados (guardamos el objeto completo)
	const [selectedProducts, setSelectedProducts] = useState<Product[]>(
		alreadySelectedProducts,
	);

	useEffect(() => {
		fetchProducts(searchTerm);
	}, [searchTerm, fetchProducts]);

	const toggleProductSelection = (product: Product) => {
		const isSelected = selectedProducts.some((p) => p.id === product.id);
		if (isSelected) {
			setSelectedProducts(
				selectedProducts.filter((p) => p.id !== product.id),
			);
		} else {
			setSelectedProducts([...selectedProducts, product]);
		}
	};

	const handleFinish = () => {
		navigation.popTo("SectionForm", {
			selectedProducts: selectedProducts,
		});
	};

	const renderProductItem = ({ item }: { item: Product }) => {
		const isSelected = selectedProducts.some((p) => p.id === item.id);

		return (
			<TouchableOpacity
				style={[
					styles.productCard,
					{
						backgroundColor: isDark ? "#1C1C1E" : "#FFF",
						borderColor: isSelected
							? colors.businessBg
							: "transparent",
						borderWidth: 2,
					},
				]}
				activeOpacity={0.8}
				onPress={() => toggleProductSelection(item)}
			>
				<View style={{ flex: 1 }}>
					<Text
						style={[
							styles.productName,
							{ color: isDark ? "#FFF" : "#000" },
						]}
					>
						{item.name}
					</Text>
					<Text
						style={{
							color: isDark
								? "rgba(255,255,255,0.6)"
								: "rgba(0,0,0,0.55)",
							fontSize: 13,
						}}
						numberOfLines={1}
					>
						{item.description || "Sin descripción"}
					</Text>
				</View>

				<Ionicons
					name={isSelected ? "checkbox" : "square-outline"}
					size={26}
					color={
						isSelected
							? colors.businessBg
							: isDark
								? "rgba(255,255,255,0.3)"
								: "rgba(0,0,0,0.3)"
					}
				/>
			</TouchableOpacity>
		);
	};

	return (
		<View
			style={[
				styles.container,
				{ backgroundColor: isDark ? "#121212" : "#F8F9FA" },
			]}
		>
			{/* Buscador */}
			<View
				style={[
					styles.searchContainer,
					{ backgroundColor: isDark ? "#1C1C1E" : "#FFF" },
				]}
			>
				<Ionicons
					name="search-outline"
					size={20}
					color={
						isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.55)"
					}
				/>
				<TextInput
					style={[
						styles.searchInput,
						{ color: isDark ? "#FFF" : "#000" },
					]}
					placeholder="Buscar producto por nombre..."
					placeholderTextColor={
						isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"
					}
					value={searchTerm}
					onChangeText={setSearchTerm}
				/>
				{searchTerm.length > 0 && (
					<TouchableOpacity onPress={() => setSearchTerm("")}>
						<Ionicons
							name="close-circle"
							size={20}
							color={
								isDark
									? "rgba(255,255,255,0.6)"
									: "rgba(0,0,0,0.55)"
							}
						/>
					</TouchableOpacity>
				)}
			</View>

			{/* Lista */}
			{refreshing ? (
				<View style={styles.centered}>
					<ActivityIndicator size="large" color={colors.businessBg} />
				</View>
			) : (
				<FlatList
					data={products}
					keyExtractor={(item) => item.id}
					renderItem={renderProductItem}
					contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
					ListEmptyComponent={
						<Text
							style={[
								styles.emptyText,
								{
									color: isDark
										? "rgba(255,255,255,0.4)"
										: "rgba(0,0,0,0.4)",
								},
							]}
						>
							No se encontraron productos.
						</Text>
					}
				/>
			)}

			{/* Botón Flotante de Confirmar */}
			<TouchableOpacity
				style={[styles.fab, { backgroundColor: colors.businessBg }]}
				onPress={handleFinish}
				activeOpacity={0.9}
			>
				<Text style={styles.fabText}>
					Listo ({selectedProducts.length})
				</Text>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1 },
	centered: { flex: 1, justifyContent: "center", alignItems: "center" },
	searchContainer: {
		flexDirection: "row",
		alignItems: "center",
		margin: 20,
		marginBottom: 5,
		paddingHorizontal: 15,
		height: 50,
		borderRadius: 12,
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 5,
	},
	searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
	productCard: {
		flexDirection: "row",
		alignItems: "center",
		padding: 16,
		borderRadius: 12,
		marginBottom: 10,
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 3,
	},
	productName: { fontSize: 16, fontWeight: FontWeight.bold, marginBottom: 2 },
	emptyText: { textAlign: "center", marginTop: 40, fontSize: 16 },
	fab: {
		position: "absolute",
		bottom: 30,
		left: 20,
		right: 20,
		height: 55,
		borderRadius: 16,
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		gap: 8,
		elevation: 5,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
	},
	fabText: { color: "white", fontWeight: FontWeight.bold, fontSize: 16 },
});
