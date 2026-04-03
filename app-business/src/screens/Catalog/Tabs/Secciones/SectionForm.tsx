import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	ActivityIndicator,
	Platform,
	TouchableOpacity,
} from "react-native";
import { FontSize, BorderRadius, FontWeight } from "@coco/shared/config/theme";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { useDialog } from "@coco/shared/providers/DialogContext";
import { useSection } from "@coco/shared/hooks/supabase";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Ionicons } from "@expo/vector-icons";
import { Product } from "@coco/shared/core/entities/";
import { VisualizationPicker } from "../../components/VisualizationPicker";
import { InputField } from "../../../../components/InputField";
import { ToggleField } from "../../components/ToggleField";
import { ChipList } from "../../components/ChipList";
import { ScreenHeader } from "../../components/ScreenHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PrimaryButton } from "../../components/PrimaryButton";

export const SectionForm = () => {
	const navigation = useNavigation<any>();
	const route = useRoute<any>();
	const { colors } = useTheme();
	const { showDialog } = useDialog();
	const [sectionId, setSectionId] = useState(undefined);
	const insets = useSafeAreaInsets();
	const { getSectionById, saveSection } = useSection();
	const textColor = colors.textPrimaryLight;
	const subTextColor = colors.textSecondaryLight;
	const borderColor = colors.borderLight;
	const bgApp = colors.backgroundLight;

	const [formData, setFormData] = useState({
		name: "",
		description: "",
		isAvailable: true,
		visualizationType: "list" as "list" | "grid",
		selectedProducts: [] as Product[],
	});

	const [loading, setLoading] = useState(false);
	const [fetchingData, setFetchingData] = useState(false);

	const handleInputChange = (key: keyof typeof formData, value: any) => {
		setFormData((prev) => ({ ...prev, [key]: value }));
	};

	useEffect(() => {
		if (route.params?.selectedProducts) {
			handleInputChange(
				"selectedProducts",
				route.params.selectedProducts,
			);
		}
	}, [route.params?.selectedProducts]);

	useEffect(() => {
		if (route.params?.sectionId) {
			setSectionId(route.params.sectionId);
		}
	}, [route.params?.sectionId]);

	useEffect(() => {
		if (sectionId) {
			(async () => {
				setFetchingData(true);
				try {
					const data = await getSectionById(sectionId);
					if (data) {
						setFormData({
							name: data.name,
							description: data.description || "",
							isAvailable: data.isAvailable,
							visualizationType: data.visualizationType || "list",
							selectedProducts: data.products || [],
						});
					}
				} catch (error) {
					console.error("Error fetching section data:", error);
					showDialog({
						title: "Error",
						message:
							"No se pudieron cargar los datos de la sección.",
						intent: "error",
					});
					navigation.goBack();
				} finally {
					setFetchingData(false);
				}
			})();
		}
	}, [sectionId, getSectionById]);

	const handleRemoveProduct = (productId: string) => {
		const filteredProducts = formData.selectedProducts.filter(
			(p) => p.id !== productId,
		);
		handleInputChange("selectedProducts", filteredProducts);
	};

	const handleSave = async () => {
		if (!formData.name.trim()) {
			showDialog({
				title: "Campo requerido",
				message: "Por favor, escribe un nombre para la sección.",
				intent: "error",
			});
			return;
		}

		setLoading(true);
		try {
			const productIds = formData.selectedProducts.map((p) => p.id);
			await saveSection(sectionId, {
				name: formData.name.trim(),
				description: formData.description.trim(),
				isAvailable: formData.isAvailable,
				visualizationType: formData.visualizationType,
				productIds,
			});

			showDialog({
				title: "¡Éxito!",
				message: `La sección ha sido ${sectionId ? "actualizada" : "creada"} correctamente.`,
				intent: "success",
				onConfirm: () => navigation.goBack(),
			});
		} catch (error: any) {
			showDialog({
				title: "Error",
				message: error.message || "No se pudo guardar la sección.",
				intent: "error",
			});
		} finally {
			setLoading(false);
		}
	};

	if (fetchingData) {
		return (
			<View style={[styles.centered, { backgroundColor: bgApp }]}>
				<ActivityIndicator size="large" color={colors.businessBg} />
			</View>
		);
	}

	return (
		<View style={{ flex: 1, backgroundColor: bgApp }}>
			<ScreenHeader
				title={sectionId ? "Editar Sección" : "Nueva Sección"}
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
				<Text style={[styles.headerSub, { color: subTextColor }]}>
					Organiza tus productos en categorías (ej. Entradas,
					Bebidas).
				</Text>

				<InputField
					label="Nombre de la sección"
					placeholder="Ejemplo: Hamburguesas, Bebidas o Postres"
					value={formData.name}
					onChangeText={(text) => handleInputChange("name", text)}
					editable={!loading}
					showLabel={true}
				/>

				<InputField
					label="Descripción (Opcional)"
					placeholder="Ejemplo: Todos nuestros combos incluyen papas y refresco."
					value={formData.description}
					onChangeText={(text) =>
						handleInputChange("description", text)
					}
					multiline
					editable={!loading}
					showLabel={true}
				/>

				<View style={[styles.divider]}>
					<VisualizationPicker
						type={formData.visualizationType}
						setType={(type) =>
							handleInputChange("visualizationType", type)
						}
						subTextColor={subTextColor}
						textColor={textColor}
						borderColor={borderColor}
						businessBg={colors.businessBg}
						label="Visualización de productos"
					/>
				</View>

				<View style={[styles.divider]}>
					<Text style={[styles.label, { color: subTextColor }]}>
						Productos en esta sección
					</Text>

					<TouchableOpacity
						style={[
							styles.addProductBtn,
							{ borderColor: colors.businessBg },
						]}
						onPress={() =>
							navigation.navigate("ProductPicker", {
								alreadySelectedProducts:
									formData.selectedProducts,
							})
						}
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
							Vincular productos
						</Text>
					</TouchableOpacity>

					<ChipList
						items={formData.selectedProducts}
						getLabel={(item) => item.name}
						onRemoveProduct={(id) => handleRemoveProduct(id)}
					/>
				</View>

				<View
					style={[
						styles.dividerLine,
						{ backgroundColor: borderColor },
					]}
				/>

				<View style={[styles.divider]}>
					<ToggleField
						label="Disponibilidad"
						activeDescription="Los clientes pueden ver esta sección"
						inactiveDescription="Sección oculta"
						value={formData.isAvailable}
						onValueChange={(val) =>
							handleInputChange("isAvailable", val)
						}
						disabled={loading}
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
					title="Guardar Cambios"
					onPress={handleSave}
					loading={loading}
					marginBottom={Platform.OS === "ios" ? insets.bottom : 12}
				/>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	scrollContent: {
		paddingHorizontal: 16,
		paddingBottom: 20,
	},
	centered: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	headerSub: {
		fontSize: FontSize.md,
		marginBottom: 20,
		marginTop: 4,
	},
	label: {
		fontSize: FontSize.md,
		fontWeight: FontWeight.bold,
		marginBottom: 8,
		marginTop: 15,
	},
	divider: {
		marginVertical: 5,
	},
	// Le cambié el nombre para no confundirlo con el marginVertical
	dividerLine: {
		height: 1,
		marginVertical: 5,
	},
	addProductBtn: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		padding: 12,
		borderRadius: BorderRadius.md,
		borderWidth: 1,
		borderStyle: "dashed",
		marginTop: 5,
		gap: 6,
	},
	addProductBtnText: {
		fontWeight: "600",
		fontSize: 14,
	},
	bottomContainer: {
		padding: 16,
		borderTopWidth: 1,
	},
});
