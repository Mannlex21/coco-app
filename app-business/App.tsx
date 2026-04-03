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
import { SupabaseProvider } from "@coco/shared/providers/SupabaseContext";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { RolesApp } from "@coco/shared/constants";
import { useBusiness } from "@coco/shared/hooks";

function AppContent() {
	const { user, setUser, isLoadingAuth, setLoadingAuth, themeMode } =
		useAppStore();
	const { loadActiveBusiness } = useBusiness();
	const { isDark } = useTheme();
	const [isRegistering, setIsRegistering] = useState(false);

	useEffect(() => {
		if (!supabase) return;

		const buscarYSetearUsuario = async (supabaseUser: any) => {
			try {
				const { data: dbUser, error } = await supabase
					.from("users")
					.select("*")
					.eq("id", supabaseUser.id)
					.maybeSingle();

				if (error)
					console.error("Error al traer usuario de la BD:", error);

				if (dbUser) {
					const domainUser: User = {
						id: dbUser.id,
						email: dbUser.email || supabaseUser.email || "",
						name: dbUser.name || "Usuario",
						status: dbUser.status || "active",
						createdAt: new Date(
							dbUser.created_at || dbUser.createdAt,
						),
						updatedAt: dbUser.updated_at
							? new Date(dbUser.updated_at)
							: new Date(dbUser.updatedAt || dbUser.created_at),
						phone: dbUser.phone || supabaseUser.phone || "",
						role: (dbUser.role as RolesApp) || "none",
					};

					setUser(domainUser);
					await loadActiveBusiness(
						dbUser.last_active_business_id,
						supabaseUser.id,
					);
				} else {
					const fallbackUser: User = {
						id: supabaseUser.id,
						email: supabaseUser.email || "",
						name:
							supabaseUser.user_metadata?.full_name ||
							supabaseUser.email?.split("@")[0] ||
							"Usuario",
						status: "active",
						createdAt: new Date(supabaseUser.created_at),
						updatedAt: supabaseUser.updated_at
							? new Date(supabaseUser.updated_at)
							: new Date(supabaseUser.created_at),
						phone: supabaseUser.phone || "",
						role: (supabaseUser.role as RolesApp) || "none",
					};

					setUser(fallbackUser);
					await loadActiveBusiness(null, supabaseUser.id);
				}
			} catch (err) {
				console.error("Fallo crítico cargando perfil de usuario:", err);
			}
		};

		const checkInitialSession = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (session?.user) {
				await buscarYSetearUsuario(session.user);
			}
			setLoadingAuth(false);
		};

		checkInitialSession();

		const { data: authListener } = supabase.auth.onAuthStateChange(
			async (event: AuthChangeEvent, session: Session | null) => {
				if (session?.user) {
					await buscarYSetearUsuario(session.user);
				} else {
					setUser(null);
				}

				setLoadingAuth(false);
			},
		);

		return () => {
			authListener.subscription.unsubscribe();
		};
	}, [setUser, setLoadingAuth, loadActiveBusiness]);

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

	// Spinner para la carga de autenticación
	if (isLoadingAuth) {
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

// 2. Componente principal de entrada
export default function App() {
	return (
		<SupabaseProvider supabaseClient={supabase}>
			<AppContent />
		</SupabaseProvider>
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
