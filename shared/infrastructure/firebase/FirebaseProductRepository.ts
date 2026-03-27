import {
	collection,
	doc,
	addDoc,
	getDoc,
	getDocs,
	updateDoc,
	deleteDoc,
	query,
	where,
	orderBy,
	serverTimestamp,
	Firestore,
} from "firebase/firestore";
import { IProductRepository } from "@coco/shared/core/repositories";
import { Product } from "@coco/shared/core/entities/Product";
import { COLLECTIONS } from "@coco/shared/constants";

export class FirebaseProductRepository implements IProductRepository {
	constructor(private db: Firestore) {}

	async create(
		product: Omit<Product, "id" | "createdAt" | "updatedAt">,
	): Promise<Product> {
		const ref = await addDoc(collection(this.db, COLLECTIONS.PRODUCTS), {
			...product,
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
		});
		return {
			...product,
			id: ref.id,
			createdAt: new Date(),
			updatedAt: new Date(),
		};
	}

	async getById(id: string): Promise<Product | null> {
		const snap = await getDoc(doc(this.db, COLLECTIONS.PRODUCTS, id));
		if (!snap.exists()) return null;
		return this._map(snap.id, snap.data());
	}

	async listByBusiness(businessId: string): Promise<Product[]> {
		const q = query(
			collection(this.db, COLLECTIONS.PRODUCTS),
			where("businessId", "==", businessId),
			where("isAvailable", "==", true),
			orderBy("sortOrder", "asc"),
		);
		const snap = await getDocs(q);
		return snap.docs.map((d) => this._map(d.id, d.data()));
	}

	async update(id: string, data: Partial<Product>): Promise<void> {
		await updateDoc(doc(this.db, COLLECTIONS.PRODUCTS, id), {
			...data,
			updatedAt: serverTimestamp(),
		});
	}

	async delete(id: string): Promise<void> {
		await deleteDoc(doc(this.db, COLLECTIONS.PRODUCTS, id));
	}

	private _map(id: string, data: Record<string, any>): Product {
		return {
			...data,
			id,
			createdAt: data.createdAt?.toDate?.() ?? new Date(),
			updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
		} as Product;
	}
}
