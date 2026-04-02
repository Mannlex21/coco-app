import React, { useEffect, useState } from "react";
import { supabase } from "@/infrastructure/supabase/config";
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
import { useAppStore } from "@coco/shared/hooks/useAppStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FontSize, BorderRadius, FontWeight } from "@coco/shared/config/theme";

// 💡 Importamos los componentes compartidos
import { ScreenHeader } from "../../components/ScreenHeader";
import { InputField } from "../../components/InputField";
import { ToggleField } from "../../components/ToggleField";

interface RouteParams {
	title?: string;
	productId?: string;
	businessId?: string;
	sectionId?: string;
}

export const ProductForm = () => {
	const navigation = useNavigation();
	const route = useRoute();
	const insets = useSafeAreaInsets();

	const { productId, sectionId } = (route.params as RouteParams) || {};

	const { colors, isDark } = useTheme();
	const { showDialog } = useDialog();
	const { user } = useAppStore();

	const { saveProduct, getProductById } = useProduct(
		supabase,
		user?.lastActiveBusinessId,
	);
	const { sections, fetchSections } = useSection(
		supabase,
		user?.lastActiveBusinessId,
	);

	// --- VARIABLES DE ESTILO ---
	const textColor = isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.85)";
	const subTextColor = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.55)";
	const borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)";

	// El fondo ahora es el directo de la app, sin cartas encima
	const bgApp = isDark ? "#121212" : "#FFFFFF";

	// --- ESTADOS ---
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);

	const [form, setForm] = useState({
		name: "",
		description: "",
		price: "",
		isAvailable: true,
	});
	const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>([]);

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		if (!user?.lastActiveBusinessId) return;

		setLoading(true);
		try {
			await fetchSections("");

			if (productId) {
				const currentProduct = await getProductById(productId);

				if (currentProduct) {
					setForm({
						name: currentProduct.name,
						description: currentProduct.description || "",
						price: currentProduct.price?.toString() || "",
						isAvailable: currentProduct.isAvailable,
					});

					setSelectedSectionIds(currentProduct.sectionIds || []);
				}
			} else if (sectionId) {
				setSelectedSectionIds([sectionId]);
			}
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const toggleSectionSelection = (id: string) => {
		setSelectedSectionIds((prev) =>
			prev.includes(id)
				? prev.filter((item) => item !== id)
				: [...prev, id],
		);
	};

	const handleSave = async () => {
		if (!form.name.trim()) {
			return showDialog({
				title: "Atención",
				message: "El nombre del producto es obligatorio.",
				intent: "info",
			});
		}

		if (selectedSectionIds.length === 0) {
			return showDialog({
				title: "Atención",
				message:
					"Debes seleccionar al menos una sección para este producto.",
				intent: "info",
			});
		}

		setSaving(true);
		try {
			await saveProduct(productId, {
				name: form.name.trim(),
				description: form.description.trim(),
				price: Number.parseFloat(form.price) || 0,
				isAvailable: form.isAvailable,
				sectionIds: selectedSectionIds,
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
		} finally {
			setSaving(false);
		}
	};

	const getSaveButtonText = (): string => {
		if (saving) return "Guardando...";
		if (productId) return "Guardar Cambios";
		return "Crear Producto";
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
			{/* 1. Cabecera Reutilizable */}
			<ScreenHeader
				title={productId ? "Editar Producto" : "Nuevo Producto"}
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
					Llena los datos del artículo para mostrarlo en tu catalogo.
				</Text>

				{/* 2. Formulario Directo sin Cartas de fondo */}
				<InputField
					label="Nombre del artículo"
					placeholder="Ej. Hamburguesa Doble Queso"
					value={form.name}
					onChangeText={(val) => setForm({ ...form, name: val })}
					editable={!saving}
				/>

				<InputField
					label="Precio (MXN)"
					placeholder="0.00"
					value={form.price}
					onChangeText={(val) => setForm({ ...form, price: val })}
					keyboardType="numeric"
					editable={!saving}
				/>

				<InputField
					label="Descripción"
					placeholder="Ingredientes, porciones, etc..."
					value={form.description}
					onChangeText={(val) =>
						setForm({ ...form, description: val })
					}
					multiline
					editable={!saving}
				/>

				<View style={[styles.divider]}>
					{/* 3. Sección de Chips */}
					<Text style={[styles.label, { color: subTextColor }]}>
						¿En qué secciones aparece?
					</Text>

					{sections.length === 0 ? (
						<Text
							style={{
								color: subTextColor,
								fontSize: 14,
								marginTop: 5,
							}}
						>
							Aún no tienes secciones creadas.
						</Text>
					) : (
						<View style={styles.chipContainer}>
							{sections.map((section) => {
								const isActive = selectedSectionIds.includes(
									section.id,
								);
								return (
									<TouchableOpacity
										key={section.id}
										style={[
											styles.chip,
											{
												backgroundColor: isDark
													? "rgba(255,255,255,0.05)"
													: "#F9F9F9",
												borderColor: borderColor,
											},
											isActive && {
												backgroundColor:
													colors.businessBg,
												borderColor: colors.businessBg,
											},
										]}
										onPress={() =>
											toggleSectionSelection(section.id)
										}
										disabled={saving}
									>
										<Text
											style={[
												styles.chipText,
												{ color: subTextColor },
												isActive && {
													color: "#FFFFFF",
													fontWeight: "600",
												},
											]}
										>
											{section.name}
										</Text>
									</TouchableOpacity>
								);
							})}
						</View>
					)}
				</View>

				{/* 4. Usamos el ToggleField que ya maneja su propio estilo limpio */}
				<View style={[styles.divider]}>
					<ToggleField
						label="Disponibilidad"
						activeDescription="Los clientes pueden ver este producto"
						inactiveDescription="Producto oculto"
						value={form.isAvailable}
						onValueChange={(val) =>
							setForm({ ...form, isAvailable: val })
						}
						disabled={saving}
					/>
				</View>
			</KeyboardAwareScrollView>

			{/* 5. Botón de guardado fijo abajo al estilo Uber */}
			<View
				style={[
					styles.bottomContainer,
					{ borderTopColor: borderColor, backgroundColor: bgApp },
				]}
			>
				<TouchableOpacity
					style={[
						styles.saveBtn,
						{
							backgroundColor: colors.businessBg,
							marginBottom:
								Platform.OS === "ios" ? insets.bottom : 12,
						},
						saving && { opacity: 0.7 },
					]}
					onPress={handleSave}
					disabled={saving}
				>
					<Text style={styles.saveBtnText}>
						{getSaveButtonText()}
					</Text>
				</TouchableOpacity>
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
		fontSize: FontSize.sm,
		fontWeight: FontWeight.bold,
		marginBottom: 8,
		marginTop: 15,
	},
	divider: {
		marginVertical: 5,
	},
	chipContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		marginTop: 5,
	},
	chip: {
		paddingVertical: 8,
		paddingHorizontal: 16,
		borderWidth: 1,
		borderRadius: 25,
		marginRight: 8,
		marginBottom: 10,
	},
	chipText: {
		fontSize: 14,
	},
	bottomContainer: {
		padding: 16,
		borderTopWidth: 1,
	},
	saveBtn: {
		padding: 16,
		borderRadius: BorderRadius.md,
		alignItems: "center",
	},
	saveBtnText: {
		color: "white",
		fontWeight: FontWeight.bold,
		fontSize: 16,
	},
});
