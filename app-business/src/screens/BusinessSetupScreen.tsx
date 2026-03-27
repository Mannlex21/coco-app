import React, { useEffect, useRef, useState } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	ScrollView,
	Alert,
	KeyboardAvoidingView,
	Platform,
	TouchableWithoutFeedback,
	Keyboard,
} from "react-native";
import { useBusiness } from "@coco/shared/hooks/useBusiness";
import { useAppStore } from "@coco/shared/hooks/useAppStore";
import { BUSINESS_CATEGORY_LABELS } from "@coco/shared/constants";
import { db } from "@/infrastructure/firebase/config";
import { Colors } from "@coco/shared/config/theme";

// Recibimos navigation para poder cerrar el modal al terminar
export const BusinessSetupScreen = ({ navigation }: any) => {
	const { user } = useAppStore();
	const { registerBusiness } = useBusiness(db, user?.id);
	const scrollRef = useRef<ScrollView>(null);
	const [keyboardHeight, setKeyboardHeight] = useState(0);
	const [loading, setLoading] = useState(false);
	const [form, setForm] = useState({
		name: "",
		category: "food" as any,
		address: "",
		phone: "",
		deliveryCost: "20",
	});
	const scrollToBottom = () => {
		// Un pequeño delay asegura que el teclado ya empezó a subir
		setTimeout(() => {
			scrollRef.current?.scrollToEnd({ animated: true });
		}, 100);
	};
	const handleSave = async () => {
		// 1. Validaciones iniciales (Regla 9.1: Dirección y Teléfono son obligatorios)
		if (!form.name.trim() || !form.address.trim() || !form.phone.trim()) {
			return Alert.alert(
				"Campos incompletos",
				"Para registrarte en Coco, necesitamos el nombre, dirección y WhatsApp de tu negocio.",
			);
		}

		if (
			Number.isNaN(Number(form.deliveryCost)) ||
			Number(form.deliveryCost) < 0
		) {
			return Alert.alert(
				"Error de costo",
				"El costo de envío debe ser un número válido.",
			);
		}

		try {
			setLoading(true);

			// 2. Llamada al hook useBusiness
			// Pasamos solo lo que el usuario editó, el hook se encarga del ownerId y los defaults
			await registerBusiness({
				name: form.name.trim(),
				category: form.category,
				address: form.address.trim(),
				phone: form.phone.trim(),
				deliveryCost: Number(form.deliveryCost),
			});

			// 3. Feedback de éxito y navegación
			Alert.alert(
				"¡Bienvenido a Coco!",
				`${form.name} ha sido registrado con éxito. Ya puedes empezar a configurar tu catálogo.`,
				[
					{
						text: "Ir al Dashboard",
						onPress: () => navigation.goBack(), // Regresa al flujo principal
					},
				],
			);
		} catch (error: any) {
			console.error("Error al guardar negocio:", error);
			Alert.alert(
				"Error de Registro",
				"No pudimos crear el negocio en este momento. Revisa tu conexión a internet e inténtalo de nuevo.",
			);
		} finally {
			setLoading(false);
		}
	};
	useEffect(() => {
		// Escuchamos cuando el teclado sube y baja
		const showSubscription = Keyboard.addListener(
			Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
			(e) => {
				setKeyboardHeight(e.endCoordinates.height);
				// Forzamos el scroll al final para que el spacer haga su magia
				setTimeout(() => {
					scrollRef.current?.scrollToEnd({ animated: true });
				}, 100);
			},
		);
		const hideSubscription = Keyboard.addListener(
			Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
			() => setKeyboardHeight(0),
		);

		return () => {
			showSubscription.remove();
			hideSubscription.remove();
		};
	}, []);
	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : undefined} // Android lo suele manejar solo
			style={{ flex: 1 }}
		>
			<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
				<ScrollView
					ref={scrollRef}
					style={styles.container}
					contentContainerStyle={styles.scrollContent}
				>
					<Text style={styles.headerTitle}>
						Cuéntanos sobre tu negocio
					</Text>
					<Text style={styles.headerSub}>
						Esta información será visible para tus clientes.
					</Text>

					<View style={styles.form}>
						<Text style={styles.label}>Nombre comercial</Text>
						<TextInput
							style={styles.input}
							value={form.name}
							onChangeText={(val) =>
								setForm({ ...form, name: val })
							}
							placeholder="Ej. Tacos El Pastor"
							placeholderTextColor="#999"
						/>

						<Text style={styles.label}>Dirección física</Text>
						<TextInput
							style={styles.input}
							value={form.address}
							onChangeText={(val) =>
								setForm({ ...form, address: val })
							}
							placeholder="Ej. Calle Nacional #12, Col. Centro"
							placeholderTextColor="#999"
						/>

						<Text style={styles.label}>
							Teléfono de contacto (WhatsApp)
						</Text>
						<TextInput
							style={styles.input}
							value={form.phone}
							keyboardType="phone-pad"
							onChangeText={(val) =>
								setForm({ ...form, phone: val })
							}
							placeholder="323 123 4567"
							placeholderTextColor="#999"
						/>

						<Text style={styles.label}>Categoría</Text>
						<View style={styles.chipContainer}>
							{Object.entries(BUSINESS_CATEGORY_LABELS).map(
								([key, label]) => (
									<TouchableOpacity
										key={key}
										style={[
											styles.chip,
											form.category === key &&
												styles.chipActive,
										]}
										onPress={() =>
											setForm({
												...form,
												category: key as any,
											})
										}
									>
										<Text
											style={[
												styles.chipText,
												form.category === key &&
													styles.chipTextActive,
											]}
										>
											{label}
										</Text>
									</TouchableOpacity>
								),
							)}
						</View>

						<Text style={styles.label}>
							Costo de Envío Base (MXN)
						</Text>
						<View style={styles.priceInputContainer}>
							<Text style={styles.currencyPrefix}>$</Text>
							<TextInput
								style={[
									styles.input,
									{ flex: 1, borderBottomWidth: 0 },
								]}
								keyboardType="numeric"
								value={form.deliveryCost}
								onChangeText={(val) =>
									setForm({ ...form, deliveryCost: val })
								}
								onFocus={scrollToBottom}
							/>
						</View>

						<TouchableOpacity
							style={[
								styles.saveBtn,
								loading && { opacity: 0.7 },
							]}
							onPress={handleSave}
							disabled={loading}
						>
							<Text style={styles.saveBtnText}>
								{loading
									? "Registrando..."
									: "Guardar y Continuar"}
							</Text>
						</TouchableOpacity>
						<View
							style={{
								height:
									keyboardHeight > 0
										? keyboardHeight - 50
										: 20,
							}}
						/>
					</View>
				</ScrollView>
			</TouchableWithoutFeedback>
		</KeyboardAvoidingView>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#F8F9FA" },
	scrollContent: { padding: 20, paddingBottom: 40 },
	headerTitle: {
		fontSize: 26,
		fontWeight: "800",
		color: "#333",
		marginTop: 20,
	},
	headerSub: {
		fontSize: 15,
		color: "#666",
		marginBottom: 25,
		marginTop: 5,
	},
	form: {
		backgroundColor: "white",
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
		color: "#444",
		textTransform: "uppercase",
		letterSpacing: 0.5,
		marginBottom: 8,
		marginTop: 20,
	},
	input: {
		borderBottomWidth: 1,
		borderBottomColor: "#EEE",
		paddingVertical: 10,
		fontSize: 16,
		color: "#333",
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
		borderColor: "#EEE",
		borderRadius: 25,
		marginRight: 8,
		marginBottom: 10,
		backgroundColor: "#F9F9F9",
	},
	chipActive: {
		backgroundColor: Colors.businessBg,
		borderColor: Colors.businessBg,
	},
	chipText: { color: "#666", fontSize: 14 },
	chipTextActive: { color: "white", fontWeight: "600" },
	priceInputContainer: {
		flexDirection: "row",
		alignItems: "center",
		borderBottomWidth: 1,
		borderBottomColor: "#EEE",
	},
	currencyPrefix: {
		fontSize: 16,
		fontWeight: "600",
		color: "#333",
		marginRight: 5,
	},
	saveBtn: {
		backgroundColor: Colors.businessBg,
		padding: 16,
		borderRadius: 14,
		alignItems: "center",
		marginTop: 35,
	},
	saveBtnText: { color: "white", fontWeight: "700", fontSize: 16 },
});
