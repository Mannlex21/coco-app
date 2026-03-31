import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	ActivityIndicator,
} from "react-native";
import { Colors } from "@coco/shared/config/theme";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAppStore } from "@coco/shared/hooks/useAppStore";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { useDialog } from "@coco/shared/providers/DialogContext";
import { supabase } from "@/infrastructure/supabase/config";
import { useSection } from "@coco/shared/hooks/supabase";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Ionicons } from "@expo/vector-icons";
import { Product } from "@coco/shared/core/entities/";

// ==========================================
// COMPONENTES EXTRAÍDOS (Sub-componentes)
// ==========================================

interface InputFieldProps {
	label: string;
	value: string;
	onChangeText: (text: string) => void;
	placeholder: string;
	textColor: string;
	subTextColor: string;
	borderColor: string;
	multiline?: boolean;
	editable?: boolean;
}

const InputField = React.memo(
	({
		label,
		value,
		onChangeText,
		placeholder,
		textColor,
		subTextColor,
		borderColor,
		multiline = false,
		editable = true,
	}: InputFieldProps) => (
		<>
			<Text style={[styles.label, { color: subTextColor }]}>{label}</Text>
			<TextInput
				style={[
					styles.input,
					{ color: textColor, borderBottomColor: borderColor },
					multiline && { paddingVertical: 10 },
				]}
				placeholder={placeholder}
				placeholderTextColor={subTextColor}
				value={value}
				onChangeText={onChangeText}
				multiline={multiline}
				editable={editable}
			/>
		</>
	),
);

interface VisualizationPickerProps {
	type: "list" | "grid";
	setType: (type: "list" | "grid") => void;
	subTextColor: string;
	textColor: string;
	borderColor: string;
	businessBg: string;
}

const VisualizationPicker = React.memo(
	({
		type,
		setType,
		subTextColor,
		textColor,
		borderColor,
		businessBg,
	}: VisualizationPickerProps) => (
		<>
			<Text
				style={[styles.label, { color: subTextColor, marginTop: 25 }]}
			>
				Visualización de productos
			</Text>
			<View style={[styles.pickerRow, { borderColor: borderColor }]}>
				<TouchableOpacity
					style={[
						styles.pickerOption,
						type === "list" && { backgroundColor: businessBg },
					]}
					onPress={() => setType("list")}
					activeOpacity={0.9}
				>
					<Ionicons
						name="list"
						size={18}
						color={type === "list" ? "white" : subTextColor}
					/>
					<Text
						style={[
							styles.pickerOptionText,
							{ color: type === "list" ? "white" : textColor },
						]}
					>
						Lista
					</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={[
						styles.pickerOption,
						type === "grid" && { backgroundColor: businessBg },
					]}
					onPress={() => setType("grid")}
					activeOpacity={0.9}
				>
					<Ionicons
						name="grid"
						size={16}
						color={type === "grid" ? "white" : subTextColor}
					/>
					<Text
						style={[
							styles.pickerOptionText,
							{ color: type === "grid" ? "white" : textColor },
						]}
					>
						Cuadrícula
					</Text>
				</TouchableOpacity>
			</View>
		</>
	),
);

interface AvailabilityToggleProps {
	isAvailable: boolean;
	setIsAvailable: (val: boolean) => void;
	isDark: boolean;
	textColor: string;
	subTextColor: string;
	borderColor: string;
	businessBg: string;
	disabled?: boolean;
}

