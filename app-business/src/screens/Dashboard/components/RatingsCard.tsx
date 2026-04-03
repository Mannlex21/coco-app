import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
	FontSize,
	Spacing,
	FontWeight,
	BorderRadius,
} from "@coco/shared/config/theme";
import { useTheme } from "@coco/shared/hooks/useTheme";

export const RatingsCard = () => {
	const { colors } = useTheme();

	return (
		<View
			style={[
				styles.moduleContainer,
				{
					backgroundColor: colors.inputBg,
					borderColor: colors.borderLight,
				},
			]}
		>
			<Text
				style={[
					styles.sectionTitle,
					{ color: colors.textPrimaryLight },
				]}
			>
				Calificaciones y Reseñas
			</Text>
			<View style={styles.ratingHeader}>
				<Text
					style={[
						styles.ratingHero,
						{ color: colors.textPrimaryLight },
					]}
				>
					4.8
				</Text>
				<View style={styles.starsWrapper}>
					<View style={styles.starsRow}>
						{[1, 2, 3, 4, 5].map((s) => (
							<Ionicons
								key={s}
								name="star"
								size={14}
								color={colors.warning}
							/>
						))}
					</View>
					<Text
						style={[
							styles.ratingCount,
							{ color: colors.textSecondaryLight },
						]}
					>
						Basado en 120 reseñas
					</Text>
				</View>
			</View>

			<View
				style={[
					styles.reviewBox,
					{ backgroundColor: colors.surfaceLight },
				]}
			>
				<Text
					style={[
						styles.reviewText,
						{ color: colors.textPrimaryLight },
					]}
				>
					"La comida llegó super caliente y el sabor increíble.
					¡Recomendado!"
				</Text>
				<Text
					style={[
						styles.reviewAuthor,
						{ color: colors.textSecondaryLight },
					]}
				>
					- Juan M.
				</Text>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	moduleContainer: {
		borderRadius: BorderRadius.md,
		padding: Spacing.md,
		marginBottom: Spacing.md,
		borderWidth: 1,
	},
	sectionTitle: {
		fontSize: FontSize.md,
		fontWeight: FontWeight.bold,
		marginBottom: Spacing.md,
	},
	ratingHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: Spacing.md,
	},
	ratingHero: {
		fontSize: FontSize.xxl * 1.5,
		fontWeight: FontWeight.black,
		marginRight: Spacing.md,
	},
	starsWrapper: {
		justifyContent: "center",
	},
	starsRow: {
		flexDirection: "row",
		marginBottom: 4,
	},
	ratingCount: {
		fontSize: FontSize.xs,
	},
	reviewBox: {
		borderRadius: BorderRadius.sm,
		padding: Spacing.md,
		marginTop: Spacing.xs,
	},
	reviewText: {
		fontSize: FontSize.sm,
		fontStyle: "italic",
		lineHeight: 18,
	},
	reviewAuthor: {
		fontSize: FontSize.xs,
		fontWeight: FontWeight.medium,
		marginTop: Spacing.sm,
		textAlign: "right",
	},
});
