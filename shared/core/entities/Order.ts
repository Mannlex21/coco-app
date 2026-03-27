export type OrderMode = "business_delivery" | "errand";
export type OrderStatus =
	| "pending"
	| "accepted"
	| "assigned"
	| "in_transit"
	| "delivered"
	| "cancelled";
export type PaymentStatus = "pending" | "paid";
export type DriverType = "business" | "independent";
export type ErrandType = "simple" | "with_wait" | "document";
export type ErrandPaymentMethod = "driver_advances" | "driver_picks_up";

export interface OrderItem {
	productId: string;
	productName: string;
	productPrice: number;
	quantity: number;
	subtotal: number;
}

export interface Order {
	id: string;
	mode: OrderMode;
	status: OrderStatus;
	clientId: string;
	businessId?: string;
	driverId?: string;
	driverType?: DriverType;

	// Modo 1 — pedido a negocio
	items?: OrderItem[];
	subtotal?: number;

	// Modo 2 — mandadito (Fase 2)
	errandDescription?: string;
	errandType?: ErrandType;
	errandPaymentMethod?: ErrandPaymentMethod;
	errandEstimatedAmount?: number;

	// Entrega
	deliveryAddress: string;
	deliveryLocation: {
		lat: number;
		lng: number;
	};

	// Costos
	deliveryCost: number;
	driverEarning: number;
	platformFeeFromBusiness: number;
	platformFeeFromDriver: number;
	total: number;

	// Pago
	paymentStatus: PaymentStatus;
	driverReceiptUrl?: string;

	// Cancelación
	cancelledBy?: "client" | "business" | "driver";
	cancellationReason?: string;

	createdAt: Date;
	updatedAt: Date;
	deliveredAt?: Date;
}
