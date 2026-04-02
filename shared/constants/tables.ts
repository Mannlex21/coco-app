export const TABLES = {
	SECTIONS: "sections",
	PRODUCTS: "products",
	MODIFIER_GROUPS: "modifier_groups",
	MODIFIER_OPTIONS: "modifier_options",
} as const;

// Esto te permite extraer el tipo si llegas a necesitarlo en alguna función
export type TableName = (typeof TABLES)[keyof typeof TABLES];
