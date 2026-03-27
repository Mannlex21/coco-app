export type BusinessStatus = "active" | "suspended" | "pending_approval";
export type BusinessPlan = "free" | "basic" | "premium";
export type BusinessCategory =
	| "food"
	| "pharmacy"
	| "grocery"
	| "bakery"
	| "other";

export interface GeoLocation {
	lat: number;
	lng: number;
}

export interface Business {
	// Identificadores
	id: string; // ID generado por Firestore
	ownerId: string; // UID del usuario (dueño) en Firebase Auth

	// Información Básica
	name: string; // Nombre comercial (Ej: Tacos El Pastor)
	description?: string; // Breve reseña del negocio
	category: BusinessCategory; // 'food', 'market', 'pharmacy', etc.

	// Contacto y Ubicación (Regla 9.1 de COCO_PROJECT.md)
	address: string; // Dirección física
	location: GeoLocation; // { lat: number, lng: number } para el mapa
	phone: string; // WhatsApp o teléfono de contacto

	// Identidad Visual (Regla 11.3)
	logoUrl?: string; // URL del logo (Mascota con sombrero de chef)
	coverUrl?: string; // Imagen de portada del negocio

	// Estado Operativo (Regla 6.1)
	isOpen: boolean; // Switch manual para abrir/cerrar en el Dashboard

	// Configuración de Logística
	deliveryCost: number; // Costo de envío base (Ej: 20 MXN)
	ownDriverIds: string[]; // IDs de repartidores propios si el negocio los tiene

	// Modelo de Negocio y Monetización (Regla 5.1)
	plan: BusinessPlan; // 'basic', 'premium', etc.
	platformFee: number; // Porcentaje o comisión fija por pedido
	weeklyDebt: number; // Monto acumulado a liquidar el lunes por SPEI

	// Control de Pagos
	lastPaymentDate?: Date; // Fecha del último SPEI recibido
	paymentDeadline?: Date; // Próximo lunes de corte

	// Metadatos y Sistema
	status: BusinessStatus; // 'pending', 'active', 'suspended'
	rating?: number; // Calificación promedio (0 a 5)
	totalOrders?: number; // Contador histórico de pedidos
	createdAt: Date; // Fecha de registro
	updatedAt: Date; // Última actualización
}
