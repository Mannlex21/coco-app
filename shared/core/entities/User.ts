export type UserRole = "client" | "business" | "driver";
export type UserStatus = "active" | "suspended" | "pending_verification";

export interface User {
	id: string;
	phone: string;
	name: string;
	role: UserRole;
	fcmToken?: string;
	status: UserStatus;
	avatarUrl?: string;
	createdAt: Date;
	updatedAt: Date;
}
