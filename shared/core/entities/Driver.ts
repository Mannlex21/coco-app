export type DriverAccountStatus = "active" | "pending_payment" | "suspended";

export interface DriverAccount {
	driverId: string;
	type: "business" | "independent";
	businessId?: string;
	maxActiveOrders: number;
	activeOrdersCount: number;
	weeklyFeeOwed: number;
	lastPaymentDate?: Date;
	paymentDeadline?: Date;
	receiptImageUrl?: string;
	status: DriverAccountStatus;
	createdAt: Date;
	updatedAt: Date;
}

export type MessageSenderRole = "client" | "driver" | "business";

export interface Message {
	id: string;
	orderId: string;
	senderId: string;
	senderRole: MessageSenderRole;
	senderName: string;
	text: string;
	createdAt: Date;
	readAt?: Date;
}

export interface TrackingLocation {
	driverId: string;
	orderId: string;
	lat: number;
	lng: number;
	heading?: number;
	speed?: number;
	updatedAt: number;
	activeOrderIds?: string[];
	waypoints?: {
		orderId: string;
		lat: number;
		lng: number;
		distanceMeters: number;
		estimatedArrivalMinutes: number;
	}[];
}
