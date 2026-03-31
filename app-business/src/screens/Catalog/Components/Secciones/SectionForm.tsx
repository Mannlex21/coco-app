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

export const SectionForm = () => {
	const navigation = useNavigation<any>();
	const route = useRoute<any>();
	const { user } = useAppStore();
	const { colors, isDark } = useTheme();
	const { showDialog } = useDialog();

	const { sectionId } = route.params || {};
	const businessId = user?.lastActiveBusinessId;

	const { getSectionById, saveSection, loadingSection } = useSection(
		supabase,
		businessId,
	);

	// --- VARIABLES DE ESTILO CLONADAS ---
	const textColor = isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.85)";
	const subTextColor = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.55)";
	const borderColor = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)";
	const cardBg = isDark ? "#1C1C1E" : Colors.light.backgroundLight;

	// --- ESTADOS ---
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [isAvailable, setIsAvailable] = useState(true);

	const [loading, setLoading] = useState(false);
	const [fetchingData, setFetchingData] = useState(false);

	useEffect(() => {
		if (sectionId) {
			(async () => {
				setFetchingData(true);
				try {
					const data = await getSectionById(sectionId);
					if (data) {
						setName(data.name);
						setDescription(data.description || "");
						setIsAvailable(data.isAvailable);
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

	const handleSave = async () => {
		if (!name.trim()) {
			showDialog({
				title: "Campo requerido",
				message: "Por favor, escribe un nombre para la sección.",
				intent: "error",
			});
			return;
		}

		setLoading(true);

		try {
			await saveSection(sectionId, {
				name: name.trim(),
				description: description.trim(),
				isAvailable,
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
			{/* Cabecera */}
			<Text style={[styles.headerTitle, { color: textColor }]}>
				{sectionId ? "Editar Sección" : "Nueva Sección"}
			</Text>
			<Text style={[styles.headerSub, { color: subTextColor }]}>
				Organiza tus productos en categorías (ej. Entradas, Bebidas).
			</Text>

			{/* Formulario Estilo Tarjeta */}
			<View style={[styles.form, { backgroundColor: cardBg }]}>
				{/* Campo: Nombre */}
				<Text
					style={[
						styles.label,
						{ color: subTextColor, marginTop: 0 },
					]}
				>
					Nombre de la sección
				</Text>
				<TextInput
					style={[
						styles.input,
						{ color: textColor, borderBottomColor: borderColor },
					]}
					placeholder="Ej. Hamburguesas, Bebidas, Postres..."
					placeholderTextColor={subTextColor}
					value={name}
					onChangeText={setName}
					editable={!loading}
				/>

				{/* Campo: Descripción */}
				<Text style={[styles.label, { color: subTextColor }]}>
					Descripción (Opcional)
				</Text>
				<TextInput
					style={[
						styles.input,
						{ color: textColor, borderBottomColor: borderColor },
					]}
					placeholder="Ej. Todos nuestros combos incluyen papas y refresco."
					placeholderTextColor={subTextColor}
					value={description}
					onChangeText={setDescription}
					multiline
					editable={!loading}
				/>

				{/* Campo: Switch Disponibilidad */}
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
					onPress={() => setIsAvailable(!isAvailable)}
					activeOpacity={0.8}
					disabled={loading}
				>
					<View style={{ flex: 1 }}>
						<Text
							style={[styles.toggleTitle, { color: textColor }]}
						>
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
						color={isAvailable ? colors.businessBg : subTextColor}
					/>
				</TouchableOpacity>

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
	headerTitle: {
		fontSize: 26,
		fontWeight: "800",
	},
	headerSub: {
		fontSize: 15,
		marginBottom: 25,
		marginTop: 5,
	},
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
	input: {
		borderBottomWidth: 1,
		paddingVertical: 10,
		fontSize: 16,
	},
	toggleRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: 12,
		borderRadius: 12,
		borderWidth: 1,
		marginTop: 5,
	},
	toggleTitle: {
		fontSize: 14,
		fontWeight: "700",
	},
	saveBtn: {
		padding: 16,
		borderRadius: 14,
		alignItems: "center",
		marginTop: 35,
	},
	saveBtnText: { color: "white", fontWeight: "700", fontSize: 16 },
});
