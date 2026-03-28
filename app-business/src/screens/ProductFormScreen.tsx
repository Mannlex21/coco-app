import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	Switch,
	Alert,
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	Keyboard,
	KeyboardEvent,
} from "react-native";
import {
	SafeAreaView,
	useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Colors } from "@coco/shared/config/theme";
import { useNavigation } from "@react-navigation/native";
import { useAppStore } from "@coco/shared/hooks/useAppStore";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useProducts } from "../../../shared/hooks/useProducts";
import { db } from "@/infrastructure/firebase/config";

const CATEGORIES = ["tacos", "bebidas", "postres", "combos", "otros"];

export const ProductFormScreen = () => {
	const navigation = useNavigation();
	const { activeBusiness } = useAppStore();
	const [form, setForm] = useState({
		name: "",
		description: "",
		price: "",
		category: "tacos",
		isAvailable: true,
	});
	const { saveProduct, loading } = useProducts(db, activeBusiness?.id);

	const handleSave = async () => {
		// 1. Validaciones básicas de UI
		if (!form.name.trim() || !form.price) {
			Alert.alert("Error", "Nombre y precio son obligatorios.");
			return;
		}

		try {
			// 2. Llamamos a tu función saveProduct
			// Notarás que solo pasamos lo que el Omit permite
			await saveProduct({
				name: form.name.trim(),
				description: form.description.trim(),
				price: parseFloat(form.price),
				category: form.category,
				isAvailable: form.isAvailable,
				imageUrl: "", // Por ahora vacío, luego vendrá de Firebase Storage
				// sortOrder se calcula dentro de saveProduct, así que aquí no lo mandamos
			} as any);

			// 3. Feedback y navegación
			Alert.alert("¡Éxito!", "Producto guardado correctamente.", [
				{ text: "OK", onPress: () => navigation.goBack() },
			]);
		} catch (error) {
			console.error("Error en handleSave:", error);
			Alert.alert(
				"Error",
				"No se pudo guardar el producto. Inténtalo de nuevo.",
			);
		}
	};
	return (
		<KeyboardAwareScrollView
			style={styles.container}
			contentContainerStyle={styles.scrollContent}
			keyboardShouldPersistTaps="handled"
			enableOnAndroid={true}
			extraScrollHeight={16}
			showsVerticalScrollIndicator={false}
		>
			<View style={styles.form}>
				<Text style={styles.label}>Nombre del producto *</Text>
				<TextInput
					style={styles.input}
					placeholder="Ej. Tacos de Asada"
					value={form.name}
					onChangeText={(t) => setForm({ ...form, name: t })}
				/>

				<Text style={styles.label}>Descripción (Opcional)</Text>
				<TextInput
					style={[styles.input, styles.textArea]}
					placeholder="¿Qué contiene el platillo?"
					multiline
					value={form.description}
					onChangeText={(t) => setForm({ ...form, description: t })}
				/>

				<Text style={styles.label}>Precio ($) *</Text>
				<TextInput
					style={styles.input}
					placeholder="0.00"
					keyboardType="numeric"
					value={form.price}
					onChangeText={(t) => setForm({ ...form, price: t })}
				/>

				<Text style={styles.label}>Categoría</Text>
				<View style={styles.categoryContainer}>
					{CATEGORIES.map((cat) => (
						<TouchableOpacity
							key={cat}
							style={[
								styles.chip,
								form.category === cat && styles.activeChip,
							]}
							onPress={() => setForm({ ...form, category: cat })}
						>
							<Text
								style={[
									styles.chipText,
									form.category === cat &&
										styles.activeChipText,
								]}
							>
								{cat.toUpperCase()}
							</Text>
						</TouchableOpacity>
					))}
				</View>

				<View style={styles.switchRow}>
					<View>
						<Text style={styles.switchLabel}>
							Disponible para venta
						</Text>
						<Text style={styles.switchSub}>
							Los clientes podrán verlo en el menú
						</Text>
					</View>
					<Switch
						value={form.isAvailable}
						onValueChange={(v) =>
							setForm({ ...form, isAvailable: v })
						}
						trackColor={{
							false: "#D1D1D1",
							true: Colors.businessBg,
						}}
					/>
				</View>

				<TouchableOpacity
					style={[styles.saveBtn, loading && styles.disabledBtn]}
					onPress={handleSave}
					disabled={loading}
				>
					{loading ? (
						<ActivityIndicator color="white" />
					) : (
						<Text style={styles.saveBtnText}>Guardar Producto</Text>
					)}
				</TouchableOpacity>
			</View>
		</KeyboardAwareScrollView>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#F8F9FA" },
	scrollContent: { padding: 20, paddingBottom: 40 },
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
		fontSize: 14,
		fontWeight: "bold",
		color: "#444",
		marginBottom: 8,
		marginTop: 15,
	},
	input: {
		backgroundColor: "#F8F9FA",
		borderWidth: 1,
		borderColor: "#E9ECEF",
		borderRadius: 12,
		padding: 15,
		fontSize: 16,
		color: "#333",
	},
	textArea: { height: 100, textAlignVertical: "top" },
	categoryContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 10,
		marginTop: 5,
	},
	chip: {
		paddingHorizontal: 15,
		paddingVertical: 8,
		borderRadius: 20,
		backgroundColor: "#F1F3F5",
		borderWidth: 1,
		borderColor: "#E9ECEF",
	},
	activeChip: {
		backgroundColor: Colors.businessBg,
		borderColor: Colors.businessBg,
	},
	chipText: { fontSize: 12, color: "#666", fontWeight: "600" },
	activeChipText: { color: "white" },
	switchRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginTop: 30,
		paddingVertical: 15,
		borderTopWidth: 1,
		borderTopColor: "#F1F3F5",
	},
	switchLabel: { fontSize: 16, fontWeight: "bold", color: "#333" },
	switchSub: { fontSize: 12, color: "#888" },
	footer: {
		paddingHorizontal: 20,
		paddingVertical: 15,
		backgroundColor: "white", // Evita que se vea el contenido scrolleado por debajo
		borderTopWidth: 1,
		borderTopColor: "#F1F3F5",
		// elevation: 10, // Opcional, pero pruébalo sin elevación primero
	},
	saveBtn: {
		backgroundColor: Colors.businessBg,
		padding: 16,
		borderRadius: 14,
		alignItems: "center",
		marginTop: 35,
	},
	disabledBtn: { opacity: 0.7 },
	saveBtnText: { color: "white", fontSize: 16, fontWeight: "bold" },
});
