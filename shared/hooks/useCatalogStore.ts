import { create } from "zustand";
import { Section, Product } from "core/entities"; // Asegúrate de añadir Modifier aquí
import { ModifierGroup } from "core/entities/Modifier";

interface CatalogState {
	sections: Section[];
	products: Product[];
	modifiersGroup: ModifierGroup[]; // 👈 Añadido
	setSections: (sections: Section[]) => void;
	setProducts: (products: Product[]) => void;
	setModifiersGroup: (modifiersGroup: ModifierGroup[]) => void;
}

export const useCatalogStore = create<CatalogState>()((set) => ({
	sections: [],
	products: [],
	modifiersGroup: [], // 👈 Estado inicial
	setSections: (sections) => set({ sections: [...sections] }),
	setProducts: (products) => set({ products: [...products] }),
	setModifiersGroup: (modifiersGroups) =>
		set({ modifiersGroup: [...modifiersGroups] }),
}));
