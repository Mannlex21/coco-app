import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "@coco/shared/hooks/useTheme"; // 👈 Tu hook de tema
import { Ionicons } from "@expo/vector-icons";

// Mantenemos la estructura mínima que necesita este componente para ser versátil
interface ChipItem {
	id: string;
	name: string;
}

interface ChipListProps {
	items: ChipItem[];
	onRemoveProduct: (productId: string) => void;
}

export const ChipList = React.memo(
	({ items, onRemoveProduct }: ChipListProps) => {
		const { colors, isDark } = useTheme();

		// Si no hay productos seleccionados, no renderizamos nada
		if (!items || items.length === 0) return null;

		// 🎨 Paleta de colores dinámica
		const textColor = isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.85)";
		const chipBg = isDark ? "rgba(255,255,255,0.05)" : "#EAEAEA";

		return (
			<View style={styles.chipsContainer}>
				{items.map((item) => (
					<View
						key={item.id}
						style={[styles.chip, { backgroundColor: chipBg }]}
					>
						<Text
							style={[styles.chipText, { color: textColor }]}
							numberOfLines={1}
						>
							{item.name}
						</Text>
						<TouchableOpacity
							onPress={() => onRemoveProduct(item.id)}
							activeOpacity={0.7}
						>
							<Ionicons
								name="close-circle"
								size={18}
								color={colors.error}
							/>
						</TouchableOpacity>
					</View>
				))}
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
		paddingHorizontal: 12,
		borderRadius: 20,
		gap: 6,
		maxWidth: "48%",
	},
	chipText: {
		fontSize: 13,
		fontWeight: "500",
		flexShrink: 1,
	},
});
