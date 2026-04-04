export const TABLES = {
	BUSINESSES: "businesses",
	SECTIONS: "sections",
	PRODUCTS: "products",
	MODIFIER_GROUPS: "modifier_groups",
	MODIFIER_OPTIONS: "modifier_options",
	PRODUCT_CROSS_SELL_GROUPS: "product_cross_sell_groups",
	PRODUCT_CROSS_SELL_ITEMS: "product_cross_sell_items",
} as const;

// Esto te permite extraer el tipo si llegas a necesitarlo en alguna función
export type TableName = (typeof TABLES)[keyof typeof TABLES];
