import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { FontSize, Spacing } from "@coco/shared/config/theme";
import { BusinessSelectorCard } from "./components/BusinessSelectorCard";
import { PreferencesCard } from "./components/PreferencesCard";
import { AboutCard } from "./components/AboutCard";
import { LogoutCard } from "./components/LogoutCard";
import { ProfileHeader } from "./components/ProfileHeader";

export const ProfileScreen = () => {
	const { colors, isDark } = useTheme();
	const subTextColor = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.55)";

	const headerBgColor =
		colors.surfaceLight || (isDark ? "#1C1C1E" : "#FFFFFF");
	const backgroundBg = isDark ? "#121212" : "#F8F9FA";

	return (
		<View style={[styles.container, { backgroundColor: headerBgColor }]}>
			<ProfileHeader />

			<View style={[styles.body, { backgroundColor: backgroundBg }]}>
				<ScrollView
					contentContainerStyle={styles.scrollContent}
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
	},
	versionText: {
		textAlign: "center",
		fontSize: FontSize.xs,
		opacity: 0.6,
		paddingTop: Spacing.lg,
		paddingBottom: Spacing.lg,
	},
});
