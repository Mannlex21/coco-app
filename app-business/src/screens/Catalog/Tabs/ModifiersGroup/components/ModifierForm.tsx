import { useState, useEffect } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	Platform,
} from "react-native";
import { FontSize, BorderRadius, FontWeight } from "@coco/shared/config/theme";
import { InputField, ToggleField } from "@/components";
import { useDialog } from "@coco/shared/providers";
import { Modifier } from "@coco/shared/core/entities";

interface RouteParams {
	modifier?: Modifier; // Pasamos el objeto completo si es edición
	onModifierSaved?: (mod: Modifier) => void;
}

export const ModifierForm = () => {
	const navigation = useNavigation<any>();
	const route = useRoute();
	const insets = useSafeAreaInsets();
	const { showDialog } = useDialog();

	const params = (route.params as RouteParams) || {};
	const { modifier } = params;

	const { colors, isDark } = useTheme();

	const subTextColor = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.55)";
	const borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)";
	const bgApp = isDark ? "#121212" : "#FFFFFF";

	const [form, setForm] = useState({
		name: "",
		extraPrice: "",
		isAvailable: true,
	});

	// Cargamos datos si es edición (en memoria)
	useEffect(() => {
		if (modifier) {
			setForm({
				name: modifier.name,
				extraPrice:
					modifier.extraPrice != null
						? modifier.extraPrice.toString()
						: "0",
				isAvailable: modifier.isAvailable ?? true,
			});
		}
	}, [modifier]);

	const handleSave = async () => {
		if (!form.name.trim()) {
			showDialog({
				title: "Campo requerido",
				message: "Por favor, ingresa el nombre del modificador.",
				intent: "warning",
			});
			return;
		}

		const price = parseFloat(form.extraPrice) || 0;

		// 1. Estructuramos el objeto Modificador
		const savedModifier: Modifier = {
			// Si ya tenía ID (edición), lo conservamos. Si es nuevo, le damos un ID temporal.
			id:
				modifier?.id ||
				`temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			name: form.name.trim(),
			extraPrice: price,
			isAvailable: form.isAvailable,
		};

		// 2. Lo devolvemos por el callback al flujo (Picker o Formulario Padre)
		if (params.onModifierSaved) {
			params.onModifierSaved(savedModifier);
		}

		showDialog({
			title: "¡Listo!",
			message: `Modificador ${modifier ? "actualizado" : "agregado"} temporalmente.`,
			intent: "success",
		});

		navigation.goBack();
	};

	return (
		<View style={{ flex: 1, backgroundColor: bgApp }}>
			<KeyboardAwareScrollView
				style={{ flex: 1 }}
				contentContainerStyle={styles.scrollContent}
				keyboardShouldPersistTaps="handled"
				enableOnAndroid={true}
				extraScrollHeight={16}
				showsVerticalScrollIndicator={false}
			>
				<Text style={[styles.headerSub, { color: subTextColor }]}>
					Configura los datos del modificador u opción. Los cambios se
					guardarán definitivamente al crear/guardar el grupo.
				</Text>

				<InputField
					label="Nombre del modificador"
					placeholder="Ej. Tocineta Crujiente"
					value={form.name}
					onChangeText={(val) => setForm({ ...form, name: val })}
				/>

				<InputField
					label="Precio extra (MXN)"
					placeholder="0.00"
					value={form.extraPrice}
					onChangeText={(val) =>
						setForm({ ...form, extraPrice: val })
					}
					keyboardType="numeric"
				/>

				<View style={styles.divider} />

				<ToggleField
					label="Disponibilidad"
					activeDescription="Los clientes pueden ver este modificador"
					inactiveDescription="Modificador oculto"
					value={form.isAvailable}
					onValueChange={(val) =>
						setForm({ ...form, isAvailable: val })
					}
				/>
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
					]}
					onPress={handleSave}
				>
					<Text style={styles.saveBtnText}>
						{modifier ? "Actualizar" : "Agregar"}
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20 },
	headerSub: { fontSize: FontSize.md, marginBottom: 20, marginTop: 4 },
	divider: {
		marginVertical: 15,
		height: 1,
		backgroundColor: "rgba(0,0,0,0.05)",
	},
	bottomContainer: { padding: 16, borderTopWidth: 1 },
	saveBtn: {
		padding: 16,
		borderRadius: BorderRadius.md,
		alignItems: "center",
		justifyContent: "center",
		minHeight: 56,
	},
	saveBtnText: { color: "white", fontWeight: FontWeight.bold, fontSize: 16 },
});
