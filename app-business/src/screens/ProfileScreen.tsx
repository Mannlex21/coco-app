import React, { ComponentProps } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ScrollView,
	Switch,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "@coco/shared/hooks/useAppStore";
import { AuthService } from "@/infrastructure/auth/AuthService";
import { useTheme } from "@coco/shared/hooks/useTheme";
import {
	Colors,
	FontSize,
	FontWeight,
	BorderRadius,
	Spacing,
	Shadow,
} from "@coco/shared/config/theme";
import { useDialog } from "@coco/shared/providers/DialogContext";

const MenuOption = ({
	icon,
	label,
	onPress,
	isError,
	rightElement,
	isDark,
	subTextColor,
}: any) => {
	let iconColor;
	if (isError) {
		iconColor = "rgba(231, 111, 81, 1)";
	} else if (isDark) {
		iconColor = "rgba(255,255,255,0.7)";
	} else {
		iconColor = "rgba(0,0,0,0.6)";
	}

	let labelColor;
	if (isError) {
		labelColor = "rgba(231, 111, 81, 1)";
	} else if (isDark) {
		labelColor = "rgba(255,255,255,0.9)";
	} else {
		labelColor = "rgba(0,0,0,0.85)";
	}

	return (
		<TouchableOpacity
			style={[
				styles.optionRow,
				{
					borderBottomColor: isDark
						? "rgba(255,255,255,0.08)"
						: "rgba(0,0,0,0.05)",
				},
			]}
			onPress={onPress}
			activeOpacity={0.7}
			disabled={!onPress}
		>
			<View style={styles.optionLeft}>
				<Ionicons name={icon} size={22} color={iconColor} />
				<Text style={[styles.optionLabel, { color: labelColor }]}>
					{label}
				</Text>
			</View>

			{rightElement ||
				(onPress && (
					<Ionicons
						name="chevron-forward"
						size={20}
						color={subTextColor}
						style={{ opacity: 0.8 }}
					/>
				))}
		</TouchableOpacity>
	);
};

