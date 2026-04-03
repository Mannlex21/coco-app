import { View, Text, StyleSheet, ScrollView, Platform } from "react-native";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { FontSize, Spacing, FontWeight } from "@coco/shared/config/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
	BusinessSelectorCard,
	PreferencesCard,
	AboutCard,
	LogoutCard,
	ProfileHeader,
} from "@/screens/Profile/components";

export const ProfileScreen = () => {
	const { colors } = useTheme();
	const insets = useSafeAreaInsets();

	const headerBgColor = colors.surfaceLight;
	const backgroundBg = colors.backgroundLight;
	const subTextColor = colors.textSecondaryLight;

	return (
		<View style={[styles.container, { backgroundColor: headerBgColor }]}>
			<ProfileHeader />

			<View style={[styles.body, { backgroundColor: backgroundBg }]}>
				<ScrollView
					contentContainerStyle={[
						styles.scrollContent,
						{
							paddingBottom:
								Platform.OS === "ios" ? insets.bottom + 20 : 30,
						},
					]}
					showsVerticalScrollIndicator={false}
				>
					<BusinessSelectorCard />
					<PreferencesCard />
					<AboutCard />
					<LogoutCard />

					<Text style={[styles.versionText, { color: subTextColor }]}>
						Coco App - Socio v1.0.0 (Beta)
					</Text>
				</ScrollView>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	body: {
		flex: 1,
	},
	scrollContent: {
		padding: Spacing.md,
		gap: Spacing.md,
	},
	versionText: {
		textAlign: "center",
		fontSize: FontSize.xs,
		fontWeight: FontWeight.medium,
		paddingTop: Spacing.md,
		paddingBottom: Spacing.xs,
	},
});
