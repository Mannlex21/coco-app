import React from "react";
import { View } from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";

interface Props {
	size?: number;
}

export const CocoLogo: React.FC<Props> = ({ size = 200 }) => {
	return (
		<View style={{ alignItems: "center", justifyContent: "center" }}>
			<Svg width={size} height={size} viewBox="0 0 96 96" fill="none">
				{/* COCO BASE */}
				<Circle cx="48" cy="58" r="26" fill="#F4A261" />
				{/* COCO INTERIOR */}
				<Circle cx="48" cy="58" r="18" fill="#E76F51" />

				{/* OJOS */}
				<Circle cx="41" cy="54" r="4" fill="#2D1B0E" />
				<Circle cx="55" cy="54" r="4" fill="#2D1B0E" />
				{/* BOCA */}
				<Circle cx="48" cy="64" r="3.5" fill="#2D1B0E" />
				{/* BRILLOS */}
				<Circle cx="40" cy="53" r="1.5" fill="white" opacity={0.7} />
				<Circle cx="54" cy="53" r="1.5" fill="white" opacity={0.7} />

				{/* --- CASCO DE MOTO --- */}
				{/* Cuerpo del casco */}
				<Path
					d="M22 46 Q22 20 48 20 Q74 20 74 46 L74 50 Q61 47 48 47 Q35 47 22 50 Z"
					fill="#1A3A6A"
				/>
				{/* Detalle línea superior */}
				<Path
					d="M27 45 Q27 25 48 25 Q69 25 69 45"
					stroke="#2A5A9A"
					strokeWidth="2"
				/>
				{/* Visor naranja */}
				<Path
					d="M28 43 Q28 35 48 35 Q68 35 68 43 L66 46 Q48 44 30 46 Z"
					fill="#FF8C42"
				/>
				{/* Franjas laterales */}
				<Rect
					x="22"
					y="44"
					width="7"
					height="6"
					rx="1.5"
					fill="#FF8C42"
				/>
				<Rect
					x="67"
					y="44"
					width="7"
					height="6"
					rx="1.5"
					fill="#FF8C42"
				/>
			</Svg>
		</View>
	);
};