export const ProfileScreen = () => {
	const { user } = useAppStore();
	const { colors, isDark, toggleTheme } = useTheme();
	const insets = useSafeAreaInsets();
	const { showDialog } = useDialog();

	const textColor = isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.85)";
	const subTextColor = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.55)";

	const headerBgColor =
		colors.surfaceLight || (isDark ? "#1C1C1E" : "#FFFFFF");
	const backgroundBg = isDark ? "#121212" : "#F8F9FA";
	const cardBg = isDark ? "#1C1C1E" : "#FFFFFF";

	const handleLogout = () => {
		showDialog({
			title: "Cerrar Sesión",
			message: "¿Estás seguro de que quieres salir de tu cuenta?",
			intent: "error",
			onConfirm: () => {
				(async () => {
					try {
						await AuthService.logout();
					} catch (error) {
						console.error(error);
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
		<View style={[styles.container, { backgroundColor: headerBgColor }]}>
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
					<View
						style={[
							styles.avatarPlaceholder,
							{ backgroundColor: colors.businessBg },
						]}
					>
						<Text style={styles.avatarText}>
							{user?.name
								? user.name
										.split(" ")
										.map((n) => n[0])
										.join("")
										.toUpperCase()
								: "SC"}
						</Text>
					</View>

					<View style={styles.headerInfo}>
						<Text style={[styles.userName, { color: textColor }]}>
							{user?.name || "Socio Coco"}
						</Text>
						<Text
							style={[styles.userPhone, { color: subTextColor }]}
						>
							{user?.phone
								? `WhatsApp: ${user.phone}`
								: "Sin teléfono"}
						</Text>
						<View style={styles.badge}>
							<Ionicons
								name="shield-checkmark"
								size={14}
								color="white"
							/>
							<Text style={styles.badgeText}>
								Socio Verificado
							</Text>
						</View>
					</View>
				</View>
			</View>

			<View style={[styles.body, { backgroundColor: backgroundBg }]}>
				<ScrollView
					contentContainerStyle={styles.scrollContent}
					showsVerticalScrollIndicator={false}
				>
					<View
						style={[
							styles.optionsCard,
							{ backgroundColor: cardBg },
						]}
					>
						<Text
							style={[
								styles.sectionTitle,
								{ color: colors.businessBg },
							]}
						>
							Preferencias
						</Text>
						<MenuOption
							icon={isDark ? "moon" : "sunny"}
							label="Modo Oscuro"
							isDark={isDark}
							subTextColor={subTextColor}
							rightElement={
								<Switch
									value={isDark}
									onValueChange={toggleTheme}
									trackColor={{
										false: "rgba(0,0,0,0.1)",
										true: colors.businessBg,
									}}
									thumbColor={isDark ? "#FFFFFF" : "#F5F5F5"}
								/>
							}
						/>
						<MenuOption
							icon="notifications"
							label="Notificaciones"
							isDark={isDark}
							subTextColor={subTextColor}
							onPress={() =>
								showDialog({
									title: "Próximamente",
									message:
										"Ajustes de notificaciones de pedidos.",
									intent: "success",
								})
							}
						/>
					</View>

					<View
						style={[
							styles.optionsCard,
							{ backgroundColor: cardBg },
						]}
					>
						<Text
							style={[
								styles.sectionTitle,
								{ color: colors.businessBg },
							]}
						>
							Acerca de Coco
						</Text>
						<MenuOption
							icon="chatbubble-ellipses"
							label="Ayuda y Soporte"
							isDark={isDark}
							subTextColor={subTextColor}
							onPress={() =>
								showDialog({
									title: "Soporte",
									message:
										"Abriendo chat de WhatsApp con soporte...",
									intent: "success",
								})
							}
						/>
						<MenuOption
							icon="document-text"
							label="Términos y Condiciones"
							isDark={isDark}
							subTextColor={subTextColor}
							onPress={() =>
								showDialog({
									title: "Legal",
									message:
										"Abriendo términos y condiciones...",
									intent: "success",
								})
							}
						/>
						<MenuOption
							icon="shield-checkmark"
							label="Política de Privacidad"
							isDark={isDark}
							subTextColor={subTextColor}
							onPress={() =>
								showDialog({
									title: "Legal",
									message:
										"Abriendo política de privacidad...",
									intent: "success",
								})
							}
						/>
					</View>

					<View
						style={[
							styles.optionsCard,
							{
								backgroundColor: cardBg,
							},
						]}
					>
						<MenuOption
							icon="log-out-outline"
							label="Cerrar Sesión"
							isDark={isDark}
							subTextColor={subTextColor}
							onPress={handleLogout}
							isError={true}
						/>
					</View>

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
	body: {
		flex: 1,
	},
	scrollContent: {
		padding: Spacing.md,
	},
	sectionTitle: {
		fontSize: FontSize.sm,
		fontWeight: FontWeight.bold,
		textTransform: "uppercase",
		letterSpacing: 0.5,
		marginBottom: Spacing.sm,
	},
	optionsCard: {
		borderRadius: BorderRadius.lg,
		paddingHorizontal: Spacing.md,
		paddingVertical: Spacing.md,
		marginTop: Spacing.lg,
		...Shadow.md,
	},
	optionRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: Spacing.md,
		borderBottomWidth: 0.5,
		paddingLeft: Spacing.lg,
	},
	optionLeft: {
		flexDirection: "row",
		alignItems: "center",
	},
	optionLabel: {
		fontSize: FontSize.md,
		fontWeight: FontWeight.medium,
		marginLeft: Spacing.md,
	},
	versionText: {
		textAlign: "center",
		fontSize: FontSize.xs,
		opacity: 0.6,
		paddingTop: Spacing.lg,
		paddingBottom: Spacing.lg,
	},
});
