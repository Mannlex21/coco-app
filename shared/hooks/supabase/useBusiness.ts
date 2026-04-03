import { useState, useEffect, useCallback } from "react";
import { Business } from "@coco/shared/core/entities/Business";
import { useAppStore } from "../useAppStore";
import { useSupabaseContext } from "@coco/shared/providers/SupabaseContext";

export const useBusiness = () => {
	const supabase = useSupabaseContext();
	const [businesses, setBusinesses] = useState<Business[]>([]);
	const { user, activeBusiness, setActiveBusiness } = useAppStore();
	const [loadingBusinesses, setLoadingBusinesses] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [isToggling, setIsToggling] = useState(false);

	// 1. Memorizamos la función que procesa la lista de negocios
	const handleBusinessesUpdate = useCallback(
		(list: Business[]) => {
			setBusinesses(list);

			if (list.length > 0) {
				const matchedBusiness = list.find(
					(b) => b.id === activeBusiness?.id,
				);

				if (matchedBusiness) {
					setActiveBusiness(matchedBusiness);
				} else if (!activeBusiness) {
					setActiveBusiness(list[0]);
				}
			} else {
				setActiveBusiness(null);
			}
			setLoadingBusinesses(false);
		},
		[activeBusiness, activeBusiness, setActiveBusiness],
	);

	// 2. Mantenemos el useEffect limpio con CERO dependencias que muten
	useEffect(() => {
		// Si no hay usuario o cliente, simplemente apagamos el loader y salimos.
		if (!user?.id || !supabase) {
			setLoadingBusinesses(false);
			return;
		}

		setLoadingBusinesses(true);

		const fetchBusinesses = async () => {
			const { data, error } = await supabase
				.from("businesses")
				.select("*")
				.eq("ownerId", user?.id);

			if (error) {
				console.error("Error al cargar negocios:", error.message);
				setLoadingBusinesses(false);
				return;
			}

			handleBusinessesUpdate(data as Business[]);
		};

		fetchBusinesses();

		// Suscripción al canal de tiempo real
		const channel = supabase
			.channel(`realtime:businesses:${user?.id}`)
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "businesses",
					filter: `ownerId=eq.${user?.id}`,
				},
				(payload: any) => {
					// En lugar de manipular estados complejos aquí que causen bucles,
					// simplemente re-ejecutamos el fetch que ya limpia el loading al final.
					fetchBusinesses();
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};

		// ⚠️ IMPORTANTE: Solo re-ejecutamos si cambia el ID del usuario.
		// Ignoramos 'supabase' y 'handleBusinessesUpdate' para evitar que referencias inestables
		// destruyan y recreen el canal de realtime en cada renderizado.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user?.id]);

	// 3. REGISTRO DE NEGOCIO
	const registerBusiness = async (formData: any) => {
		if (!user?.id) throw new Error("No hay usuario autenticado.");
		try {
			const { data, error } = await supabase
				.from("businesses")
				.insert([
					{
						...formData,
						ownerId: user?.id,
						status: "pending_approval",
						plan: "free",
						isOpen: false,
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
					},
				])
				.select()
				.single();

			if (error) throw error;
			return data;
		} catch (error) {
			console.error("Error en registerBusiness:", error);
			throw error;
		}
	};

	// 4. CAMBIAR ESTADO
	const toggleBusinessStatus = async (
		businessId: string,
		currentStatus: boolean,
	) => {
		if (isToggling) return;

		setIsToggling(true);
		const newStatus = !currentStatus;

		try {
			// 1. Actualizamos en Supabase
			const { error } = await supabase
				.from("businesses")
				.update({ isOpen: newStatus })
				.eq("id", businessId);

			if (error) throw error;

			if (activeBusiness?.id === businessId) {
				setActiveBusiness({
					...activeBusiness,
					isOpen: newStatus,
				});
			}
		} catch (error) {
			console.error("Error al cambiar estado:", error);
			throw error; // Lo relanzamos para que el componente muestre el modal de error
		} finally {
			setIsToggling(false);
		}
	};

	// 5. BORRAR NEGOCIO
	const deleteBusiness = async (businessId: string) => {
		try {
			// 1. Borramos en Supabase
			const { error } = await supabase
				.from("businesses")
				.delete()
				.eq("id", businessId);

			if (error) throw error;

			// 2. 🚀 Actualizamos el estado de la app al instante
			setBusinesses((currentList) =>
				currentList.filter((b) => b.id !== businessId),
			);

			// Si el negocio que borramos era el activo, limpiamos el store
			if (activeBusiness?.id === businessId) {
				setActiveBusiness(null);
			}
		} catch (error) {
			console.error("Error al borrar:", error);
			throw error;
		}
	};

	// 6. REFRESH MANUAL
	const onRefresh = async () => {
		setRefreshing(true);
		try {
			if (user?.id) {
				// 🚀 Ejecutamos la petición y el temporizador EN PARALELO
				const [supabaseResponse] = await Promise.all([
					supabase
						.from("businesses")
						.select("*")
						.eq("ownerId", user?.id),
					new Promise((resolve) => setTimeout(resolve, 800)), // Mínimo 800ms de esferita girando
				]);

				const { data } = supabaseResponse;

				if (data) handleBusinessesUpdate(data as Business[]);
			}
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
		isToggling,
	};
};
