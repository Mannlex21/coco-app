import React, { ComponentProps } from "react";
import { View, Text, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
	createStackNavigator,
	StackNavigationOptions,
} from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DashboardScreen } from "@/screens/Dashboard/DashboardScreen";
import { BusinessSetupScreen } from "@/screens/Profile/BusinessSetupScreen";
import { FontSize, FontWeight } from "@coco/shared/config/theme";
import { CatalogScreen } from "@/screens/Catalog/CatalogScreen";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { ProfileScreen } from "@/screens/Profile/ProfileScreen";
import { UserSetupScreen } from "@/screens/Profile/components/UserSetupScreen";
import { SectionForm } from "@/screens/Catalog/Tabs/Sections/SectionForm";
import { ProductForm } from "@/screens/Catalog/Tabs/Products/ProductForm";
import { ProductPicker } from "@/screens/Catalog/Tabs/Products/ProductPicker";
import { ModifierForm } from "@/screens/Catalog/Tabs/ModifiersGroup/components/ModifierForm";
import { ModifierPicker } from "@/screens/Catalog/Tabs/ModifiersGroup/components/ModifierPicker";
import { ModifierGroupForm } from "@/screens/Catalog/Tabs/ModifiersGroup/ModifierGroupForm";
import { SectionPicker } from "@/screens/Catalog/Tabs/Sections/components/SectionPicker";
import { ModifierGroupPicker } from "@/screens/Catalog/Tabs/ModifiersGroup/components/ModifierGroupPicker";

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

	// 🌟 1. Función generadora para abstraer el boilerplate de las opciones
	const getScreenOptions = (
		defaultTitle: string,
		presentation: "card" | "modal" = "card",
	) => {
		return ({ route }: any): StackNavigationOptions => ({
			headerShown: false,
			title: route.params?.title || defaultTitle,
			headerTintColor: colors.businessBg,
			headerTitleStyle: {
				fontWeight: FontWeight.bold,
				fontSize: FontSize.lg,
				color: colors.textPrimaryLight,
			},
			headerBackTitle: "",
			presentation: presentation,
			...(presentation === "modal" && { animation: "slide_from_bottom" }),
			headerStyle: {
				backgroundColor: colors.surfaceLight,
				elevation: 0,
				shadowOpacity: 0,
				borderBottomWidth: 1,
				borderBottomColor: colors.borderLight,
			},
		});
	};

	return (
		<RootStack.Navigator
			screenOptions={{
				headerShown: false,
				cardStyle: { backgroundColor: colors.surfaceLight },
			}}
		>
			<RootStack.Screen name="Tabs" component={TabNavigator} />

			{/* 🌟 2. Reducción drástica de código repetido */}
			<RootStack.Screen
				name="BusinessSetup"
				component={BusinessSetupScreen}
				options={getScreenOptions("Configurar Negocio")}
			/>

			<RootStack.Screen
				name="ProductForm"
				component={ProductForm}
				options={getScreenOptions("Producto")}
			/>

			<RootStack.Screen
				name="ProductPicker"
				component={ProductPicker}
				options={getScreenOptions("Seleccionar Productos", "modal")}
			/>
			<RootStack.Screen
				name="ModifierGroupPicker"
				component={ModifierGroupPicker}
				options={getScreenOptions(
					"Seleccionar Grupos de Modificadores",
					"modal",
				)}
			/>

			<RootStack.Screen
				name="SectionPicker"
				component={SectionPicker}
				options={getScreenOptions("Seleccionar Secciones", "modal")}
			/>

			<RootStack.Screen
				name="ModifierPicker"
				component={ModifierPicker}
				options={getScreenOptions("Seleccionar Modificadores", "modal")}
			/>

			<RootStack.Screen
				name="ModifierForm"
				component={ModifierForm}
				options={getScreenOptions("Seleccionar modificador", "modal")}
			/>

			<RootStack.Screen
				name="SectionForm"
				component={SectionForm}
				options={getScreenOptions("Formulario de Sección", "modal")}
			/>

			<RootStack.Screen
				name="ModifierGroupForm"
				component={ModifierGroupForm}
				options={getScreenOptions(
					"Formulario de Grupo de Modificadores",
					"modal",
				)}
			/>

			<RootStack.Screen
				name="UserSetup"
				component={UserSetupScreen}
				options={getScreenOptions("Editar Perfil", "modal")}
			/>
		</RootStack.Navigator>
	);
};
