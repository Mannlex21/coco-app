import { useState, useEffect, useMemo } from "react";
import {
	collection,
	onSnapshot,
	query,
	orderBy,
	Firestore,
	updateDoc,
	doc,
	getDoc,
} from "firebase/firestore";
import { Product } from "@coco/shared/core/entities/Product";
import { FirebaseProductRepository } from "../infrastructure/firebase/FirebaseProductRepository";

export const useProducts = (db: Firestore, businessId: string | undefined) => {
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);

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
					...(doc.data() as object),
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

	const saveProduct = async (
		formData: Omit<
			Product,
			"id" | "businessId" | "createdAt" | "updatedAt"
		>,
	) => {
		if (!businessId) throw new Error("No hay negocio activo");
		try {
			return await repo.save(businessId, {
				...formData,
				isAvailable: formData.isAvailable ?? true,
				sortOrder: products.length,
			} as any);
		} catch (error) {
			console.error("Error saving product:", error);
			throw error;
		}
	};

	// --- NUEVA FUNCIÓN: UPDATE PRODUCT ---
	const updateProduct = async (
		productId: string,
		formData: Partial<Omit<Product, "id" | "businessId" | "createdAt">>,
	) => {
		if (!businessId) throw new Error("No hay negocio activo");

		try {
			setLoading(true);
			const productRef = doc(
				db,
				`businesses/${businessId}/products`,
				productId,
			);

			// Si tu repositorio ya tiene un método update, úsalo:
			// return await repo.update(businessId, productId, formData);

			// Si no, lo hacemos directo con Firebase mientras tanto:
			await updateDoc(productRef, {
				...formData,
				updatedAt: new Date().toISOString(), // Mantenemos registro de cambios
			});
		} catch (error) {
			console.error("Error updating product:", error);
			throw error;
		} finally {
			setLoading(false);
		}
	};

	const toggleAvailability = async (
		productId: string,
		currentStatus: boolean,
	) => {
		if (!businessId) return;

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
			console.error("Error al cambiar disponibilidad:", error);
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
	const getProductById = async (productId: string) => {
		if (!businessId) throw new Error("No hay negocio activo");

		try {
			const productRef = doc(
				db,
				`businesses/${businessId}/products`,
				productId,
			);
			const productSnap = await getDoc(productRef);

			if (productSnap.exists()) {
				return {
					id: productSnap.id,
					...productSnap.data(),
				} as Product;
			} else {
				return null;
			}
		} catch (error) {
			console.error("Error getProduct en hook:", error);
			throw error;
		}
	};
	const onRefresh = async () => {
		setRefreshing(true);
		try {
			const wait = new Promise((resolve) => setTimeout(resolve, 800));
			const fetch = businessId
				? repo.listByBusinessId(businessId)
				: Promise.resolve();

			await Promise.all([wait, fetch]);
			console.log("useProduct refresh");
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
		updateProduct,
		getProductById,
	};
};
