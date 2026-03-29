import { useState, useEffect, useMemo } from "react";
import {
	collection,
	onSnapshot,
	query,
	where,
	Firestore,
} from "firebase/firestore";
import { Business } from "@coco/shared/core/entities/Business";
import { FirebaseBusinessRepository } from "@coco/shared/infrastructure/firebase/FirebaseBusinessRepository";
import { useAppStore } from "./useAppStore";
import { COLLECTIONS } from "@coco/shared/constants";

export const useBusiness = (db: Firestore, userId?: string) => {
	const [businesses, setBusinesses] = useState<Business[]>([]);
	const { activeBusiness, setActiveBusiness } = useAppStore();
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);

	const repo = useMemo(() => new FirebaseBusinessRepository(db), [db]);

	useEffect(() => {
		if (!db || !userId) {
			setLoading(false);
			return;
		}

		setLoading(true);
		const q = query(
			collection(db, COLLECTIONS.BUSINESSES),
			where("ownerId", "==", userId),
		);

		const unsubscribe = onSnapshot(
			q,
			(snapshot) => {
				const list = snapshot.docs.map((doc) => ({
					id: doc.id,
					...(doc.data() as object),
				})) as Business[];

				setBusinesses(list);

				if (list.length === 1) {
					setActiveBusiness(list[0]);
				} else if (list.length === 0) {
					setActiveBusiness(null);
				}

				setLoading(false);
			},
			(error) => {
				console.error("Error en onSnapshot Business:", error);
				setLoading(false);
			},
		);

		return () => unsubscribe();
	}, [db, userId]);

	// 2. REGISTRO (Usando el Repo)
	const registerBusiness = async (formData: any) => {
		if (!userId) throw new Error("No hay usuario autenticado.");
		try {
			return await repo.register(userId, formData);
		} catch (error) {
			console.error("Error en registerBusiness:", error);
			throw error;
		}
	};

	// 3. TOGGLE STATUS (Usando el Repo)
	const toggleBusinessStatus = async (
		businessId: string,
		currentStatus: boolean,
	) => {
		try {
			await repo.updateStatus(businessId, !currentStatus);
		} catch (error) {
			console.error("Error al cambiar estado:", error);
			throw error;
		}
	};

	// 4. DELETE (Usando el Repo)
	const deleteBusiness = async (businessId: string) => {
		try {
			await repo.delete(businessId);
		} catch (error) {
			console.error("Error al borrar:", error);
			throw error;
		}
	};

	const onRefresh = async () => {
		setRefreshing(true);
		try {
			await Promise.all([
				userId ? repo.listByOwnerId(userId) : Promise.resolve(),
				new Promise((resolve) => setTimeout(resolve, 800)),
			]);
			console.log("useBusiness refresh");
		} catch (error) {
			console.error("Error al refrescar negocios:", error);
		} finally {
			setRefreshing(false);
		}
	};

	return {
		businesses,
		activeBusiness,
		loading,
		registerBusiness,
		toggleBusinessStatus,
		refreshing,
		onRefresh,
		deleteBusiness,
	};
};