const AvailabilityToggle = React.memo(
	({
		isAvailable,
		setIsAvailable,
		isDark,
		textColor,
		subTextColor,
		borderColor,
		businessBg,
		disabled,
	}: AvailabilityToggleProps) => (
		<>
			<Text
				style={[styles.label, { color: subTextColor, marginTop: 25 }]}
			>
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
				onPress={() => setIsAvailable(!isAvailable)}
				activeOpacity={0.8}
				disabled={disabled}
			>
				<View style={{ flex: 1 }}>
					<Text style={[styles.toggleTitle, { color: textColor }]}>
						Sección Activa
					</Text>
					<Text
						style={{
							color: subTextColor,
							fontSize: 12,
							marginTop: 2,
						}}
					>
						{isAvailable
							? "Los clientes pueden ver esta sección"
							: "Sección oculta temporalmente"}
					</Text>
				</View>
				<Ionicons
					name={isAvailable ? "toggle" : "toggle-outline"}
					size={36}
					color={isAvailable ? businessBg : subTextColor}
				/>
			</TouchableOpacity>
		</>
	),
);

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export const SectionForm = () => {
	const navigation = useNavigation<any>();
	const route = useRoute<any>();
	const { user } = useAppStore();
	const { colors, isDark } = useTheme();
	const { showDialog } = useDialog();
	const [sectionId, setSectionId] = useState(undefined);
	const businessId = user?.lastActiveBusinessId;

	const { getSectionById, saveSection, loadingSection } = useSection(
		supabase,
		businessId,
	);

	const textColor = isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.85)";
	const subTextColor = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.55)";
	const borderColor = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)";
	const cardBg = isDark ? "#1C1C1E" : Colors.light.backgroundLight;

	// --- FORMULARIO AGRUPADO EN UN SOLO ESTADO ---
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		isAvailable: true,
		visualizationType: "list" as "list" | "grid",
		selectedProducts: [] as Product[],
	});

	const [loading, setLoading] = useState(false);
	const [fetchingData, setFetchingData] = useState(false);

	// Manejador genérico para actualizar el formulario
	const handleInputChange = (key: keyof typeof formData, value: any) => {
		setFormData((prev) => ({
			...prev,
			[key]: value,
		}));
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
	}, [route.params?.selectedProducts]); // Ojo: Aquí tenías 'selectedProducts' en tu dependencia original, revisa si querías poner 'route.params?.sectionId'

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
					console.log(error);
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
		if (loadingSection) return "Guardando...";
		if (sectionId) return "Guardar Cambios";
		return "Crear Sección";
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
				{sectionId ? "Editar Sección" : "Nueva Sección"}
			</Text>
			<Text style={[styles.headerSub, { color: subTextColor }]}>
				Organiza tus productos en categorías (ej. Entradas, Bebidas).
			</Text>

			<View style={[styles.form, { backgroundColor: cardBg }]}>
				{/* Campo: Nombre */}
				<InputField
					label="Nombre de la sección"
					placeholder="Ej. Hamburguesas, Bebidas, Postres..."
					value={formData.name}
					onChangeText={(text) => handleInputChange("name", text)}
					textColor={textColor}
					subTextColor={subTextColor}
					borderColor={borderColor}
					editable={!loading}
				/>

				{/* Campo: Descripción */}
				<InputField
					label="Descripción (Opcional)"
					placeholder="Ej. Todos nuestros combos incluyen papas y refresco."
					value={formData.description}
					onChangeText={(text) =>
						handleInputChange("description", text)
					}
					textColor={textColor}
					subTextColor={subTextColor}
					borderColor={borderColor}
					multiline
					editable={!loading}
				/>

				{/* Campo: Tipo de Visualización */}
				<VisualizationPicker
					type={formData.visualizationType}
					setType={(type) =>
						handleInputChange("visualizationType", type)
					}
					subTextColor={subTextColor}
					textColor={textColor}
					borderColor={borderColor}
					businessBg={colors.businessBg}
				/>

				{/* Campo: Agregar Productos */}
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
							businessId,
							alreadySelectedProducts: formData.selectedProducts,
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
						Vincular productos existentes
					</Text>
				</TouchableOpacity>

				{/* Contenedor de Chips */}
				{formData.selectedProducts.length > 0 && (
					<View style={styles.chipsContainer}>
						{formData.selectedProducts.map((product) => (
							<View
								key={product.id}
								style={[
									styles.chip,
									{
										backgroundColor: isDark
											? "rgba(255,255,255,0.05)"
											: "#EAEAEA",
									},
								]}
							>
								<Text
									style={[
										styles.chipText,
										{ color: textColor },
									]}
									numberOfLines={1}
								>
									{product.name}
								</Text>
								<TouchableOpacity
									onPress={() =>
										handleRemoveProduct(product.id)
									}
								>
									<Ionicons
										name="close-circle"
										size={18}
										color={colors.error}
									/>
								</TouchableOpacity>
							</View>
						))}
					</View>
				)}

				{/* Campo: Switch Disponibilidad */}
				<AvailabilityToggle
					isAvailable={formData.isAvailable}
					setIsAvailable={(val) =>
						handleInputChange("isAvailable", val)
					}
					isDark={isDark}
					textColor={textColor}
					subTextColor={subTextColor}
					borderColor={borderColor}
					businessBg={colors.businessBg}
					disabled={loading}
				/>

				{/* Botón Guardar */}
				<TouchableOpacity
					style={[
						styles.saveBtn,
						{ backgroundColor: colors.businessBg },
						loading && { opacity: 0.7 },
					]}
					onPress={handleSave}
					disabled={loading}
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
		elevation: 3,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.05,
		shadowRadius: 10,
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

	pickerRow: {
		flexDirection: "row",
		borderWidth: 1,
		borderRadius: 12,
		overflow: "hidden",
		marginTop: 5,
	},
	pickerOption: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 12,
		gap: 8,
	},
	pickerOptionText: { fontSize: 14, fontWeight: "600" },

	toggleRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	toggleTitle: { fontSize: 14, fontWeight: "700" },
	saveBtn: {
		padding: 16,
		borderRadius: 14,
		alignItems: "center",
		marginTop: 35,
	},
	saveBtnText: { color: "white", fontWeight: "700", fontSize: 16 },

	addProductBtn: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		padding: 12,
		borderRadius: 12,
		borderWidth: 1,
		borderStyle: "dashed",
		marginTop: 5,
		gap: 6,
	},
	addProductBtnText: { fontWeight: "600", fontSize: 14 },
	chipsContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
		marginTop: 12,
	},
	chip: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 6,
		paddingHorizontal: 12,
		borderRadius: 20,
		gap: 6,
		maxWidth: "48%",
	},
	chipText: { fontSize: 13, fontWeight: "500", flexShrink: 1 },
});
