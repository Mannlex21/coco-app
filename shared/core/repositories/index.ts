import { User } from "../entities/User";
import { Business } from "../entities/Business";
import { Product } from "../entities/Product";
import { Order, OrderStatus } from "../entities/Order";
import { DriverAccount, Message, TrackingLocation } from "../entities/Driver";

export type Unsubscribe = () => void;

// ─── AUTH ────────────────────────────────────────────────────────────────────

export interface IAuthRepository {
	getCurrentUser(): Promise<User | null>;
	onAuthStateChanged(callback: (user: User | null) => void): Unsubscribe;
	signOut(): Promise<void>;
	updateFCMToken(userId: string, token: string): Promise<void>;
	updateProfile(
		userId: string,
		data: Partial<Pick<User, "name" | "avatarUrl">>,
	): Promise<void>;
}

// ─── USUARIOS ────────────────────────────────────────────────────────────────

export interface IUserRepository {
	getById(id: string): Promise<User | null>;
	update(id: string, data: Partial<User>): Promise<void>;
	existsByPhone(phone: string): Promise<boolean>;
}

// ─── NEGOCIOS ────────────────────────────────────────────────────────────────

export interface IBusinessRepository {
	// Registro inicial con campos obligatorios
	register(
		userId: string,
		formData: Pick<
			Business,
			"name" | "category" | "address" | "phone" | "deliveryCost"
		>,
	): Promise<string>;

	// Métodos de lectura
	getById(id: string): Promise<Business | null>;
	listByOwnerId(ownerId: string): Promise<Business[]>;
	listActive(): Promise<Business[]>;
	listen(id: string, callback: (business: Business) => void): Unsubscribe;

	// Métodos de actualización y estado
	update(id: string, data: Partial<Business>): Promise<void>;
	updateStatus(id: string, isOpen: boolean): Promise<void>;
	delete(id: string): Promise<void>;

	// Gestión de drivers y finanzas
	addOwnDriver(businessId: string, driverId: string): Promise<void>;
	removeOwnDriver(businessId: string, driverId: string): Promise<void>;
	addWeeklyDebt(businessId: string, amount: number): Promise<void>;
	markPaymentDone(businessId: string): Promise<void>;
}

// ─── PRODUCTOS ───────────────────────────────────────────────────────────────

export interface IProductRepository {
	// Lectura
	getById(businessId: string, productId: string): Promise<Product | null>;
	listByBusinessId(businessId: string): Promise<Product[]>;

	// Escritura
	save(
		businessId: string,
		product: Omit<Product, "id" | "createdAt" | "updatedAt">,
	): Promise<string>;
	update(
		businessId: string,
		productId: string,
		data: Partial<Product>,
	): Promise<void>;
	updateAvailability(
		businessId: string,
		productId: string,
		isAvailable: boolean,
	): Promise<void>;
	delete(businessId: string, productId: string): Promise<void>;
}

// ─── PEDIDOS ─────────────────────────────────────────────────────────────────

export interface IOrderRepository {
	create(
		order: Omit<Order, "id" | "createdAt" | "updatedAt">,
	): Promise<Order>;
	getById(id: string): Promise<Order | null>;
	updateStatus(id: string, status: OrderStatus): Promise<void>;
	update(id: string, data: Partial<Order>): Promise<void>;
	listenByClient(
		clientId: string,
		callback: (orders: Order[]) => void,
	): Unsubscribe;
	listenByBusiness(
		businessId: string,
		callback: (orders: Order[]) => void,
	): Unsubscribe;
	listenAvailableForDriver(callback: (orders: Order[]) => void): Unsubscribe;
	listenByDriver(
		driverId: string,
		callback: (orders: Order[]) => void,
	): Unsubscribe;
	assignDriver(
		orderId: string,
		driverId: string,
		driverType: "business" | "independent",
	): Promise<void>;
}

// ─── REPARTIDORES ────────────────────────────────────────────────────────────

export interface IDriverRepository {
	create(
		account: Omit<DriverAccount, "createdAt" | "updatedAt">,
	): Promise<DriverAccount>;
	getByDriverId(driverId: string): Promise<DriverAccount | null>;
	update(driverId: string, data: Partial<DriverAccount>): Promise<void>;
	listAvailableIndependent(): Promise<DriverAccount[]>;
	uploadReceipt(driverId: string, imageUri: string): Promise<string>;
	addWeeklyFee(driverId: string, amount: number): Promise<void>;
	approvePayment(driverId: string): Promise<void>;
}

// ─── CHAT ────────────────────────────────────────────────────────────────────

export interface IChatRepository {
	sendMessage(message: Omit<Message, "id" | "createdAt">): Promise<Message>;
	listenMessages(
		orderId: string,
		callback: (messages: Message[]) => void,
	): Unsubscribe;
	markAsRead(orderId: string, messageId: string): Promise<void>;
}

// ─── TRACKING ────────────────────────────────────────────────────────────────

export interface ITrackingRepository {
	updateLocation(location: TrackingLocation): Promise<void>;
	listenDriverLocation(
		orderId: string,
		callback: (location: TrackingLocation | null) => void,
	): Unsubscribe;
	clearLocation(orderId: string): Promise<void>;
}

// ─── NOTIFICACIONES ──────────────────────────────────────────────────────────

export interface INotificationRepository {
	sendToUser(
		userId: string,
		title: string,
		body: string,
		data?: Record<string, string>,
	): Promise<void>;
	sendToMany(
		userIds: string[],
		title: string,
		body: string,
		data?: Record<string, string>,
	): Promise<void>;
}
