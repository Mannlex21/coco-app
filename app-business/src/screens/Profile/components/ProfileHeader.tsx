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
} from "@coco/shared/config/theme";
import { useNavigation } from "@react-navigation/native";

export const ProfileHeader = () => {
	const { user } = useAppStore();
	const { colors } = useTheme();
	const insets = useSafeAreaInsets();
	const navigation = useNavigation<any>();

	const { userData } = useUser();
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

	// Mapeo utilizando las propiedades exactas de tu interface ColorPalette
	const textColor = colors.textPrimaryLight;
	const subTextColor = colors.textSecondaryLight;
	const separatorColor = colors.borderLight;

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
					backgroundColor: colors.backgroundLight, // ¡Ahora sí! usando backgroundLight
					paddingTop:
						Platform.OS === "ios" ? insets.top : insets.top - 10, // Ajuste para Android
					borderBottomColor: separatorColor,
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
						{userData?.phone || user?.phone || "Sin teléfono"}
					</Text>

					{/* Badge Verificado */}
					<View style={styles.badge}>
						<Ionicons
							name="shield-checkmark"
							size={12}
							color="white"
						/>
						<Text style={styles.badgeText}>Socio Verificado</Text>
					</View>
				</View>

				{/* Botón de Editar */}
				<TouchableOpacity
					style={styles.editButton}
					onPress={() => navigation.navigate("UserSetup")}
					activeOpacity={0.6}
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
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	profileHeaderContent: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: Spacing.xs,
	},
	avatarPlaceholder: {
		width: 64,
		height: 64,
		borderRadius: BorderRadius.full,
		justifyContent: "center",
		alignItems: "center",
		overflow: "hidden",
	},
	avatarText: {
		fontSize: FontSize.lg,
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
		marginTop: 1,
	},
	badge: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#4CAF50",
		paddingVertical: 2,
		paddingHorizontal: Spacing.sm,
		borderRadius: BorderRadius.sm,
		marginTop: Spacing.xs,
		alignSelf: "flex-start",
	},
	badgeText: {
		color: "white",
		fontSize: 10,
		fontWeight: FontWeight.bold,
		marginLeft: 3,
		textTransform: "uppercase",
	},
	editButton: {
		width: 36,
		height: 36,
		borderRadius: BorderRadius.full,
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
