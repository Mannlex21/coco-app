import { create } from "zustand";
import { Section } from "core/entities";

interface SectionState {
	sections: Section[];

	setSections: (sections: Section[]) => void;
	addSection: (section: Section) => void;
	updateSection: (
		sectionId: string,
		updatedSection: Partial<Section>,
	) => void;
	removeSection: (sectionId: string) => void;
	clearSections: () => void;
}

export const useSectionStore = create<SectionState>((set) => ({
	sections: [],

	setSections: (sections) => set({ sections: [...sections] }),

	addSection: (section) =>
		set((state) => ({
			sections: [...state.sections, section],
		})),

	updateSection: (sectionId, updatedSection) =>
		set((state) => ({
			sections: state.sections.map((s) =>
				s.id === sectionId ? { ...s, ...updatedSection } : s,
			),
		})),

	removeSection: (sectionId) =>
		set((state) => ({
			sections: state.sections.filter((s) => s.id !== sectionId),
		})),

	clearSections: () => set({ sections: [] }),
}));
