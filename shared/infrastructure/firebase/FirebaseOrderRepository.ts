import {
	collection,
	doc,
	addDoc,
	getDoc,
	updateDoc,
	query,
	where,
	onSnapshot,
	serverTimestamp,
	orderBy,
	Firestore,
} from "firebase/firestore";
import { IOrderRepository, Unsubscribe } from "@coco/shared/core/repositories";
import { Order, OrderStatus } from "@coco/shared/core/entities/Order";
import { COLLECTIONS } from "@coco/shared/constants";

export class FirebaseOrderRepository implements IOrderRepository {
	constructor(private db: Firestore) {}

	async create(
		order: Omit<Order, "id" | "createdAt" | "updatedAt">,
	): Promise<Order> {
		const ref = await addDoc(collection(this.db, COLLECTIONS.ORDERS), {
			...order,
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
		});
		return {
			...order,
			id: ref.id,
			createdAt: new Date(),
			updatedAt: new Date(),
		};
	}

	async getById(id: string): Promise<Order | null> {
		const snap = await getDoc(doc(this.db, COLLECTIONS.ORDERS, id));
		if (!snap.exists()) return null;
		return this._map(snap.id, snap.data());
	}

	async updateStatus(id: string, status: OrderStatus): Promise<void> {
		await updateDoc(doc(this.db, COLLECTIONS.ORDERS, id), {
			status,
			updatedAt: serverTimestamp(),
			...(status === "delivered"
				? { deliveredAt: serverTimestamp() }
				: {}),
		});
	}

	async update(id: string, data: Partial<Order>): Promise<void> {
		await updateDoc(doc(this.db, COLLECTIONS.ORDERS, id), {
			...data,
			updatedAt: serverTimestamp(),
		});
	}

	listenByClient(
		clientId: string,
		callback: (orders: Order[]) => void,
	): Unsubscribe {
		const q = query(
			collection(this.db, COLLECTIONS.ORDERS),
			where("clientId", "==", clientId),
			orderBy("createdAt", "desc"),
		);
		return onSnapshot(q, (snap) => {
			callback(snap.docs.map((d) => this._map(d.id, d.data())));
		});
	}

	listenByBusiness(
		businessId: string,
		callback: (orders: Order[]) => void,
	): Unsubscribe {
		const q = query(
			collection(this.db, COLLECTIONS.ORDERS),
			where("businessId", "==", businessId),
			where("status", "not-in", ["delivered", "cancelled"]),
			orderBy("createdAt", "desc"),
		);
		return onSnapshot(q, (snap) => {
			callback(snap.docs.map((d) => this._map(d.id, d.data())));
		});
	}

	listenAvailableForDriver(callback: (orders: Order[]) => void): Unsubscribe {
		const q = query(
			collection(this.db, COLLECTIONS.ORDERS),
			where("status", "==", "accepted"),
			where("driverId", "==", null),
			orderBy("createdAt", "asc"),
		);
		return onSnapshot(q, (snap) => {
			callback(snap.docs.map((d) => this._map(d.id, d.data())));
		});
	}

	listenByDriver(
		driverId: string,
		callback: (orders: Order[]) => void,
	): Unsubscribe {
		const q = query(
			collection(this.db, COLLECTIONS.ORDERS),
			where("driverId", "==", driverId),
			where("status", "not-in", ["delivered", "cancelled"]),
			orderBy("createdAt", "desc"),
		);
		return onSnapshot(q, (snap) => {
			callback(snap.docs.map((d) => this._map(d.id, d.data())));
		});
	}

	async assignDriver(
		orderId: string,
		driverId: string,
		driverType: "business" | "independent",
	): Promise<void> {
		await updateDoc(doc(this.db, COLLECTIONS.ORDERS, orderId), {
			driverId,
			driverType,
			status: "assigned",
			updatedAt: serverTimestamp(),
		});
	}

	private _map(id: string, data: Record<string, any>): Order {
		return {
			...data,
			id,
			createdAt: data.createdAt?.toDate?.() ?? new Date(),
			updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
			deliveredAt: data.deliveredAt?.toDate?.(),
		} as Order;
	}
}
