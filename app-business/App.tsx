import React, { useEffect, useState } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";

import { auth, db } from "./src/infrastructure/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { Colors } from "@coco/shared/config/theme";
import { useBusiness } from "@coco/shared/hooks/useBusiness";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { MainNavigator } from "@/navigation/MainNavigator";
import { AuthStack } from "@/navigation/AuthStack";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useAppStore } from "@coco/shared/hooks/useAppStore";
import { User } from "@coco/shared/core/entities/User";
import { DialogProvider } from "@coco/shared/providers/DialogContext";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { StatusBar } from "expo-status-bar";

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

	const { loadingBusinesses } = useBusiness(db, user?.id);

	const isGlobalLoading = isLoadingAuth || (user && loadingBusinesses);

	const currentColors = Colors[themeMode];
	const headerBgColor =
		currentColors.surfaceLight || (isDark ? "#1C1C1E" : "#FFFFFF");
	const CocoAppTheme = {
		...DefaultTheme,
		colors: {
			...DefaultTheme.colors,
			background: currentColors.backgroundLight,
			primary: currentColors.businessBg,
			card: headerBgColor,
			text: currentColors.textPrimaryLight,
		},
	};

	if (isGlobalLoading) {
		return (
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
				<StatusBar style={isDark ? "light" : "dark"} animated={true} />
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
