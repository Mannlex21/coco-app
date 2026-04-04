import { memo } from "react";
import { View, Text, StyleSheet, Switch, Platform } from "react-native";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { FontSize, FontWeight } from "@coco/shared/config/theme";

interface ToggleFieldProps {
	label: string;
	activeDescription: string;
	inactiveDescription: string;
	value: boolean;
	onValueChange: (val: boolean) => void;
	disabled?: boolean;
}

export const ToggleField = memo(
	({
		label,
		activeDescription,
		inactiveDescription,
		value,
		onValueChange,
		disabled = false,
	}: ToggleFieldProps) => {
		const { colors } = useTheme();

		// Usamos el color de borde para el fondo del switch apagado
		// para que sea sutil y se adapte a ambos temas
		const trackColorFalse = colors.borderLight;

		return (
			<View style={styles.container}>
				<View style={styles.toggleRow}>
					<View style={styles.textContainer}>
						<Text
							style={[
								styles.toggleTitle,
								{ color: colors.textSecondaryLight },
							]}
						>
							{label}
						</Text>
						<Text
							style={[
								styles.toggleSubtitle,
								{ color: colors.textSecondaryLight },
							]}
						>
							{value ? activeDescription : inactiveDescription}
						</Text>
					</View>

					<Switch
						value={value}
						onValueChange={onValueChange}
						disabled={disabled}
						trackColor={{
							false: trackColorFalse,
							true: colors.businessBg,
						}}
						thumbColor={
							Platform.OS === "android" ? "#FFFFFF" : undefined
						}
						ios_backgroundColor={trackColorFalse}
					/>
				</View>
			</View>
		);
	},
);

const styles = StyleSheet.create({
	container: {
		marginTop: 12,
		marginBottom: 4,
	},
	toggleRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	textContainer: {
		flex: 1,
		paddingRight: 12,
	},
	toggleTitle: {
		fontSize: FontSize.md,
		fontWeight: FontWeight.bold,
		marginBottom: 4,
	},
	toggleSubtitle: {
		fontSize: FontSize.sm,
		fontWeight: FontWeight.medium,
	},
});
