import { useState, useEffect, useMemo } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Business } from "@coco/shared/core/entities/Business";
import { FirebaseBusinessRepository } from "@coco/shared/infrastructure/firebase/FirebaseBusinessRepository";
import { useAppStore } from "./useAppStore";

export const useBusiness = (
	db: any,
	userId: string | undefined,
	lastActiveBusinessId?: string,
) => {
	const [businesses, setBusinesses] = useState<Business[]>([]);
	const { activeBusiness, setActiveBusiness } = useAppStore();
	const [loadingBusinesses, setLoadingBusinesses] = useState(true);
	const [refreshing, setRefreshing] = useState(false);

	const repo = useMemo(() => new FirebaseBusinessRepository(db), [db]);

	useEffect(() => {
		if (!userId) return;

		// 🛠️ Corregido: Usamos 'ownerId' en lugar de 'userId'
		const q = query(
			collection(db, "businesses"),
			where("ownerId", "==", userId),
		);

		const unsubscribe = onSnapshot(q, (snapshot) => {
			const list = snapshot.docs.map((doc) => ({
				id: doc.id,
				...(doc.data() as object),
			})) as Business[];

			setBusinesses(list);

			if (list.length > 0) {
				// 🔍 Buscamos si el ID guardado en el perfil del usuario existe en esta lista
				const matchedBusiness = list.find(
					(b) => b.id === lastActiveBusinessId,
				);

				if (matchedBusiness) {
					// Si el ID guardado coincide con una sucursal real, la activamos
					setActiveBusiness(matchedBusiness);
				} else if (!activeBusiness) {
					// Si no hay ninguna guardada (o ya no existe), y el store está vacío,
					// agarramos la primera sucursal por defecto.
					setActiveBusiness(list[0]);
				}
			} else {
				// Si borró todas sus sucursales
				setActiveBusiness(null);
			}

			setLoadingBusinesses(false);
		});

		return () => unsubscribe();
	}, [userId, lastActiveBusinessId, db]);

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
		loadingBusinesses,
		registerBusiness,
		toggleBusinessStatus,
		refreshing,
		onRefresh,
		deleteBusiness,
	};
};
