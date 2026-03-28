export interface Product {
	id: string;
	businessId: string; // ✅ Correcto, relación 1-N con Business
	name: string;
	description?: string;
	price: number;
	imageUrl?: string;
	isAvailable: boolean;
	category: "tacos" | "bebidas" | "postres" | "combos" | "otros";
	stock?: number;
	options?: {
		name: string;
		type: "radio" | "checkbox";
		choices: {
			name: string;
			extraPrice?: number;
		}[];
	}[];
	sortOrder?: number;
	createdAt: Date;
	updatedAt: Date;
}
