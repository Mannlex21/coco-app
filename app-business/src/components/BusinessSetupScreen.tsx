import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
} from "react-native";
import { useAppStore } from "@coco/shared/hooks/useAppStore";
import { BUSINESS_CATEGORY_LABELS } from "@coco/shared/constants";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { Colors } from "@coco/shared/config/theme";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDialog } from "@coco/shared/providers/DialogContext";
import { supabase } from "@/infrastructure/supabase/config";
import { useBusiness } from "@coco/shared/hooks/supabase";

export const BusinessSetupScreen = ({ navigation }: any) => {
	const { user } = useAppStore();
	const { registerBusiness } = useBusiness(supabase, user?.id);
	const [loading, setLoading] = useState(false);
	const { showDialog } = useDialog();
	const { colors, isDark } = useTheme();

	const textColor = isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.85)";
	const subTextColor = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.55)";
	const borderColor = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)";

	const cardBg = isDark ? "#1C1C1E" : Colors.light.backgroundLight;

	const [form, setForm] = useState({
		name: "",
		category: "food" as any,
		description: "",
		address: "",
		phone: "",
		deliveryCost: "20",
	});

	const handleSave = async () => {
		if (!form.name.trim() || !form.address.trim() || !form.phone.trim()) {
			return showDialog({
				title: "Campos incompletos",
				message:
					"Para registrarte en Coco, necesitamos el nombre, dirección y WhatsApp de tu negocio.",
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

			await registerBusiness({
				name: form.name.trim(),
				category: form.category,
				description: form.description.trim(), // Añadido que faltaba
				address: form.address.trim(),
				phone: form.phone.trim(),
				deliveryCost: Number(form.deliveryCost), // Cambiado a snake_case
			});

			showDialog({
				title: "¡Bienvenido a Coco!",
				message: `${form.name} ha sido registrado con éxito. Ya puedes empezar a configurar tu catálogo.`,
				intent: "success",
				onConfirm: () => navigation.goBack(),
			});
		} catch (error: any) {
			console.error("Error al guardar negocio:", error);
			showDialog({
				title: "Error de Registro",
				message:
					"No pudimos crear el negocio en este momento. Revisa tu conexión a internet e inténtalo de nuevo.",
				intent: "error",
			});
		} finally {
			setLoading(false);
		}
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
				Cuéntanos sobre tu negocio
			</Text>
			<Text style={[styles.headerSub, { color: subTextColor }]}>
				Esta información será visible para tus clientes.
			</Text>

			<View style={[styles.form, { backgroundColor: cardBg }]}>
				<Text style={[styles.label, { color: subTextColor }]}>
					Nombre comercial
				</Text>
				<TextInput
					style={[
						styles.input,
						{ color: textColor, borderBottomColor: borderColor },
					]}
					value={form.name}
					onChangeText={(val) => setForm({ ...form, name: val })}
					placeholder="Ej. Tacos El Pastor"
					placeholderTextColor={subTextColor}
					editable={!loading}
				/>

				<Text style={[styles.label, { color: subTextColor }]}>
					¿Qué vendes? (Breve reseña)
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
					placeholder="Ej. Antojitos mexicanos y aguas frescas"
					placeholderTextColor={subTextColor}
					multiline
					editable={!loading}
				/>

				<Text style={[styles.label, { color: subTextColor }]}>
					Teléfono
				</Text>
				<TextInput
					style={[
						styles.input,
						{ color: textColor, borderBottomColor: borderColor },
					]}
					value={form.phone}
					keyboardType="phone-pad"
					onChangeText={(val) => setForm({ ...form, phone: val })}
					placeholder="323 123 4567"
					placeholderTextColor={subTextColor}
					editable={!loading}
				/>

				<Text style={[styles.label, { color: subTextColor }]}>
					Categoría
				</Text>
				<View style={styles.chipContainer}>
					{Object.entries(BUSINESS_CATEGORY_LABELS).map(
						([key, label]) => {
							const isActive = form.category === key;
							return (
								<TouchableOpacity
									key={key}
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
										setForm({
											...form,
											category: key as any,
										})
									}
									disabled={loading}
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
										{label}
									</Text>
								</TouchableOpacity>
							);
						},
					)}
				</View>

				<Text style={[styles.label, { color: subTextColor }]}>
					Dirección física
				</Text>
				<TextInput
					style={[
						styles.input,
						{ color: textColor, borderBottomColor: borderColor },
					]}
					value={form.address}
					onChangeText={(val) => setForm({ ...form, address: val })}
					placeholder="Ej. Calle Nacional #12, Col. Centro"
					placeholderTextColor={subTextColor}
					editable={!loading}
				/>

				<Text style={[styles.label, { color: subTextColor }]}>
					Costo de Envío Base (MXN)
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
						value={form.deliveryCost}
						onChangeText={(val) =>
							setForm({ ...form, deliveryCost: val })
						}
						placeholderTextColor={subTextColor}
						editable={!loading}
					/>
				</View>

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
						{loading ? "Registrando..." : "Guardar y Continuar"}
					</Text>
				</TouchableOpacity>
			</View>
		</KeyboardAwareScrollView>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1 },
	scrollContent: { padding: 20, paddingBottom: 40 },
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
	chipText: { fontSize: 14 },
	priceInputContainer: {
		flexDirection: "row",
		alignItems: "center",
		borderBottomWidth: 1,
	},
	currencyPrefix: {
		fontSize: 16,
		fontWeight: "600",
		marginRight: 5,
	},
	saveBtn: {
		padding: 16,
		borderRadius: 14,
		alignItems: "center",
		marginTop: 35,
	},
	saveBtnText: { color: "white", fontWeight: "700", fontSize: 16 },
});
