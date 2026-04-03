import { useState, useEffect, useCallback } from "react";
import { Business } from "@coco/shared/core/entities/Business";
import { useAppStore } from "../useAppStore";
import { useSupabaseContext } from "@coco/shared/providers/SupabaseContext";
import { TABLES } from "@coco/shared/constants";
import { useBusinessStore } from "@coco/shared/hooks/useBusinessStore";

export const useBusiness = () => {
	const supabase = useSupabaseContext();
	const { user, activeBusiness, setActiveBusiness } = useAppStore();
	const businesses = useBusinessStore((state) => state.businesses);
	const setBusinesses = useBusinessStore((state) => state.setBusinesses);
	const [loadings, setLoadings] = useState({
		fetch: true, // Para la carga inicial
		register: false, // Para crear negocio
		toggle: false, // Para abrir/cerrar negocio
		delete: false, // Para borrar negocio
		refresh: false, // Para el pull-to-refresh
	});

	const [error, setError] = useState<string | null>(null);

	const setFunctionLoading = (key: keyof typeof loadings, value: boolean) => {
		setLoadings((prev) => ({ ...prev, [key]: value }));
	};

	const fetchBusinesses = useCallback(async () => {
		if (!user?.id || !supabase) return;

		setFunctionLoading("fetch", true);
		setError(null);

		try {
			const { data, error: supabaseError } = await supabase
				.from("businesses")
				.select("*")
				.eq("ownerId", user.id);

			if (supabaseError) throw supabaseError;

			const list = data as Business[];
			setBusinesses(list);
		} catch (err: any) {
			console.error("Error fetching businesses:", err);
			setError(err.message || "No se pudieron cargar los negocios");
		} finally {
			setFunctionLoading("fetch", false);
		}
	}, [supabase, user?.id, setBusinesses]);

	useEffect(() => {
		if (!user?.id || !supabase) return;

		fetchBusinesses();

		const channel = supabase
			.channel(`realtime:businesses:${user.id}`)
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "businesses",
					filter: `ownerId=eq.${user.id}`,
				},
				() => fetchBusinesses(),
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [user?.id, supabase, fetchBusinesses]);

	const registerBusiness = async (formData: any) => {
		if (!user?.id) throw new Error("No hay usuario autenticado.");

		setFunctionLoading("register", true);
		try {
			const { data, error: supabaseError } = await supabase
				.from(TABLES.BUSINESSES)
				.insert([
					{
						...formData,
						ownerId: user.id,
						status: "pending_approval",
						plan: "free",
						isOpen: false,
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
					},
				])
				.select()
				.single();

			if (supabaseError) throw supabaseError;
			return data;
		} catch (err) {
			console.error("Error en registerBusiness:", err);
			throw err;
		} finally {
			setFunctionLoading("register", false);
		}
	};

	const toggleBusinessStatus = async (
		businessId: string,
		currentStatus: boolean,
	) => {
		if (loadings.toggle) return;

		setFunctionLoading("toggle", true);
		const newStatus = !currentStatus;

		try {
			const { error: supabaseError } = await supabase
				.from(TABLES.BUSINESSES)
				.update({ isOpen: newStatus })
				.eq("id", businessId);

			if (supabaseError) throw supabaseError;

			setBusinesses(
				businesses.map((b) =>
					b.id === businessId ? { ...b, isOpen: newStatus } : b,
				),
			);

			if (activeBusiness?.id === businessId) {
				setActiveBusiness({
					...activeBusiness,
					isOpen: newStatus,
				});
			}
		} catch (err) {
			console.error("Error al cambiar estado:", err);
			throw err;
		} finally {
			setFunctionLoading("toggle", false);
		}
	};

	const loadActiveBusiness = useCallback(
		async (businessId?: string | null, userId?: string | null) => {
			if (!supabase || !userId) return;

			try {
				if (businessId) {
					const { data, error: supabaseError } = await supabase
						.from("businesses")
						.select("*")
						.eq("id", businessId)
						.maybeSingle();

					if (supabaseError) throw supabaseError;

					if (data) {
						setActiveBusiness(data as Business);
						return; // Terminamos con éxito
					}
				}

				const { data: userBusinesses, error: listError } =
					await supabase
						.from("businesses")
						.select("*")
						.eq("ownerId", userId)
						.order("createdAt", { ascending: true })
						.limit(1);

				if (listError) throw listError;

				if (userBusinesses && userBusinesses.length > 0) {
					const firstBusiness = userBusinesses[0] as Business;
					setActiveBusiness(firstBusiness);
					await supabase
						.from("users")
						.update({ last_active_business_id: firstBusiness.id })
						.eq("id", userId);
				}
			} catch (err) {
				console.error("Error al orquestar el negocio activo:", err);
			}
		},
		[supabase, user?.id, setActiveBusiness],
	);
	const deleteBusiness = async (businessId: string) => {
		setFunctionLoading("delete", true);
		try {
			const { error: supabaseError } = await supabase
				.from(TABLES.BUSINESSES)
				.delete()
				.eq("id", businessId);

			if (supabaseError) throw supabaseError;

			setBusinesses(businesses.filter((b) => b.id !== businessId));

			if (activeBusiness?.id === businessId) {
				setActiveBusiness(null);
			}
		} catch (err) {
			console.error("Error al borrar:", err);
			throw err;
		} finally {
			setFunctionLoading("delete", false);
		}
	};

	const onRefresh = useCallback(async () => {
		setFunctionLoading("refresh", true);
		try {
			await Promise.all([
				fetchBusinesses(),
				new Promise((resolve) => setTimeout(resolve, 800)),
			]);
		} catch (err) {
			console.error("Error al refrescar negocios:", err);
		} finally {
			setFunctionLoading("refresh", false);
		}
	}, [fetchBusinesses]);

	return {
		businesses,
		activeBusiness,
		registerBusiness,
		toggleBusinessStatus,
		onRefresh,
		deleteBusiness,
		error,
		refetch: fetchBusinesses,
		loadings,
		loadActiveBusiness,
	};
};
