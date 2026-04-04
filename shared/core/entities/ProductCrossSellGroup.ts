// --- 1. MUNDO BASE DE DATOS (Snake Case) ---
// Estas interfaces reflejan exactamente cómo están nombradas tus columnas en PostgreSQL.

export interface DBProductCrossSellGroup {
	id: string;
	origin_product_id: string;
	name: string;
	position: number;
	created_at: string;
	// Nodo relacional que viene de Supabase al consultar los items
	product_cross_sell_items?: DBProductCrossSellItem[];
}

export interface DBProductCrossSellItem {
	id: string;
	group_id: string;
	suggested_product_id: string;
	override_price: number | null;
	position: number;
	created_at: string;
	// Nodo relacional que viene de Supabase al consultar el producto sugerido
	products?: {
		id: string;
		name: string;
		price: number;
		image_url: string | null;
		is_available: boolean;
	};
}

// --- 2. MUNDO FRONTEND (Camel Case) ---
// Estas son las interfaces que utilizarás en tus componentes, pantallas y stores.

export interface ProductCrossSellGroup {
	id: string;
	originProductId: string;
	name: string;
	position: number;
	createdAt: Date;
	items: ProductCrossSellItem[]; // Array mapeado y listo para iterar
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
	imageUrl: string | null;
	isAvailable: boolean;
}

// --- 3. FUNCIÓN DE MAPEO ---
// Transforma la data cruda de Supabase al estándar limpio que usa tu App.

export const mapDBCrossSellToFrontend = (
	dbGroups: DBProductCrossSellGroup[],
): ProductCrossSellGroup[] => {
	if (!dbGroups) return [];

	return (
		dbGroups
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

							// Extraemos del nodo anidado 'products'
							name: productData?.name || "",
							normalPrice: productData?.price
								? Number(productData.price)
								: 0,
							imageUrl: productData?.image_url || null,
							isAvailable: productData?.is_available ?? false,
						};
					})
					// Aseguramos que los productos sugeridos vengan ordenados por posición
					.sort((a, b) => a.position - b.position);

				return {
					id: group.id,
					originProductId: group.origin_product_id,
					name: group.name,
					position: group.position,
					createdAt: new Date(group.created_at),
					items: mappedItems,
				};
			})
			// Aseguramos que los títulos de los grupos vengan ordenados por posición
			.sort((a, b) => a.position - b.position)
	);
};
