import { initializeApp } from "firebase/app";
// Importamos solo lo que TypeScript sí reconoce sin errores
import * as FirebaseAuth from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
	apiKey: "TU_API_KEY", // Pon tu API KEY real aquí
	authDomain: "coco-app-87b2a.firebaseapp.com",
	projectId: "coco-app-87b2a",
	storageBucket: "coco-app-87b2a.firebasestorage.app",
	messagingSenderId: "374229611342",
	appId: "1:374229611342:web:600e70ca2b083c0f4f9104",
};

const app = initializeApp(firebaseConfig);

/**
 * SOLUCIÓN FINAL PARA MONOREPO EN WINDOWS:
 * Extraemos la persistencia del objeto FirebaseAuth.
 * Si por alguna razón la versión de Firebase no la incluye,
 * usamos memoria por defecto para que la app NO truene.
 */
const getPersistence =
	(FirebaseAuth as any).getReactNativePersistence ||
	(FirebaseAuth as any).getAuthPersistence;

export const auth = (FirebaseAuth as any).initializeAuth(app, {
	persistence: getPersistence ? getPersistence(AsyncStorage) : undefined,
});
