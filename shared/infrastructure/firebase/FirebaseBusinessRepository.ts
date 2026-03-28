import {
	IBusinessRepository,
	Unsubscribe,
} from "@coco/shared/core/repositories";
import { Business } from "@coco/shared/core/entities/Business";
import { COLLECTIONS } from "@coco/shared/constants";
import {
	addDoc,
	arrayRemove,
	arrayUnion,
	collection,
	deleteDoc,
	doc,
	Firestore,
	getDoc,
	getDocs,
	increment,
	onSnapshot,
	query,
	serverTimestamp,
	setDoc,
	Timestamp,
	updateDoc,
	where,
} from "firebase/firestore";

export class FirebaseBusinessRepository implements IBusinessRepository {
	constructor(private db: Firestore) {}

	private get safeDb(): Firestore {
		if (!this.db) throw new Error("Firestore no inicializado.");
		return this.db;
	}

	// Método unificado para registro de nuevos negocios
	async register(
		userId: string,
		formData: Pick<
			Business,
			"name" | "category" | "address" | "phone" | "deliveryCost"
		>,
	): Promise<string> {
		const docRef = doc(collection(this.safeDb, COLLECTIONS.BUSINESSES));

		const businessData: Business = {
			id: docRef.id,
			ownerId: userId,
			name: formData.name,
			category: formData.category,
			address: formData.address,
			phone: formData.phone,
			deliveryCost: Number(formData.deliveryCost),
			location: { lat: 0, lng: 0 },
			isOpen: false,
			status: "active",
			plan: "basic",
			platformFee: 0.05,
			weeklyDebt: 0,
			ownDriverIds: [],
			description: "",
			logoUrl: "",
			coverUrl: "",
			totalOrders: 0,
			rating: 5,
			createdAt: serverTimestamp() as any,
			updatedAt: serverTimestamp() as any,
			paymentDeadline: null as any,
		};

		await setDoc(docRef, businessData);
		return docRef.id;
	}

	async updateStatus(id: string, isOpen: boolean): Promise<void> {
		await updateDoc(doc(this.safeDb, COLLECTIONS.BUSINESSES, id), {
			isOpen,
			updatedAt: serverTimestamp(),
		});
	}

	async delete(id: string): Promise<void> {
		await deleteDoc(doc(this.safeDb, COLLECTIONS.BUSINESSES, id));
	}

	async getById(id: string): Promise<Business | null> {
		const snap = await getDoc(doc(this.safeDb, COLLECTIONS.BUSINESSES, id));
		if (!snap.exists()) return null;
		return this._map(snap.id, snap.data());
	}

	// En lugar de devolver Business | null, devolvemos un array
	// Cambiamos el nombre para que sea plural y devuelva un array
	async listByOwnerId(ownerId: string): Promise<Business[]> {
		if (!this.db || !ownerId) return [];

		try {
			const colRef = collection(this.db, COLLECTIONS.BUSINESSES);
			const q = query(colRef, where("ownerId", "==", ownerId));
			const snap = await getDocs(q);

			// Retornamos la lista mapeada (si está vacío, devuelve [])
			return snap.docs.map((doc) => this._map(doc.id, doc.data()));
		} catch (error) {
			console.error("Error listing businesses:", error);
			return [];
		}
	}

	async listActive(): Promise<Business[]> {
		const q = query(
			collection(this.safeDb, COLLECTIONS.BUSINESSES),
			where("status", "==", "active"),
			where("isOpen", "==", true),
		);
		const snap = await getDocs(q);
		return snap.docs.map((d) => this._map(d.id, d.data()));
	}

	async update(id: string, data: Partial<Business>): Promise<void> {
		await updateDoc(doc(this.safeDb, COLLECTIONS.BUSINESSES, id), {
			...data,
			updatedAt: serverTimestamp(),
		});
	}

	listen(id: string, callback: (business: Business) => void): Unsubscribe {
		return onSnapshot(
			doc(this.safeDb, COLLECTIONS.BUSINESSES, id),
			(snap) => {
				if (snap.exists()) callback(this._map(snap.id, snap.data()));
			},
		);
	}

	async addOwnDriver(businessId: string, driverId: string): Promise<void> {
		await updateDoc(doc(this.safeDb, COLLECTIONS.BUSINESSES, businessId), {
			ownDriverIds: arrayUnion(driverId),
			updatedAt: serverTimestamp(),
		});
	}

	async removeOwnDriver(businessId: string, driverId: string): Promise<void> {
		await updateDoc(doc(this.safeDb, COLLECTIONS.BUSINESSES, businessId), {
			ownDriverIds: arrayRemove(driverId),
			updatedAt: serverTimestamp(),
		});
	}

	async addWeeklyDebt(businessId: string, amount: number): Promise<void> {
		await updateDoc(doc(this.safeDb, COLLECTIONS.BUSINESSES, businessId), {
			weeklyDebt: increment(amount),
			updatedAt: serverTimestamp(),
		});
	}

	async markPaymentDone(businessId: string): Promise<void> {
		await updateDoc(doc(this.safeDb, COLLECTIONS.BUSINESSES, businessId), {
			weeklyDebt: 0,
			lastPaymentDate: serverTimestamp(),
			status: "active",
			updatedAt: serverTimestamp(),
		});
	}

	private _map(id: string, data: Record<string, any>): Business {
		return {
			...data,
			id,
			createdAt: (data.createdAt as Timestamp)?.toDate?.() ?? new Date(),
			updatedAt: (data.updatedAt as Timestamp)?.toDate?.() ?? new Date(),
			lastPaymentDate: (data.lastPaymentDate as Timestamp)?.toDate?.(),
			paymentDeadline: (data.paymentDeadline as Timestamp)?.toDate?.(),
		} as Business;
	}
}
