import React, { useEffect, useState } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { Colors } from "@coco/shared/config/theme";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { MainNavigator } from "@/navigation/MainNavigator";
import { AuthStack } from "@/navigation/AuthStack";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useAppStore } from "@coco/shared/hooks/useAppStore";
import { User } from "@coco/shared/core/entities/User";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { StatusBar } from "expo-status-bar";
import { supabase } from "@/infrastructure/supabase/config";
import { ContextMenuProvider, DialogProvider } from "../shared/providers";

export default function App() {
	const { user, setUser, isLoadingAuth, setLoadingAuth, themeMode } =
		useAppStore();
	const { isDark } = useTheme();
	const [isRegistering, setIsRegistering] = useState(false);
	useEffect(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			handleUserChange(session?.user || null);
			setLoadingAuth(false);
		});

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			handleUserChange(session?.user || null);
			setLoadingAuth(false);
		});

		const handleUserChange = (supabaseUser: any) => {
			if (supabaseUser) {
				const cocoUser: User = {
					id: supabaseUser.id,
					phone: supabaseUser.phone || "",
					name:
						supabaseUser.user_metadata?.name ||
						supabaseUser.email?.split("@")[0] ||
						"Usuario Coco",
					role: "business",
					status: "active",
					createdAt: new Date(supabaseUser.created_at),
					updatedAt: new Date(),
				};
				setUser(cocoUser);
			} else {
				setUser(null);
			}
		};

		return () => subscription.unsubscribe();
	}, []);

	const isGlobalLoading = isLoadingAuth;

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
				<ContextMenuProvider>
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
				</ContextMenuProvider>
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
