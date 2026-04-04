import { create } from "zustand";
import { Product } from "@coco/shared/core/entities";

interface ProductState {
	products: Product[];
	searchTerm: string;

	setProducts: (products: Product[]) => void;
	setSearchTerm: (term: string) => void;
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
	searchTerm: "",

	setProducts: (products) => set({ products: [...products] }),

	setSearchTerm: (term) => set({ searchTerm: term }),

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

	clearProducts: () => set({ products: [], searchTerm: "" }),
}));
