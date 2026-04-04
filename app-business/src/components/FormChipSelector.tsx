import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { FontSize, FontWeight } from "@coco/shared/config/theme";

type IoniconsProps = React.ComponentProps<typeof Ionicons>;
type IoniconsName = IoniconsProps["name"];

interface FormChipSelectorProps<T> {
	label: string;
	addButtonLabel?: string;
	addButtonIcon?: IoniconsName;
	items: T[];
	maxVisibleChips?: number;
	onPressAdd: () => void;
	onPressItem?: (item: T) => void;
	onRemoveItem: (id: string) => void;
	getLabel: (item: T) => string;
	getKey: (item: T) => string;
	disabled?: boolean;
}

export const FormChipSelector = memo(
	<T extends Record<string, any>>({
		label,
		addButtonLabel = "Agregar",
		addButtonIcon = "add",
		items,
		maxVisibleChips = 3,
		onPressAdd,
		onPressItem,
		onRemoveItem,
		getLabel,
		getKey,
		disabled = false,
	}: FormChipSelectorProps<T>) => {
		const { colors } = useTheme();

		const visibleItems = items.slice(0, maxVisibleChips);
		const remainingCount = items.length - maxVisibleChips;

		const chipBg = colors.inputBg;
		const textColor = colors.textPrimaryLight;

		return (
			<View style={styles.divider}>
				<Text
					style={[styles.label, { color: colors.textSecondaryLight }]}
				>
					{label}
				</Text>

				<View style={styles.chipsContainer}>
					<TouchableOpacity
						style={[
							styles.chip,
							{ backgroundColor: chipBg },
							disabled && { opacity: 0.5 },
						]}
						onPress={onPressAdd}
						activeOpacity={0.6}
						disabled={disabled}
					>
						<View style={styles.textContainer}>
							<Ionicons
								name={addButtonIcon as any}
								size={16}
								color={textColor}
								style={{ marginRight: 4 }}
							/>
							<Text
								style={[
									styles.chipText,
									{ color: textColor, fontWeight: "500" },
								]}
							>
								{addButtonLabel}
							</Text>
						</View>
					</TouchableOpacity>

					{visibleItems.map((item) => {
						const key = getKey(item);
						const displayName = getLabel(item);

						return (
							<View
								key={key}
								style={[
									styles.chip,
									{ backgroundColor: chipBg },
									disabled && { opacity: 0.7 },
								]}
							>
								<TouchableOpacity
									style={styles.textContainer}
									onPress={() => onPressItem?.(item)}
									disabled={disabled || !onPressItem}
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
									onPress={() => onRemoveItem(key)}
									activeOpacity={0.7}
									style={[
										styles.closeButton,
										disabled && { opacity: 0.3 },
									]}
									disabled={disabled}
								>
									<Ionicons
										name="close-circle"
										size={16}
										color={colors.error}
									/>
								</TouchableOpacity>
							</View>
						);
					})}

					{remainingCount > 0 && (
						<TouchableOpacity
							style={[
								styles.chip,
								{ backgroundColor: chipBg },
								disabled && { opacity: 0.5 },
							]}
							onPress={onPressAdd}
							activeOpacity={0.6}
							disabled={disabled}
						>
							<Text
								style={[
									styles.chipText,
									{
										color: colors.textSecondaryLight,
										fontWeight: "600",
									},
								]}
							>
								+ {remainingCount}
							</Text>
						</TouchableOpacity>
					)}
				</View>
			</View>
		);
	},
);

const styles = StyleSheet.create({
	divider: {
		marginTop: 16,
		marginBottom: 8,
	},
	label: {
		fontSize: FontSize.md,
		fontWeight: FontWeight.bold,
		marginBottom: 8,
		marginTop: 10,
	},
	chipsContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
	},
	chip: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 6,
		paddingHorizontal: 12,
		borderRadius: 20,
	},
	textContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginRight: 4,
	},
	chipText: {
		fontSize: 13,
		maxWidth: 120,
	},
	closeButton: {
		justifyContent: "center",
		alignItems: "center",
	},
});
