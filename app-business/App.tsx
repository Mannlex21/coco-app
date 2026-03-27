import React, { useEffect, useState } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";

import { auth, db } from "./src/infrastructure/firebase/config";
import { onAuthStateChanged, User } from "firebase/auth";
import { RegisterScreen } from "@/screens/RegisterScreen";
import { LoginScreen } from "@/screens/LoginScreen";
import { Colors } from "@coco/shared/config/theme";
import { useBusiness } from "@coco/shared/hooks/useBusiness";
import { NavigationContainer } from "@react-navigation/native";
import { MainNavigator } from "@/screens/MainNavigator";
import { AuthStack } from "@/screens/AuthStack";
import { SafeAreaProvider } from "react-native-safe-area-context";
export default function App() {
	const [user, setUser] = useState<User | null>(null);
	const [authLoading, setAuthLoading] = useState(true);
	const [isRegistering, setIsRegistering] = useState(false);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
			setUser(currentUser);
			setAuthLoading(false);
		});
		return () => unsubscribe();
	}, []);

	const { loading: businessLoading } = useBusiness(
		db,
		user?.uid || undefined,
	);

	const isGlobalLoading = authLoading || (user && businessLoading);

	if (isGlobalLoading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator color="white" size="large" />
			</View>
		);
	}

	if (!user) {
		return isRegistering ? (
			<RegisterScreen onBack={() => setIsRegistering(false)} />
		) : (
			<LoginScreen onRegister={() => setIsRegistering(true)} />
		);
	}

	return (
		<SafeAreaProvider>
			<NavigationContainer>
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
