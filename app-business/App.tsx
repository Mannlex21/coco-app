import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
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
import { CocoLoadingScreen } from "@coco/shared/components";

function AppContent() {
	const { user, setUser, themeMode, setLoadingAuth, isLoadingAuth } =
		useAppStore();
	const { loadActiveBusiness } = useBusiness();
	const { isDark } = useTheme();
	const [isRegistering, setIsRegistering] = useState(false);
	const [appIsReady, setAppIsReady] = useState(false);

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

	const mapearYSetearUsuario = async (supabaseUser: any) => {
		try {
			const { data: dbUser, error } = await supabase
				.from("users")
				.select("*")
				.eq("id", supabaseUser.id)
				.maybeSingle();

			if (error)
				console.error("❌ Error al traer usuario de la BD:", error);

			if (dbUser) {
				const domainUser: User = {
					id: dbUser.id,
					email: dbUser.email || supabaseUser.email || "",
					name: dbUser.name || "Usuario",
					status: dbUser.status || "active",
					createdAt: new Date(dbUser.created_at || dbUser.createdAt),
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
			console.error("❌ Fallo crítico cargando perfil de usuario:", err);
		}
	};

	useEffect(() => {
		if (!supabase) return;

		let isMounted = true;
		// 💡 Bandera local para evitar que mapearYSetearUsuario se ejecute si ya se está procesando
		let isProcessingAuth = false;

		const { data: authListener } = supabase.auth.onAuthStateChange(
			async (event: AuthChangeEvent, session: Session | null) => {
				if (!isMounted || isProcessingAuth) return;

				if (session?.user) {
					isProcessingAuth = true;
					setLoadingAuth(true); // Solo se activa una vez de manera controlada

					await mapearYSetearUsuario(session.user);

					if (isMounted) setLoadingAuth(false);
					isProcessingAuth = false;
				} else {
					setUser(null);
					setLoadingAuth(false);
				}
			},
		);

		return () => {
			isMounted = false;
			authListener.subscription.unsubscribe();
		};
		// 💡 IMPORTANTE: Si tus funciones provienen de stores globales,
		// sus referencias no cambian. Al dejar el arreglo vacío evitamos re-montajes.
	}, []);

	useEffect(() => {
		let timer: ReturnType<typeof setTimeout>;

		async function prepare() {
			try {
				await new Promise((resolve) => {
					timer = setTimeout(resolve, 3000);
				});
			} catch (e) {
				console.warn(e);
			} finally {
				setAppIsReady(true);
			}
		}

		prepare();

		return () => {
			if (timer) clearTimeout(timer);
		};
	}, []);

	if (isLoadingAuth || !appIsReady) {
		return <CocoLoadingScreen />;
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
