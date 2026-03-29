import React, { useEffect, useState } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";

import { auth, db } from "./src/infrastructure/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { Colors, ColorPalette } from "@coco/shared/config/theme"; // 👈 Importamos ColorPalette
import { useBusiness } from "@coco/shared/hooks/useBusiness";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { MainNavigator } from "@/navigation/MainNavigator";
import { AuthStack } from "@/navigation/AuthStack";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useAppStore } from "@coco/shared/hooks/useAppStore";
import { User } from "@coco/shared/core/entities/User";
import { DialogProvider } from "@coco/shared/providers/DialogContext";
import { useTheme } from "@coco/shared/hooks/useTheme";

export default function App() {
	const { user, setUser, isLoadingAuth, setLoadingAuth, themeMode } =
		useAppStore();
	const { isDark } = useTheme();
	const [isRegistering, setIsRegistering] = useState(false);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
			if (firebaseUser) {
				const cocoUser: User = {
					id: firebaseUser.uid,
					phone: firebaseUser.phoneNumber || "",
					name: firebaseUser.displayName || "Usuario Coco",
					role: "business",
					status: "active",
					createdAt: new Date(),
					updatedAt: new Date(),
				};

				setUser(cocoUser);
			} else {
				setUser(null);
			}
			setLoadingAuth(false);
		});
		return () => unsubscribe();
	}, []);

	const { loading: businessLoading } = useBusiness(db, user?.id);

	const isGlobalLoading = isLoadingAuth || (user && businessLoading);

	// 💡 Quitamos el casteo genérico y usamos el tipado exacto que acordamos
	const currentColors = Colors[themeMode] as ColorPalette;
	const headerBgColor =
		currentColors.surfaceLight || (isDark ? "#1C1C1E" : "#FFFFFF");
	const CocoAppTheme = {
		...DefaultTheme,
		colors: {
			...DefaultTheme.colors,
			background: currentColors.backgroundLight,
			primary: currentColors.businessBg,
			card: headerBgColor, // Muy importante para los headers nativos
			text: currentColors.textPrimaryLight,
		},
	};

	if (isGlobalLoading) {
		return (
			/* 💡 Le pasamos el color de fondo dinámico según el tema del store */
			<View
				style={[
					styles.loadingContainer,
					{ backgroundColor: currentColors.businessBg },
				]}
			>
				<ActivityIndicator
					color={currentColors.textOnPrimary || "white"}
					size="large"
				/>
			</View>
		);
	}

	return (
		<SafeAreaProvider>
			<SafeAreaView
				style={[styles.container, { backgroundColor: headerBgColor }]}
				edges={["top"]}
			>
				<DialogProvider>
					<NavigationContainer theme={CocoAppTheme}>
						{user ? (
							<MainNavigator />
						) : (
							<AuthStack
								isRegistering={isRegistering}
								setIsRegistering={setIsRegistering}
							/>
						)}
					</NavigationContainer>
				</DialogProvider>
			</SafeAreaView>
		</SafeAreaProvider>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
});
