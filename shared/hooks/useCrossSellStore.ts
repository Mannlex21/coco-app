import { create } from "zustand";
import { ProductCrossSellGroup } from "@coco/shared/core/entities";

interface CrossSellState {
	// Estado
	crossSellGroups: ProductCrossSellGroup[];
	searchTerm: string; // Por si en el futuro quieres filtrar grupos o productos sugeridos

	// Acciones
	setCrossSellGroups: (groups: ProductCrossSellGroup[]) => void;
	setSearchTerm: (term: string) => void;

	// Helpers para mutar el estado local sin re-fetch (Optimización UI)
	addGroupLocal: (group: ProductCrossSellGroup) => void;
	removeGroupLocal: (groupId: string) => void;
	updateGroupLocal: (
		groupId: string,
		data: Partial<ProductCrossSellGroup>,
	) => void;

	// Limpiar el store (útil al desmotar la pantalla o cambiar de producto)
	clearCrossSellStore: () => void;
}

export const useCrossSellStore = create<CrossSellState>((set) => ({
	// --- ESTADO INICIAL ---
	crossSellGroups: [],
	searchTerm: "",

	// --- ACCIONES ---
	setCrossSellGroups: (groups) => set({ crossSellGroups: groups }),

	setSearchTerm: (term) => set({ searchTerm: term }),

	addGroupLocal: (group) =>
		set((state) => ({
			crossSellGroups: [...state.crossSellGroups, group],
		})),

	removeGroupLocal: (groupId) =>
		set((state) => ({
			crossSellGroups: state.crossSellGroups.filter(
				(g) => g.id !== groupId,
			),
		})),

	updateGroupLocal: (groupId, data) =>
		set((state) => ({
			crossSellGroups: state.crossSellGroups.map((g) =>
				g.id === groupId ? { ...g, ...data } : g,
			),
		})),

	clearCrossSellStore: () => set({ crossSellGroups: [], searchTerm: "" }),
}));
