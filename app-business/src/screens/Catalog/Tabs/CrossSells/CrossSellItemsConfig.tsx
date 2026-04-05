import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { useProductStore } from "@coco/shared/hooks";
import { FontSize, FontWeight, Spacing } from "@coco/shared/config/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
	ScreenHeader,
	PrimaryButton,
	CustomDropdown,
	InputField,
} from "@/components";
import { useDialog } from "@coco/shared/providers";

export const CrossSellItemsConfig = () => {
	const navigation = useNavigation<any>();
	const route = useRoute<any>();
	const { colors } = useTheme();
	const insets = useSafeAreaInsets();
	const { showDialog } = useDialog();

	const {
		onSaveConfig,
		alreadySelectedProductIds = [], // 👈 Ahora recibimos directamente el arreglo de IDs
		originProductId,
	} = route.params || {};

	const allStoreProducts = useProductStore((state) => state.products || []);

	const [selectedProductId, setSelectedProductId] = useState<string | null>(
		null,
	);
	const [overridePrice, setOverridePrice] = useState("");

	const productOptions = useMemo(() => {
		return allStoreProducts
			.filter((p) => p.id !== originProductId)
			.filter((p) => {
				return !alreadySelectedProductIds.includes(p.id);
			})
			.map((prod) => ({
				label: prod.name,
				value: prod.id,
			}));
	}, [allStoreProducts, originProductId, alreadySelectedProductIds]);
	// Buscamos el producto seleccionado para obtener su precio original
	const selectedProductInfo = useMemo(() => {
		if (!selectedProductId) return null;
		return allStoreProducts.find((p) => p.id === selectedProductId);
	}, [selectedProductId, allStoreProducts]);

	const handlePriceChange = (text: string) => {
		const validatedText = text.replace(/[^0-9.]/g, "");
		setOverridePrice(validatedText);
	};

	const handleFinish = () => {
		if (!selectedProductId) {
			return showDialog({
				title: "Atención",
				message: "Por favor, selecciona un producto para continuar.",
				intent: "info",
			});
		}

		// 1. Limpiamos espacios en blanco
		const trimmedPrice = overridePrice.trim();

		// 2. Evaluamos si el string no está vacío y si es un número válido
		const parsedPrice =
			trimmedPrice == "" ? null : Number.parseFloat(trimmedPrice);

		// 3. Verificamos que no sea un NaN por accidente
		const finalOverridePrice = Number.isNaN(parsedPrice)
			? null
			: parsedPrice;

		if (selectedProductInfo && onSaveConfig) {
			onSaveConfig({
				id: selectedProductInfo.id,
				name: selectedProductInfo.name,
				price: selectedProductInfo.price,
				override_price: finalOverridePrice,
			});
		}

		navigation.goBack();
	};

	const isPriceEditable = !!selectedProductId;

	return (
		<View style={{ flex: 1, backgroundColor: colors.backgroundLight }}>
			<ScreenHeader
				title="Configurar Sugerencia"
				onBack={() => navigation.goBack()}
				fontSizeTitle={FontSize.xl}
			/>

			<View style={styles.content}>
				<Text
					style={[
						styles.headerSub,
						{ color: colors.textSecondaryLight },
					]}
				>
					Selecciona un producto y asígnale un precio especial de
					venta cruzada si lo deseas.
				</Text>

				{/* Dropdown de productos */}
				<View style={styles.inputContainer}>
					<Text
						style={[
							styles.label,
							{ color: colors.textSecondaryLight },
						]}
					>
						Producto Sugerido
					</Text>
					<CustomDropdown
						placeholder="Selecciona un producto..."
						options={productOptions}
						value={selectedProductId}
						onChange={(val) => {
							setSelectedProductId(val);
							if (!val) setOverridePrice("");
						}}
						colors={colors}
					/>
				</View>

				{/* 💡 Precio Original como Texto (Lectura) */}
				<View style={styles.inputContainer}>
					<Text
						style={[
							styles.label,
							{ color: colors.textSecondaryLight },
						]}
					>
						Precio Original
					</Text>
					<Text
						style={[
							styles.priceText,
							{ color: colors.textPrimaryLight },
						]}
					>
						{selectedProductInfo?.price
							? `$${selectedProductInfo.price}`
							: "Selecciona un producto"}
					</Text>
				</View>

				{/* 💡 Input de Precio Modificado con tu componente InputField */}
				<View style={styles.fieldWrapper}>
					<InputField
						label="Precio Modificado (Opcional)"
						placeholder={
							isPriceEditable ? "0.00" : "Selecciona un producto"
						}
						value={overridePrice}
						onChangeText={handlePriceChange}
						keyboardType="decimal-pad"
						editable={isPriceEditable}
						showLabel={true}
					/>
				</View>
			</View>

			<View
				style={[
					styles.bottomContainer,
					{
						borderTopColor: colors.borderLight,
						backgroundColor: colors.backgroundLight,
					},
				]}
			>
				<PrimaryButton
					title="Guardar cambios"
					onPress={handleFinish}
					disabled={!selectedProductId}
					marginBottom={
						Platform.OS === "ios" ? insets.bottom : Spacing.md
					}
				/>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	content: {
		paddingHorizontal: Spacing.md,
		paddingTop: Spacing.sm,
		flex: 1,
	},
	headerSub: {
		fontSize: FontSize.md,
		marginBottom: Spacing.lg,
	},
	inputContainer: {
		marginBottom: Spacing.lg,
		marginHorizontal: 5, // Para alinearse con el margen de 5 que tiene el InputField
	},
	fieldWrapper: {
		marginBottom: Spacing.lg,
	},
	label: {
		fontSize: FontSize.md,
		fontWeight: FontWeight.bold,
		marginBottom: 8,
		marginTop: 10,
	},
	priceText: {
		fontSize: FontSize.md,
		fontWeight: FontWeight.medium,
		paddingHorizontal: Spacing.sm,
		paddingVertical: 4,
	},
	bottomContainer: {
		padding: Spacing.md,
		borderTopWidth: 1,
	},
});
