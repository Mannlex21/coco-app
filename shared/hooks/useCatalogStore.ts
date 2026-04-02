import { create } from "zustand";
import { Section, Product } from "core/entities"; // Asegúrate de añadir Modifier aquí
import { Modifier } from "core/entities/Modifier";

interface CatalogState {
	sections: Section[];
	products: Product[];
	modifiers: Modifier[]; // 👈 Añadido
	setSections: (sections: Section[]) => void;
	setProducts: (products: Product[]) => void;
	setModifiers: (modifiers: Modifier[]) => void; // 👈 Añadido
}

export const useCatalogStore = create<CatalogState>()((set) => ({
	sections: [],
	products: [],
	modifiers: [], // 👈 Estado inicial
	setSections: (sections) => set({ sections: [...sections] }),
	setProducts: (products) => set({ products: [...products] }),
	setModifiers: (modifiers) => set({ modifiers: [...modifiers] }), // 👈 Clonación limpia
}));
