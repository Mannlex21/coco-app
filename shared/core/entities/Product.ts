export interface Product {
	id: string;
	businessId: string;
	name: string;
	description?: string;
	price: number;
	imageUrl?: string;
	isAvailable: boolean;
	category?: string;
	sortOrder?: number;
	createdAt: Date;
	updatedAt: Date;
}
