// src/navigation/AuthStack.tsx
import React from "react";
import { LoginScreen } from "@/screens/LoginScreen";
import { RegisterScreen } from "@/screens/RegisterScreen";

interface AuthStackProps {
	isRegistering: boolean;
	setIsRegistering: (value: boolean) => void;
}

export const AuthStack: React.FC<AuthStackProps> = ({
	isRegistering,
	setIsRegistering,
}) => {
	if (isRegistering) {
		return <RegisterScreen onBack={() => setIsRegistering(false)} />;
	}

	return <LoginScreen onRegister={() => setIsRegistering(true)} />;
};
