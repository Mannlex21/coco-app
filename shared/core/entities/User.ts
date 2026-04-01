import { RolesApp } from "@coco/shared/constants";

export type UserStatus = "active" | "suspended" | "pending_verification";

export interface User {
	id: string;
	phone: string;
	name: string;
	email?: string;
	role: RolesApp;
	fcmToken?: string;
	status: UserStatus;
	avatarUrl?: string;
	lastActiveBusinessId?: string;
	createdAt: Date;
	updatedAt: Date;
}
