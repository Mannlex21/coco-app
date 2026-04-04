import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { FontSize, FontWeight } from "@coco/shared/config/theme";
import { memo } from "react";

interface VisualizationPickerProps {
	type: "list" | "grid";
	setType: (type: "list" | "grid") => void;
	label?: string;
	showLabel?: boolean;
}

export const VisualizationPicker = memo(
	({
		type,
		setType,
		label = "Visualización",
		showLabel = true,
	}: VisualizationPickerProps) => {
		const { colors } = useTheme();

		return (
			<View style={styles.container}>
				{showLabel && (
					<Text
						style={[
							styles.label,
							{ color: colors.textSecondaryLight },
						]}
					>
						{label}
					</Text>
				)}

				<View
					style={[
						styles.pickerRow,
						{ borderColor: colors.borderLight },
					]}
				>
					<TouchableOpacity
						style={[
							styles.pickerOption,
							type === "list" && {
								backgroundColor: colors.businessBg,
							},
						]}
						onPress={() => setType("list")}
						activeOpacity={0.9}
					>
						<Ionicons
							name="list"
							size={18}
							color={
								type === "list"
									? colors.textOnPrimary
									: colors.textSecondaryLight
							}
						/>
						<Text
							style={[
								styles.pickerOptionText,
								{
									color:
										type === "list"
											? colors.textOnPrimary
											: colors.textPrimaryLight,
								},
							]}
						>
							Lista
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={[
							styles.pickerOption,
							type === "grid" && {
								backgroundColor: colors.businessBg,
							},
						]}
						onPress={() => setType("grid")}
						activeOpacity={0.9}
					>
						<Ionicons
							name="grid"
							size={16}
							color={
								type === "grid"
									? colors.textOnPrimary
									: colors.textSecondaryLight
							}
						/>
						<Text
							style={[
								styles.pickerOptionText,
								{
									color:
										type === "grid"
											? colors.textOnPrimary
											: colors.textPrimaryLight,
								},
							]}
						>
							Cuadrícula
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		);
	},
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
