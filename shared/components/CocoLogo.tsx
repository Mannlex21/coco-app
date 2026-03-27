import React from "react";
import { View } from "react-native";
import Svg, { Circle, Rect, Ellipse, Path, G } from "react-native-svg";
import { Colors } from "../config/theme";

interface Props {
	size?: number;
	variant?: "client" | "business" | "driver";
}

export const CocoLogo: React.FC<Props> = ({
	size = 200,
	variant = "client",
}) => {
	const isClient = variant === "client";
	const isBusiness = variant === "business";
	const isDriver = variant === "driver";

	// Posición base: el cliente y negocio llevan hojas, bajamos un poco el coco
	const baseY = isClient || isBusiness ? 54 : 58;
	return (
		<View style={{ alignItems: "center", justifyContent: "center" }}>
			<Svg width={size} height={size} viewBox="0 0 96 96" fill="none">
				{/* --- HOJAS DE PALMERA (Cliente y Negocios) --- */}
				{isClient && (
					<G>
						<Path
							d="M42 18 Q34 6 38 2 Q44 6 42 18"
							fill={Colors.leafMed}
						/>
						<Path
							d="M48 16 Q48 2 52 0 Q56 4 48 16"
							fill={Colors.leafLight}
						/>
						<Path
							d="M54 18 Q62 6 58 2 Q52 6 54 18"
							fill={Colors.leafMed}
						/>
					</G>
				)}

				{/* --- COCO BASE --- */}
				<Circle cx="48" cy={baseY} r="26" fill={Colors.cocoBase} />
				<Circle cx="48" cy={baseY} r="18" fill={Colors.cocoInner} />

				{/* --- CARA --- */}
				<G>
					<Circle
						cx="41"
						cy={baseY - 4}
						r="4"
						fill={Colors.cocoEyes}
					/>
					<Circle
						cx="55"
						cy={baseY - 4}
						r="4"
						fill={Colors.cocoEyes}
					/>
					<Circle
						cx="48"
						cy={baseY + 6}
						r="3.5"
						fill={Colors.cocoEyes}
					/>
					<Circle
						cx="40"
						cy={baseY - 5}
						r="1.5"
						fill="white"
						opacity={0.7}
					/>
					<Circle
						cx="54"
						cy={baseY - 5}
						r="1.5"
						fill="white"
						opacity={0.7}
					/>
				</G>

				{/* --- ACCESORIO: SOMBRERO DE CHEF (Negocios) --- */}
				{isBusiness && (
					<G>
						<Rect
							x="27"
							y="35"
							width="42"
							height="10"
							rx="2"
							fill="white"
						/>
						<Ellipse cx="37" cy="26" rx="7" ry="11" fill="white" />
						<Ellipse cx="59" cy="26" rx="7" ry="11" fill="white" />
						<Ellipse
							cx="48"
							cy="23"
							rx="9"
							ry="14"
							fill="#F0EDE8"
						/>
					</G>
				)}

				{/* --- ACCESORIO: CASCO (Repartidor) --- */}
				{isDriver && (
					<G>
						<Path
							d="M22 46 Q22 20 48 20 Q74 20 74 46 L74 50 Q61 47 48 47 Q35 47 22 50 Z"
							fill={Colors.driverBg}
						/>
						<Path
							d="M28 43 Q28 35 48 35 Q68 35 68 43 L66 46 Q48 44 30 46 Z"
							fill="#FF8C42"
						/>
					</G>
				)}
			</Svg>
		</View>
	);
};
