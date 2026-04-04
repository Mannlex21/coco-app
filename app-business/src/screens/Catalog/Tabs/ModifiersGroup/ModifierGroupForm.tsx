import { useEffect, useState } from "react";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { useDialog } from "@coco/shared/providers";
import { useNavigation, useRoute } from "@react-navigation/native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
	ActivityIndicator,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	Platform,
} from "react-native";
import { useAppStore } from "@coco/shared/hooks/useAppStore";
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
	ChipList,
	PrimaryButton,
} from "@/components";
import { useModifiersGroup } from "@coco/shared/hooks/supabase/useModifiersGroup";
import { Modifier } from "@coco/shared/core/entities";
import { FormChipSelector } from "@/components/FormChipSelector";

interface RouteParams {
	title?: string;
	groupId?: string;
}

export const ModifierGroupForm = () => {
	const navigation = useNavigation<any>();
	const route = useRoute();
	const insets = useSafeAreaInsets();

	const { groupId } = (route.params as RouteParams) || {};

	const { colors } = useTheme();
	const { showDialog } = useDialog();
	const { user } = useAppStore();
	const { saveModifierGroup, getModifierGroupById, loadings } =
		useModifiersGroup();

	const borderColor = colors.borderLight;

	const [formData, setFormData] = useState({
		name: "",
		internalName: "",
		minSelectable: "0",
		maxSelectable: "1",
		isAvailable: true,
		selectedModifier: [] as Modifier[],
	});

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		if (!user?.lastActiveBusinessId || !groupId) return;

		try {
			const currentGroup = await getModifierGroupById(groupId);

			if (currentGroup) {
				setFormData({
					name: currentGroup.name,
					internalName: currentGroup.internalName || "",
					minSelectable: currentGroup.minSelectable.toString(),
					maxSelectable: currentGroup.maxSelectable.toString(),
					isAvailable: currentGroup.isAvailable,
					selectedModifier: currentGroup.choices || [],
				});
			}
		} catch (error) {
			console.error(error);
		}
	};

	const handleSave = async () => {
		const min = Number.parseInt(formData.minSelectable) || 0;
		const max = Number.parseInt(formData.maxSelectable) || 1;

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

		try {
			await saveModifierGroup(groupId, {
				name: formData.name.trim(),
				internalName: formData.internalName.trim(),
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
			});
		} catch (error) {
			console.error(error);
			showDialog({
				title: "Error",
				message:
					"No pudimos guardar los modificadores en este momento.",
				intent: "error",
			});
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

	const handleEditModifier = (modifier: Modifier) => {
		navigation.navigate("ModifierForm", {
			modifier: modifier,
			onModifierSaved: (updatedMod: Modifier) => {
				const updatedList = formData.selectedModifier.map((m) =>
					m.id === updatedMod.id ? updatedMod : m,
				);
				handleInputChange("selectedModifier", updatedList);
			},
		});
	};

	if (loadings.fetch) {
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
				<Text
					style={[
						styles.headerSub,
						{ color: colors.textSecondaryLight },
					]}
				>
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
					editable={!loadings.save}
				/>

				<InputField
					label="Nombre interno (Opcional)"
					placeholder="Ej. Modificadores - Alitas combos"
					value={formData.internalName}
					onChangeText={(val) =>
						setFormData({ ...formData, internalName: val })
					}
					editable={!loadings.save}
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
							editable={!loadings.save}
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
							editable={!loadings.save}
						/>
					</View>
				</View>

				<FormChipSelector
					label="Opciones vinculadas"
					addButtonLabel="Modificadores"
					items={formData.selectedModifier}
					maxVisibleChips={2}
					getLabel={(item) => item.name}
					getKey={(item) => item.id}
					disabled={loadings.save}
					onPressAdd={() => {
						navigation.navigate("ModifierPicker", {
							groupId,
							currentMemoryModifiers: formData.selectedModifier,
							onSelect: (selectedFromPicker: Modifier[]) => {
								handleInputChange(
									"selectedModifier",
									selectedFromPicker,
								);
							},
						});
					}}
					onRemoveItem={(id) => {
						if (!loadings.save) {
							handleRemoveProduct(id);
						}
					}}
					onPressItem={(item) => {
						if (!loadings.save) {
							handleEditModifier(item as Modifier);
						}
					}}
				/>

				<View style={styles.divider}>
					<ToggleField
						label="Disponibilidad"
						activeDescription="Los clientes pueden ver este grupo de modificadores"
						inactiveDescription="Grupo de modificadores oculto"
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
					{
						borderTopColor: colors.borderLight,
						backgroundColor: colors.backgroundLight,
					},
					loadings.save && { opacity: 0.5 },
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
	saveBtnText: { fontWeight: FontWeight.bold, fontSize: 16 },
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
