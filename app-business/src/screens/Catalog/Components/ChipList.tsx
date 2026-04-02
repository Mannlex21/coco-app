import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";

interface ChipListProps<T> {
	items: T[];
	onRemoveProduct: (id: string) => void;
	onPressItem?: (item: T) => void;

	// 🔥 NUEVAS PROPS PARA CUSTOMIZACIÓN
	// Función para obtener el texto visible (ej: item => item.description)
	getLabel?: (item: T) => string;
	// Función por si el id se llama diferente (ej: item => item.product_id)
	getKey?: (item: T) => string;
}

// Convertimos el componente a genérico <T> para mantener el tipado estricto
export const ChipList = React.memo(
	<T extends Record<string, any>>({
		items,
		onRemoveProduct,
		onPressItem,
		getLabel,
		getKey,
	}: ChipListProps<T>) => {
		const { colors, isDark } = useTheme();

		if (!items || items.length === 0) return null;

		const textColor = isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.85)";
		const chipBg = isDark ? "rgba(255,255,255,0.05)" : "#EAEAEA";

		return (
			<View style={styles.chipsContainer}>
				{items.map((item) => {
					// 1. Extraemos la llave única (id por defecto)
					const key = getKey ? getKey(item) : item.id;

					// 2. Extraemos el texto a mostrar (name o title por defecto)
					const displayName = getLabel
						? getLabel(item)
						: item.name || item.title || "Sin nombre";

					return (
						<View
							key={key}
							style={[styles.chip, { backgroundColor: chipBg }]}
						>
							<TouchableOpacity
								style={styles.textContainer}
								onPress={() => onPressItem && onPressItem(item)}
								disabled={!onPressItem}
								activeOpacity={0.6}
							>
								<Text
									style={[
										styles.chipText,
										{ color: textColor },
									]}
									numberOfLines={1}
									ellipsizeMode="tail"
								>
									{displayName}
								</Text>
							</TouchableOpacity>

							<TouchableOpacity
								onPress={() => onRemoveProduct(key)}
								activeOpacity={0.7}
								style={styles.closeButton}
							>
								<Ionicons
									name="close-circle"
									size={18}
									color={colors.error}
								/>
							</TouchableOpacity>
						</View>
					);
				})}
			</View>
		);
	},
);

const styles = StyleSheet.create({
	chipsContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
		marginTop: 12,
	},
	chip: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 6,
		paddingHorizontal: 10,
		borderRadius: 20,
	},
	textContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginRight: 6,
	},
	chipText: {
		fontSize: 13,
		fontWeight: "500",
		maxWidth: 150,
	},
	closeButton: {
		paddingVertical: 2,
		justifyContent: "center",
		alignItems: "center",
	},
});
