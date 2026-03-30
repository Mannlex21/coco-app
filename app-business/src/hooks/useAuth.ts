import { useState, useEffect } from "react";
import { supabase } from "@/infrastructure/supabase/config"; // Ajusta la ruta
import { User } from "@supabase/supabase-js";

export const useAuth = () => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// 1. Verificar si ya hay una sesión activa al abrir la app
		supabase.auth.getSession().then(({ data: { session } }) => {
			setUser(session?.user ?? null);
			setLoading(false);
		});

		// 2. Escuchar cambios en el estado de autenticación (Login, Logout, etc.)
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setUser(session?.user ?? null);
			setLoading(false);
		});

		return () => subscription.unsubscribe();
	}, []);

	// 3. Método para Registrarse
	const signUp = async (email: string, pass: string, name: string) => {
		const { data, error } = await supabase.auth.signUp({
			email,
			password: pass,
			options: {
				data: { name: name }, // Guardamos el nombre en los metadatos del usuario
			},
		});
		return { data, error };
	};

	// 4. Método para Iniciar Sesión
	const signIn = async (email: string, pass: string) => {
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password: pass,
		});
		return { data, error };
	};

	// 5. Método para Cerrar Sesión
	const signOut = async () => {
		const { error } = await supabase.auth.signOut();
		return { error };
	};

	return {
		user,
		loading,
		signUp,
		signIn,
		signOut,
	};
};
