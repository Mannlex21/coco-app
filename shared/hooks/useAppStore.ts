import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import * as SecureStore from "expo-secure-store";
import { User } from "@coco/shared/core/entities/User";
import { Order } from "@coco/shared/core/entities/Order";
import { Business } from "@coco/shared/core/entities/Business";
import { Section } from "core/entities"; // 👈 Asegúrate de importar tu entidad

export interface CartItem {
	productId: string;
	productName: string;
	productPrice: number;
	quantity: number;
}

export interface AppState {
	user: User | null;
	isLoadingAuth: boolean;
	setUser: (user: User | null) => void;
	setLoadingAuth: (loading: boolean) => void;
	activeOrder: Order | null;
	setActiveOrder: (order: Order | null) => void;
	activeBusiness: Business | null;
	setActiveBusiness: (business: Business | null) => void;
	cart: CartItem[];
	cartBusinessId: string | null;
	addToCart: (item: CartItem, businessId: string) => void;
	removeFromCart: (productId: string) => void;
	incrementItem: (productId: string) => void;
	decrementItem: (productId: string) => void;
	clearCart: () => void;
	cartTotal: () => number;
	cartCount: () => number;
	themeMode: "light" | "dark";
	setThemeMode: (mode: "light" | "dark") => void;

	// 💥 NUEVOS ESTADOS PARA SECCIONES
	sections: Section[];
	setSections: (sections: Section[]) => void;
}

const secureStorage = {
	getItem: async (name: string): Promise<string | null> => {
		return (await SecureStore.getItemAsync(name)) || null;
	},
	setItem: async (name: string, value: string): Promise<void> => {
		await SecureStore.setItemAsync(name, value);
	},
	removeItem: async (name: string): Promise<void> => {
		await SecureStore.deleteItemAsync(name);
	},
};

export const useAppStore = create<AppState>()(
	persist(
		(set, get) => ({
			user: null,
			isLoadingAuth: true,
			setUser: (user) => set({ user }),
			setLoadingAuth: (isLoadingAuth) => set({ isLoadingAuth }),
			themeMode: "light",
			setThemeMode: (mode) => set({ themeMode: mode }),
			activeOrder: null,
			setActiveOrder: (activeOrder) => set({ activeOrder }),
			activeBusiness: null,
			setActiveBusiness: (activeBusiness) => set({ activeBusiness }),
			cart: [],
			cartBusinessId: null,

			// 💥 ESTADO INICIAL Y ACCIÓN PARA SECCIONES
			sections: [],
			setSections: (sections) => set({ sections }),

			addToCart: (item, businessId) =>
				set((state) => {
					if (
						state.cartBusinessId &&
						state.cartBusinessId !== businessId
					) {
						return { cart: [item], cartBusinessId: businessId };
					}
					const existing = state.cart.find(
						(c) => c.productId === item.productId,
					);
					if (existing) {
						return {
							cartBusinessId: businessId,
							cart: state.cart.map((c) =>
								c.productId === item.productId
									? { ...c, quantity: c.quantity + 1 }
									: c,
							),
						};
					}
					return {
						cart: [...state.cart, item],
						cartBusinessId: businessId,
					};
				}),

			removeFromCart: (productId) =>
				set((state) => {
					const newCart = state.cart.filter(
						(c) => c.productId !== productId,
					);
					return {
						cart: newCart,
						cartBusinessId:
							newCart.length === 0 ? null : state.cartBusinessId,
					};
				}),

			incrementItem: (productId) =>
				set((state) => ({
					cart: state.cart.map((c) =>
						c.productId === productId
							? { ...c, quantity: c.quantity + 1 }
							: c,
					),
				})),

			decrementItem: (productId) =>
				set((state) => {
					const item = state.cart.find(
						(c) => c.productId === productId,
					);
					if (!item) return state;
					if (item.quantity <= 1) {
						const newCart = state.cart.filter(
							(c) => c.productId !== productId,
						);
						return {
							cart: newCart,
							cartBusinessId:
								newCart.length === 0
									? null
									: state.cartBusinessId,
						};
					}
					return {
						cart: state.cart.map((c) =>
							c.productId === productId
								? { ...c, quantity: c.quantity - 1 }
								: c,
						),
					};
				}),

			clearCart: () => set({ cart: [], cartBusinessId: null }),

			cartTotal: () =>
				get().cart.reduce(
					(sum, item) => sum + item.productPrice * item.quantity,
					0,
				),

			cartCount: () =>
				get().cart.reduce((sum, item) => sum + item.quantity, 0),
		}),
		{
			name: "coco-app-storage",
			storage: createJSONStorage(() => secureStorage),
			partialize: (state) => ({
				cart: state.cart,
				cartBusinessId: state.cartBusinessId,
				themeMode: state.themeMode,
			}),
		},
	),
);
