import React, { useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
	View,
	Text,
	StyleSheet,
	Platform,
	TouchableOpacity,
	Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { FontSize, FontWeight, Spacing } from "@coco/shared/config/theme";
import { useDialog } from "@coco/shared/providers/DialogContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PrimaryButton, ScreenHeader, InputField } from "@/components";

export const BusinessScheduleScreen = ({ route, navigation }: any) => {
	const { business } = route.params || {};
	const { showDialog } = useDialog();
	const { colors } = useTheme();
	const insets = useSafeAreaInsets();

	const [loading, setLoading] = useState(false);
	const borderColor = colors.borderLight;

	const [hours, setHours] = useState([
		{ day: 0, open: "09:00", close: "22:00", isClosed: false },
		{ day: 1, open: "09:00", close: "22:00", isClosed: false },
		{ day: 2, open: "09:00", close: "22:00", isClosed: false },
		{ day: 3, open: "09:00", close: "22:00", isClosed: false },
		{ day: 4, open: "09:00", close: "22:00", isClosed: false },
		{ day: 5, open: "09:00", close: "22:00", isClosed: false },
		{ day: 6, open: "09:00", close: "22:00", isClosed: false },
	]);
	const toggleDayClosed = (dayIndex: number) => {
		setHours((prev) =>
			prev.map((h) =>
				h.day === dayIndex ? { ...h, isClosed: !h.isClosed } : h,
			),
		);
	};

	const handleSave = async () => {
		setLoading(true);
		setTimeout(() => setLoading(false), 1000); // Simulación
	};

	return (
		<View style={{ flex: 1, backgroundColor: colors.backgroundLight }}>
			<ScreenHeader
				title="Horarios de Atención"
				onBack={() => navigation.goBack()}
				fontSizeTitle={FontSize.xl}
			/>

			<KeyboardAwareScrollView
				style={{ flex: 1 }}
				contentContainerStyle={styles.scrollContent}
				keyboardShouldPersistTaps="handled"
				enableOnAndroid={true}
				extraScrollHeight={16}
				showsVerticalScrollIndicator={false}
			>
				<View
					style={[
						styles.hoursContainer,
						{
							backgroundColor: colors.surfaceLight,
							borderColor: colors.borderLight,
						},
					]}
				>
					{hours.map((dayItem) => {
						const daysOfWeek = [
							"Dom",
							"Lun",
							"Mar",
							"Mié",
							"Jue",
							"Vie",
							"Sáb",
						];
						return (
							<View
								key={dayItem.day}
								style={[
									styles.dayRow,
									{ borderBottomColor: colors.borderLight },
								]}
							>
								<Text
									style={[
										styles.dayName,
										{ color: colors.textPrimaryLight },
									]}
								>
									{daysOfWeek[dayItem.day]}
								</Text>

								<TouchableOpacity
									style={[
										styles.closedBadge,
										dayItem.isClosed && {
											backgroundColor: colors.errorLight,
										},
									]}
									onPress={() => toggleDayClosed(dayItem.day)}
								>
									<Text
										style={{
											color: dayItem.isClosed
												? colors.error
												: colors.textSecondaryLight,
											fontSize: 12,
											fontWeight: "bold",
										}}
									>
										{dayItem.isClosed
											? "CERRADO"
											: "ABIERTO"}
									</Text>
								</TouchableOpacity>

								{!dayItem.isClosed && (
									<Text
										style={{
											color: colors.textPrimaryLight,
											fontSize: 13,
										}}
									>
										{dayItem.open} - {dayItem.close}
									</Text>
								)}
							</View>
						);
					})}
				</View>
			</KeyboardAwareScrollView>
			<View
				style={[
					styles.bottomContainer,
					{
						borderTopColor: borderColor,
						backgroundColor: colors.backgroundLight,
					},
				]}
			>
				<PrimaryButton
					title="Guardar Cambios"
					onPress={handleSave}
					loading={loading}
					marginBottom={Platform.OS === "ios" ? insets.bottom : 12}
				/>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	scrollContent: {
		paddingHorizontal: 16,
		paddingBottom: 20,
	},
	sectionHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 15,
		marginTop: 10,
		gap: 8,
	},
	sectionTitle: {
		fontSize: FontSize.lg,
		fontWeight: FontWeight.bold,
	},
	switchRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 12,
		borderRadius: 8,
		marginBottom: 15,
	},
	switchLabel: {
		fontSize: FontSize.md,
		fontWeight: FontWeight.semibold,
	},
	hoursContainer: {
		borderWidth: 1,
		borderRadius: 8,
		overflow: "hidden",
	},
	dayRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 10,
		paddingHorizontal: 12,
		borderBottomWidth: 1,
	},
	dayName: {
		fontWeight: FontWeight.bold,
		width: 40,
	},
	closedBadge: {
		paddingVertical: 4,
		paddingHorizontal: 8,
		borderRadius: 4,
		backgroundColor: "#f0f0f0",
	},
	bottomContainer: {
		padding: 16,
		borderTopWidth: 1,
	},
});
