import { useState, useEffect } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Platform,
	ActivityIndicator,
} from "react-native";
import {
	FontSize,
	BorderRadius,
	FontWeight,
	Spacing,
} from "@coco/shared/config/theme";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { ScreenHeader, PrimaryButton } from "@/components";
import { useModifiersGroup } from "@coco/shared/hooks/supabase"; // Usamos tu hook

interface RouteParams {
	alreadySelectedGroups?: string[];
	returnScreen?: string;
}

export const ModifierGroupPicker = () => {
	const navigation = useNavigation<any>();
	const route = useRoute();
	const { colors } = useTheme();
	const insets = useSafeAreaInsets();
	const { modifierGroups, loadings, refetch } = useModifiersGroup();

	const { alreadySelectedGroups = [], returnScreen = "ProductForm" } =
		(route.params as RouteParams) || {};

	const textColor = colors.textPrimaryLight;
	const subTextColor = colors.textSecondaryLight;
	const borderColor = colors.borderLight;
	const bgApp = colors.backgroundLight;

	// Estado local para saber cuáles están tildados
	const [selectedIds, setSelectedIds] = useState<string[]>(
		alreadySelectedGroups,
	);

	useEffect(() => {
		// Aseguramos que la data esté fresca al abrir la pantalla
		refetch("");
	}, []);

	const handleToggleSelection = (id: string) => {
		setSelectedIds((prev) =>
			prev.includes(id)
				? prev.filter((groupId) => groupId !== id)
				: [...prev, id],
		);
	};

	const handleConfirmSelection = () => {
		// Devolvemos los parámetros a la pantalla que nos llamó (por defecto ProductForm)
		navigation.popTo(returnScreen, {
			selectedModifierGroups: selectedIds,
		});
	};

	return (
		<View style={{ flex: 1, backgroundColor: bgApp }}>
			<ScreenHeader
				title="Vincular Grupos"
				onBack={() => navigation.goBack()}
				fontSizeTitle={FontSize.xl}
			/>

			<View
				style={[
					styles.subHeaderContainer,
					{ borderBottomColor: borderColor },
				]}
			>
				<TouchableOpacity
					style={[
						styles.createBtn,
						{ backgroundColor: colors.businessBg },
					]}
					onPress={() =>
						navigation.navigate("ModifierGroupForm", {
							// Pantalla ficticia para crear un grupo nuevo si lo requieres
						})
					}
				>
					<Ionicons name="add" size={20} color="white" />
					<Text style={styles.createBtnText}>Crear Nuevo Grupo</Text>
				</TouchableOpacity>
			</View>

			<Text style={[styles.headerSub, { color: subTextColor }]}>
				Selecciona los grupos de modificadores que aplican para este
				producto.
			</Text>

			{loadings.fetch ? (
				<View style={styles.centered}>
					<ActivityIndicator size="large" color={colors.businessBg} />
				</View>
			) : (
				<KeyboardAwareScrollView
					style={{ flex: 1 }}
					contentContainerStyle={styles.scrollContent}
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}
				>
					<View style={styles.listContainer}>
						{modifierGroups.map((item) => {
							const isSelected = selectedIds.includes(item.id);
							return (
								<TouchableOpacity
									key={item.id}
									style={[
										styles.card,
										{
											borderBottomColor: borderColor,
											opacity: item.isAvailable ? 1 : 0.6,
										},
									]}
									onPress={() =>
										handleToggleSelection(item.id)
									}
									activeOpacity={0.7}
								>
									<View style={{ flex: 1 }}>
										<Text
											style={[
												styles.name,
												{ color: textColor },
											]}
										>
											{item.name}
										</Text>
										<Text
											style={{
												color: subTextColor,
												fontSize: 13,
											}}
										>
											{item.choices.length} opciones •{" "}
											{item.minSelectable === 0
												? "Opcional"
												: `Mínimo ${item.minSelectable}`}
										</Text>
									</View>

									<View style={styles.checkboxContainer}>
										<Ionicons
											name={
												isSelected
													? "checkbox"
													: "square-outline"
											}
											size={24}
											color={
												isSelected
													? colors.businessBg
													: subTextColor
											}
										/>
									</View>
								</TouchableOpacity>
							);
						})}

						{modifierGroups.length === 0 && (
							<Text
								style={[
									styles.emptyText,
									{ color: subTextColor },
								]}
							>
								No tienes grupos de modificadores creados.
							</Text>
						)}
					</View>
				</KeyboardAwareScrollView>
			)}

			<View
				style={[
					styles.bottomContainer,
					{ borderTopColor: borderColor, backgroundColor: bgApp },
				]}
			>
				<PrimaryButton
					title={`Guardar cambios (${selectedIds.length})`}
					onPress={handleConfirmSelection}
					marginBottom={
						Platform.OS === "ios" ? insets.bottom : Spacing.md
					}
				/>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	scrollContent: { paddingHorizontal: 16, paddingBottom: 20 },
	centered: { flex: 1, justifyContent: "center", alignItems: "center" },
	headerSub: {
		fontSize: FontSize.md,
		marginBottom: 10,
		marginTop: 4,
		paddingHorizontal: Spacing.md,
		paddingTop: Spacing.xs,
	},
	subHeaderContainer: {
		paddingHorizontal: Spacing.md,
		paddingVertical: Spacing.sm,
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	createBtn: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 12,
		borderRadius: BorderRadius.md,
		gap: 6,
	},
	createBtnText: {
		color: "white",
		fontWeight: FontWeight.bold,
		fontSize: 15,
	},
	listContainer: { marginTop: 10 },
	card: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 16,
		paddingHorizontal: 4,
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	name: { fontSize: 16, fontWeight: FontWeight.bold, marginBottom: 2 },
	checkboxContainer: {
		padding: 8,
		justifyContent: "center",
		alignItems: "center",
	},
	emptyText: { textAlign: "center", marginTop: 40, fontSize: 16 },
	bottomContainer: { padding: 16, borderTopWidth: 1 },
});
