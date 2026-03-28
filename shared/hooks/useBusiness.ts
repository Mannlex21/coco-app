import { useState, useEffect, useMemo } from "react";
import {
	collection,
	deleteDoc,
	doc,
	Firestore,
	serverTimestamp,
	setDoc,
	updateDoc,
} from "firebase/firestore";
import { FirebaseBusinessRepository } from "@coco/shared/infrastructure/firebase/FirebaseBusinessRepository";
import { Business } from "@coco/shared/core/entities/Business";
import { useAppStore } from "./useAppStore";

export const useBusiness = (db: Firestore, userId: string | undefined) => {
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false); // Nuevo estado para el pull-to-refresh
	const [businesses, setBusinesses] = useState<Business[]>([]); // La lista 1 a N
	const { activeBusiness, setActiveBusiness } = useAppStore();

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
			setActiveBusiness(businessData);
			setBusinesses((prev) => [...prev, businessData]);
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

			// 1. Actualización persistente en Firebase
			await updateDoc(businessRef, {
				isOpen: newStatus,
				updatedAt: serverTimestamp(),
			});

			// 2. Actualización en el Store Global (Zustand)
			// IMPORTANTE: Aquí no usamos (prev) => ... porque el setter de tu Store
			// espera el objeto Business directamente.
			if (activeBusiness?.id === businessId) {
				setActiveBusiness({
					...activeBusiness,
					isOpen: newStatus,
					updatedAt: new Date() as any, // Sync local de la fecha
				});
			}

			// 3. Actualización en la lista local del Hook (React State)
			// Aquí SÍ usamos el callback (prev) porque es un useState estándar
			setBusinesses((prev) =>
				prev.map((b) =>
					b.id === businessId ? { ...b, isOpen: newStatus } : b,
				),
			);
		} catch (error) {
			// Logueamos el error con contexto (buena práctica de Clean Code)
			console.error("Error al cambiar el estado del negocio:", error);
			throw error;
		}
	};

	const deleteBusiness = async (businessId: string): Promise<void> => {
		try {
			const businessRef = doc(db, "businesses", businessId);
			await deleteDoc(businessRef);

			// Limpiamos el estado global y local
			setActiveBusiness(null);
			setBusinesses((prev) => prev.filter((b) => b.id !== businessId));
		} catch (error) {
			console.error("Error al borrar negocio:", error);
			throw error;
		}
	};
	const fetchData = async () => {
		if (!db || !userId) return;
		try {
			const repo = new FirebaseBusinessRepository(db);
			const list = await repo.listByOwnerId(userId);
			setBusinesses(list);
			if (list.length > 0) {
				setActiveBusiness(list[0]);
			}
		} catch (error) {
			console.error("Error fetching:", error);
		}
	};

	useEffect(() => {
		setLoading(true);
		fetchData().finally(() => setLoading(false));
	}, [db, userId]);
	const onRefresh = async () => {
		setRefreshing(true);
		await fetchData();
		setRefreshing(false);
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
