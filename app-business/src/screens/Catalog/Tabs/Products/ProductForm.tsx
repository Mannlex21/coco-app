import React, { useEffect, useState } from "react";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { useDialog } from "@coco/shared/providers/DialogContext";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
	ActivityIndicator,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	Platform,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useProduct, useSection } from "@coco/shared/hooks/supabase";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
	FontSize,
	BorderRadius,
	FontWeight,
	Spacing,
} from "@coco/shared/config/theme";
import { ScreenHeader } from "../../components/ScreenHeader";
import { InputField } from "../../components/InputField";
import { ToggleField } from "../../components/ToggleField";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Ionicons } from "@expo/vector-icons";
import { ChipList } from "../../components/ChipList";
interface RouteParams {
	title?: string;
	productId?: string;
	sectionId?: string;
	selectedSections?: string[]; // 🌟 Recibimos el objeto completo desde el Picker
}

export const ProductForm = () => {
	const navigation = useNavigation<any>();
	const route = useRoute<any>();
	const insets = useSafeAreaInsets();
	const { productId, sectionId } = (route.params as RouteParams) || {};
	const [currentProductId] = useState(productId);
	const { colors } = useTheme();
	const { showDialog } = useDialog();
	const { saveProduct, getProductById, loadingProduct } = useProduct();
	const { sections, fetchSections } = useSection();

	const subTextColor = colors.textSecondaryLight;
	const borderColor = colors.borderLight;
	const bgApp = colors.backgroundLight;

	const [loading, setLoading] = useState(false);

	const [formData, setFormData] = useState({
		name: "",
		description: "",
		price: "",
		isAvailable: true,
		selectedSection: [] as string[], // 🌟 Almacena puros IDs
	});

	useEffect(() => {
		loadData();
	}, []);

	useEffect(() => {
		const params = route.params as RouteParams;

		// 1. Validamos que existan las secciones en los parámetros
		if (params?.selectedSections) {
			setFormData((prev) => ({
				...prev,
				// 🚀 El truco está aquí: Si params.selectedSections es falsy, cae en []
				selectedSection: params.selectedSections || [],
			}));

			// Limpiamos los parámetros para que no se cicle
			navigation.setParams({ selectedSections: undefined });
		}
	}, [route.params]);

	const loadData = async () => {
		setLoading(true);
		try {
			await fetchSections("");

			if (currentProductId) {
				const currentProduct = await getProductById(currentProductId);

				if (currentProduct) {
					setFormData({
						name: currentProduct.name,
						description: currentProduct.description || "",
						price: currentProduct.price?.toString() || "",
						isAvailable: currentProduct.isAvailable,
						selectedSection: currentProduct.sectionIds || [],
					});
				}
			} else if (sectionId) {
				setFormData((prev) => ({
					...prev,
					selectedSection: [sectionId],
				}));
			}
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const handleRemoveSection = (id: string) => {
		setFormData((prev) => ({
			...prev,
			selectedSection: prev.selectedSection.filter(
				(secId) => secId !== id,
			),
		}));
	};

	const handleSave = async () => {
		if (!formData.name.trim()) {
			return showDialog({
				title: "Atención",
				message: "El nombre del producto es obligatorio.",
				intent: "info",
			});
		}

		if (formData.selectedSection.length === 0) {
			return showDialog({
				title: "Atención",
				message:
					"Debes seleccionar al menos una sección para este producto.",
				intent: "info",
			});
		}

		try {
			await saveProduct(currentProductId, {
				name: formData.name.trim(),
				description: formData.description.trim(),
				price: Number.parseFloat(formData.price) || 0,
				isAvailable: formData.isAvailable,
				sectionIds: formData.selectedSection,
			});
			showDialog({
				title: "¡Éxito!",
				message: "El producto ha sido guardado correctamente.",
				intent: "success",
				onConfirm: () => navigation.goBack(),
			});
		} catch (error) {
			console.error(error);
			showDialog({
				title: "Error",
				message: "No pudimos guardar el producto en este momento.",
				intent: "error",
			});
		}
	};

	if (loading) {
		return (
			<View style={[styles.centered, { backgroundColor: bgApp }]}>
				<ActivityIndicator size="large" color={colors.businessBg} />
			</View>
		);
	}

	return (
		<View style={{ flex: 1, backgroundColor: bgApp }}>
			<ScreenHeader
				title={currentProductId ? "Editar Producto" : "Nuevo Producto"}
				onBack={() => navigation.goBack()}
			/>

			<KeyboardAwareScrollView
				style={{ flex: 1 }}
				contentContainerStyle={styles.scrollContent}
				keyboardShouldPersistTaps="handled"
				enableOnAndroid={true}
				extraScrollHeight={Spacing.md}
				showsVerticalScrollIndicator={false}
			>
				<Text style={[styles.headerSub, { color: subTextColor }]}>
					Llena los datos del artículo para mostrarlo en tu catálogo.
				</Text>

				<InputField
					label="Nombre del artículo"
					placeholder="Ej. Hamburguesa Doble Queso"
					value={formData.name}
					onChangeText={(val) =>
						setFormData({ ...formData, name: val })
					}
					editable={!loadingProduct}
				/>

				<InputField
					label="Precio (MXN)"
					placeholder="0.00"
					value={formData.price}
					onChangeText={(val) =>
						setFormData({ ...formData, price: val })
					}
					keyboardType="numeric"
					editable={!loadingProduct}
				/>

				<InputField
					label="Descripción"
					placeholder="Ingredientes, porciones, etc..."
					value={formData.description}
					onChangeText={(val) =>
						setFormData({ ...formData, description: val })
					}
					multiline
					editable={!loadingProduct}
				/>

				<View style={[styles.divider]}>
					<Text style={[styles.label, { color: subTextColor }]}>
						¿En qué sección(es) aparece este producto?
					</Text>

					<TouchableOpacity
						style={[
							styles.addProductBtn,
							{ borderColor: colors.businessBg },
						]}
						onPress={() => {
							navigation.navigate("SectionPicker", {
								alreadySelectedSections:
									formData.selectedSection,
								returnScreen: "ProductForm",
							});
						}}
					>
						<Ionicons
							name="add-circle-outline"
							size={20}
							color={colors.businessBg}
						/>
						<Text
							style={[
								styles.addProductBtnText,
								{ color: colors.businessBg },
							]}
						>
							Vincular secciones
						</Text>
					</TouchableOpacity>

					{/* 🌟 Pintamos los chips buscando la data completa desde el hook local */}
					<ChipList
						items={sections.filter((section) =>
							formData.selectedSection?.includes(section.id),
						)}
						getLabel={(item) => item.name}
						onRemoveProduct={(id) => handleRemoveSection(id)}
					/>
				</View>

				<View style={[styles.divider]}>
					<ToggleField
						label="Disponibilidad"
						activeDescription="Los clientes pueden ver este producto"
						inactiveDescription="Producto oculto"
						value={formData.isAvailable}
						onValueChange={(val) =>
							setFormData({ ...formData, isAvailable: val })
						}
						disabled={loadingProduct}
					/>
				</View>
			</KeyboardAwareScrollView>

			<View
				style={[
					styles.bottomContainer,
					{ borderTopColor: borderColor, backgroundColor: bgApp },
				]}
			>
				<PrimaryButton
					title={`Guardar cambios`}
					onPress={handleSave}
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
		marginBottom: Spacing.lg,
		marginTop: Spacing.xs,
	},
	label: {
		fontSize: FontSize.sm,
		fontWeight: FontWeight.bold,
		marginBottom: Spacing.sm,
		marginTop: Spacing.md,
	},
	divider: {
		marginVertical: Spacing.xs,
	},
	bottomContainer: {
		padding: Spacing.md,
		borderTopWidth: 1,
	},
	addProductBtn: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		padding: Spacing.md,
		borderRadius: BorderRadius.md,
		borderWidth: 1,
		borderStyle: "dashed",
		marginTop: Spacing.xs,
		gap: Spacing.xs,
	},
	addProductBtnText: {
		fontWeight: FontWeight.semibold,
		fontSize: FontSize.sm,
	},
});
