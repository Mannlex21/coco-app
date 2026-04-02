import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { FontSize } from "@coco/shared/config/theme";

interface SectionHeaderProps {
	title: string;
	onBack: () => void;
	fontSizeTitle?: number;
}

export const ScreenHeader = React.memo(
	({ title, onBack, fontSizeTitle = FontSize.title }: SectionHeaderProps) => {
		const { colors, isDark } = useTheme();
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
							color={textColor} // Uber usa el color del texto para la flecha
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
					>
						{title}
					</Text>
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
		paddingRight: 16,
	},
	headerTitle: {
		fontWeight: "800",
		flex: 1,
	},
});
