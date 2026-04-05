import React, { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Platform,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
	useTheme,
	useProduct,
	useCrossSells,
	useAppStore,
} from "@coco/shared/hooks";
import { useDialog } from "@coco/shared/providers";
import { FontSize, FontWeight, Spacing } from "@coco/shared/config/theme";
// Importamos el picker que acabamos de crear
import {
	ScreenHeader,
	InputField,
	PrimaryButton,
	ToggleField,
	VisualizationPicker,
} from "@/components";
import { FormChipSelector } from "@/components/FormChipSelector";

interface RouteParams {
	title?: string;
	groupId?: string;
	originProductId: string;
}

export const CrossSellAssociation = () => {
	const navigation = useNavigation<any>();
	const route = useRoute();
	const insets = useSafeAreaInsets();
	const { title, groupId, originProductId } =
		(route.params as RouteParams) || {};

	const { colors } = useTheme();
	const { showDialog } = useDialog();
	const { user } = useAppStore();

	const { products, loadings: productLoadings } = useProduct();
	const {
		crossSellGroups,
		loadings: crossSellLoadings,
		saveCrossSellGroup,
	} = useCrossSells();

	// 1️⃣ Agregamos visualizationType al estado inicial
	const [formData, setFormData] = useState({
		name: "",
		isAvailable: true,
		visualizationType: "list" as "list" | "grid", // 👈 Estado para el picker
		selectedCrossSellProducts: [] as any[],
	});

	const originProductName =
		products.find((p) => p.id === originProductId)?.name || "Producto";

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		if (!user?.lastActiveBusinessId || !groupId) return;

		try {
			const currentGroup = crossSellGroups.find((g) => g.id === groupId);
			if (currentGroup) {
				const mappedProducts = currentGroup.items
					? currentGroup.items.map((i: any) => {
							return {
								// 🛡️ Usamos suggestedProductId que es el ID REAL del producto
								id: i.suggestedProductId || i.id,
								name: i.name || "Producto sin nombre",
								price: i.normalPrice || 0,
								// 🛡️ Mapeamos la variable en camelCase como viene en el log
								override_price: i.overridePrice ?? null,
							};
						})
					: [];

				setFormData({
					name: currentGroup.name,
					isAvailable: currentGroup.isAvailable ?? true,
					visualizationType: currentGroup.visualizationType || "list",
					selectedCrossSellProducts: mappedProducts,
				});
			}
		} catch (error) {
			console.error("Error cargando datos de edición:", error);
		}
	};

	const handleInputChange = (key: keyof typeof formData, value: any) => {
		setFormData((prev) => ({ ...prev, [key]: value }));
	};

	const handleSave = async () => {
		if (!originProductId) {
			return showDialog({
				title: "Error",
				message: "Falta el identificador del producto base.",
				intent: "error",
			});
		}

		if (!formData.name.trim()) {
			return showDialog({
				title: "Atención",
				message: "El nombre del grupo de sugerencias es obligatorio.",
				intent: "info",
			});
		}

		if (formData.selectedCrossSellProducts.length === 0) {
			return showDialog({
				title: "Atención",
				message:
					"Debes vincular al menos un producto a través del selector.",
				intent: "info",
			});
		}

		try {
			const itemsToSave = formData.selectedCrossSellProducts.map(
				(p, index) => ({
					suggested_product_id: p.id,
					// 🛡️ Ahora sí mandamos el precio modificado si es que existe
					override_price: p.override_price ?? null,
					position: index + 1,
				}),
			);

			await saveCrossSellGroup(originProductId, groupId, {
				name: formData.name.trim(),
				is_available: formData.isAvailable,
				visualization_type: formData.visualizationType,
				items: itemsToSave,
			});

			showDialog({
				title: "¡Éxito!",
				message:
					"Las ventas cruzadas han sido guardadas correctamente.",
				intent: "success",
			});

			navigation.goBack();
		} catch (error) {
			console.error(error);
			showDialog({
				title: "Error",
				message:
					"No pudimos guardar las ventas cruzadas en este momento.",
				intent: "error",
			});
		}
	};

	const handleRemoveProduct = (productId: string) => {
		const filtered = formData.selectedCrossSellProducts.filter(
			(p) => p.id !== productId,
		);
		handleInputChange("selectedCrossSellProducts", filtered);
	};

	const isSaving = crossSellLoadings.saveGroup || crossSellLoadings.saveItems;

	if (productLoadings.fetch || crossSellLoadings.fetch) {
		return (
			<View
				style={[
					styles.centered,
					{ backgroundColor: colors.backgroundLight },
				]}
			>
				<ActivityIndicator size="large" color={colors.businessBg} />
			</View>
		);
	}

	return (
		<View style={{ flex: 1, backgroundColor: colors.backgroundLight }}>
			<ScreenHeader
				title={title || "Asociación de Ventas Cruzadas"}
				fontSizeTitle={FontSize.xl}
				onBack={() => navigation.goBack()}
			/>

			<KeyboardAwareScrollView
				style={{ flex: 1 }}
				contentContainerStyle={styles.scrollContent}
				keyboardShouldPersistTaps="handled"
				enableOnAndroid={true}
				extraScrollHeight={16}
				showsVerticalScrollIndicator={false}
			>
				<Text
					style={[
						styles.headerSub,
						{ color: colors.textSecondaryLight },
					]}
				>
					Configura productos sugeridos que se ofrecerán al cliente
					cuando elija el producto base.
				</Text>

				<View style={styles.inputContainer}>
					<Text
						style={[
							styles.label,
							{ color: colors.textPrimaryLight },
						]}
					>
						Producto Base
					</Text>
					<View
						style={[
							styles.readOnlyBox,
							{ backgroundColor: colors.borderLight },
						]}
					>
						<Text
							style={{
								color: colors.textPrimaryLight,
								fontWeight: FontWeight.bold,
							}}
						>
							{originProductName}
						</Text>
					</View>
				</View>

				<InputField
					label="Nombre del grupo de sugerencias"
					placeholder="Ej. Sugerencias del Chef o Completa tu orden"
					value={formData.name}
					onChangeText={(val) => handleInputChange("name", val)}
					editable={!isSaving}
				/>

				<FormChipSelector
					label="Productos sugeridos"
					addButtonLabel="Agregar"
					items={formData.selectedCrossSellProducts}
					maxVisibleChips={3}
					getLabel={(item) => item.name}
					getKey={(item) => item.id}
					disabled={isSaving}
					onPressAdd={() => {
						/* 🛠️ Extraemos SOLO los IDs para mandarlos a la navegación */
						const selectedProductIds =
							formData.selectedCrossSellProducts.map((p) => p.id);

						navigation.navigate("CrossSellItemsConfig", {
							originProductId: originProductId,
							alreadySelectedProductIds: selectedProductIds,
							onSaveConfig: (newConfiguredProduct: any) => {
								setFormData((prev) => ({
									...prev,
									selectedCrossSellProducts: [
										...prev.selectedCrossSellProducts,
										newConfiguredProduct,
									],
								}));
							},
						});
					}}
					onRemoveItem={(id) => {
						if (!isSaving) {
							handleRemoveProduct(id);
						}
					}}
					onPressItem={(item) => {}}
				/>

				{/* 3️⃣ Añadimos el VisualizationPicker justo debajo de la selección de productos */}
				<View style={styles.pickerWrapper}>
					<VisualizationPicker
						type={formData.visualizationType}
						setType={(type) =>
							handleInputChange("visualizationType", type)
						}
						label="Estilo de visualización"
						showLabel={true}
					/>
				</View>

				<ToggleField
					label="Grupo Disponible"
					activeDescription="Este grupo de sugerencias se muestra en el menú."
					inactiveDescription="Este grupo de sugerencias está oculto en el menú."
					value={formData.isAvailable}
					onValueChange={(val) =>
						handleInputChange("isAvailable", val)
					}
					disabled={isSaving}
				/>
			</KeyboardAwareScrollView>

			<View
				style={[
					styles.bottomContainer,
					{
						borderTopColor: colors.borderLight,
						backgroundColor: colors.backgroundLight,
					},
					isSaving && { opacity: 0.5 },
				]}
			>
				<PrimaryButton
					title={`Guardar cambios`}
					onPress={handleSave}
					disabled={isSaving}
					loading={isSaving}
					marginBottom={
						Platform.OS === "ios" ? insets.bottom : Spacing.md
					}
				/>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	scrollContent: { paddingHorizontal: 16, paddingBottom: 20 },
	centered: { flex: 1, justifyContent: "center", alignItems: "center" },
	headerSub: { fontSize: FontSize.md, marginBottom: 20, marginTop: 4 },
	inputContainer: { marginBottom: 15 },
	label: {
		fontSize: FontSize.sm,
		fontWeight: FontWeight.bold,
		marginBottom: 8,
	},
	readOnlyBox: {
		padding: 14,
		borderRadius: 8,
		marginTop: 4,
	},
	bottomContainer: { padding: 16, borderTopWidth: 1 },
	pickerWrapper: {
		marginBottom: 15, // Mantenemos la consistencia de separación del formulario
	},
});
