import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { useTheme } from "@coco/shared/hooks/useTheme";

interface SkeletonProps {
	width?: any; // Puede ser número o porcentaje (ej: '100%')
	height: number;
	variant?: "box" | "circle" | "text"; // Formas predefinidas
	style?: StyleProp<ViewStyle>;
}

export const Skeleton = ({
	width = "100%",
	height,
	variant = "box",
	style,
}: SkeletonProps) => {
	const { colors } = useTheme();
	const pulseAnim = useRef(new Animated.Value(0.4)).current;

	// 💫 Animación infinita de parpadeo (Shimmer effect)
	useEffect(() => {
		Animated.loop(
			Animated.sequence([
				Animated.timing(pulseAnim, {
					toValue: 1,
					duration: 1000,
					useNativeDriver: true,
				}),
				Animated.timing(pulseAnim, {
					toValue: 0.4,
					duration: 1000,
					useNativeDriver: true,
				}),
			]),
		).start();
	}, [pulseAnim]);

	// 📐 Determinar el redondeado según la variante
	let borderRadius = 4; // default para 'box'
	if (variant === "circle") {
		borderRadius = typeof width === "number" ? width / 2 : height / 2;
	} else if (variant === "text") {
		borderRadius = height / 2; // Bordes tipo píldora para imitar texto
	}

	return (
		<Animated.View
			style={[
				{
					width,
					height,
					borderRadius,
					backgroundColor: colors.borderLight, // Color sutil de tu tema
					opacity: pulseAnim, // Aquí aplicamos la animación
				},
				style,
			]}
		/>
	);
};
