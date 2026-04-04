import { create } from "zustand";
import { Section } from "@coco/shared/core/entities";

interface SectionState {
	sections: Section[];
	searchTerm: string;

	setSections: (sections: Section[]) => void;
	setSearchTerm: (term: string) => void;
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
	searchTerm: "",

	setSections: (sections) => set({ sections: [...sections] }),
	setSearchTerm: (term) => set({ searchTerm: term }),

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
	clearSections: () => set({ sections: [], searchTerm: "" }),
}));
