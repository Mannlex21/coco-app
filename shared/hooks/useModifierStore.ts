import { create } from "zustand";
import { ModifierGroup } from "@coco/shared/core/entities/Modifier";

interface ModifierState {
	modifiersGroup: ModifierGroup[];
	searchTerm: string;
	setModifiersGroup: (modifiersGroup: ModifierGroup[]) => void;
	setSearchTerm: (term: string) => void;
	addModifierGroup: (modifierGroup: ModifierGroup) => void;
	updateModifierGroup: (
		groupId: string,
		updatedGroup: Partial<ModifierGroup>,
	) => void;
	removeModifierGroup: (groupId: string) => void;
	clearModifiers: () => void;
}

export const useModifierStore = create<ModifierState>((set) => ({
	modifiersGroup: [],
	searchTerm: "",

	setModifiersGroup: (modifiersGroups) =>
		set({ modifiersGroup: [...modifiersGroups] }),

	setSearchTerm: (term) => set({ searchTerm: term }),

	addModifierGroup: (modifierGroup) =>
		set((state) => ({
			modifiersGroup: [...state.modifiersGroup, modifierGroup],
		})),

	updateModifierGroup: (groupId, updatedGroup) =>
		set((state) => ({
			modifiersGroup: state.modifiersGroup.map((m) =>
				m.id === groupId ? { ...m, ...updatedGroup } : m,
			),
		})),

	removeModifierGroup: (groupId) =>
		set((state) => ({
			modifiersGroup: state.modifiersGroup.filter(
				(m) => m.id !== groupId,
			),
		})),
	clearModifiers: () => set({ modifiersGroup: [], searchTerm: "" }),
}));
