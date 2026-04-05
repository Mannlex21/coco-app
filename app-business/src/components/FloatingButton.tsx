import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
	FontSize,
	FontWeight,
	Spacing,
	Shadow,
} from "@coco/shared/config/theme";
import { useTheme } from "@coco/shared/hooks";

type IoniconsProps = React.ComponentProps<typeof Ionicons>;
type IoniconsName = IoniconsProps["name"];

interface FloatingButtonProps {
	label: string;
	iconName?: IoniconsName;
	onPress: () => void;
	disabled?: boolean;
}

export const FloatingButton = ({
	label,
	iconName = "add",
	onPress,
	disabled = false,
}: FloatingButtonProps) => {
	const { colors } = useTheme();

	return (
		<View style={styles.fabFixedWrapper} pointerEvents="box-none">
			<TouchableOpacity
				style={[
					styles.fabUber,
					{
						backgroundColor: colors.businessBg,
						opacity: disabled ? 0.7 : 1,
					},
				]}
				onPress={onPress}
				disabled={disabled}
			>
				{iconName && (
					<Ionicons
						name={iconName}
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
