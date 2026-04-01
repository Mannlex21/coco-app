import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
	FontSize,
	FontWeight,
	Spacing,
	Shadow,
} from "@coco/shared/config/theme";

// 🔥 1. Importamos ComponentProps para extraer los tipos del componente
type IoniconsProps = React.ComponentProps<typeof Ionicons>;
// 🔥 2. Esto extrae estrictamente la lista de strings con nombres válidos de iconos
type IoniconsName = IoniconsProps["name"];

interface FloatingButtonProps {
	label: string;
	iconName?: IoniconsName; // 👈 Ahora TypeScript sabe exactamente qué nombres son válidos
	onPress: () => void;
	colors: any;
	activeOpacity?: number;
}

export const FloatingButton = ({
	label,
	iconName = "add", // Por defecto dejamos el icono de suma
	onPress,
	colors,
	activeOpacity = 0.8,
}: FloatingButtonProps) => {
	return (
		<View style={styles.fabFixedWrapper} pointerEvents="box-none">
			<TouchableOpacity
				style={[styles.fabUber, { backgroundColor: colors.businessBg }]}
				activeOpacity={activeOpacity}
				onPress={onPress}
			>
				{iconName && (
					<Ionicons
						name={iconName} // 👈 TypeScript ya no se quejará aquí
						size={20}
						color={colors.textOnPrimary}
						style={styles.fabIcon}
					/>
				)}
				<Text style={[styles.fabText, { color: colors.textOnPrimary }]}>
					{label}
				</Text>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	fabFixedWrapper: {
		position: "absolute",
		bottom: Spacing.lg,
		left: 0,
		right: 0,
		alignItems: "center",
		justifyContent: "center",
		pointerEvents: "box-none",
	},
	fabUber: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		height: 46,
		paddingHorizontal: Spacing.lg,
		borderRadius: 23,
		...Shadow.md,
		minWidth: 150,
	},
	fabIcon: {
		marginRight: 4,
	},
	fabText: {
		fontSize: FontSize.sm,
		fontWeight: FontWeight.semibold,
	},
});
