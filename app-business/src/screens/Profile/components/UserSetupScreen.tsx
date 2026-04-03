import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	TextInput,
	ActivityIndicator,
	ScrollView,
	Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppStore } from "@coco/shared/hooks/useAppStore";
import { useUser } from "@coco/shared/hooks/supabase";
import { useTheme } from "@coco/shared/hooks/useTheme";
import {
	FontSize,
	FontWeight,
	BorderRadius,
	Spacing,
	Shadow,
} from "@coco/shared/config/theme";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { User } from "@coco/shared/core/entities/User";
import { useDialog } from "@coco/shared/providers/DialogContext";

export const UserSetupScreen = () => {
	const { user } = useAppStore();
	const { colors, isDark } = useTheme();
	const insets = useSafeAreaInsets();
	const navigation = useNavigation();
	const { showDialog } = useDialog();
	const { updateProfile } = useUser(user?.id);
	const [form, setForm] = useState({
		name: "",
		phone: "",
		avatarUrl: "",
	});

	const [isSaving, setIsSaving] = useState(false);
	const [isUploadingImage, setIsUploadingImage] = useState(false);
	const [imageToUpload, setImageToUpload] = useState<string | null>(null);

	useEffect(() => {
		setForm({
			name: user?.name || "",
			phone: user?.phone || "",
			avatarUrl: user?.avatarUrl
				? `${user.avatarUrl}?t=${Date.now()}`
				: "",
		});
		setImageToUpload(null);
	}, [user]);

	const handleChange = (field: keyof typeof form, value: string) => {
		setForm((prevForm) => ({ ...prevForm, [field]: value }));
	};

	const textColor = isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.85)";
	const subTextColor = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.55)";

	const handlePickImage = async () => {
		const { status } =
			await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== "granted") {
			showDialog({
				title: "Permiso denegado",
				message: "Necesitamos permiso para acceder a tus fotos.",
				type: "info",
			});
			return;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ["images"],
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.5,
		});

		if (!result.canceled) {
			const selectedUri = result.assets[0].uri;
			setForm({ ...form, avatarUrl: selectedUri });
			setImageToUpload(selectedUri);
		}
	};

	const handleSave = async () => {
		if (!form.name.trim()) {
			showDialog({
				title: "Campo requerido",
				message: "El nombre no puede estar vacío.",
				type: "info",
			});
			return;
		}

		setIsSaving(true);
		try {
			const dataToUpdate: Partial<User> = {
				name: form.name.trim(),
				phone: form.phone.trim(),
				avatarUrl: imageToUpload || user?.avatarUrl || "",
			};

			const response = await updateProfile(dataToUpdate);

			if (response.success) {
				navigation.goBack();
			} else {
				showDialog({
					title: "Error",
					message: "No se pudo actualizar el perfil.",
					type: "info",
				});
			}
		} catch (error) {
			console.log(error);
			showDialog({
				title: "Error inesperado",
				message: "Ocurrió un error al intentar guardar los datos.",
				type: "info",
			});
		} finally {
			setIsSaving(false);
			setIsUploadingImage(false);
		}
	};

	const getInitials = () => {
		const currentName = form.name || user?.name;
		if (!currentName) return "SC";
		return currentName
			.split(" ")
			.map((n: string) => n[0])
			.join("")
			.toUpperCase()
			.substring(0, 2);
	};

	return (
		<ScrollView
			style={[
				styles.screenContainer,
				{ backgroundColor: isDark ? "#121212" : "#F5F5F7" },
			]}
			contentContainerStyle={[
				styles.scrollContent,
				{ paddingBottom: insets.bottom + Spacing.lg },
			]}
		>
			<Text style={[styles.setupSubtitle, { color: subTextColor }]}>
				Mantén tu información de contacto actualizada para que tus
				clientes y repartidores puedan comunicarse contigo.
			</Text>

			{/* AVATAR */}
			<View style={styles.avatarContainer}>
				<TouchableOpacity
					onPress={handlePickImage}
					style={[
						styles.avatarFrame,
						{ backgroundColor: colors.businessBg },
					]}
				>
					{form.avatarUrl ? (
						<Image
							source={{ uri: form.avatarUrl }}
							style={styles.avatarImage}
						/>
					) : (
						<Text style={styles.avatarText}>{getInitials()}</Text>
					)}
					<View
						style={[
							styles.cameraIconBadge,
							{ backgroundColor: isDark ? "#1C1C1E" : "white" },
						]}
					>
						<Ionicons name="camera" size={16} color={textColor} />
					</View>
				</TouchableOpacity>
				<Text style={[styles.avatarLabel, { color: subTextColor }]}>
					{isUploadingImage
						? "Subiendo imagen..."
						: "Toca para cambiar foto"}
				</Text>
			</View>

			{/* Input Nombre */}
			<View style={styles.inputGroup}>
				<Text
					style={[
						styles.inputLabel,
						{
							color: isDark
								? "rgba(255,255,255,0.7)"
								: "rgba(0,0,0,0.6)",
						},
					]}
				>
					Nombre completo
				</Text>
				<TextInput
					style={[
						styles.input,
						{
							backgroundColor: isDark ? "#1C1C1E" : "white",
							color: textColor,
							borderColor: isDark
								? "rgba(255,255,255,0.1)"
								: "rgba(0,0,0,0.05)",
						},
					]}
					value={form.name}
					onChangeText={(text) => handleChange("name", text)}
					placeholder="Tu nombre"
					placeholderTextColor={subTextColor}
				/>
			</View>

			{/* Input Teléfono */}
			<View style={styles.inputGroup}>
				<Text
					style={[
						styles.inputLabel,
						{
							color: isDark
								? "rgba(255,255,255,0.7)"
								: "rgba(0,0,0,0.6)",
						},
					]}
				>
					Teléfono (WhatsApp)
				</Text>
				<TextInput
					style={[
						styles.input,
						{
							backgroundColor: isDark ? "#1C1C1E" : "white",
							color: textColor,
							borderColor: isDark
								? "rgba(255,255,255,0.1)"
								: "rgba(0,0,0,0.05)",
						},
					]}
					value={form.phone}
					onChangeText={(text) => handleChange("phone", text)}
					placeholder="Ej: 5512345678"
					keyboardType="phone-pad"
					placeholderTextColor={subTextColor}
				/>
			</View>

			{/* Botón Guardar */}
			<TouchableOpacity
				style={[
					styles.actionButton,
					{ backgroundColor: colors.businessBg },
					(isSaving || isUploadingImage) && { opacity: 0.7 },
				]}
				onPress={handleSave}
				disabled={isSaving || isUploadingImage}
				activeOpacity={0.8}
			>
				{isSaving || isUploadingImage ? (
					<ActivityIndicator size="small" color="white" />
				) : (
					<Text style={styles.actionButtonText}>Guardar Cambios</Text>
				)}
			</TouchableOpacity>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	screenContainer: { flex: 1 },
	scrollContent: { padding: Spacing.lg },
	setupSubtitle: {
		fontSize: FontSize.md,
		marginBottom: Spacing.xl,
		lineHeight: 22,
	},
	avatarContainer: {
		alignItems: "center",
		marginBottom: Spacing.xl,
	},
	avatarFrame: {
		width: 100,
		height: 100,
		borderRadius: BorderRadius.full,
		justifyContent: "center",
		alignItems: "center",
		...Shadow.md,
		position: "relative",
	},
	avatarImage: {
		width: 100,
		height: 100,
		borderRadius: BorderRadius.full,
	},
	avatarText: {
		fontSize: FontSize.title * 1.2,
		fontWeight: FontWeight.black,
		color: "#FFFFFF",
	},
	cameraIconBadge: {
		position: "absolute",
		bottom: 0,
		right: 0,
		width: 32,
		height: 32,
		borderRadius: BorderRadius.sm,
		justifyContent: "center",
		alignItems: "center",
		...Shadow.sm,
	},
	avatarLabel: {
		fontSize: FontSize.xs,
		marginTop: Spacing.sm,
		fontWeight: FontWeight.medium,
	},
	inputGroup: { marginBottom: Spacing.lg },
	inputLabel: {
		fontSize: FontSize.sm,
		fontWeight: FontWeight.semibold,
		marginBottom: Spacing.xs,
	},
	input: {
		borderWidth: 1,
		borderRadius: BorderRadius.md,
		padding: Spacing.md,
		fontSize: FontSize.md,
		...Shadow.sm,
	},
	actionButton: {
		borderRadius: BorderRadius.md,
		paddingVertical: Spacing.md,
		justifyContent: "center",
		alignItems: "center",
		marginTop: Spacing.xl,
		...Shadow.md,
	},
	actionButtonText: {
		color: "white",
		fontSize: FontSize.lg,
		fontWeight: FontWeight.bold,
	},
});
