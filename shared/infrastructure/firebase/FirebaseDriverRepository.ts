import {
	collection,
	doc,
	setDoc,
	getDoc,
	getDocs,
	updateDoc,
	query,
	where,
	serverTimestamp,
	increment,
	Firestore,
} from "firebase/firestore";
import {
	getStorage,
	ref,
	uploadBytes,
	getDownloadURL,
	FirebaseStorage,
} from "firebase/storage";
import { IDriverRepository } from "@coco/shared/core/repositories";
import { DriverAccount } from "@coco/shared/core/entities/Driver";
import { COLLECTIONS, PLATFORM } from "@coco/shared/constants";

export class FirebaseDriverRepository implements IDriverRepository {
	constructor(
		private db: Firestore,
		private storage: FirebaseStorage,
	) {}

	async create(
		account: Omit<DriverAccount, "createdAt" | "updatedAt">,
	): Promise<DriverAccount> {
		const data = {
			...account,
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
		};
		await setDoc(
			doc(this.db, COLLECTIONS.DRIVER_ACCOUNTS, account.driverId),
			data,
		);
		return { ...account, createdAt: new Date(), updatedAt: new Date() };
	}

	async getByDriverId(driverId: string): Promise<DriverAccount | null> {
		const snap = await getDoc(
			doc(this.db, COLLECTIONS.DRIVER_ACCOUNTS, driverId),
		);
		if (!snap.exists()) return null;
		return this._map(snap.data());
	}

	async update(
		driverId: string,
		data: Partial<DriverAccount>,
	): Promise<void> {
		await updateDoc(doc(this.db, COLLECTIONS.DRIVER_ACCOUNTS, driverId), {
			...data,
			updatedAt: serverTimestamp(),
		});
	}

	async listAvailableIndependent(): Promise<DriverAccount[]> {
		const q = query(
			collection(this.db, COLLECTIONS.DRIVER_ACCOUNTS),
			where("type", "==", "independent"),
			where("status", "==", "active"),
			where(
				"activeOrdersCount",
				"<",
				PLATFORM.DRIVER_MAX_ACTIVE_ORDERS_MVP,
			),
		);
		const snap = await getDocs(q);
		return snap.docs.map((d) => this._map(d.data()));
	}

	async uploadReceipt(driverId: string, imageUri: string): Promise<string> {
		const response = await fetch(imageUri);
		const blob = await response.blob();
		const storageRef = ref(
			this.storage,
			`receipts/drivers/${driverId}/${Date.now()}.jpg`,
		);
		await uploadBytes(storageRef, blob);
		const url = await getDownloadURL(storageRef);
		await this.update(driverId, {
			receiptImageUrl: url,
			status: "pending_payment",
		});
		return url;
	}

	async addWeeklyFee(driverId: string, amount: number): Promise<void> {
		await updateDoc(doc(this.db, COLLECTIONS.DRIVER_ACCOUNTS, driverId), {
			weeklyFeeOwed: increment(amount),
			updatedAt: serverTimestamp(),
		});
	}

	async approvePayment(driverId: string): Promise<void> {
		await updateDoc(doc(this.db, COLLECTIONS.DRIVER_ACCOUNTS, driverId), {
			weeklyFeeOwed: 0,
			lastPaymentDate: serverTimestamp(),
			receiptImageUrl: null,
			status: "active",
			updatedAt: serverTimestamp(),
		});
	}

	private _map(data: Record<string, any>): DriverAccount {
		return {
			...data,
			createdAt: data.createdAt?.toDate?.() ?? new Date(),
			updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
			lastPaymentDate: data.lastPaymentDate?.toDate?.(),
			paymentDeadline: data.paymentDeadline?.toDate?.(),
		} as DriverAccount;
	}
}
