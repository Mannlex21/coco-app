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

	// Mapeo semántico directo usando tu ColorPalette
	const headerBgColor = colors.surfaceLight;
	const backgroundBg = colors.backgroundLight;
	const subTextColor = colors.textSecondaryLight;

	return (
		// El contenedor principal adopta el color del header para evitar saltos visuales en el notch
		<View style={[styles.container, { backgroundColor: headerBgColor }]}>
			{/* Header del Perfil */}
			<ProfileHeader />

			{/* Cuerpo con Scroll */}
			<View style={[styles.body, { backgroundColor: backgroundBg }]}>
				<ScrollView
					contentContainerStyle={[
						styles.scrollContent,
						// Aseguramos el área segura inferior para evitar cortes en el botón de logout o versión
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

					{/* Texto de versión estilizado semánticamente */}
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
		// Agregamos un gap consistente entre las tarjetas en lugar de margins individuales
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
