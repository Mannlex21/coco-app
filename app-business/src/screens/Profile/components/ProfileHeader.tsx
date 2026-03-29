import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "@coco/shared/hooks/useAppStore";
import { useTheme } from "@coco/shared/hooks/useTheme";
import {
	FontSize,
	FontWeight,
	BorderRadius,
	Spacing,
	Shadow,
} from "@coco/shared/config/theme";

export const ProfileHeader = () => {
	const { user } = useAppStore();
	const { colors, isDark } = useTheme();
	const insets = useSafeAreaInsets();

	const textColor = isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.85)";
	const subTextColor = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.55)";

	const headerBgColor =
		colors.surfaceLight || (isDark ? "#1C1C1E" : "#FFFFFF");

	// Calculamos las iniciales del nombre
	const getInitials = () => {
		if (!user?.name) return "SC";
		return user.name
			.split(" ")
			.map((n: string) => n[0])
			.join("")
			.toUpperCase();
	};

	return (
		<View
			style={[
				styles.header,
				{
					backgroundColor: headerBgColor,
					paddingTop: insets.top + Spacing.sm,
					borderBottomColor: isDark
						? "rgba(255,255,255,0.1)"
						: "rgba(0,0,0,0.08)",
				},
			]}
		>
			<View style={styles.profileHeaderContent}>
				{/* Avatar */}
				<View
					style={[
						styles.avatarPlaceholder,
						{ backgroundColor: colors.businessBg },
					]}
				>
					<Text style={styles.avatarText}>{getInitials()}</Text>
				</View>

				{/* Información del Usuario */}
				<View style={styles.headerInfo}>
					<Text style={[styles.userName, { color: textColor }]}>
						{user?.name || "Socio Coco"}
					</Text>
					<Text style={[styles.userPhone, { color: subTextColor }]}>
						{user?.phone
							? `WhatsApp: ${user.phone}`
							: "Sin teléfono"}
					</Text>

					{/* Badge Verificado */}
					<View style={styles.badge}>
						<Ionicons
							name="shield-checkmark"
							size={14}
							color="white"
						/>
						<Text style={styles.badgeText}>Socio Verificado</Text>
					</View>
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	header: {
		paddingHorizontal: Spacing.md,
		paddingBottom: Spacing.lg,
		borderBottomWidth: 1,
	},
	profileHeaderContent: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: Spacing.xs,
	},
	avatarPlaceholder: {
		width: 70,
		height: 70,
		borderRadius: BorderRadius.full,
		justifyContent: "center",
		alignItems: "center",
		...Shadow.md,
	},
	avatarText: {
		fontSize: FontSize.title,
		fontWeight: FontWeight.black,
		color: "#FFFFFF",
	},
	headerInfo: {
		flex: 1,
		marginLeft: Spacing.md,
	},
	userName: {
		fontSize: FontSize.lg,
		fontWeight: FontWeight.bold,
	},
	userPhone: {
		fontSize: FontSize.sm,
		marginTop: 2,
	},
	badge: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "rgba(76, 175, 80, 0.9)",
		paddingVertical: 3,
		paddingHorizontal: Spacing.sm,
		borderRadius: BorderRadius.sm,
		marginTop: Spacing.sm,
		alignSelf: "flex-start",
	},
	badgeText: {
		color: "white",
		fontSize: FontSize.xs - 1,
		fontWeight: FontWeight.bold,
		marginLeft: 4,
		textTransform: "uppercase",
	},
});
