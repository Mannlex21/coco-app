import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
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
} from "@coco/shared/config/theme";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { User } from "@coco/shared/core/entities/User";
import { useDialog } from "@coco/shared/providers/DialogContext";
import { ScreenHeader } from "@/screens/Catalog/components/ScreenHeader";
import { InputField } from "@/components/InputField";

export const UserSetupScreen = () => {
	const { user } = useAppStore();
	const { colors, isDark } = useTheme();
	const insets = useSafeAreaInsets();
	const navigation = useNavigation();
	const { showDialog } = useDialog();
	const { updateProfile } = useUser();

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

	const textColor = colors.textPrimaryLight;
	const subTextColor = colors.textSecondaryLight;
	const separatorColor = colors.borderLight;

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
		<View
			style={[
				styles.screenContainer,
				{
					backgroundColor: colors.backgroundLight,
				},
			]}
		>
			<View
				style={[
					{
						borderBottomWidth: StyleSheet.hairlineWidth,
						borderBottomColor: colors.borderLight,
					},
				]}
			>
				<ScreenHeader
					title="Mi Perfil"
					onBack={() => navigation.goBack()}
				/>
			</View>

			<ScrollView
				contentContainerStyle={[
					styles.scrollContent,
					{ paddingBottom: insets.bottom + Spacing.lg },
				]}
			>
				<Text style={[styles.setupSubtitle, { color: subTextColor }]}>
					{
						"Mantén tu información de contacto actualizada para que tus clientes y repartidores puedan comunicarse contigo."
					}
				</Text>

				{/* AVATAR */}
				<View style={styles.avatarContainer}>
					<TouchableOpacity
						onPress={handlePickImage}
						style={[
							styles.avatarFrame,
							{ backgroundColor: colors.businessBg },
						]}
						activeOpacity={0.8}
					>
						{form.avatarUrl ? (
							<Image
								source={{ uri: form.avatarUrl }}
								style={styles.avatarImage}
							/>
						) : (
							<Text style={styles.avatarText}>
								{getInitials()}
							</Text>
						)}

						<View
							style={[
								styles.cameraIconBadge,
								{
									backgroundColor: isDark
										? "#2A2A2A"
										: "white",
									borderColor: separatorColor,
								},
							]}
						>
							<Ionicons
								name="camera"
								size={14}
								color={textColor}
							/>
						</View>
					</TouchableOpacity>

					<Text style={[styles.avatarLabel, { color: subTextColor }]}>
						{isUploadingImage
							? "Subiendo imagen..."
							: "Toca para cambiar foto"}
					</Text>
				</View>

				{/* Inputs usando InputField */}
				<InputField
					label="Nombre completo"
					value={form.name}
					onChangeText={(text) => handleChange("name", text)}
					placeholder="Tu nombre"
				/>

				<InputField
					label="Teléfono (WhatsApp)"
					value={form.phone}
					onChangeText={(text) => handleChange("phone", text)}
					placeholder="Ej: 5512345678"
					keyboardType="phone-pad"
				/>

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
						<Text style={styles.actionButtonText}>
							{"Guardar Cambios"}
						</Text>
					)}
				</TouchableOpacity>
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	screenContainer: { flex: 1 },
	scrollContent: {
		paddingHorizontal: Spacing.lg,
		paddingTop: Spacing.lg,
	},
	setupSubtitle: {
		textAlign: "justify",
		fontSize: FontSize.md,
		marginBottom: Spacing.xl,
		lineHeight: 22,
	},
	avatarContainer: {
		alignItems: "center",
		marginBottom: Spacing.xl,
	},
	avatarFrame: {
		width: 96,
		height: 96,
		borderRadius: BorderRadius.full,
		justifyContent: "center",
		alignItems: "center",
		position: "relative",
	},
	avatarImage: {
		width: 96,
		height: 96,
		borderRadius: BorderRadius.full,
	},
	avatarText: {
		fontSize: FontSize.title * 1.1,
		fontWeight: FontWeight.black,
		color: "#FFFFFF",
	},
	cameraIconBadge: {
		position: "absolute",
		bottom: 0,
		right: 0,
		width: 30,
		height: 30,
		borderRadius: BorderRadius.full,
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 1,
	},
	avatarLabel: {
		fontSize: FontSize.xs,
		marginTop: Spacing.sm,
		fontWeight: FontWeight.medium,
	},
	actionButton: {
		borderRadius: BorderRadius.md,
		paddingVertical: Spacing.md,
		justifyContent: "center",
		alignItems: "center",
		marginTop: Spacing.xl, // Espacio superior para separarlo del último input
	},
	actionButtonText: {
		color: "white",
		fontSize: FontSize.lg,
		fontWeight: FontWeight.bold,
	},
});
