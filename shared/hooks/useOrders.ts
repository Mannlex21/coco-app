import { useEffect, useState } from "react";
import { Firestore } from "firebase/firestore";
import { Database } from "firebase/database";
import { FirebaseOrderRepository } from "@coco/shared/infrastructure/firebase/FirebaseOrderRepository";
import { FirebaseTrackingRepository } from "@coco/shared/infrastructure/firebase/FirebaseTrackingRepository";
import { FirebaseChatRepository } from "@coco/shared/infrastructure/firebase/FirebaseChatRepository";
import { Order } from "@coco/shared/core/entities/Order";
import { TrackingLocation, Message } from "@coco/shared/core/entities/Driver";
import { useAppStore } from "@coco/shared/hooks/useAppStore";

// ─── PEDIDOS CLIENTE ─────────────────────────────────────────────────────────

export const useClientOrders = (
	db: Firestore,
	clientId: string | undefined,
) => {
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!clientId) return;
		const repo = new FirebaseOrderRepository(db);
		const unsub = repo.listenByClient(clientId, (data) => {
			setOrders(data);
			setLoading(false);
		});
		return unsub;
	}, [clientId]);

	return { orders, loading };
};

// ─── PEDIDOS NEGOCIO ──────────────────────────────────────────────────────────

export const useBusinessOrders = (
	db: Firestore,
	businessId: string | undefined,
) => {
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!businessId) return;
		const repo = new FirebaseOrderRepository(db);
		const unsub = repo.listenByBusiness(businessId, (data) => {
			setOrders(data);
			setLoading(false);
		});
		return unsub;
	}, [businessId]);

	return { orders, loading };
};

// ─── PEDIDOS REPARTIDOR ───────────────────────────────────────────────────────

export const useDriverOrders = (
	db: Firestore,
	driverId: string | undefined,
) => {
	const [orders, setOrders] = useState<Order[]>([]);
	const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!driverId) return;
		const repo = new FirebaseOrderRepository(db);
		const unsubActive = repo.listenByDriver(driverId, (data) => {
			setOrders(data);
			setLoading(false);
		});
		const unsubAvailable = repo.listenAvailableForDriver((data) => {
			setAvailableOrders(data);
		});
		return () => {
			unsubActive();
			unsubAvailable();
		};
	}, [driverId]);

	return { orders, availableOrders, loading };
};

// ─── TRACKING GPS ─────────────────────────────────────────────────────────────
// El hook ya lee de Realtime DB aunque no haya mapa todavía.
// Cuando se implemente Mapbox, solo se usa location.lat y location.lng.

export const useTracking = (rtdb: Database, orderId: string | undefined) => {
	const [location, setLocation] = useState<TrackingLocation | null>(null);

	useEffect(() => {
		if (!orderId) return;
		const repo = new FirebaseTrackingRepository(rtdb);
		const unsub = repo.listenDriverLocation(orderId, setLocation);
		return unsub;
	}, [orderId]);

	return { location };
};

// ─── CHAT ─────────────────────────────────────────────────────────────────────

export const useChat = (db: Firestore, orderId: string | undefined) => {
	const [messages, setMessages] = useState<Message[]>([]);
	const { user } = useAppStore();

	useEffect(() => {
		if (!orderId) return;
		const repo = new FirebaseChatRepository(db);
		const unsub = repo.listenMessages(orderId, setMessages);
		return unsub;
	}, [orderId]);

	const sendMessage = async (text: string) => {
		if (!orderId || !user) return;
		const repo = new FirebaseChatRepository(db);
		await repo.sendMessage({
			orderId,
			senderId: user.id,
			senderRole: user.role as any,
			senderName: user.name,
			text,
		});
	};

	return { messages, sendMessage };
};
