import { useState, useEffect, useCallback, useMemo } from "react";
import { useAppStore } from "@coco/shared/hooks/useAppStore";
import { Business, User } from "@coco/shared/core/entities";
import {
	EntityType,
	StorageRepository,
} from "@coco/shared/infrastructure/supabase/StorageRepository";
import { useSupabaseContext } from "@coco/shared/providers/SupabaseContext";

export const useUser = () => {
	const supabase = useSupabaseContext();
	const { user, setUser } = useAppStore();
	const [loadingUser, setLoadingUser] = useState(true);
	const storageRepository = useMemo(
		() => new StorageRepository(supabase),
		[supabase],
	);
	// 1. Memorizamos la función fetchUserData con useCallback.
	// Solo cambiará si cambian 'userId' o 'setUser'.
	const fetchUserData = useCallback(async () => {
		if (!user?.id || !setUser) return;

		try {
			const { data, error } = await supabase
				.from("users")
				.select("*")
				.eq("id", user.id)
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
	}, [user?.id, setUser, supabase]); // Agregamos supabase aquí de forma segura

	// 2. useEffect enfocado estrictamente en la orquestación y el tiempo real
	useEffect(() => {
		if (!user?.id) {
			setLoadingUser(false);
			return;
		}

		setLoadingUser(true);
		fetchUserData(); // Ejecución inicial

		// Suscripción en tiempo real con Supabase
		const userChannel = supabase
			.channel(`public:users:id=eq.${user.id}`)
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "users",
					filter: `id=eq.${user.id}`,
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
	}, [user?.id, fetchUserData, supabase]);

	const updateProfile = async (data: Partial<User>) => {
		if (!user?.id) return { success: false, error: "No user ID" };

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
					user.id,
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
				.eq("id", user.id);

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

	const updateLastActiveBusiness = async (business: Business) => {
		if (!user?.id || !business)
			return { success: false, error: "No user ID or active business" };

		try {
			const { error } = await supabase
				.from("users")
				.update({
					last_active_business_id: business.id, // Guardamos la snake_case para DB
					updated_at: new Date().toISOString(),
				})
				.eq("id", user.id);

			if (error) throw error;

			// ⚡ IMPORTANTE: Actualizamos el estado global para que no se desfase
			if (user) {
				setUser({
					...user,
					lastActiveBusinessId: business.id, // Guardamos camelCase para el estado
					updatedAt: new Date(),
				});
			}

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
