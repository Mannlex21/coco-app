import { FontSize, FontWeight, Spacing } from "@coco/shared/config/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

// 1. Agregamos las nuevas props opcionales al tipado
interface EmptyStateProps {
	isFiltering: boolean;
	colors: any;
	title?: string; // 👈 Opcional
	description?: string; // 👈 Opcional
}

export const EmptyState = ({
	isFiltering,
	colors,
	title,
	description,
}: EmptyStateProps) => {
	// 2. Resolvemos los textos usando cortocircuitos (si no vienen props, usa el default)
	const displayTitle =
		title ??
		(isFiltering ? "No se encontraron resultados" : "No hay elementos");

	const displayDescription =
		description ??
		(isFiltering
			? "Intenta buscando con otras palabras clave."
			: "Presiona el botón '+' de abajo para crear tu primer elemento.");

	return (
		<View style={styles.emptyContainer}>
			<Ionicons
				name={isFiltering ? "search-outline" : "file-tray-outline"}
				size={48}
				color={colors.textSecondaryLight}
				style={styles.emptyIcon}
			/>
			<Text
				style={[styles.emptyTitle, { color: colors.textPrimaryLight }]}
			>
				{displayTitle}
			</Text>
			<Text
				style={[
					styles.emptySubtitle,
					{ color: colors.textSecondaryLight },
				]}
			>
				{displayDescription}
			</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	emptyContainer: {
		alignItems: "center",
		justifyContent: "center",
		padding: Spacing.xl,
	},
	emptyIcon: {
		marginBottom: Spacing.md,
		opacity: 0.6,
	},
	emptyTitle: {
		fontSize: FontSize.lg,
		fontWeight: FontWeight.bold,
		marginBottom: Spacing.xs,
		textAlign: "center",
	},
	emptySubtitle: {
		fontSize: FontSize.md,
		textAlign: "center",
		paddingHorizontal: Spacing.md,
	},
});
