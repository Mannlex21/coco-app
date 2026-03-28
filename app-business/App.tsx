import React, { useEffect, useState } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";

import { auth, db } from "./src/infrastructure/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { RegisterScreen } from "@/screens/RegisterScreen";
import { LoginScreen } from "@/screens/LoginScreen";
import { Colors } from "@coco/shared/config/theme";
import { useBusiness } from "@coco/shared/hooks/useBusiness";
import { NavigationContainer } from "@react-navigation/native";
import { MainNavigator } from "@/navigation/MainNavigator";
import { AuthStack } from "@/navigation/AuthStack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAppStore } from "@coco/shared/hooks/useAppStore";
import { User } from "@coco/shared/core/entities/User";
export default function App() {
	const { user, setUser, isLoadingAuth, setLoadingAuth } = useAppStore();
	const [isRegistering, setIsRegistering] = useState(false);

	// Dentro de tu useEffect en App.tsx
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
			if (firebaseUser) {
				// 1. Mapeamos al objeto que tu interfaz 'User' exige
				const cocoUser: User = {
					id: firebaseUser.uid,
					phone: firebaseUser.phoneNumber || "",
					name: firebaseUser.displayName || "Usuario Coco",
					role: "business",
					status: "active",
					createdAt: new Date(), // En un flujo real, esto vendría de Firestore
					updatedAt: new Date(),
				};

				// 2. Guardamos en el Store Global de Zustand
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

	if (isGlobalLoading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator color="white" size="large" />
			</View>
		);
	}

	return (
		<SafeAreaProvider>
			<NavigationContainer>
				{/* 3. Una sola fuente de verdad para la navegación */}
				{user ? (
					<MainNavigator />
				) : (
					<AuthStack
						isRegistering={isRegistering}
						setIsRegistering={setIsRegistering}
					/>
				)}
			</NavigationContainer>
		</SafeAreaProvider>
	);
}
const styles = StyleSheet.create({
	loadingContainer: {
		flex: 1,
		backgroundColor: Colors.businessBg,
		justifyContent: "center",
		alignItems: "center",
	},
});
