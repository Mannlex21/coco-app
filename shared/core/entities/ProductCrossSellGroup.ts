// 1. Definimos los tipos literales para TypeScript
export type VisualizationType = "list" | "grid";

// --- 1. MUNDO BASE DE DATOS (Snake Case) ---
export interface DBProductCrossSellGroup {
	id: string;
	origin_product_id: string;
	name: string;
	position: number;
	is_available: boolean;
	visualization_type: VisualizationType;
	created_at: string;
	product_cross_sell_items?: DBProductCrossSellItem[];
}

export interface DBProductCrossSellItem {
	id: string;
	group_id: string;
	suggested_product_id: string;
	override_price: number | null;
	position: number;
	created_at: string;
	products?: {
		id: string;
		name: string;
		price: number;
		image_url: string | null;
		is_available: boolean;
	};
}

// --- 2. MUNDO FRONTEND (Camel Case) ---
export interface ProductCrossSellGroup {
	id: string;
	originProductId: string;
	name: string;
	position: number;
	isAvailable: boolean;
	visualizationType: VisualizationType;
	createdAt: Date;
	items: ProductCrossSellItem[];
}

export interface ProductCrossSellItem {
	id: string;
	groupId: string;
	suggestedProductId: string;
	overridePrice: number | null;
	position: number;
	createdAt: Date;
	name: string;
	normalPrice: number;
	imageUrl?: string;
	isAvailable: boolean;
}

// --- 3. FUNCIÓN DE MAPEO ---
export const mapDBCrossSellToFrontend = (
	dbGroups: DBProductCrossSellGroup[],
): ProductCrossSellGroup[] => {
	if (!dbGroups) return [];

	return dbGroups
		.map((group) => {
			const mappedItems: ProductCrossSellItem[] = (
				group.product_cross_sell_items || []
			)
				.map((item) => {
					const productData = item.products;

					return {
						id: item.id,
						groupId: item.group_id,
						suggestedProductId: item.suggested_product_id,
						overridePrice: item.override_price
							? Number(item.override_price)
							: null,
						position: item.position,
						createdAt: new Date(item.created_at),

						name: productData?.name || "",
						normalPrice: productData?.price
							? Number(productData.price)
							: 0,
						imageUrl: productData?.image_url || "",
						isAvailable: productData?.is_available ?? false,
					};
				})
				.sort((a, b) => a.position - b.position);

			return {
				id: group.id,
				originProductId: group.origin_product_id,
				name: group.name,
				position: group.position,
				isAvailable: group.is_available ?? true,
				visualizationType: group.visualization_type || "list",
				createdAt: new Date(group.created_at),
				items: mappedItems,
			};
		})
		.sort((a, b) => a.position - b.position);
};
