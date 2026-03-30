import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	ScrollView,
	Switch,
	ActivityIndicator,
} from "react-native";
import {
	BorderRadius,
	Shadow,
	Spacing,
	FontSize,
	FontWeight,
} from "@coco/shared/config/theme";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAppStore } from "@coco/shared/hooks/useAppStore";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { useDialog } from "@coco/shared/providers/DialogContext";
import { supabase } from "@/infrastructure/supabase/config";
import { useSection } from "@coco/shared/hooks/supabase";

export const SectionFormScreen = () => {
	const navigation = useNavigation<any>();
	const route = useRoute<any>();
	const { user } = useAppStore();
	const { colors } = useTheme();
	const { showDialog } = useDialog();

	const { sectionId } = route.params || {};
	const businessId = user?.lastActiveBusinessId;

	// Invocamos el hook pasándole el cliente y el businessId
	const { getSectionById, saveSection } = useSection(supabase, businessId);

	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [isAvailable, setIsAvailable] = useState(true);

	const [loading, setLoading] = useState(false);
	const [fetchingData, setFetchingData] = useState(false);

	// 1. Cargar datos si estamos en modo edición
	useEffect(() => {
		if (sectionId) {
			(async () => {
				setFetchingData(true);
				try {
					const data = await getSectionById(sectionId); // 👈 Usamos el hook
					if (data) {
						setName(data.name);
						setDescription(data.description || "");
						setIsAvailable(data.isAvailable);
					}
				} catch (error) {
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

	// 2. Guardar o actualizar la sección
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
			// 👈 Delegamos el guardado completo al hook
			await saveSection(sectionId, {
				name,
				description,
				isAvailable,
			});

			showDialog({
				title: "¡Éxito!",
				message: `Sección ${sectionId ? "actualizada" : "creada"} correctamente.`,
				intent: "success",
			});

			navigation.goBack();
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
					styles.loadingContainer,
					{ backgroundColor: colors.backgroundLight },
				]}
			>
				<ActivityIndicator size="large" color={colors.businessBg} />
			</View>
		);
	}

	return (
		<ScrollView
			style={[
				styles.container,
				{ backgroundColor: colors.backgroundLight },
			]}
		>
			<View style={styles.formContainer}>
				{/* Campo: Nombre */}
				<Text
					style={[styles.label, { color: colors.textPrimaryLight }]}
				>
					Nombre de la sección *
				</Text>
				<TextInput
					style={[
						styles.input,
						{
							backgroundColor: colors.surfaceLight,
							color: colors.textPrimaryLight,
							borderColor: colors.borderLight,
						},
					]}
					placeholder="Ej: Hamburguesas, Bebidas, Postres..."
					placeholderTextColor={colors.textSecondaryLight}
					value={name}
					onChangeText={setName}
				/>

				{/* Campo: Descripción */}
				<Text
					style={[styles.label, { color: colors.textPrimaryLight }]}
				>
					Descripción (Opcional)
				</Text>
				<TextInput
					style={[
						styles.input,
						styles.textArea,
						{
							backgroundColor: colors.surfaceLight,
							color: colors.textPrimaryLight,
							borderColor: colors.borderLight,
						},
					]}
					placeholder="Ej: Todos nuestros combos incluyen papas y refresco."
					placeholderTextColor={colors.textSecondaryLight}
					value={description}
					onChangeText={setDescription}
					multiline
					numberOfLines={3}
				/>

				{/* Campo: Switch Disponibilidad */}
				<View
					style={[
						styles.switchRow,
						{ backgroundColor: colors.surfaceLight },
					]}
				>
					<View>
						<Text
							style={[
								styles.switchTitle,
								{ color: colors.textPrimaryLight },
							]}
						>
							Sección Activa
						</Text>
						<Text
							style={[
								styles.switchSub,
								{ color: colors.textSecondaryLight },
							]}
						>
							{isAvailable
								? "Los clientes pueden ver esta sección"
								: "Sección oculta temporalmente"}
						</Text>
					</View>
					<Switch
						value={isAvailable}
						onValueChange={setIsAvailable}
						trackColor={{
							false: colors.borderLight,
							true: colors.businessBg,
						}}
						thumbColor={
							isAvailable
								? colors.textOnPrimary
								: colors.backgroundLight
						}
					/>
				</View>

				{/* Botón Guardar */}
				<TouchableOpacity
					style={[
						styles.submitBtn,
						{ backgroundColor: colors.businessBg },
						loading && { opacity: 0.7 },
					]}
					onPress={handleSave}
					disabled={loading}
				>
					{loading ? (
						<ActivityIndicator
							color={colors.textOnPrimary}
							size="small"
						/>
					) : (
						<Text
							style={[
								styles.submitBtnText,
								{ color: colors.textOnPrimary },
							]}
						>
							{sectionId ? "Actualizar Sección" : "Crear Sección"}
						</Text>
					)}
				</TouchableOpacity>
			</View>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1 },
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	formContainer: { padding: Spacing.md, marginTop: Spacing.md },
	label: {
		fontSize: FontSize.md,
		fontWeight: FontWeight.semibold,
		marginBottom: Spacing.sm,
		marginTop: Spacing.md,
	},
	input: {
		padding: Spacing.md,
		borderRadius: BorderRadius.md,
		fontSize: FontSize.md,
		borderWidth: 1,
	},
	textArea: {
		height: 80,
		textAlignVertical: "top",
	},
	switchRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: Spacing.md,
		borderRadius: BorderRadius.md,
		marginTop: Spacing.lg,
		borderWidth: 1,
		borderColor: "rgba(0,0,0,0.05)",
		...Shadow.sm,
	},
	switchTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
	switchSub: { fontSize: FontSize.xs, marginTop: 2 },
	submitBtn: {
		marginTop: Spacing.xl,
		padding: Spacing.md,
		borderRadius: BorderRadius.md,
		alignItems: "center",
		justifyContent: "center",
		height: 50,
		...Shadow.md,
	},
	submitBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
});
