export type UserRole = "client" | "business" | "driver";
export type UserStatus = "active" | "suspended" | "pending_verification";

// 💡 Interfaz mejorada con los datos que acabamos de diseñar
export interface User {
	id: string;
	phone: string;
	name: string;
	email?: string;
	role: UserRole;
	fcmToken?: string;
	status: UserStatus;
	avatarUrl?: string;
	lastActiveBusinessId?: string;
	createdAt: Date;
	updatedAt: Date;
}
