import React from "react";
import {
	Text,
	TextInput,
	View,
	StyleSheet,
	TextInputProps,
} from "react-native";
import { useTheme } from "@coco/shared/hooks/useTheme";
import {
	Colors,
	BorderRadius,
	FontSize,
	FontWeight,
} from "@coco/shared/config/theme";

// 💡 Heredamos todas las propiedades nativas de un TextInput (como keyboardType, autoCapitalize, etc.)
interface InputFieldProps extends TextInputProps {
	label: string;
	showLabel?: boolean;
}

export const InputField = React.memo(
	({
		label,
		value,
		onChangeText,
		placeholder,
		multiline = false,
		editable = true,
		showLabel = true,
		style, // Extraemos style por si pasas estilos personalizados por fuera
		...props // 👈 Captura el resto de propiedades como keyboardType, returnKeyType, etc.
	}: InputFieldProps) => {
		const { isDark } = useTheme();

		const activeColors = isDark ? Colors.dark : Colors.light;

		const textColor = activeColors.textPrimaryLight;
		const subTextColor = activeColors.textSecondaryLight;
		const inputBgColor = activeColors.inputBg;

		const showFakePlaceholder = !multiline && !value;

		return (
			<View style={styles.container}>
				{showLabel && (
					<Text style={[styles.label, { color: subTextColor }]}>
						{label}
					</Text>
				)}

				<View style={styles.inputWrapper}>
					{showFakePlaceholder && (
						<Text
							style={[
								styles.fakePlaceholder,
								{ color: subTextColor },
							]}
							numberOfLines={1}
							ellipsizeMode="tail"
						>
							{placeholder}
						</Text>
					)}

					<TextInput
						style={[
							styles.input,
							{
								color: textColor,
								backgroundColor: inputBgColor,
								height: multiline ? 100 : 54,
								textAlignVertical: multiline ? "top" : "center",
								paddingTop: multiline ? 14 : 16,
								paddingBottom: multiline ? 14 : 16,
								minHeight: multiline ? 100 : 54,
							},
							style, // 👈 Permite sobreescribir estilos base si fuera necesario
						]}
						placeholder={multiline ? placeholder : ""}
						placeholderTextColor={subTextColor}
						value={value}
						onChangeText={onChangeText}
						multiline={multiline}
						editable={editable}
						{...props} // 👈 Inyecta automáticamente keyboardType y cualquier otra que mandes
					/>
				</View>
			</View>
		);
	},
);

const styles = StyleSheet.create({
	container: {
		margin: 5,
	},
	label: {
		fontSize: FontSize.md,
		fontWeight: FontWeight.bold,
		marginBottom: 8,
		marginTop: 10,
	},
	inputWrapper: {
		position: "relative",
		justifyContent: "center",
	},
	input: {
		borderRadius: BorderRadius.md,
		paddingHorizontal: 16,
		fontSize: FontSize.md,
		backgroundColor: "red",
	},
	fakePlaceholder: {
		position: "absolute",
		left: 16,
		top: 16,
		fontSize: FontSize.md,
		zIndex: 1,
		pointerEvents: "none",
	},
});
