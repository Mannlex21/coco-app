import { create } from "zustand";
import { Section, Product } from "core/entities";

interface CatalogState {
	sections: Section[];
	products: Product[];
	setSections: (sections: Section[]) => void;
	setProducts: (products: Product[]) => void;
}

export const useCatalogStore = create<CatalogState>()((set) => ({
	sections: [],
	products: [],
	setSections: (sections) => set({ sections: [...sections] }), // Clonación limpia
	setProducts: (products) => set({ products: [...products] }), // Clonación limpia
}));
