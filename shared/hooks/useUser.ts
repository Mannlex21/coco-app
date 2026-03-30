import { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { useAppStore } from "@coco/shared/hooks/useAppStore";
import { User } from "core/entities";
import {
	StorageRepository,
	UploadResult,
} from "@coco/shared/infrastructure/supabase/StorageRepository";

export const useUser = (db: any, userId: string | undefined) => {
	const { user, setUser } = useAppStore();
	const [loadingUser, setLoadingUser] = useState(true);

	useEffect(() => {
		if (!userId) {
			setLoadingUser(false);
			return;
		}

		const userRef = doc(db, "users", userId);

		const unsubscribe = onSnapshot(userRef, (docSnap) => {
			if (docSnap.exists()) {
				const data = docSnap.data();

				const updatedUserData: User = {
					id: docSnap.id,
					name: data.name || "",
					phone: data.phone || "",
					email: data.email || "",
					role: data.role || "business",
					status: data.status || "active",
					fcmToken: data.fcmToken,
					avatarUrl: data.avatarUrl,
					lastActiveBusinessId: data.lastActiveBusinessId,
					createdAt: data.createdAt
						? data.createdAt.toDate()
						: new Date(),
					updatedAt: data.updatedAt
						? data.updatedAt.toDate()
						: new Date(),
				};

				if (setUser) {
					setUser(updatedUserData);
				}
			}
			setLoadingUser(false);
		});

		return () => unsubscribe();
	}, [userId, db, setUser]);

	const updateProfile = async (
		data: Partial<User>,
		storage: StorageRepository,
	) => {
		if (!userId) return { success: false, error: "No user ID" };
		const userRef = doc(db, "users", userId);

		try {
			let imageResult: UploadResult = { url: "", error: null };

			if (data.avatarUrl) {
				let entityFolder: "customers" | "drivers" | "merchants" =
					"customers";

				if (user?.role === "driver") entityFolder = "drivers";
				if (user?.role === "business") entityFolder = "merchants";

				imageResult = await storage.uploadImage(
					data.avatarUrl,
					entityFolder,
					userId,
					["avatar"],
					"avatar",
				);

				if (imageResult.error) throw new Error(imageResult.error);
			}

			await setDoc(
				userRef,
				{
					...data,
					// Si se subió imagen, usamos la nueva URL. Si no, mantenemos la que venía en data.
					avatarUrl: imageResult.url || data.avatarUrl,
					updatedAt: new Date(),
				},
				{ merge: true },
			);

			return { success: true };
		} catch (error: any) {
			console.error("Error al actualizar el perfil:", error);
			return { success: false, error: error.message || error };
		}
	};

	const updateLastActiveBusiness = async (businessId: string) => {
		if (!userId) return { success: false, error: "No user ID" };
		const userRef = doc(db, "users", userId);
		try {
			await setDoc(
				userRef,
				{
					lastActiveBusinessId: businessId,
					updatedAt: new Date(),
				},
				{ merge: true },
			);
			return { success: true };
		} catch (error) {
			console.error(
				"Error al actualizar el último negocio activo:",
				error,
			);
			return { success: false, error };
		}
	};
	return {
		userData: user,
		loadingUser,
		updateProfile,
		updateLastActiveBusiness,
	};
};
