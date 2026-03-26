// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: "AIzaSyAEbmmTDBSPxEkIWyzMUG0h9eNtcI3Npdc",
	authDomain: "coco-app-87b2a.firebaseapp.com",
	databaseURL: "https://coco-app-87b2a-default-rtdb.firebaseio.com",
	projectId: "coco-app-87b2a",
	storageBucket: "coco-app-87b2a.firebasestorage.app",
	messagingSenderId: "806797404504",
	appId: "1:806797404504:web:b6ae03fc94b840660bdd2d",
};

// Initialize Firebase
// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios para usar en las 3 apps
export const auth = getAuth(app);
export const db = getFirestore(app); // Para pedidos y negocios
export const rtdb = getDatabase(app); // Para el GPS en tiempo real
export const storage = getStorage(app); // Para fotos
export default app;
