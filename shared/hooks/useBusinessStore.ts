import { create } from "zustand";
import { Business } from "@coco/shared/core/entities/Business";

// 1. Definimos la interfaz para el estado y las acciones
interface BusinessState {
	businesses: Business[];

	// Acciones para mutar el estado
	setBusinesses: (businesses: Business[]) => void;
	addBusiness: (business: Business) => void;
	updateBusiness: (
		businessId: string,
		updatedBusiness: Partial<Business>,
	) => void;
	removeBusiness: (businessId: string) => void;
	clearBusinesses: () => void;
}

// 2. Creamos el store con Zustand
export const useBusinessStore = create<BusinessState>((set) => ({
	// Estado inicial
	businesses: [],

	// Setea la lista completa (por ejemplo, después de un fetch o refresh)
	setBusinesses: (businesses) => set({ businesses }),

	// Agrega un nuevo negocio a la lista existente
	addBusiness: (business) =>
		set((state) => ({
			businesses: [...state.businesses, business],
		})),

	// Actualiza un negocio específico buscando por ID
	updateBusiness: (businessId, updatedBusiness) =>
		set((state) => ({
			businesses: state.businesses.map((b) =>
				b.id === businessId ? { ...b, ...updatedBusiness } : b,
			),
		})),

	// Remueve un negocio de la lista (útil para borrado optimista)
	removeBusiness: (businessId) =>
		set((state) => ({
			businesses: state.businesses.filter((b) => b.id !== businessId),
		})),

	// Limpia el store (ideal para cuando el usuario hace logout)
	clearBusinesses: () => set({ businesses: [] }),
}));
