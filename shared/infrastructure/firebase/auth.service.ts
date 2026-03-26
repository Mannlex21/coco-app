import {
	signInWithPopup,
	GoogleAuthProvider,
	signOut,
	onAuthStateChanged,
	User,
} from "firebase/auth";
import { auth } from "./config";

const googleProvider = new GoogleAuthProvider();

export const AuthService = {
	// Login con Google (Ideal para Cliente y Repartidor)
	loginWithGoogle: async () => {
		try {
			const result = await signInWithPopup(auth, googleProvider);
			return result.user;
		} catch (error) {
			console.error("Error en Login:", error);
			throw error;
		}
	},

	// Cerrar sesión
	logout: async () => {
		return await signOut(auth);
	},

	// Escuchar cambios en el usuario (Saber si está logueado)
	subscribeToAuthChanges: (callback: (user: User | null) => void) => {
		return onAuthStateChanged(auth, callback);
	},
};
