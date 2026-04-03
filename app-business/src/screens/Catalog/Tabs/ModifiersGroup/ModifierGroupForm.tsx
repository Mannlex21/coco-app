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
import { useAppStore } from "@coco/shared/hooks/useAppStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FontSize, BorderRadius, FontWeight } from "@coco/shared/config/theme";

// Importamos tus componentes compartidos
import { ScreenHeader } from "../../components/ScreenHeader";
import { InputField } from "../../../../components/InputField";
import { ToggleField } from "../../components/ToggleField";
import { useModifiersGroup } from "@coco/shared/hooks/supabase/useModifiersGroup";
import { Modifier } from "@coco/shared/core/entities/Modifier";
import { Ionicons } from "@expo/vector-icons";
import { ChipList } from "../../components/ChipList";

interface RouteParams {
	title?: string;
	groupId?: string;
}

export const ModifierGroupForm = () => {
	const navigation = useNavigation<any>();
	const route = useRoute();
	const insets = useSafeAreaInsets();

	const { groupId } = (route.params as RouteParams) || {};

	const { colors, isDark } = useTheme();
	const { showDialog } = useDialog();
	const { user } = useAppStore();

	const { saveModifierGroup, getModifierGroupById } = useModifiersGroup();

	// --- VARIABLES DE ESTILO ---
	const subTextColor = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.55)";
	const borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)";
	const bgApp = isDark ? "#121212" : "#FFFFFF";

	// --- ESTADOS ---
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);

	const [formData, setFormData] = useState({
		name: "",
		internalName: "",
		minSelectable: "0",
		maxSelectable: "1",
		isAvailable: true,
		selectedModifier: [] as Modifier[], // Aquí viven las opciones en memoria
	});

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		if (!user?.lastActiveBusinessId || !groupId) return;

		setLoading(true);
		try {
			const currentGroup = await getModifierGroupById(groupId);

			if (currentGroup) {
				setFormData({
					name: currentGroup.name,
					internalName: currentGroup.internal_name || "",
					minSelectable: currentGroup.minSelectable.toString(),
					maxSelectable: currentGroup.maxSelectable.toString(),
					isAvailable: currentGroup.status === "active",
					selectedModifier: currentGroup.choices || [],
				});
			}
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	// --- GUARDADO ---
	const handleSave = async () => {
		const min = parseInt(formData.minSelectable) || 0;
		const max = parseInt(formData.maxSelectable) || 1;

		if (!formData.name.trim()) {
			return showDialog({
				title: "Atención",
				message: "El nombre visible para el cliente es obligatorio.",
				intent: "info",
			});
		}

		if (min > max) {
			return showDialog({
				title: "Atención",
				message:
					"La selección mínima no puede ser mayor que la máxima.",
				intent: "info",
			});
		}

		if (formData.selectedModifier.length === 0) {
			return showDialog({
				title: "Atención",
				message:
					"Debes vincular al menos un modificador a través del selector.",
				intent: "info",
			});
		}

		setSaving(true);
		try {
			// Enviamos todo el paquete (incluyendo los modificadores temporales y fijos)
			await saveModifierGroup(groupId, {
				name: formData.name.trim(),
				internal_name: formData.internalName.trim(),
				minSelectable: min,
				maxSelectable: max,
				isAvailable: formData.isAvailable,
				choices: formData.selectedModifier,
			});

			showDialog({
				title: "¡Éxito!",
				message:
					"El grupo de modificadores ha sido guardado correctamente.",
				intent: "success",
				onConfirm: () => navigation.goBack(),
			});
		} catch (error) {
			console.error(error);
			showDialog({
				title: "Error",
				message:
					"No pudimos guardar los modificadores en este momento.",
				intent: "error",
			});
		} finally {
			setSaving(false);
		}
	};

	const handleInputChange = (key: keyof typeof formData, value: any) => {
		setFormData((prev) => ({ ...prev, [key]: value }));
	};

	const handleRemoveProduct = (productId: string) => {
		const filteredProducts = formData.selectedModifier.filter(
			(p) => p.id !== productId,
		);
		handleInputChange("selectedModifier", filteredProducts);
	};

	// 🔥 NUEVA FUNCIÓN: Permite editar un modificador que esté en la lista sin tocar BD
	const handleEditModifier = (modifier: Modifier) => {
		navigation.navigate("ModifierForm", {
			modifier: modifier, // Pasamos el objeto completo para rellenar el form
			onModifierSaved: (updatedMod: Modifier) => {
				const updatedList = formData.selectedModifier.map((m) =>
					m.id === updatedMod.id ? updatedMod : m,
				);
				handleInputChange("selectedModifier", updatedList);
			},
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
				title={
					groupId ? "Editar Modificadores" : "Nuevos Modificadores"
				}
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
					Configura opciones adicionales u obligatorias para tus
					productos.
				</Text>

				<InputField
					label="Nombre visible para el cliente"
					placeholder="Ej. Escoge tu refresco o Agrega extras"
					value={formData.name}
					onChangeText={(val) =>
						setFormData({ ...formData, name: val })
					}
					editable={!saving}
				/>

				<InputField
					label="Nombre interno (Opcional)"
					placeholder="Ej. Modificadores - Alitas combos"
					value={formData.internalName}
					onChangeText={(val) =>
						setFormData({ ...formData, internalName: val })
					}
					editable={!saving}
				/>

				<View style={styles.rowInputs}>
					<View style={{ flex: 1 }}>
						<InputField
							label="Mín. permitidos"
							placeholder="0"
							value={formData.minSelectable}
							onChangeText={(val) =>
								setFormData({ ...formData, minSelectable: val })
							}
							keyboardType="numeric"
							editable={!saving}
						/>
					</View>
					<View style={{ width: 16 }} />
					<View style={{ flex: 1 }}>
						<InputField
							label="Máx. permitidos"
							placeholder="1"
							value={formData.maxSelectable}
							onChangeText={(val) =>
								setFormData({ ...formData, maxSelectable: val })
							}
							keyboardType="numeric"
							editable={!saving}
						/>
					</View>
				</View>

				{/* --- SECCIÓN DE VINCULACIÓN MEDIANTE EL PICKER --- */}
				<View style={styles.divider}>
					<Text
						style={[
							styles.label,
							{ color: subTextColor, marginTop: 10 },
						]}
					>
						Opciones vinculadas
					</Text>

					<TouchableOpacity
						style={[
							styles.addModifierBtn,
							{ borderColor: colors.businessBg },
						]}
						onPress={() =>
							navigation.navigate("ModifierPicker", {
								groupId,
								// 👇 CAMBIO AQUÍ: En lugar de mapear solo IDs, mandamos los objetos completos en memoria
								currentMemoryModifiers:
									formData.selectedModifier,
								onSelect: (selectedFromPicker: Modifier[]) => {
									handleInputChange(
										"selectedModifier",
										selectedFromPicker,
									);
								},
							})
						}
					>
						<Ionicons
							name="link-outline"
							size={20}
							color={colors.businessBg}
						/>
						<Text
							style={[
								styles.addModifierBtnText,
								{ color: colors.businessBg },
							]}
						>
							{formData.selectedModifier.length > 0
								? "Modificar selección"
								: "Seleccionar modificadores existentes"}
						</Text>
					</TouchableOpacity>

					{/* Mostramos los modificadores seleccionados */}
					<View style={{ marginTop: 10 }}>
						<ChipList
							items={formData.selectedModifier}
							getKey={(item) => item.id}
							getLabel={(item) => `${item.name}`}
							onRemoveProduct={handleRemoveProduct}
							onPressItem={(item) =>
								handleEditModifier(item as Modifier)
							}
						/>
					</View>
				</View>

				<View style={styles.divider}>
					<ToggleField
						label="Disponibilidad"
						activeDescription="Los clientes pueden ver este grupo de modificadores"
						inactiveDescription="Grupo de modificadores oculto"
						value={formData.isAvailable}
						onValueChange={(val) =>
							setFormData({ ...formData, isAvailable: val })
						}
						disabled={saving}
					/>
				</View>
			</KeyboardAwareScrollView>

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
					<Text style={styles.saveBtnText}>{"Guardar Cambios"}</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	// Tus estilos se quedan exactamente igual
	scrollContent: { paddingHorizontal: 16, paddingBottom: 20 },
	centered: { flex: 1, justifyContent: "center", alignItems: "center" },
	headerSub: { fontSize: FontSize.md, marginBottom: 20, marginTop: 4 },
	label: {
		fontSize: FontSize.sm,
		fontWeight: FontWeight.bold,
		marginBottom: 8,
		marginTop: 15,
	},
	divider: { marginVertical: 10 },
	rowInputs: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
	bottomContainer: { padding: 16, borderTopWidth: 1 },
	saveBtn: {
		padding: 16,
		borderRadius: BorderRadius.md,
		alignItems: "center",
	},
	saveBtnText: { color: "white", fontWeight: FontWeight.bold, fontSize: 16 },
	addModifierBtn: {
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
	addModifierBtnText: { fontWeight: "600", fontSize: 14 },
});
