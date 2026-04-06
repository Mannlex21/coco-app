import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { useDialog, useSupabaseContext } from "@coco/shared/providers";
import {
	FontSize,
	FontWeight,
	Spacing,
	BorderRadius,
} from "@coco/shared/config/theme";
import { useAppStore } from "@coco/shared/hooks/useAppStore";

export const LogoutCard = () => {
	const supabase = useSupabaseContext();
	const { colors } = useTheme();
	const { showDialog } = useDialog();
	const { setActiveBusiness, setUser } = useAppStore();

	const errorBg = colors.errorLight;
	const errorTextColor = colors.error;

	const handleLogout = () => {
		showDialog({
			title: "Cerrar Sesión",
			message: "¿Estás seguro de que quieres salir de tu cuenta?",
			intent: "error",
			type: "options",
			onConfirm: () => {
				(async () => {
					try {
						const { error } = await supabase.auth.signOut();
						if (error) throw error;
						setActiveBusiness(null);
						setUser(null);
					} catch (error: any) {
						console.error("Error al cerrar sesión:", error.message);
						showDialog({
							title: "Error",
							message: "No se pudo cerrar sesión.",
							intent: "error",
						});
					}
				})();
			},
		});
	};

	return (
		<View style={styles.sectionContainer}>
			<TouchableOpacity
				style={[
					styles.buttonRow,
					{
						backgroundColor: colors.errorLight,
						borderColor: colors.error,
						borderWidth: StyleSheet.hairlineWidth,
					},
				]}
				onPress={handleLogout}
				activeOpacity={0.7}
			>
				<View style={styles.iconContainer}>
					<Ionicons
						name="log-out-outline"
						size={22}
						color={errorTextColor}
					/>
				</View>

				<Text style={[styles.buttonLabel, { color: errorTextColor }]}>
					Cerrar Sesión
				</Text>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	sectionContainer: {
		width: "100%",
	},
	buttonRow: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: Spacing.md,
		paddingHorizontal: Spacing.md,
		borderRadius: BorderRadius.md,
		position: "relative",
	},
	iconContainer: {
		position: "absolute",
		left: Spacing.md,
		justifyContent: "center",
		alignItems: "center",
	},
	buttonLabel: {
		fontSize: FontSize.md,
		fontWeight: FontWeight.bold,
		textAlign: "center",
	},
});
