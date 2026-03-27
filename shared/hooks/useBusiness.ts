import { useState, useEffect, useMemo } from "react";
import {
	collection,
	doc,
	Firestore,
	serverTimestamp,
	setDoc,
	updateDoc,
} from "firebase/firestore";
import { FirebaseBusinessRepository } from "@coco/shared/infrastructure/firebase/FirebaseBusinessRepository";
import { Business } from "@coco/shared/core/entities/Business";

export const useBusiness = (db: Firestore, userId: string | undefined) => {
	const [loading, setLoading] = useState(true);
	const [businesses, setBusinesses] = useState<Business[]>([]); // La lista 1 a N
	const [activeBusiness, setActiveBusiness] = useState<Business | null>(null); // El seleccionado

	useEffect(() => {
		if (!db || !userId) {
			setLoading(false);
			return;
		}

		const fetchData = async () => {
			setLoading(true);
			try {
				const repo = new FirebaseBusinessRepository(db);
				const list = await repo.listByOwnerId(userId);

				setBusinesses(list);

				// DECISIÓN LÓGICA:
				if (list.length === 1) {
					// Si solo hay uno, lo marcamos como el activo automáticamente
					setActiveBusiness(list[0]);
				} else {
					// Si hay 0 o más de 1, el activo sigue siendo null
					// para que la App sepa que debe mostrar el Registro o el Selector
					setActiveBusiness(null);
				}
			} catch (error) {
				console.error("Error fetching businesses:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [db, userId]);

	// Dentro de tu hook o lógica de negocio
	const registerBusiness = async (
		formData: Pick<
			Business,
			"name" | "category" | "address" | "phone" | "deliveryCost"
		>,
	): Promise<void> => {
		// Aquí usamos userId, que es el parámetro que entra al hook
		if (!userId) {
			throw new Error(
				"No hay un usuario autenticado para registrar el negocio.",
			);
		}

		try {
			const newBusinessRef = doc(collection(db, "businesses"));

			const businessData: Business = {
				id: newBusinessRef.id,
				ownerId: userId, // <--- LISTO: Aquí asignamos el ID del usuario

				// ... resto de tus campos ...
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

			await setDoc(newBusinessRef, businessData);

			// OPCIONAL: Podrías actualizar el estado local aquí para que
			// aparezca el nuevo negocio sin recargar
			// setBusinesses([...businesses, businessData]);
		} catch (error) {
			console.error("Error en registerBusiness:", error);
			throw error;
		}
	};
	// En el hook useBusiness
	const toggleBusinessStatus = async (
		businessId: string,
		currentStatus: boolean,
	): Promise<void> => {
		if (!businessId) return;

		try {
			const businessRef = doc(db, "businesses", businessId);
			const newStatus = !currentStatus;

			// updateDoc devuelve Promise<void> nativamente, no requiere 'as any' ni 'as Promise'
			await updateDoc(businessRef, {
				isOpen: newStatus,
				updatedAt: serverTimestamp(),
			});

			// Actualización atómica del estado local para evitar saltos en la UI
			setActiveBusiness((prev) =>
				prev ? { ...prev, isOpen: newStatus } : null,
			);

			setBusinesses((prev) =>
				prev.map((b) =>
					b.id === businessId ? { ...b, isOpen: newStatus } : b,
				),
			);
		} catch (error) {
			// SonarQube S2486: Siempre loguear o manejar el error, nunca dejar el catch vacío
			console.error("Error updating business status in Tuxpan:", error);
			throw error;
		}
	};

	return {
		businesses,
		activeBusiness,
		loading,
		registerBusiness,
		toggleBusinessStatus,
	};
};
