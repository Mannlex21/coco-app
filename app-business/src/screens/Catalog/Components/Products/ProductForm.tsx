import React, { useEffect, useState } from "react";
import { supabase } from "@/infrastructure/supabase/config";
import { Colors } from "@coco/shared/config/theme";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { useDialog } from "@coco/shared/providers/DialogContext";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
	ActivityIndicator,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Ionicons } from "@expo/vector-icons";
import { useProduct, useSection } from "@coco/shared/hooks/supabase";
import { useAppStore } from "@coco/shared/hooks/useAppStore";

interface RouteParams {
	title?: string;
	productId?: string;
	businessId?: string;
	sectionId?: string; // 🪄 Agregamos sectionId a los parámetros de la ruta
}

export const ProductForm = () => {
	const navigation = useNavigation();
	const route = useRoute();

	// 🪄 Extraemos sectionId junto con productId
	const { productId, sectionId } = (route.params as RouteParams) || {};

	const { colors, isDark } = useTheme();
	const { showDialog } = useDialog();

	// Hooks de datos
	const { user } = useAppStore();

	const { products, saveProduct, getProductById } = useProduct(
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
	const borderColor = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)";
	const cardBg = isDark ? "#1C1C1E" : Colors.light.backgroundLight;

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
				// Modo Edición: Traemos la data del producto
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
				// 🪄 Modo Creación con sección por defecto:
				// Si no hay productId pero sí viene un sectionId, lo preseleccionamos
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

	if (loading) {
		return (
			<View
				style={[
					styles.centered,
					{ backgroundColor: isDark ? "#121212" : "#F8F9FA" },
				]}
			>
				<ActivityIndicator size="large" color={colors.businessBg} />
			</View>
		);
	}
	const getSaveButtonText = (): string => {
		if (saving) return "Guardando...";
		if (productId) return "Guardar Cambios";
		return "Crear Producto";
	};

	return (
		<KeyboardAwareScrollView
			style={[
				styles.container,
				{ backgroundColor: isDark ? "#121212" : "#F8F9FA" },
			]}
			contentContainerStyle={styles.scrollContent}
			keyboardShouldPersistTaps="handled"
			enableOnAndroid={true}
			extraScrollHeight={16}
			showsVerticalScrollIndicator={false}
		>
			<Text style={[styles.headerTitle, { color: textColor }]}>
				{productId ? "Editar Producto" : "Nuevo Producto"}
			</Text>
			<Text style={[styles.headerSub, { color: subTextColor }]}>
				Llena los datos del artículo para mostrarlo en tu menú.
			</Text>

			<View style={[styles.form, { backgroundColor: cardBg }]}>
				{/* Nombre del Producto */}
				<Text
					style={[
						styles.label,
						{ color: subTextColor, marginTop: 0 },
					]}
				>
					Nombre del artículo
				</Text>
				<TextInput
					style={[
						styles.input,
						{ color: textColor, borderBottomColor: borderColor },
					]}
					value={form.name}
					onChangeText={(val) => setForm({ ...form, name: val })}
					placeholder="Ej. Hamburguesa Doble Queso"
					placeholderTextColor={subTextColor}
					editable={!saving}
				/>

				{/* Precio */}
				<Text style={[styles.label, { color: subTextColor }]}>
					Precio (MXN)
				</Text>
				<View
					style={[
						styles.priceInputContainer,
						{ borderBottomColor: borderColor },
					]}
				>
					<Text style={[styles.currencyPrefix, { color: textColor }]}>
						$
					</Text>
					<TextInput
						style={[
							styles.input,
							{ flex: 1, borderBottomWidth: 0, color: textColor },
						]}
						keyboardType="numeric"
						value={form.price}
						onChangeText={(val) => setForm({ ...form, price: val })}
						placeholder="0.00"
						placeholderTextColor={subTextColor}
						editable={!saving}
					/>
				</View>

				{/* Descripción */}
				<Text style={[styles.label, { color: subTextColor }]}>
					Descripción
				</Text>
				<TextInput
					style={[
						styles.input,
						{ color: textColor, borderBottomColor: borderColor },
					]}
					value={form.description}
					onChangeText={(val) =>
						setForm({ ...form, description: val })
					}
					placeholder="Ingredientes, porciones, etc..."
					placeholderTextColor={subTextColor}
					multiline
					editable={!saving}
				/>

				{/* Selección Múltiple de Secciones */}
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
											backgroundColor: colors.businessBg,
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

				{/* Estado del Producto */}
				<Text style={[styles.label, { color: subTextColor }]}>
					Disponibilidad
				</Text>
				<TouchableOpacity
					style={[
						styles.toggleRow,
						{
							backgroundColor: isDark
								? "rgba(255,255,255,0.03)"
								: "#F9F9F9",
							borderColor: borderColor,
						},
					]}
					onPress={() =>
						setForm({ ...form, isAvailable: !form.isAvailable })
					}
					activeOpacity={0.8}
					disabled={saving}
				>
					<View style={{ flex: 1 }}>
						<Text
							style={[styles.toggleTitle, { color: textColor }]}
						>
							Producto visible
						</Text>
						<Text
							style={{
								color: subTextColor,
								fontSize: 12,
								marginTop: 2,
							}}
						>
							Determina si los clientes pueden ordenar este
							artículo.
						</Text>
					</View>
					<Ionicons
						name={form.isAvailable ? "toggle" : "toggle-outline"}
						size={36}
						color={
							form.isAvailable ? colors.businessBg : subTextColor
						}
					/>
				</TouchableOpacity>

				{/* Botón Guardar */}
				<TouchableOpacity
					style={[
						styles.saveBtn,
						{ backgroundColor: colors.businessBg },
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
		</KeyboardAwareScrollView>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1 },
	scrollContent: { padding: 20, paddingBottom: 40 },
	centered: { flex: 1, justifyContent: "center", alignItems: "center" },
	headerTitle: { fontSize: 26, fontWeight: "800" },
	headerSub: { fontSize: 15, marginBottom: 25, marginTop: 5 },
	form: {
		padding: 24,
		borderRadius: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.05,
		shadowRadius: 10,
		elevation: 3,
	},
	label: {
		fontSize: 13,
		fontWeight: "700",
		textTransform: "uppercase",
		letterSpacing: 0.5,
		marginBottom: 8,
		marginTop: 20,
	},
	input: { borderBottomWidth: 1, paddingVertical: 10, fontSize: 16 },
	priceInputContainer: {
		flexDirection: "row",
		alignItems: "center",
		borderBottomWidth: 1,
	},
	currencyPrefix: { fontSize: 16, fontWeight: "600", marginRight: 5 },
	chipContainer: { flexDirection: "row", flexWrap: "wrap", marginTop: 5 },
	chip: {
		paddingVertical: 8,
		paddingHorizontal: 16,
		borderWidth: 1,
		borderRadius: 25,
		marginRight: 8,
		marginBottom: 10,
	},
	chipText: { fontSize: 14 },
	toggleRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: 12,
		borderRadius: 12,
		borderWidth: 1,
		marginTop: 5,
	},
	toggleTitle: { fontSize: 14, fontWeight: "700" },
	saveBtn: {
		padding: 16,
		borderRadius: 14,
		alignItems: "center",
		marginTop: 35,
	},
	saveBtnText: { color: "white", fontWeight: "700", fontSize: 16 },
});
