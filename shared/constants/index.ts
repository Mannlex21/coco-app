export const PLATFORM = {
	NAME: "Coco",
	FEE_BUSINESS: 4,
	FEE_DRIVER: 2,
	WEEKLY_DEADLINE_DAYS: 7,
	DRIVER_MAX_ACTIVE_ORDERS_MVP: 1,
};

export const MINIMUM_DRIVER_EARNINGS = {
	simple: 25,
	with_wait: 50,
	document: 30,
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
	pending: "Esperando confirmación",
	accepted: "Pedido confirmado",
	assigned: "Repartidor asignado",
	in_transit: "En camino",
	delivered: "Entregado",
	cancelled: "Cancelado",
};

export const ORDER_STATUS_EMOJI: Record<string, string> = {
	pending: "🕐",
	accepted: "✅",
	assigned: "🛵",
	in_transit: "📍",
	delivered: "🎉",
	cancelled: "❌",
};

export const BUSINESS_CATEGORY_LABELS: Record<string, string> = {
	food: "Restaurante / Comida",
	pharmacy: "Farmacia",
	grocery: "Abarrotes / Supermercado",
	bakery: "Panadería",
	other: "Otro negocio",
};

export const COLLECTIONS = {
	USERS: "users",
	BUSINESSES: "businesses",
	PRODUCTS: "products",
	ORDERS: "orders",
	DRIVER_ACCOUNTS: "driverAccounts",
};

export const RTDB_PATHS = {
	TRACKING: (orderId: string) => `tracking/${orderId}`,
};
export const LAYOUT = {
	TAB_BAR_HEIGHT: 70, // altura base del tab bar definida en MainNavigator
	KEYBOARD_EXTRA_SCROLL: 130, // offset extra para KeyboardAwareScrollView
};
