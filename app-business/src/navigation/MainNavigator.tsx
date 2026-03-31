import React, { ComponentProps } from "react";
import { View, Text, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DashboardScreen } from "@/screens/Dashboard/DashboardScreen";
import { BusinessSetupScreen } from "@/components/BusinessSetupScreen";
import { FontSize, FontWeight } from "@coco/shared/config/theme";
import { CatalogScreen } from "@/screens/Catalog/CatalogScreen";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { ProfileScreen } from "@/screens/Profile/ProfileScreen";
import { UserSetupScreen } from "@/screens/Profile/components/UserSetupScreen";
import { SectionForm } from "@/screens/Catalog/Components/Secciones/SectionForm";
import { ProductForm } from "@/screens/Catalog/Components/Products/ProductForm";
import { ProductPickerScreen } from "@/screens/Catalog/Components/Secciones/ProductPickerScreen";

const RootStack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Pantalla temporal para secciones en desarrollo
const PlaceholderScreen = ({
	name,
	backgroundColor,
	textColor,
}: {
	name: string;
	backgroundColor: string;
	textColor: string;
}) => (
	<View
		style={{
			flex: 1,
			justifyContent: "center",
			alignItems: "center",
			backgroundColor: backgroundColor,
		}}
	>
		<Text
			style={{
				color: textColor,
				fontSize: FontSize.md,
				fontWeight: FontWeight.medium,
			}}
		>
			{name} (Próximamente)
		</Text>
	</View>
);

const TabNavigator = () => {
	const insets = useSafeAreaInsets();
	const { colors } = useTheme();

	return (
		<Tab.Navigator
			screenOptions={({ route }) => ({
				headerShown: false,
				tabBarActiveTintColor: colors.businessBg,
				tabBarInactiveTintColor: colors.textSecondaryLight,
				tabBarStyle: {
					height: Platform.OS === "ios" ? 70 + insets.bottom : 90,
					paddingBottom: Platform.OS === "ios" ? insets.bottom : 12,
					paddingTop: 10,
					backgroundColor: colors.surfaceLight,
					borderTopWidth: 1,
					borderTopColor: colors.borderLight,
					elevation: 10,
					shadowColor: "#000",
					shadowOffset: { width: 0, height: -3 },
					shadowOpacity: 0.05,
					shadowRadius: 5,
				},
				tabBarLabelStyle: {
					fontSize: FontSize.xs,
					fontWeight: FontWeight.semibold,
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
				{() => (
					<PlaceholderScreen
						name="Gestión de Pedidos"
						backgroundColor={colors.backgroundLight}
						textColor={colors.textSecondaryLight}
					/>
				)}
			</Tab.Screen>
			<Tab.Screen name="Catálogo" component={CatalogScreen} />
			<Tab.Screen name="Perfil" component={ProfileScreen}></Tab.Screen>
		</Tab.Navigator>
	);
};

export const MainNavigator = () => {
	const { colors } = useTheme();

	return (
		<RootStack.Navigator
			screenOptions={{
				headerShown: false,
				cardStyle: { backgroundColor: colors.surfaceLight },
			}}
		>
			<RootStack.Screen name="Tabs" component={TabNavigator} />
			<RootStack.Screen
				name="BusinessSetup"
				component={BusinessSetupScreen}
				options={({ route }: any) => ({
					headerShown: true,
					title: route.params?.title || "Configurar Negocio",
					headerTintColor: colors.businessBg,
					headerTitleStyle: {
						fontWeight: FontWeight.bold,
						fontSize: FontSize.lg,
						color: colors.textPrimaryLight,
					},
					headerBackTitle: "",
					presentation: "card",
					headerStyle: {
						backgroundColor: colors.surfaceLight,
						elevation: 0,
						shadowOpacity: 0,
						borderBottomWidth: 1,
						borderBottomColor: colors.borderLight,
					},
				})}
			/>
			<RootStack.Screen
				name="ProductForm"
				component={ProductForm}
				options={({ route }: any) => ({
					headerShown: true,
					title: route.params?.title || "Producto",
					headerTintColor: colors.businessBg,
					headerTitleStyle: {
						fontWeight: FontWeight.bold,
						fontSize: FontSize.lg,
						color: colors.textPrimaryLight,
					},
					headerBackTitle: "",
					presentation: "card",
					headerStyle: {
						backgroundColor: colors.surfaceLight,
						elevation: 0,
						shadowOpacity: 0,
						borderBottomWidth: 1,
						borderBottomColor: colors.borderLight,
					},
				})}
			/>

			<RootStack.Screen
				name="ProductPicker"
				component={ProductPickerScreen} // Asegúrate de importar tu componente
				options={({ route }: any) => ({
					headerShown: true,
					title: route.params?.title || "Seleccionar Productos",
					headerTintColor: colors.businessBg,
					headerTitleStyle: {
						fontWeight: FontWeight.bold,
						fontSize: FontSize.lg,
						color: colors.textPrimaryLight,
					},
					headerBackTitle: "",

					// 🌟 CONFIGURACIÓN CLAVE PARA EL PICKER 🌟
					presentation: "modal", // Lo muestra como modal levantándose desde abajo
					animation: "slide_from_bottom", // Animación natural de modal

					headerStyle: {
						backgroundColor: colors.surfaceLight,
						elevation: 0,
						shadowOpacity: 0,
						borderBottomWidth: 1,
						borderBottomColor: colors.borderLight,
					},
				})}
			/>
			<RootStack.Screen
				name="SectionForm"
				component={SectionForm}
				options={({ route }: any) => ({
					headerShown: true,
					title: route.params?.title || "Sección",
					headerTintColor: colors.businessBg,
					headerTitleStyle: {
						fontWeight: FontWeight.bold,
						fontSize: FontSize.lg,
						color: colors.textPrimaryLight,
					},
					headerBackTitle: "",
					presentation: "card",
					headerStyle: {
						backgroundColor: colors.surfaceLight,
						elevation: 0,
						shadowOpacity: 0,
						borderBottomWidth: 1,
						borderBottomColor: colors.borderLight,
					},
				})}
			/>
			<RootStack.Screen
				name="UserSetup"
				component={UserSetupScreen}
				options={({ route }: any) => ({
					headerShown: true,
					title: route.params?.title || "Editar Perfil",
					headerTintColor: colors.businessBg,
					headerTitleStyle: {
						fontWeight: FontWeight.bold,
						fontSize: FontSize.lg,
						color: colors.textPrimaryLight,
					},
					headerBackTitle: "",
					presentation: "card",
					headerStyle: {
						backgroundColor: colors.surfaceLight,
						elevation: 0,
						shadowOpacity: 0,
						borderBottomWidth: 1,
						borderBottomColor: colors.borderLight,
					},
				})}
			/>
		</RootStack.Navigator>
	);
};
