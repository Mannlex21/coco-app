import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { FontSize } from "@coco/shared/config/theme";
import { memo, ReactNode } from "react";

interface SectionHeaderProps {
	title: string;
	onBack: () => void;
	fontSizeTitle?: number;
	rightActions?: ReactNode;
}

export const ScreenHeader = memo(
	({
		title,
		onBack,
		fontSizeTitle = FontSize.title,
		rightActions,
	}: SectionHeaderProps) => {
		const { isDark } = useTheme();
		const textColor = isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.85)";

		return (
			<View style={styles.headerWrapper}>
				<View style={styles.headerContent}>
					<TouchableOpacity
						onPress={onBack}
						style={styles.backButton}
						activeOpacity={0.7}
					>
						<Ionicons
							name="arrow-back"
							size={24}
							color={textColor}
						/>
					</TouchableOpacity>

					<Text
						style={[
							styles.headerTitle,
							{
								color: textColor,
								fontSize: fontSizeTitle,
							},
						]}
						numberOfLines={1}
						ellipsizeMode="tail"
					>
						{title}
					</Text>

					{/* Contenedor para acciones en el extremo derecho */}
					{rightActions && (
						<View style={styles.rightActionsContainer}>
							{rightActions}
						</View>
					)}
				</View>
			</View>
		);
	},
);

const styles = StyleSheet.create({
	headerWrapper: {
		paddingHorizontal: 16,
		paddingTop: 16,
		paddingBottom: 8,
	},
	headerContent: {
		flexDirection: "row",
		alignItems: "center",
	},
	backButton: {
		paddingVertical: 8,
		paddingRight: 16, // Devolvemos su espacio original
	},
	headerTitle: {
		fontWeight: "800",
		flex: 1,
	},
	rightActionsContainer: {
		flexDirection: "row",
		alignItems: "center",
		padding: 15,
	},
});
