import {
	Firestore,
	collection,
	addDoc,
	updateDoc,
	deleteDoc,
	doc,
	getDocs,
	query,
	orderBy,
	serverTimestamp,
	getDoc,
} from "firebase/firestore";
import { Product } from "@coco/shared/core/entities/Product";
import { IProductRepository } from "core/repositories";

export class FirebaseProductRepository implements IProductRepository {
	constructor(private db: Firestore) {}

	private getProductPath(businessId: string, productId?: string) {
		return productId
			? doc(this.db, `businesses/${businessId}/products`, productId)
			: collection(this.db, `businesses/${businessId}/products`);
	}

	async listByBusinessId(businessId: string): Promise<Product[]> {
		const q = query(
			this.getProductPath(businessId) as any,
			orderBy("sortOrder", "asc"),
		);
		const snapshot = await getDocs(q);

		return snapshot.docs.map(
			(doc) =>
				({
					id: doc.id,
					...(doc.data() as object), // ✅ Soluciona ts(2698)
				}) as Product,
		);
	}

	async save(businessId: string, product: any): Promise<string> {
		const colRef = this.getProductPath(businessId) as any;
		const docRef = await addDoc(colRef, {
			...product,
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
		});
		return docRef.id;
	}

	async update(
		businessId: string,
		productId: string,
		data: Partial<Product>,
	): Promise<void> {
		const docRef = this.getProductPath(businessId, productId) as any;
		await updateDoc(docRef, {
			...data,
			updatedAt: serverTimestamp(),
		});
	}

	async updateAvailability(
		businessId: string,
		productId: string,
		isAvailable: boolean,
	): Promise<void> {
		await this.update(businessId, productId, { isAvailable });
	}

	async delete(businessId: string, productId: string): Promise<void> {
		const docRef = this.getProductPath(businessId, productId) as any;
		await deleteDoc(docRef);
	}

	async getById(
		businessId: string,
		productId: string,
	): Promise<Product | null> {
		const docRef = this.getProductPath(businessId, productId) as any;
		const snap = await getDoc(docRef);
		return snap.exists()
			? ({ id: snap.id, ...(snap.data() as object) } as Product)
			: null;
	}
}
