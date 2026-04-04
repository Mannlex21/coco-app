import { useEffect, useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { useDialog } from "@coco/shared/providers";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
	ActivityIndicator,
	StyleSheet,
	Text,
	View,
	Platform,
	TouchableOpacity,
	Image,
} from "react-native";
import {
	useModifiersGroup,
	useProduct,
	useSection,
} from "@coco/shared/hooks/supabase";
import {
	FontSize,
	BorderRadius,
	FontWeight,
	Spacing,
} from "@coco/shared/config/theme";
import {
	ScreenHeader,
	InputField,
	ToggleField,
	PrimaryButton,
} from "@/components";
import { FormChipSelector } from "@/components/FormChipSelector";
import * as ImagePicker from "expo-image-picker";

interface RouteParams {
	title?: string;
	productId?: string;
	sectionId?: string;
	returnScreen: string;
	selectedSections?: string[];
	selectedModifierGroups?: string[];
}

export const ProductForm = () => {
	const navigation = useNavigation<any>();
	const route = useRoute<any>();
	const insets = useSafeAreaInsets();
	const {
		productId,
		sectionId,
		returnScreen = "",
	} = (route.params as RouteParams) || {};
	const [currentProductId] = useState(productId);
	const { colors } = useTheme();
	const { showDialog } = useDialog();
	const { saveProduct, getProductById, loadings } = useProduct();
	const { sections, fetch: fetchSections } = useSection();
	const { modifierGroups, refetch: fetchModifierGroups } =
		useModifiersGroup();

	const subTextColor = colors.textSecondaryLight;
	const borderColor = colors.borderLight;
	const bgApp = colors.backgroundLight;

	const [loading, setLoading] = useState(false);

	const [formData, setFormData] = useState({
		name: "",
		description: "",
		price: "",
		imageUrl: "",
		isAvailable: true,
		selectedSection: [] as string[],
		selectedModifierGroups: [] as string[],
	});

	useEffect(() => {
		loadData();
	}, []);

	useEffect(() => {
		const params = route.params as RouteParams;

		if (params?.selectedSections) {
			setFormData((prev) => ({
				...prev,
				selectedSection: params.selectedSections || [],
			}));
			navigation.setParams({ selectedSections: undefined });
		}
		if (params?.selectedModifierGroups) {
			setFormData((prev) => ({
				...prev,
				selectedModifierGroups: params.selectedModifierGroups || [],
			}));
			navigation.setParams({ selectedModifierGroups: undefined });
		}
	}, [route.params]);

	const loadData = async () => {
		setLoading(true);
		try {
			await fetchSections("");
			await fetchModifierGroups("");

			if (currentProductId) {
				const currentProduct = await getProductById(currentProductId);

				if (currentProduct) {
					setFormData({
						name: currentProduct.name,
						description: currentProduct.description || "",
						price: currentProduct.price?.toString() || "",
						imageUrl: currentProduct.imageUrl || "",
						isAvailable: currentProduct.isAvailable,
						selectedSection: currentProduct.sectionIds || [],
						selectedModifierGroups:
							currentProduct.modifierGroupIds || [],
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

	const handleRemoveModifierGroup = (id: string) => {
		setFormData((prev) => ({
			...prev,
			selectedModifierGroups: prev.selectedModifierGroups.filter(
				(groupId) => groupId !== id,
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
				imageUrl: formData.imageUrl,
				isAvailable: formData.isAvailable,
				sectionIds: formData.selectedSection,
				modifierGroupIds: formData.selectedModifierGroups,
			});
			if (returnScreen === "SectionsTab") {
				fetchSections("");
			}
			showDialog({
				title: "¡Éxito!",
				message: "El producto ha sido guardado correctamente.",
				intent: "success",
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

	const handleSelectImage = async () => {
		const { status } =
			await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== "granted") {
			showDialog({
				title: "Permiso denegado",
				message: "Necesitamos permiso para acceder a tus fotos.",
				type: "info",
			});
			return;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ["images"],
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.5,
		});

		if (!result.canceled) {
			setFormData({ ...formData, imageUrl: result.assets[0].uri });
		}
	};

	const handleDeleteImage = () => {
		setFormData({
			...formData,
			imageUrl: "",
		});
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

				<Text style={styles.label}>Imagen del producto</Text>
				<View style={{ width: "100%" }}>
					<TouchableOpacity
						style={[
							styles.imageContainer,
							{
								borderColor: colors.borderLight,
								backgroundColor: colors.inputBg,
							},
							loadings.save && { opacity: 0.5 }, // 👈 Bloqueo visual de la imagen
						]}
						onPress={handleSelectImage}
						disabled={loadings.save} // 👈 Bloqueo interactivo
					>
						{formData.imageUrl ? (
							<Image
								source={{ uri: formData.imageUrl }}
								style={styles.image}
								resizeMode="cover"
							/>
						) : (
							<View style={styles.imagePlaceholder}>
								<View style={styles.pureCssIcon}>
									<View
										style={[
											styles.iconVertical,
											{
												backgroundColor:
													colors.textSecondaryLight,
											},
										]}
									/>
									<View
										style={[
											styles.iconHorizontal,
											{
												backgroundColor:
													colors.textSecondaryLight,
											},
										]}
									/>
								</View>

								<Text
									style={[
										styles.placeholderText,
										{ color: colors.textSecondaryLight },
									]}
								>
									Subir imagen
								</Text>
							</View>
						)}
					</TouchableOpacity>

					{/* Botones de acción flotantes */}
					{formData.imageUrl && (
						<View style={styles.actionButtonsContainer}>
							<TouchableOpacity
								style={[
									styles.actionBtn,
									{ backgroundColor: colors.surfaceLight },
									loadings.save && { opacity: 0.5 }, // 👈 Bloqueo visual del botón flotante
								]}
								onPress={handleSelectImage}
								disabled={loadings.save} // 👈 Bloqueo interactivo
							>
								<Text
									style={[
										styles.actionBtnText,
										{ color: colors.textPrimaryLight },
									]}
								>
									Cambiar
								</Text>
							</TouchableOpacity>

							<TouchableOpacity
								style={[
									styles.actionBtn,
									{ backgroundColor: colors.errorLight },
									loadings.save && { opacity: 0.5 }, // 👈 Bloqueo visual del botón flotante
								]}
								onPress={handleDeleteImage}
								disabled={loadings.save} // 👈 Bloqueo interactivo
							>
								<Text
									style={[
										styles.actionBtnText,
										{ color: colors.error },
									]}
								>
									Eliminar
								</Text>
							</TouchableOpacity>
						</View>
					)}
				</View>

				<InputField
					label="Nombre del artículo"
					placeholder="Ej. Hamburguesa Doble Queso"
					value={formData.name}
					onChangeText={(val) =>
						setFormData({ ...formData, name: val })
					}
					editable={!loadings.save}
				/>

				<InputField
					label="Precio (MXN)"
					placeholder="0.00"
					value={formData.price}
					onChangeText={(val) =>
						setFormData({ ...formData, price: val })
					}
					keyboardType="numeric"
					editable={!loadings.save}
				/>

				<InputField
					label="Descripción"
					placeholder="Ingredientes, porciones, etc..."
					value={formData.description}
					onChangeText={(val) =>
						setFormData({ ...formData, description: val })
					}
					multiline
					editable={!loadings.save}
				/>

				<FormChipSelector
					label="¿En qué sección(es) aparece este producto?"
					addButtonLabel="Sección"
					disabled={loadings.save} // 👈 Bloqueo al componente Chip
					items={sections.filter((section) =>
						formData.selectedSection?.includes(section.id),
					)}
					maxVisibleChips={3}
					getLabel={(item) => item.name}
					getKey={(item) => item.id}
					onPressAdd={() => {
						navigation.navigate("SectionPicker", {
							alreadySelectedSections: formData.selectedSection,
							returnScreen: "ProductForm",
						});
					}}
					onRemoveItem={(id) => handleRemoveSection(id)}
					onPressItem={() =>
						navigation.navigate("SectionPicker", {
							alreadySelectedSections: formData.selectedSection,
							returnScreen: "ProductForm",
						})
					}
				/>

				<FormChipSelector
					label="¿Qué grupos de modificadores aplican?"
					addButtonLabel="Modificador"
					addButtonIcon="add"
					disabled={loadings.save} // 👈 Bloqueo al componente Chip
					maxVisibleChips={3}
					items={modifierGroups.filter((group) =>
						formData.selectedModifierGroups?.includes(group.id),
					)}
					getLabel={(item) => item.name}
					getKey={(item) => item.id}
					onPressAdd={() => {
						navigation.navigate("ModifierGroupPicker", {
							alreadySelectedGroups:
								formData.selectedModifierGroups,
							returnScreen: "ProductForm",
						});
					}}
					onRemoveItem={(id) => handleRemoveModifierGroup(id)}
					onPressItem={() => {
						navigation.navigate("ModifierGroupPicker", {
							alreadySelectedGroups:
								formData.selectedModifierGroups,
							returnScreen: "ProductForm",
						});
					}}
				/>

				<View style={[styles.divider]}>
					<ToggleField
						label="Disponibilidad"
						activeDescription="Los clientes pueden ver este producto"
						inactiveDescription="Producto oculto"
						value={formData.isAvailable}
						onValueChange={(val) =>
							setFormData({ ...formData, isAvailable: val })
						}
						disabled={loadings.save}
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
					disabled={loadings.save} // 👈 Bloqueo del botón principal
					loading={loadings.save} // 👈 Añadido por si tu botón usa un spinner interno
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
	imageContainer: {
		width: "100%",
		height: 120,
		borderRadius: BorderRadius.md,
		borderWidth: 1.5,
		borderStyle: "dashed",
		justifyContent: "center",
		alignItems: "center",
		overflow: "hidden",
		marginTop: Spacing.xs,
	},
	image: {
		width: "100%",
		height: "100%",
	},
	imagePlaceholder: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
	placeholderText: {
		fontSize: FontSize.sm,
		fontWeight: FontWeight.medium,
		marginLeft: Spacing.sm,
	},
	pureCssIcon: {
		width: 16,
		height: 16,
		justifyContent: "center",
		alignItems: "center",
	},
	iconVertical: {
		width: 2,
		height: 14,
		borderRadius: 1,
		position: "absolute",
	},
	iconHorizontal: {
		width: 14,
		height: 2,
		borderRadius: 1,
		position: "absolute",
	},
	// --- NUEVOS ESTILOS PARA LOS BOTONES ---
	actionButtonsContainer: {
		flexDirection: "row",
		position: "absolute",
		top: 12,
		right: 8,
		gap: 6, // Espaciado entre botones
	},
	actionBtn: {
		paddingVertical: 4,
		paddingHorizontal: 10,
		borderRadius: 6,
		borderWidth: 1,
		borderColor: "#EEEEEE",
		// Una sombrita ligera para elevarlos sobre la imagen
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 1,
		elevation: 2,
	},
	actionBtnText: {
		fontSize: 12,
		fontWeight: "600",
	},
});
