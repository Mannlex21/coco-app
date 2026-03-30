import React, { useMemo } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Image,
	Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "@coco/shared/hooks/useAppStore";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { useUser } from "@coco/shared/hooks/supabase";
import {
	FontSize,
	FontWeight,
	BorderRadius,
	Spacing,
	Shadow,
} from "@coco/shared/config/theme";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "@/infrastructure/supabase/config";

export const ProfileHeader = () => {
	const { user } = useAppStore();
	const { colors, isDark } = useTheme();
	const insets = useSafeAreaInsets();
	const navigation = useNavigation<any>();

	const { userData } = useUser(supabase, user?.id);
	const rawAvatarUrl = userData?.avatarUrl || user?.avatarUrl;
	const lastUpdate = userData?.updatedAt
		? new Date(userData.updatedAt).getTime()
		: 0;
	const avatarUrl = useMemo(() => {
		if (!rawAvatarUrl) return null;
		const timestamp = lastUpdate || Date.now();

		return rawAvatarUrl.startsWith("http")
			? `${rawAvatarUrl}?t=${timestamp}`
			: rawAvatarUrl;
	}, [rawAvatarUrl, lastUpdate]);

	const textColor = isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.85)";
	const subTextColor = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.55)";
	const headerBgColor =
		colors.surfaceLight || (isDark ? "#1C1C1E" : "#FFFFFF");

	const getInitials = () => {
		const currentName = userData?.name || user?.name;
		if (!currentName) return "SC";
		return currentName
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
					paddingTop:
						Platform.OS === "android"
							? insets.top - 10
							: insets.top,
					borderBottomColor: isDark
						? "rgba(255,255,255,0.1)"
						: "rgba(0,0,0,0.08)",
				},
			]}
		>
			<View style={styles.profileHeaderContent}>
				<View
					style={[
						styles.avatarPlaceholder,
						{ backgroundColor: colors.businessBg },
					]}
				>
					{avatarUrl ? (
						<Image
							source={{ uri: avatarUrl }}
							style={styles.avatarImage}
						/>
					) : (
						<Text style={styles.avatarText}>{getInitials()}</Text>
					)}
				</View>

				{/* Información del Usuario */}
				<View style={styles.headerInfo}>
					<Text style={[styles.userName, { color: textColor }]}>
						{userData?.name || user?.name || "Socio Coco"}
					</Text>
					<Text style={[styles.userPhone, { color: subTextColor }]}>
						{userData?.phone || user?.phone
							? `${userData?.phone || user?.phone}`
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

				{/* Botón de Editar */}
				<TouchableOpacity
					style={styles.editButton}
					onPress={() => navigation.navigate("UserSetup")}
				>
					<Ionicons name="pencil" size={18} color={textColor} />
				</TouchableOpacity>
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
	},
	avatarPlaceholder: {
		width: 70,
		height: 70,
		borderRadius: BorderRadius.full,
		justifyContent: "center",
		alignItems: "center",
		...Shadow.md,
		overflow: "hidden",
	},
	avatarText: {
		fontSize: FontSize.title,
		fontWeight: FontWeight.black,
		color: "#FFFFFF",
	},
	headerInfo: { flex: 1, marginLeft: Spacing.md },
	userName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
	userPhone: { fontSize: FontSize.sm, marginTop: 2 },
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
	editButton: {
		width: 36,
		height: 36,
		borderRadius: BorderRadius.sm,
		justifyContent: "center",
		alignItems: "center",
		marginLeft: Spacing.sm,
	},
	avatarImage: {
		width: "100%",
		height: "100%",
		resizeMode: "cover",
	},
});
