import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	TextInput,
	TouchableOpacity,
	ActivityIndicator,
	Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { useProduct } from "@coco/shared/hooks/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Product } from "@coco/shared/core/entities/";
import {
	FontSize,
	FontWeight,
	BorderRadius,
	Spacing,
} from "@coco/shared/config/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenHeader } from "../../components/ScreenHeader";
import { PrimaryButton } from "../../components/PrimaryButton";

export const ProductPicker = () => {
	const navigation = useNavigation<any>();
	const route = useRoute<any>();
	const { colors, isDark } = useTheme();
	const insets = useSafeAreaInsets();

	const { alreadySelectedProducts = [] } = route.params || {};

	const { products, loadings, fetchProducts, searchTerm, setSearchTerm } =
		useProduct();

	const [selectedProducts, setSelectedProducts] = useState<Product[]>(
		alreadySelectedProducts,
	);

	const textColor = colors.textPrimaryLight;
	const subTextColor = colors.textSecondaryLight;
	const borderColor = colors.borderLight;
	const bgApp = colors.backgroundLight;
	const bgSearchInput = colors.inputBg;

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
				style={[styles.card, { borderBottomColor: borderColor }]}
				activeOpacity={0.7}
				onPress={() => toggleProductSelection(item)}
			>
				<View style={{ flex: 1 }}>
					<Text style={[styles.name, { color: textColor }]}>
						{item.name}
					</Text>
					<Text
						style={{ color: subTextColor, fontSize: FontSize.sm }}
						numberOfLines={1}
					>
						{item.description || "Sin descripción"}
					</Text>
				</View>

				<Ionicons
					name={isSelected ? "checkbox" : "square-outline"}
					size={24}
					color={isSelected ? colors.businessBg : subTextColor}
				/>
			</TouchableOpacity>
		);
	};

	return (
		<View style={{ flex: 1, backgroundColor: bgApp }}>
			<ScreenHeader
				title="Vincular Productos"
				onBack={() => navigation.goBack()}
				fontSizeTitle={FontSize.xl}
			/>

			<View
				style={[
					styles.searchContainer,
					{
						backgroundColor: bgSearchInput,
						borderColor: borderColor,
					},
				]}
			>
				<Ionicons
					name="search-outline"
					size={18}
					color={subTextColor}
				/>
				<TextInput
					style={[styles.searchInput, { color: textColor }]}
					placeholder="Buscar producto por nombre..."
					placeholderTextColor={
						isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"
					}
					value={searchTerm}
					onChangeText={setSearchTerm}
				/>
				{searchTerm.length > 0 && (
					<TouchableOpacity onPress={() => setSearchTerm("")}>
						<Ionicons
							name="close-circle"
							size={18}
							color={subTextColor}
						/>
					</TouchableOpacity>
				)}
			</View>

			<Text style={[styles.headerSub, { color: subTextColor }]}>
				Busca y selecciona los productos que formarán parte de esta
				sección.
			</Text>

			{loadings.fetch ? (
				<View style={styles.centered}>
					<ActivityIndicator size="large" color={colors.businessBg} />
				</View>
			) : (
				<FlatList
					data={products}
					keyExtractor={(item) => item.id}
					renderItem={renderProductItem}
					contentContainerStyle={styles.scrollContent}
					showsVerticalScrollIndicator={false}
					ListEmptyComponent={
						<Text
							style={[styles.emptyText, { color: subTextColor }]}
						>
							No se encontraron productos.
						</Text>
					}
				/>
			)}

			<View
				style={[
					styles.bottomContainer,
					{ borderTopColor: borderColor, backgroundColor: bgApp },
				]}
			>
				<PrimaryButton
					title={`Guardar cambios (${selectedProducts.length})`}
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
	searchContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginHorizontal: Spacing.md,
		marginBottom: Spacing.sm,
		paddingHorizontal: Spacing.md, // Cambiado de 12 a Spacing.md (16)
		height: 46,
		borderRadius: BorderRadius.md,
		borderWidth: StyleSheet.hairlineWidth,
	},
	searchInput: {
		flex: 1,
		marginLeft: Spacing.sm,
		fontSize: FontSize.md,
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
		marginTop: Spacing.xxl, // Cambiado de 40 a Spacing.xxl (48)
		fontSize: FontSize.md,
	},
	bottomContainer: {
		padding: Spacing.md,
		borderTopWidth: 1,
	},
});
