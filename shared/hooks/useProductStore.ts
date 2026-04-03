import { create } from "zustand";
import { Product } from "core/entities";

interface ProductState {
	products: Product[];

	setProducts: (products: Product[]) => void;
	addProduct: (product: Product) => void;
	updateProduct: (
		productId: string,
		updatedProduct: Partial<Product>,
	) => void;
	removeProduct: (productId: string) => void;
	clearProducts: () => void;
}

export const useProductStore = create<ProductState>((set) => ({
	products: [],

	setProducts: (products) => set({ products: [...products] }),

	addProduct: (product) =>
		set((state) => ({
			products: [...state.products, product],
		})),

	updateProduct: (productId, updatedProduct) =>
		set((state) => ({
			products: state.products.map((p) =>
				p.id === productId ? { ...p, ...updatedProduct } : p,
			),
		})),

	removeProduct: (productId) =>
		set((state) => ({
			products: state.products.filter((p) => p.id !== productId),
		})),

	clearProducts: () => set({ products: [] }),
}));
