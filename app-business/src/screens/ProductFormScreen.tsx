import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	Switch,
	ActivityIndicator,
} from "react-native";
import {
	Spacing,
	BorderRadius,
	FontSize,
	FontWeight,
	Shadow,
} from "@coco/shared/config/theme";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAppStore } from "@coco/shared/hooks/useAppStore";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useProducts } from "../../../shared/hooks/useProducts";
import { db } from "@/infrastructure/firebase/config";
import { Product } from "@coco/shared/core/entities/Product";
import { useDialog } from "@coco/shared/providers/DialogContext";
import { useTheme } from "@coco/shared/hooks/useTheme";

const CATEGORIES = ["tacos", "bebidas", "postres", "combos", "otros"];

export const ProductFormScreen = () => {
	const navigation = useNavigation();
	const route = useRoute<any>();
	const { showDialog } = useDialog();

	const productId = route.params?.productId;
	const isEditMode = !!productId;

	const { activeBusiness } = useAppStore();
	const [fetchingProduct, setFetchingProduct] = useState(isEditMode);

	// 💡 Extraemos si es oscuro o no y el businessBg dinámico
	const { colors, isDark } = useTheme();

	// 🎨 Colores calculados por opacidad (Inmunes a fallos de TypeScript)
	const textColor = isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.85)";
	const subTextColor = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.55)";
	const borderColor = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)";

	// 🧱 Fondos estructurales fijos y seguros
	const backgroundBg = isDark ? "#121212" : "#F8F9FA";
	const cardBg = isDark ? "#1C1C1E" : "#FFFFFF";
	const inputBg = isDark ? "#2C2C2E" : "#F5F5F5";

	const [form, setForm] = useState({
		name: "",
		description: "",
		price: "",
		category: "tacos",
		isAvailable: true,
	});

	const { saveProduct, getProductById, updateProduct, loading } = useProducts(
		db,
		activeBusiness?.id,
	);

	useEffect(() => {
		const fetchProductData = async () => {
			if (!isEditMode || !productId) return;

			try {
				const data = await getProductById(productId);

				if (data) {
					setForm({
						name: data.name || "",
						description: data.description || "",
						price: data.price ? data.price.toString() : "",
						category: data.category || "tacos",
						isAvailable: data.isAvailable ?? true,
					});
				} else {
					showDialog({
						title: "Error",
						message: "No se encontró el producto.",
						intent: "error",
					});
					navigation.goBack();
				}
			} catch (error) {
				console.error("Error:", error);
				showDialog({
					title: "Error",
					message: "No se pudieron cargar los datos del producto.",
					intent: "error",
				});
			} finally {
				setFetchingProduct(false);
			}
		};

		fetchProductData();
	}, [isEditMode, productId]);

	const handleSave = async () => {
		if (!form.name.trim() || !form.price) {
			showDialog({
				title: "Atención",
				message: "Nombre y precio son obligatorios.",
				intent: "warning",
			});
			return;
		}

		try {
			const productData = {
				name: form.name.trim(),
				description: form.description.trim(),
				price: Number.parseFloat(form.price),
				category: form.category as Product["category"],
				isAvailable: form.isAvailable,
			};

			if (isEditMode) {
				await updateProduct(productId, productData);
			} else {
				await saveProduct(productData as any);
			}

			showDialog({
				title: "¡Éxito!",
				message: `Producto ${isEditMode ? "actualizado" : "guardado"} correctamente.`,
				intent: "success",
				onConfirm: () => navigation.goBack(),
			});
		} catch (error) {
			console.error("Error en handleSave:", error);
			showDialog({
				title: "Error",
				message: `No se pudo ${isEditMode ? "actualizar" : "guardar"} el producto.`,
				intent: "error",
			});
		}
	};

	if (fetchingProduct) {
		return (
			<View
				style={[
					styles.loadingContainer,
					{ backgroundColor: backgroundBg },
				]}
			>
				<ActivityIndicator size="large" color={colors.businessBg} />
				<Text style={[styles.loadingText, { color: subTextColor }]}>
					Cargando datos...
				</Text>
			</View>
		);
	}

	return (
		<KeyboardAwareScrollView
			style={[styles.container, { backgroundColor: backgroundBg }]}
			contentContainerStyle={styles.scrollContent}
			keyboardShouldPersistTaps="handled"
			enableOnAndroid={true}
			extraScrollHeight={Spacing.md}
			showsVerticalScrollIndicator={false}
		>
			<View style={[styles.form, { backgroundColor: cardBg }]}>
				<Text style={[styles.label, { color: textColor }]}>
					Nombre del producto *
				</Text>
				<TextInput
					style={[
						styles.input,
						{
							backgroundColor: inputBg,
							color: textColor,
							borderColor,
						},
					]}
					placeholder="Ej. Tacos de Asada"
					placeholderTextColor={subTextColor}
					value={form.name}
					onChangeText={(t) => setForm({ ...form, name: t })}
					editable={!loading}
				/>

				<Text style={[styles.label, { color: textColor }]}>
					Descripción (Opcional)
				</Text>
				<TextInput
					style={[
						styles.input,
						styles.textArea,
						{
							backgroundColor: inputBg,
							color: textColor,
							borderColor,
						},
					]}
					placeholder="¿Qué contiene el platillo?"
					placeholderTextColor={subTextColor}
					multiline
					value={form.description}
					onChangeText={(t) => setForm({ ...form, description: t })}
					editable={!loading}
				/>

				<Text style={[styles.label, { color: textColor }]}>
					Precio ($) *
				</Text>
				<TextInput
					style={[
						styles.input,
						{
							backgroundColor: inputBg,
							color: textColor,
							borderColor,
						},
					]}
					placeholder="0.00"
					placeholderTextColor={subTextColor}
					keyboardType="numeric"
					value={form.price}
					onChangeText={(t) => setForm({ ...form, price: t })}
					editable={!loading}
				/>

				<Text style={[styles.label, { color: textColor }]}>
					Categoría
				</Text>
				<View style={styles.categoryContainer}>
					{CATEGORIES.map((cat) => {
						const isActive = form.category === cat;
						return (
							<TouchableOpacity
								key={cat}
								style={[
									styles.chip,
									{
										backgroundColor: isDark
											? "rgba(255,255,255,0.05)"
											: "#FFFFFF",
										borderColor,
									},
									isActive && {
										backgroundColor: colors.businessBg,
										borderColor: colors.businessBg,
									},
								]}
								onPress={() =>
									setForm({ ...form, category: cat })
								}
								disabled={loading}
							>
								<Text
									style={[
										styles.chipText,
										{ color: subTextColor },
										isActive && { color: "#FFFFFF" },
									]}
								>
									{cat.toUpperCase()}
								</Text>
							</TouchableOpacity>
						);
					})}
				</View>

				<View
					style={[styles.switchRow, { borderTopColor: borderColor }]}
				>
					<View>
						<Text
							style={[styles.switchLabel, { color: textColor }]}
						>
							Disponible para venta
						</Text>
						<Text
							style={[styles.switchSub, { color: subTextColor }]}
						>
							Los clientes podrán verlo en el menú
						</Text>
					</View>
					<Switch
						value={form.isAvailable}
						onValueChange={(v) =>
							setForm({ ...form, isAvailable: v })
						}
						trackColor={{
							false: isDark ? "#3A3A3C" : "rgba(0,0,0,0.1)",
							true: colors.businessBg,
						}}
						thumbColor={isDark ? "#FFFFFF" : "#F5F5F5"}
						disabled={loading}
					/>
				</View>

				<TouchableOpacity
					style={[
						styles.saveBtn,
						{ backgroundColor: colors.businessBg },
						loading && styles.disabledBtn,
					]}
					onPress={handleSave}
					disabled={loading}
				>
					<Text style={styles.saveBtnText}>
						{loading ? "Guardando producto..." : "Guardar Producto"}
					</Text>
				</TouchableOpacity>
			</View>
		</KeyboardAwareScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	scrollContent: {
		padding: Spacing.md,
		paddingBottom: Spacing.xl,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	loadingText: {
		marginTop: Spacing.sm,
		fontSize: FontSize.sm,
	},
	form: {
		padding: Spacing.lg,
		borderRadius: BorderRadius.lg,
		...Shadow.md,
	},
	label: {
		fontSize: FontSize.sm,
		fontWeight: FontWeight.bold,
		marginBottom: Spacing.xs,
		marginTop: Spacing.md,
	},
	input: {
		borderWidth: 1,
		borderRadius: BorderRadius.md,
		padding: Spacing.md,
		fontSize: FontSize.md,
	},
	textArea: {
		height: 100,
		textAlignVertical: "top",
	},
	categoryContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: Spacing.sm,
		marginTop: Spacing.xs,
	},
	chip: {
		paddingHorizontal: Spacing.md,
		paddingVertical: Spacing.sm,
		borderRadius: BorderRadius.full,
		borderWidth: 1,
	},
	chipText: {
		fontSize: FontSize.xs,
		fontWeight: FontWeight.semibold,
	},
	switchRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginTop: Spacing.xl,
		paddingVertical: Spacing.md,
		borderTopWidth: 1,
	},
	switchLabel: {
		fontSize: FontSize.md,
		fontWeight: FontWeight.bold,
	},
	switchSub: {
		fontSize: FontSize.xs,
	},
	saveBtn: {
		padding: Spacing.md,
		borderRadius: BorderRadius.md,
		alignItems: "center",
		marginTop: Spacing.xl,
	},
	disabledBtn: {
		opacity: 0.7,
	},
	saveBtnText: {
		color: "#FFFFFF",
		fontSize: FontSize.md,
		fontWeight: FontWeight.bold,
	},
});
