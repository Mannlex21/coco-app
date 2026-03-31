export const TABLES = {
	SECTIONS: "sections",
	PRODUCTS: "products",
} as const;

// Esto te permite extraer el tipo si llegas a necesitarlo en alguna función
export type TableName = (typeof TABLES)[keyof typeof TABLES];
