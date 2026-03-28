import { useState, useEffect, useMemo } from "react";
import {
	collection,
	onSnapshot,
	query,
	orderBy,
	Firestore,
} from "firebase/firestore";
import { Product } from "@coco/shared/core/entities/Product";
import { FirebaseProductRepository } from "../infrastructure/firebase/FirebaseProductRepository";

export const useProducts = (db: Firestore, businessId: string | undefined) => {
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);

	// Repositorio memorizado
	const repo = useMemo(() => new FirebaseProductRepository(db), [db]);

	useEffect(() => {
		if (!businessId) {
			setLoading(false);
			return;
		}

		setLoading(true);
		const path = `businesses/${businessId}/products`;
		const q = query(collection(db, path), orderBy("sortOrder", "asc"));

		const unsubscribe = onSnapshot(
			q,
			(snapshot) => {
				const list = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				})) as Product[];

				setProducts(list);
				setLoading(false);
			},
			(error) => {
				console.error("Error onSnapshot Products:", error);
				setLoading(false);
			},
		);

		return () => unsubscribe();
	}, [db, businessId]);

	const saveProduct = async (formData: any) => {
		if (!businessId) throw new Error("No hay negocio activo");
		try {
			return await repo.save(businessId, {
				...formData,
				isAvailable: formData.isAvailable ?? true,
				sortOrder: products.length,
			});
		} catch (error) {
			console.error("Error saving product:", error);
			throw error;
		}
	};

	const toggleAvailability = async (
		productId: string,
		currentStatus: boolean,
	) => {
		if (!businessId) return;

		// Update Optimista
		setProducts((prev) =>
			prev.map((p) =>
				p.id === productId ? { ...p, isAvailable: !currentStatus } : p,
			),
		);

		try {
			await repo.updateAvailability(
				businessId,
				productId,
				!currentStatus,
			);
		} catch (error) {
			console.log(error);
			// Rollback manual (aunque onSnapshot lo corregiría solo, esto es más rápido)
			setProducts((prev) =>
				prev.map((p) =>
					p.id === productId
						? { ...p, isAvailable: currentStatus }
						: p,
				),
			);
		}
	};

	const deleteProduct = async (productId: string) => {
		if (!businessId) return;
		try {
			await repo.delete(businessId, productId);
		} catch (error) {
			console.error("Error deleting product:", error);
			throw error;
		}
	};

	const onRefresh = async () => {
		setRefreshing(true);
		try {
			await new Promise((resolve) => setTimeout(resolve, 800));
			if (businessId) {
				await repo.listByBusinessId(businessId);
				console.log("Refresh");
			}
		} catch (error) {
			console.error("Error al refrescar productos:", error);
		} finally {
			setRefreshing(false);
		}
	};

	return {
		products,
		loading,
		refreshing,
		onRefresh,
		saveProduct,
		toggleAvailability,
		deleteProduct,
	};
};
