import { create } from "zustand";
import { ModifierGroup } from "@coco/shared/core/entities/Modifier";

interface ModifierState {
	modifiersGroup: ModifierGroup[];

	setModifiersGroup: (modifiersGroup: ModifierGroup[]) => void;
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

	setModifiersGroup: (modifiersGroups) =>
		set({ modifiersGroup: [...modifiersGroups] }),

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

	clearModifiers: () => set({ modifiersGroup: [] }),
}));
