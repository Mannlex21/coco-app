import React from "react";
import { View, Text, StyleSheet, Switch, Platform } from "react-native";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { FontSize, FontWeight } from "@coco/shared/config/theme";

interface ToggleFieldProps {
	title: string;
	activeDescription: string;
	inactiveDescription: string;
	value: boolean;
	onValueChange: (val: boolean) => void;
	disabled?: boolean;
}

export const ToggleField = React.memo(
	({
		title,
		activeDescription,
		inactiveDescription,
		value,
		onValueChange,
		disabled = false,
	}: ToggleFieldProps) => {
		const { colors, isDark } = useTheme();

		// 🎨 Paleta de colores dinámica
		const textColor = isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.85)";
		const subTextColor = isDark
			? "rgba(255,255,255,0.6)"
			: "rgba(0,0,0,0.55)";

		// Fondo del track cuando está apagado
		const trackColorFalse = isDark ? "#3A3A3C" : "#D1D1D6";

		return (
			<View style={styles.container}>
				<View style={styles.toggleRow}>
					<View style={{ flex: 1, paddingRight: 10 }}>
						<Text
							style={[
								styles.toggleTitle,
								{ color: subTextColor },
							]}
						>
							{title}
						</Text>
						<Text
							style={[
								styles.toggleSubtitle,
								{ color: subTextColor },
							]}
						>
							{value ? activeDescription : inactiveDescription}
						</Text>
					</View>

					<Switch
						value={value}
						onValueChange={onValueChange}
						disabled={disabled}
						// iOS usa trackColor, Android usa thumbColor y trackColor
						trackColor={{
							false: trackColorFalse,
							true: colors.businessBg,
						}}
						// El círculo deslizable
						thumbColor={
							Platform.OS === "android" ? "#FFFFFF" : undefined
						}
						// Color de fondo nativo en iOS para redondear el diseño cuando está apagado
						ios_backgroundColor={trackColorFalse}
					/>
				</View>
			</View>
		);
	},
);

const styles = StyleSheet.create({
	container: {
		marginTop: 5,
	},
	label: {
		fontSize: 13,
		fontWeight: FontWeight.bold,
		textTransform: "uppercase",
		marginBottom: 8,
		marginTop: 20,
	},
	toggleRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	toggleTitle: {
		fontSize: FontSize.md,
		fontWeight: FontWeight.bold,
	},
	toggleSubtitle: {
		fontSize: FontSize.sm,
		fontWeight: FontWeight.medium,
	},
});
