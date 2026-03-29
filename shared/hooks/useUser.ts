import { useState, useEffect } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";

export const useUser = (db: any, userId: string | undefined) => {
	const [userData, setUserData] = useState<any>(null);
	const [loadingUser, setLoadingUser] = useState(true);

	useEffect(() => {
		if (!userId) {
			setLoadingUser(false);
			return;
		}

		const userRef = doc(db, "users", userId);

		// Usamos onSnapshot para que si cambia en la base de datos,
		// la app reaccione en tiempo real
		const unsubscribe = onSnapshot(userRef, (docSnap) => {
			if (docSnap.exists()) {
				setUserData({ id: docSnap.id, ...docSnap.data() });
			}
			setLoadingUser(false);
		});

		return () => unsubscribe();
	}, [userId, db]);

	// Función limpia para actualizar el último negocio activo
	const updateLastActiveBusiness = async (businessId: string) => {
		if (!userId) return;
		const userRef = doc(db, "users", userId);
		try {
			await updateDoc(userRef, {
				lastActiveBusinessId: businessId,
			});
		} catch (error) {
			console.error("Error al actualizar lastActiveBusinessId:", error);
		}
	};

	return {
		userData,
		loadingUser,
		updateLastActiveBusiness,
	};
};
