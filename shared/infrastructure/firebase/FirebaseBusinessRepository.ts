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
	doc,
	Firestore,
	getDoc,
	getDocs,
	increment,
	onSnapshot,
	query,
	serverTimestamp,
	Timestamp,
	updateDoc,
	where,
} from "firebase/firestore";

export class FirebaseBusinessRepository implements IBusinessRepository {
	constructor(private db: Firestore) {
		if (!this.db) {
			console.error(
				"🚨 FirebaseBusinessRepository: La instancia de Firestore (db) es undefined.",
			);
		}
	}

	// Usamos 'any' en el retorno para saltar la validación de instancia en toda la clase
	private get safeDb(): any {
		if (!this.db) throw new Error("Firestore no inicializado.");
		return this.db as any;
	}

	async create(
		business: Omit<Business, "id" | "createdAt" | "updatedAt">,
	): Promise<Business> {
		const dbAny = this.db as any;
		// El 'business' que recibes del formulario ya debe traer el 'ownerId'
		const ref = await addDoc(collection(dbAny, COLLECTIONS.BUSINESSES), {
			...business,
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
			status: "active", // Estado inicial por defecto
		});

		return {
			...business,
			id: ref.id,
			createdAt: new Date(),
			updatedAt: new Date(),
		} as Business;
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
