import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Platform,
} from "react-native";
import {
	FontSize,
	BorderRadius,
	FontWeight,
	Spacing,
} from "@coco/shared/config/theme";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenHeader } from "../../../components/ScreenHeader";
import { Modifier } from "@coco/shared/core/entities/Modifier";
import { useDialog } from "@coco/shared/providers";

interface RouteParams {
	groupId?: string;
	currentMemoryModifiers?: Modifier[];
	onSelect?: (selected: Modifier[]) => void;
}

export const ModifierPicker = () => {
	const navigation = useNavigation<any>();
	const route = useRoute();
	const { colors } = useTheme();
	const insets = useSafeAreaInsets();
	const { showDialog } = useDialog();

	const { currentMemoryModifiers = [], onSelect } =
		(route.params as RouteParams) || {};

	const textColor = colors.textPrimaryLight;
	const subTextColor = colors.textSecondaryLight;
	const borderColor = colors.borderLight;
	const bgApp = colors.backgroundLight;

	const [activeModifiers, setActiveModifiers] = useState<Modifier[]>(
		currentMemoryModifiers,
	);

	const [hasNewUnsavedItems, setHasNewUnsavedItems] = useState(false);
	const [isConfirming, setIsConfirming] = useState(false);

	useEffect(() => {
		const unsubscribe = navigation.addListener("beforeRemove", (e: any) => {
			if (!hasNewUnsavedItems || isConfirming) {
				return;
			}
			e.preventDefault();

			showDialog({
				title: "Cambios sin guardar",
				message:
					"Has creado nuevos modificadores en esta pantalla. Si regresas ahora, se perderán. ¿Estás seguro?",
				intent: "warning",
				onConfirm: () => {
					navigation.dispatch(e.data.action);
				},
			});
		});

		return unsubscribe;
	}, [navigation, hasNewUnsavedItems, isConfirming, showDialog]);

	const handleRemoveModifier = (id: string) => {
		setActiveModifiers((prev) => prev.filter((mod) => mod.id !== id));
	};

	const handleConfirmSelection = () => {
		setIsConfirming(true);
		if (onSelect) {
			onSelect(activeModifiers);
		}
		setTimeout(() => {
			navigation.goBack();
		}, 0);
	};

	return (
		<View style={{ flex: 1, backgroundColor: bgApp }}>
			<ScreenHeader
				title="Vincular Modificadores"
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
						navigation.navigate("ModifierForm", {
							onModifierSaved: (newMod: Modifier) => {
								setActiveModifiers((prev) => [newMod, ...prev]);
								setHasNewUnsavedItems(true);
							},
						})
					}
				>
					<Ionicons name="add" size={20} color="white" />
					<Text style={styles.createBtnText}>
						Crear Nuevo Modificador
					</Text>
				</TouchableOpacity>
			</View>

			<Text style={[styles.headerSub, { color: subTextColor }]}>
				Revisa la lista de modificadores. Quita los que no necesites
				para este grupo.
			</Text>

			<KeyboardAwareScrollView
				style={{ flex: 1 }}
				contentContainerStyle={styles.scrollContent}
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.listContainer}>
					{activeModifiers.map((item) => (
						<View
							key={item.id}
							style={[
								styles.card,
								{
									borderBottomColor: borderColor,
									opacity: item.isAvailable ? 1 : 0.6,
								},
							]}
						>
							<View style={{ flex: 1 }}>
								<Text
									style={[styles.name, { color: textColor }]}
								>
									{item.name}
								</Text>
								<Text
									style={{
										color: subTextColor,
										fontSize: 13,
									}}
								>
									{item.extraPrice
										? `+$${item.extraPrice.toFixed(2)}`
										: "Gratis"}
								</Text>
							</View>

							<TouchableOpacity
								onPress={() => handleRemoveModifier(item.id)}
								style={styles.deleteButton}
								activeOpacity={0.6}
							>
								<Ionicons
									name="trash-outline"
									size={22}
									color={colors.error}
								/>
							</TouchableOpacity>
						</View>
					))}

					{activeModifiers.length === 0 && (
						<Text
							style={[styles.emptyText, { color: subTextColor }]}
						>
							No hay modificadores en la lista. Crea uno nuevo
							arriba o regresa.
						</Text>
					)}
				</View>
			</KeyboardAwareScrollView>

			<View
				style={[
					styles.bottomContainer,
					{ borderTopColor: borderColor, backgroundColor: bgApp },
				]}
			>
				<TouchableOpacity
					style={[
						styles.saveBtn,
						{
							backgroundColor: colors.businessBg,
							marginBottom:
								Platform.OS === "ios" ? insets.bottom : 12,
						},
					]}
					onPress={handleConfirmSelection}
					activeOpacity={0.9}
				>
					<Text style={styles.saveBtnText}>
						Guardar cambios ({activeModifiers.length})
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	scrollContent: { paddingHorizontal: 16, paddingBottom: 20 },
	centered: { marginTop: 40, justifyContent: "center", alignItems: "center" },
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
	deleteButton: {
		padding: 8,
		justifyContent: "center",
		alignItems: "center",
	},
	emptyText: { textAlign: "center", marginTop: 40, fontSize: 16 },
	bottomContainer: { padding: 16, borderTopWidth: 1 },
	saveBtn: {
		padding: 16,
		borderRadius: BorderRadius.md,
		alignItems: "center",
	},
	saveBtnText: { color: "white", fontWeight: FontWeight.bold, fontSize: 16 },
});
