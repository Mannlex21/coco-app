import { initializeApp, getApps, getApp } from "firebase/app";
import {
	initializeAuth,
	// @ts-ignore
	getReactNativePersistence,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
	FIREBASE_API_KEY,
	FIREBASE_AUTH_DOMAIN,
	FIREBASE_PROJECT_ID,
	FIREBASE_STORAGE_BUCKET,
	FIREBASE_MESSAGING_SENDER_ID,
	FIREBASE_APP_ID,
} from "@env";

const firebaseConfig = {
	apiKey: FIREBASE_API_KEY,
	authDomain: FIREBASE_AUTH_DOMAIN,
	projectId: FIREBASE_PROJECT_ID,
	storageBucket: FIREBASE_STORAGE_BUCKET,
	messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
	appId: FIREBASE_APP_ID,
};

// 1. Inicializar App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 2. Inicializar Auth de forma ATÓMICA
// Intentamos recuperar la instancia. Si no existe, la inicializamos UNA SOLA VEZ con persistencia.
/**
 * Inicialización atómica usando globalThis para cumplir con SonarQube (S7764).
 * Esto evita el warning de persistencia y el error de Duplicate App.
 */
const initializeFirebaseAuth = () => {
	// Usamos globalThis para persistir la instancia durante el Hot Reload de Expo
	const existingAuth = (globalThis as any).firebaseAuth;

	if (existingAuth) return existingAuth;

	try {
		const authInstance = initializeAuth(app, {
			persistence: getReactNativePersistence(AsyncStorage),
		});

		// Guardamos la referencia en el objeto global estándar
		(globalThis as any).firebaseAuth = authInstance;
		return authInstance;
	} catch (error: any) {
		// Si el error es específicamente que NO ha sido inicializada, la creamos.
		// Si es OTRO error, lo registramos para no dejar el catch vacío (S2486).
		if (error.code === "auth/app-not-initialized" || !getApps().length) {
			return initializeAuth(app, {
				persistence: getReactNativePersistence(AsyncStorage),
			});
		}

		// Reportamos cualquier otro error inesperado para que no sea un "silent fail"
		console.error("Error inesperado al inicializar Firebase Auth:", error);

		// Fallback: intentamos inicializar de todos modos para que la app no quede rota
		return initializeAuth(app, {
			persistence: getReactNativePersistence(AsyncStorage),
		});
	}
};

export const auth = initializeFirebaseAuth();
export default app;
