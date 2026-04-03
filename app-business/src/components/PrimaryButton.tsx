import {
	TouchableOpacity,
	Text,
	StyleSheet,
	ActivityIndicator,
	ViewStyle,
	TextStyle,
} from "react-native";
import { BorderRadius, FontWeight } from "@coco/shared/config/theme";
import { useTheme } from "@coco/shared/hooks/useTheme";

interface PrimaryButtonProps {
	title: string;
	onPress: () => void;
	loading?: boolean;
	disabled?: boolean;
	style?: ViewStyle;
	textStyle?: TextStyle;
	marginBottom?: number;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
	title,
	onPress,
	loading = false,
	disabled = false,
	style,
	textStyle,
	marginBottom = 0,
}) => {
	const { colors } = useTheme();

	const isInteractionDisabled = loading || disabled;

	return (
		<TouchableOpacity
			style={[
				styles.btn,
				{
					backgroundColor: colors.businessBg,
					marginBottom: marginBottom,
				},
				isInteractionDisabled && styles.disabled,
				style,
			]}
			onPress={onPress}
			disabled={isInteractionDisabled}
			activeOpacity={0.8}
		>
			{loading ? (
				<ActivityIndicator size="small" color="#FFFFFF" />
			) : (
				<Text style={[styles.btnText, textStyle]}>{title}</Text>
			)}
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	btn: {
		padding: 16,
		borderRadius: BorderRadius.md,
		alignItems: "center",
		justifyContent: "center",
		minHeight: 54,
	},
	disabled: {
		opacity: 0.6,
	},
	btnText: {
		color: "white",
		fontWeight: FontWeight.bold,
		fontSize: 16,
	},
});
