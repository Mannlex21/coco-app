import React from "react";
import { View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

interface Props {
	size?: number;
}

export const CocoLogo: React.FC<Props> = ({ size = 200 }) => {
	return (
		<View style={{ alignItems: "center", justifyContent: "center" }}>
			<Svg width={size} height={size} viewBox="0 0 96 96" fill="none">
				{/* HOJAS (Palmera) */}
				<Path d="M42 18 Q34 6 38 2 Q44 6 42 18" fill="#27AE60" />
				<Path d="M48 16 Q48 2 52 0 Q56 4 48 16" fill="#2ECC71" />
				<Path d="M54 18 Q62 6 58 2 Q52 6 54 18" fill="#27AE60" />

				{/* COCO BASE - Exterior */}
				<Circle cx="48" cy="54" r="26" fill="#F4A261" />

				{/* COCO INTERIOR - Oscuro */}
				<Circle cx="48" cy="54" r="18" fill="#E76F51" />

				{/* OJOS */}
				<Circle cx="41" cy="50" r="4" fill="#2D1B0E" />
				<Circle cx="55" cy="50" r="4" fill="#2D1B0E" />

				{/* BOCA */}
				<Circle cx="48" cy="60" r="3.5" fill="#2D1B0E" />

				{/* BRILLOS */}
				<Circle cx="40" cy="49" r="1.5" fill="white" opacity={0.7} />
				<Circle cx="54" cy="49" r="1.5" fill="white" opacity={0.7} />
			</Svg>
		</View>
	);
};
