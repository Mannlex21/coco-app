import {
	collection,
	addDoc,
	updateDoc,
	doc,
	onSnapshot,
	query,
	orderBy,
	serverTimestamp,
	Firestore,
} from "firebase/firestore";
import { IChatRepository, Unsubscribe } from "@coco/shared/core/repositories";
import { Message } from "@coco/shared/core/entities/Driver";
import { COLLECTIONS } from "@coco/shared/constants";

export class FirebaseChatRepository implements IChatRepository {
	constructor(private db: Firestore) {}

	async sendMessage(
		message: Omit<Message, "id" | "createdAt">,
	): Promise<Message> {
		const messagesCol = collection(
			this.db,
			COLLECTIONS.ORDERS,
			message.orderId,
			"messages",
		);
		const ref = await addDoc(messagesCol, {
			...message,
			createdAt: serverTimestamp(),
		});
		return { ...message, id: ref.id, createdAt: new Date() };
	}

	listenMessages(
		orderId: string,
		callback: (messages: Message[]) => void,
	): Unsubscribe {
		const q = query(
			collection(this.db, COLLECTIONS.ORDERS, orderId, "messages"),
			orderBy("createdAt", "asc"),
		);
		return onSnapshot(q, (snap) => {
			callback(
				snap.docs.map(
					(d) =>
						({
							...d.data(),
							id: d.id,
							createdAt:
								d.data().createdAt?.toDate?.() ?? new Date(),
						}) as Message,
				),
			);
		});
	}

	async markAsRead(orderId: string, messageId: string): Promise<void> {
		await updateDoc(
			doc(this.db, COLLECTIONS.ORDERS, orderId, "messages", messageId),
			{ readAt: serverTimestamp() },
		);
	}
}
