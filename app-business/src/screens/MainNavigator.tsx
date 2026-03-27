import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons"; // Iconos de Expo
import { DashboardScreen } from "@/screens/DashboardScreen";
import { Colors } from "@coco/shared/config/theme";
import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createStackNavigator } from "@react-navigation/stack";
import { BusinessSetupScreen } from "./BusinessSetupScreen";

const Tab = createBottomTabNavigator();
const InicioStack = createStackNavigator();
const PlaceholderScreen = ({ name }: { name: string }) => (
	<View
		style={{
			flex: 1,
			justifyContent: "center",
			alignItems: "center",
			backgroundColor: "#F8F9FA",
		}}
	>
		<Text style={{ color: "#666", fontSize: 16 }}>
			{name} (Próximamente)
		</Text>
	</View>
);

export const MainNavigator = () => {
	const insets = useSafeAreaInsets();

	const InicioStackScreen = (props: any) => (
		<InicioStack.Navigator screenOptions={{ headerShown: false }}>
			<InicioStack.Screen name="DashboardMain">
				{(stackProps) => (
					<DashboardScreen
						{...props}
						{...stackProps}
						onRegisterPress={() =>
							stackProps.navigation.navigate("BusinessSetup")
						}
					/>
				)}
			</InicioStack.Screen>
			<InicioStack.Screen
				name="BusinessSetup"
				component={BusinessSetupScreen}
				options={{
					presentation: "modal",
					headerShown: true,
					title: "Configurar Negocio",
				}}
			/>
		</InicioStack.Navigator>
	);

	return (
		<Tab.Navigator
			screenOptions={({ route }) => ({
				headerShown: false,
				tabBarActiveTintColor: Colors.businessBg, // Tu color azul/verde de negocio
				tabBarInactiveTintColor: "#999",
				tabBarStyle: {
					height: 70 + insets.bottom, // Altura base + el espacio nativo del sistema
					paddingBottom: insets.bottom,
					paddingTop: 8,
					backgroundColor: "white",
					borderTopWidth: 1,
					borderTopColor: "#EEE",
					elevation: 8, // Sombra en Android
					shadowColor: "#000", // Sombra en iOS
					shadowOffset: { width: 0, height: -2 },
					shadowOpacity: 0.05,
					shadowRadius: 3,
				},
				tabBarLabelStyle: {
					fontSize: 12,
					fontWeight: "500",
				},
				// FUNCIÓN PARA RENDERIZAR ICONOS DINÁMICOS
				tabBarIcon: ({ focused, color, size }) => {
					let iconName: any;

					if (route.name === "Inicio") {
						iconName = focused ? "home" : "home-outline";
					} else if (route.name === "Pedidos") {
						iconName = focused ? "list" : "list-outline";
					} else if (route.name === "Catálogo") {
						iconName = focused ? "fast-food" : "fast-food-outline";
					} else if (route.name === "Perfil") {
						iconName = focused ? "person" : "person-outline";
					}

					return <Ionicons name={iconName} size={24} color={color} />;
				},
			})}
		>
			<Tab.Screen name="Inicio">{() => <InicioStackScreen />}</Tab.Screen>

			<Tab.Screen name="Pedidos">
				{() => <PlaceholderScreen name="Gestión de Pedidos" />}
			</Tab.Screen>

			<Tab.Screen name="Catálogo">
				{() => <PlaceholderScreen name="Mi Menú / Productos" />}
			</Tab.Screen>

			<Tab.Screen name="Perfil">
				{() => <PlaceholderScreen name="Ajustes de Cuenta" />}
			</Tab.Screen>
		</Tab.Navigator>
	);
};
