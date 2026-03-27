import {
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	signOut,
	GoogleAuthProvider,
	signInWithCredential,
} from "firebase/auth";
import { auth } from "@/infrastructure/firebase/config";

export const AuthService = {
	// Login con Google
	loginWithGoogle: async (idToken: string) => {
		const credential = GoogleAuthProvider.credential(idToken);
		return signInWithCredential(auth, credential);
	},

	// Registro con Correo
	register: (email: string, pass: string) =>
		createUserWithEmailAndPassword(auth, email, pass),

	// Login con Correo
	login: (email: string, pass: string) =>
		signInWithEmailAndPassword(auth, email, pass),

	// Cerrar Sesión
	logout: () => signOut(auth),

	// Obtener usuario actual
	getCurrentUser: () => auth.currentUser,
};
