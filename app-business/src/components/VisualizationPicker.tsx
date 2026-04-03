import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FontSize, FontWeight } from "@coco/shared/config/theme";
import { memo } from "react";

interface VisualizationPickerProps {
	type: "list" | "grid";
	setType: (type: "list" | "grid") => void;
	subTextColor: string;
	textColor: string;
	borderColor: string;
	businessBg: string;
	label?: string;
	showLabel?: boolean;
}

export const VisualizationPicker = memo(
	({
		type,
		setType,
		subTextColor,
		textColor,
		borderColor,
		businessBg,
		label = "Visualización",
		showLabel = true,
	}: VisualizationPickerProps) => (
		<View style={styles.container}>
			{showLabel && (
				<Text style={[styles.label, { color: subTextColor }]}>
					{label}
				</Text>
			)}

			<View style={[styles.pickerRow, { borderColor: borderColor }]}>
				<TouchableOpacity
					style={[
						styles.pickerOption,
						type === "list" && { backgroundColor: businessBg },
					]}
					onPress={() => setType("list")}
					activeOpacity={0.9}
				>
					<Ionicons
						name="list"
						size={18}
						color={type === "list" ? "white" : subTextColor}
					/>
					<Text
						style={[
							styles.pickerOptionText,
							{ color: type === "list" ? "white" : textColor },
						]}
					>
						Lista
					</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={[
						styles.pickerOption,
						type === "grid" && { backgroundColor: businessBg },
					]}
					onPress={() => setType("grid")}
					activeOpacity={0.9}
				>
					<Ionicons
						name="grid"
						size={16}
						color={type === "grid" ? "white" : subTextColor}
					/>
					<Text
						style={[
							styles.pickerOptionText,
							{ color: type === "grid" ? "white" : textColor },
						]}
					>
						Cuadrícula
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	),
);

const styles = StyleSheet.create({
	container: {},
	label: {
		fontSize: FontSize.md,
		fontWeight: FontWeight.bold,
		marginBottom: 8,
		marginTop: 10,
	},
	pickerRow: {
		flexDirection: "row",
		borderWidth: 1,
		borderRadius: 12,
		overflow: "hidden",
		marginTop: 5,
	},
	pickerOption: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 12,
		gap: 8,
	},
	pickerOptionText: {
		fontSize: 14,
		fontWeight: "600",
	},
});
