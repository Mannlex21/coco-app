import React from "react";
import { View } from "react-native";
import Svg, { Circle, Rect, Ellipse } from "react-native-svg";

interface Props {
	size?: number;
}

export const CocoLogo: React.FC<Props> = ({ size = 200 }) => {
	return (
		<View style={{ alignItems: "center", justifyContent: "center" }}>
			<Svg width={size} height={size} viewBox="0 0 96 96" fill="none">
				{/* COCO BASE - Naranja Exterior */}
				<Circle cx="48" cy="58" r="26" fill="#F4A261" />

				{/* COCO INTERIOR - Naranja Oscuro */}
				<Circle cx="48" cy="58" r="18" fill="#E76F51" />

				{/* OJOS (Café Madera) */}
				<Circle cx="41" cy="54" r="4" fill="#2D1B0E" />
				<Circle cx="55" cy="54" r="4" fill="#2D1B0E" />

				{/* BOCA */}
				<Circle cx="48" cy="64" r="3.5" fill="#2D1B0E" />

				{/* BRILLOS EN LOS OJOS */}
				<Circle cx="40" cy="53" r="1.5" fill="white" opacity={0.7} />
				<Circle cx="54" cy="53" r="1.5" fill="white" opacity={0.7} />

				{/* --- SOMBRERO DE CHEF --- */}
				{/* Banda base del sombrero */}
				<Rect
					x="27"
					y="35"
					width="42"
					height="10"
					rx="2"
					fill="white"
				/>

				{/* Cuerpo del sombrero (Lados) */}
				<Ellipse cx="37" cy="26" rx="7" ry="11" fill="white" />
				<Ellipse cx="59" cy="26" rx="7" ry="11" fill="white" />

				{/* Cuerpo central (Un poco más grisáceo para dar volumen) */}
				<Ellipse cx="48" cy="23" rx="9" ry="14" fill="#F0EDE8" />
			</Svg>
		</View>
	);
};
