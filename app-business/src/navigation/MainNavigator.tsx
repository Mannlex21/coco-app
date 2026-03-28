import React, { ComponentProps } from "react";
import { View, Text, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DashboardScreen } from "@/screens/DashboardScreen";
import { BusinessSetupScreen } from "@/screens/BusinessSetupScreen";
import { Colors } from "@coco/shared/config/theme";
import { ProductCatalogScreen } from "@/screens/ProductCardScreen";
import { ProductFormScreen } from "@/screens/ProductFormScreen";

const RootStack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Pantalla temporal para secciones en desarrollo
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

const TabNavigator = () => {
	const insets = useSafeAreaInsets();

	return (
		<Tab.Navigator
			screenOptions={({ route }) => ({
				headerShown: false,
				// Aplicamos el color global de Coco para la pestaña activa
				tabBarActiveTintColor: Colors.businessBg,
				tabBarInactiveTintColor: "#999",
				tabBarStyle: {
					// Ajuste de altura dinámico según el dispositivo (iOS/Android)
					height: Platform.OS === "ios" ? 70 + insets.bottom : 90,
					paddingBottom: Platform.OS === "ios" ? insets.bottom : 12,
					paddingTop: 10,
					backgroundColor: "white",
					borderTopWidth: 1,
					borderTopColor: "#F0F0F0",
					// Sombras
					elevation: 10,
					shadowColor: "#000",
					shadowOffset: { width: 0, height: -3 },
					shadowOpacity: 0.05,
					shadowRadius: 5,
				},
				tabBarLabelStyle: {
					fontSize: 11,
					fontWeight: "600",
					marginTop: 2,
				},
				tabBarIcon: ({ focused, color, size }) => {
					let iconName: ComponentProps<typeof Ionicons>["name"];

					switch (route.name) {
						case "Inicio":
							iconName = focused ? "home" : "home-outline";
							break;
						case "Pedidos":
							iconName = focused ? "receipt" : "receipt-outline";
							break;
						case "Catálogo":
							iconName = focused
								? "fast-food"
								: "fast-food-outline";
							break;
						case "Perfil":
							iconName = focused ? "person" : "person-outline";
							break;
						default:
							iconName = "help-outline";
					}

					return (
						<Ionicons
							name={iconName as any}
							size={22}
							color={color}
						/>
					);
				},
			})}
		>
			<Tab.Screen name="Inicio" component={DashboardScreen} />
			<Tab.Screen name="Pedidos">
				{() => <PlaceholderScreen name="Gestión de Pedidos" />}
			</Tab.Screen>
			<Tab.Screen
				name="Catálogo"
				component={ProductCatalogScreen}
			></Tab.Screen>
			<Tab.Screen name="Perfil">
				{() => <PlaceholderScreen name="Ajustes de Cuenta" />}
			</Tab.Screen>
		</Tab.Navigator>
	);
};

export const MainNavigator = () => {
	return (
		<RootStack.Navigator
			screenOptions={{
				headerShown: false,
				// Configuración de transición suave
				cardStyle: { backgroundColor: "white" },
			}}
		>
			<RootStack.Screen name="Tabs" component={TabNavigator} />
			<RootStack.Screen
				name="BusinessSetup"
				component={BusinessSetupScreen}
				options={{
					headerShown: true,
					title: "Configurar Negocio",
					headerTintColor: Colors.businessBg, // Título y botón atrás en naranja Coco
					headerTitleStyle: {
						fontWeight: "800",
						fontSize: 18,
						color: "#333",
					},
					headerBackTitle: "",
					presentation: "card", // Se siente como una navegación fluida
					headerStyle: {
						backgroundColor: "white",
						elevation: 0, // Limpio para Android
						shadowOpacity: 0, // Limpio para iOS
						borderBottomWidth: 1,
						borderBottomColor: "#EEE",
					},
				}}
			/>
			<RootStack.Screen
				name="ProductForm"
				component={ProductFormScreen}
				options={{
					headerShown: true,
					title: "Agregar producto",
					headerTintColor: Colors.businessBg, // Título y botón atrás en naranja Coco
					headerTitleStyle: {
						fontWeight: "800",
						fontSize: 18,
						color: "#333",
					},
					headerBackTitle: "",
					presentation: "card", // Se siente como una navegación fluida
					headerStyle: {
						backgroundColor: "white",
						elevation: 0, // Limpio para Android
						shadowOpacity: 0, // Limpio para iOS
						borderBottomWidth: 1,
						borderBottomColor: "#EEE",
					},
				}}
			/>
		</RootStack.Navigator>
	);
};
