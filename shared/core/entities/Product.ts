// 4. La interfaz maestra del Producto
export interface Product {
	id: string;
	businessId: string;
	name: string;
	description: string;
	price: number;
	imageUrl?: string;
	isAvailable: boolean;
	position: number;
	createdAt: Date;
	updatedAt: Date;
	sectionIds: string[];
}
