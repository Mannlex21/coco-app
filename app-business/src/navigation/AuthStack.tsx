// src/navigation/AuthStack.tsx
import React from "react";
import { LoginScreen } from "@/screens/Start/LoginScreen";
import { RegisterScreen } from "@/screens/Start/RegisterScreen";

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
