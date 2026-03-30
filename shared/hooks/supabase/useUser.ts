import { useState, useEffect, useCallback, useMemo } from "react"; // 👈 Agregamos useCallback
import { useAppStore } from "@coco/shared/hooks/useAppStore";
import { User } from "core/entities";
import {
	EntityType,
	StorageRepository,
} from "@coco/shared/infrastructure/supabase/StorageRepository";
import { SupabaseClient } from "@supabase/supabase-js";

export const useUser = (
	supabase: SupabaseClient,
	userId: string | undefined,
) => {
	const { user, setUser } = useAppStore();
	const [loadingUser, setLoadingUser] = useState(true);
	const storageRepository = useMemo(
		() => new StorageRepository(supabase),
		[supabase],
	);
	// 1. Memorizamos la función fetchUserData con useCallback.
	// Solo cambiará si cambian 'userId' o 'setUser'.
	const fetchUserData = useCallback(async () => {
		if (!userId || !setUser) return;

		try {
			const { data, error } = await supabase
				.from("users")
				.select("*")
				.eq("id", userId)
				.maybeSingle();

			if (error) throw error;

			if (data) {
				const updatedUserData: User = {
					id: data.id,
					name: data.name || "",
					phone: data.phone || "",
					email: data.email || "",
					role: data.role || "business",
					status: data.status || "active",
					fcmToken: data.fcm_token,
					avatarUrl: data.avatar_url,
					lastActiveBusinessId: data.last_active_business_id,
					createdAt: data.created_at
						? new Date(data.created_at)
						: new Date(),
					updatedAt: data.updated_at
						? new Date(data.updated_at)
						: new Date(),
				};
				setUser(updatedUserData);
			}
		} catch (error) {
			console.error("Error al cargar datos del usuario:", error);
		} finally {
			setLoadingUser(false);
		}
	}, [userId, setUser, supabase]); // Agregamos supabase aquí de forma segura

	// 2. useEffect enfocado estrictamente en la orquestación y el tiempo real
	useEffect(() => {
		if (!userId) {
			setLoadingUser(false);
			return;
		}

		setLoadingUser(true);
		fetchUserData(); // Ejecución inicial

		// Suscripción en tiempo real con Supabase
		const userChannel = supabase
			.channel(`public:users:id=eq.${userId}`)
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "users",
					filter: `id=eq.${userId}`,
				},
				() => {
					// 👈 En lugar de adivinar el merge de 'user', simplemente
					// re-ejecutamos el fetch que ya sabe cómo formatear todo.
					fetchUserData();
				},
			)
			.subscribe();

		// Limpieza de la suscripción al desmontar
		return () => {
			supabase.removeChannel(userChannel);
		};

		// ⚠️ Dejamos ÚNICAMENTE 'userId' y 'fetchUserData' como dependencias.
		// Esto garantiza que el canal de realtime no se destruya ni cree loops.
	}, [userId, fetchUserData, supabase]);

	const updateProfile = async (data: Partial<User>) => {
		if (!userId) return { success: false, error: "No user ID" };

		try {
			let finalAvatarUrl = data.avatarUrl || "";

			// 1. Si viene una nueva avatarUrl que sea local (de ImagePicker)
			if (data.avatarUrl) {
				let entityFolder: EntityType = "customers";
				if (user?.role === "driver") entityFolder = "drivers";
				if (user?.role === "business") entityFolder = "merchants";

				// 2. Usamos la instancia local del hook 🎯
				const imageResult = await storageRepository.uploadImage(
					data.avatarUrl,
					entityFolder,
					userId,
					["avatar"],
					"profileAvatar",
				);

				if (imageResult.error) throw new Error(imageResult.error);

				finalAvatarUrl = imageResult.url || "";
			}

			// 3. Guardamos en la base de datos
			const { error } = await supabase
				.from("users")
				.update({
					name: data.name,
					phone: data.phone,
					email: data.email,
					role: data.role,
					status: data.status,
					fcm_token: data.fcmToken,
					avatar_url: finalAvatarUrl,
					updated_at: new Date().toISOString(),
				})
				.eq("id", userId);

			if (error) throw error;

			if (user) {
				setUser({
					...user, // Datos viejos (id, email, etc.)
					...data, // Datos nuevos que mandó el form (name, phone)
					avatarUrl: finalAvatarUrl, // La nueva URL pública de la imagen
					updatedAt: new Date(),
				});
			}

			return { success: true };
		} catch (error: any) {
			console.error("Error al actualizar el perfil:", error);
			return { success: false, error: error.message || error };
		}
	};

	const updateLastActiveBusiness = async (businessId: string) => {
		if (!userId) return { success: false, error: "No user ID" };

		try {
			const { error } = await supabase
				.from("users")
				.update({
					last_active_business_id: businessId,
					updated_at: new Date().toISOString(),
				})
				.eq("id", userId);

			if (error) throw error;

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
