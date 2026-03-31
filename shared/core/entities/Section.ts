export interface Section {
	id: string;
	businessId: string;
	name: string;
	description?: string;
	position: number;
	isAvailable: boolean;
	visualizationType: string;
	createdAt: Date;
	updatedAt: Date;
}
