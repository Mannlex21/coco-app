import React, { createContext, useContext, ReactNode } from "react";

// Creamos el contexto. Lo inicializamos en undefined para forzar el uso dentro del Provider.
const SupabaseContext = createContext<any>(undefined);

interface SupabaseProviderProps {
	supabaseClient: any; // Aquí pasas la instancia generada en la app
	children: ReactNode;
}

export const SupabaseProvider = ({
	supabaseClient,
	children,
}: SupabaseProviderProps) => {
	return (
		<SupabaseContext.Provider value={supabaseClient}>
			{children}
		</SupabaseContext.Provider>
	);
};

// Hook interno para que tus otros hooks en shared consuman Supabase
export const useSupabaseContext = () => {
	const context = useContext(SupabaseContext);
	if (context === undefined) {
		throw new Error(
			"useSupabaseContext debe ser usado dentro de un SupabaseProvider",
		);
	}
	return context;
};
