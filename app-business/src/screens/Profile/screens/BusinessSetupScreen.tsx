import { useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
	View,
	Text,
	StyleSheet,
	Platform,
	TouchableOpacity,
} from "react-native";
import { BUSINESS_CATEGORY_LABELS } from "@coco/shared/constants";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { FontSize, FontWeight } from "@coco/shared/config/theme";
import { useDialog } from "@coco/shared/providers/DialogContext";
import { useBusiness } from "@coco/shared/hooks/supabase";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PrimaryButton, ScreenHeader, InputField } from "@/components";

export const BusinessSetupScreen = ({ route, navigation }: any) => {
	const { business } = route.params || {};
	const isEditing = !!business?.id;

	const { registerBusiness, updateBusiness } = useBusiness();

	const [loading, setLoading] = useState(false);
	const { showDialog } = useDialog();
	const { colors } = useTheme();
	const insets = useSafeAreaInsets();

	const textColor = colors.textPrimaryLight;
	const subTextColor = colors.textSecondaryLight;
	const borderColor = colors.borderLight;

	const [form, setForm] = useState({
		name: business?.name || "",
		category: business?.category || ("food" as any),
		description: business?.description || "",
		address: business?.address || "",
		phone: business?.phone || "",
		deliveryCost: business?.deliveryCost?.toString() || "20",
	});

	const handleInputChange = (key: keyof typeof form, value: string) => {
		setForm((prev) => ({ ...prev, [key]: value }));
	};

	const handleSave = async () => {
		// Validaciones (igual para ambos casos)
		if (!form.name.trim() || !form.address.trim() || !form.phone.trim()) {
			return showDialog({
				title: "Campos incompletos",
				message:
					"Necesitamos el nombre, dirección y WhatsApp de tu negocio.",
				intent: "error",
			});
		}

		if (
			Number.isNaN(Number(form.deliveryCost)) ||
			Number(form.deliveryCost) < 0
		) {
			return showDialog({
				title: "Error de costo",
				message: "El costo de envío debe ser un número válido.",
				intent: "error",
			});
		}

		try {
			setLoading(true);

			if (isEditing) {
				// CASO EDICIÓN
				await updateBusiness(business.id, {
					name: form.name.trim(),
					category: form.category,
					description: form.description.trim(),
					address: form.address.trim(),
					phone: form.phone.trim(),
					deliveryCost: Number(form.deliveryCost),
				});
			} else {
				// CASO CREACIÓN DESDE CERO
				await registerBusiness({
					name: form.name.trim(),
					category: form.category,
					description: form.description.trim(),
					address: form.address.trim(),
					phone: form.phone.trim(),
					deliveryCost: Number(form.deliveryCost),
				});
			}

			showDialog({
				title: isEditing ? "Cambios guardados" : "¡Bienvenido a Coco!",
				message: isEditing
					? "La información se actualizó con éxito."
					: `${form.name} ha sido registrado. Ya puedes configurar tu catálogo.`,
				intent: "success",
				onConfirm: () => navigation.goBack(),
			});
		} catch (error: any) {
			console.error("Error al guardar negocio:", error);
			showDialog({
				title: "Error",
				message: "No pudimos guardar los cambios. Inténtalo de nuevo.",
				intent: "error",
			});
		} finally {
			setLoading(false);
		}
	};

	const categoryItems = Object.entries(BUSINESS_CATEGORY_LABELS).map(
		([id, name]) => ({
			id,
			name,
		}),
	);

	return (
		<View style={{ flex: 1, backgroundColor: colors.backgroundLight }}>
			<ScreenHeader
				title={isEditing ? "Editar Negocio" : "Registrar Negocio"}
				onBack={() => navigation.goBack()}
				fontSizeTitle={FontSize.xl}
			/>

			<KeyboardAwareScrollView
				style={{ flex: 1 }}
				contentContainerStyle={styles.scrollContent}
				keyboardShouldPersistTaps="handled"
				enableOnAndroid={true}
				extraScrollHeight={16}
				showsVerticalScrollIndicator={false}
			>
				<Text style={[styles.headerTitle, { color: textColor }]}>
					{isEditing
						? `Editando ${business.name}`
						: "Cuéntanos sobre tu negocio"}
				</Text>
				<Text style={[styles.headerSub, { color: subTextColor }]}>
					Esta información será visible para tus clientes.
				</Text>

				<InputField
					label="Nombre comercial"
					placeholder="Ej. Tacos El Pastor"
					value={form.name}
					onChangeText={(text) => handleInputChange("name", text)}
					editable={!loading}
					showLabel={true}
				/>

				<InputField
					label="¿Qué vendes? (Breve reseña)"
					placeholder="Ej. Antojitos mexicanos y aguas frescas"
					value={form.description}
					onChangeText={(text) =>
						handleInputChange("description", text)
					}
					multiline
					editable={!loading}
					showLabel={true}
				/>

				<InputField
					label="Teléfono"
					placeholder="323 123 4567"
					value={form.phone}
					keyboardType="phone-pad"
					onChangeText={(text) => handleInputChange("phone", text)}
					editable={!loading}
					showLabel={true}
				/>

				<View style={styles.divider}>
					<Text style={[styles.label, { color: subTextColor }]}>
						Categoría
					</Text>
					<View style={styles.chipWrapper}>
						{categoryItems.map((item) => {
							const isActive = form.category === item.id;
							return (
								<TouchableOpacity
									key={item.id}
									style={[
										styles.customChip,
										{
											borderColor: borderColor,
											backgroundColor:
												colors.surfaceLight,
										},
										isActive && {
											backgroundColor: colors.businessBg,
											borderColor: colors.businessBg,
										},
									]}
									onPress={() =>
										!loading &&
										handleInputChange("category", item.id)
									}
									disabled={loading}
									activeOpacity={0.7}
								>
									<Text
										style={[
											styles.customChipText,
											{ color: subTextColor },
											isActive && {
												color: "#FFFFFF",
												fontWeight: "600",
											},
										]}
									>
										{item.name}
									</Text>
								</TouchableOpacity>
							);
						})}
					</View>
				</View>

				<InputField
					label="Dirección física"
					placeholder="Ej. Calle Nacional #12, Col. Centro"
					value={form.address}
					onChangeText={(text) => handleInputChange("address", text)}
					editable={!loading}
					showLabel={true}
				/>

				<InputField
					label="Costo de Envío Base (MXN)"
					placeholder="0.00"
					value={form.deliveryCost}
					keyboardType="numeric"
					onChangeText={(text) =>
						handleInputChange("deliveryCost", text)
					}
					editable={!loading}
					showLabel={true}
				/>
			</KeyboardAwareScrollView>
			<View
				style={[
					styles.bottomContainer,
					{
						borderTopColor: borderColor,
						backgroundColor: colors.backgroundLight,
					},
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
	headerTitle: {
		fontSize: FontSize.lg,
		fontWeight: "800",
		marginTop: 10,
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
	bottomContainer: {
		padding: 16,
		borderTopWidth: 1,
	},

	chipWrapper: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
		marginTop: 5,
	},
	customChip: {
		paddingVertical: 8,
		paddingHorizontal: 16,
		borderRadius: 20,
		borderWidth: 1,
		// Al usar flex-start evitamos que el chip intente estirarse para llenar espacio
		alignSelf: "flex-start",
	},
	customChipText: {
		fontSize: 14,
	},
});
