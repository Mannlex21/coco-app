import React from "react";
import {
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FontSize, FontWeight, Spacing } from "@coco/shared/config/theme";
import { CrossSellListItem } from "./CrossSellListItem";
import { CrossSellGridItem } from "./CrossSellGridItem";
import { useAppStore } from "@coco/shared/hooks";

interface CrossSellGroupItemProps {
	group: any;
	colors: any;
	onOpenMenu: (group: any) => void;
}

export const CrossSellGroupItem = ({
	group,
	colors,
	onOpenMenu,
}: CrossSellGroupItemProps) => {
	const { user } = useAppStore();

	const isGrid =
		group.visualization_type === "grid" ||
		group.visualizationType === "grid";

	return (
		<View style={styles.groupContainer}>
			{/* CABECERA DEL GRUPO */}
			<View
				style={[
					styles.groupHeader,
					{ backgroundColor: colors.backgroundLight },
				]}
			>
				<View
					style={{
						flex: 1,
						marginRight: 8,
						flexDirection: "row",
						alignItems: "center",
					}}
				>
					<Text
						style={[
							styles.groupTitle,
							{ color: colors.textPrimaryLight },
						]}
					>
						{group.name}
					</Text>

					{/* Badge por si el grupo no está disponible */}
					{!group.isAvailable && (
						<View
							style={[
								styles.disabledBadge,
								{ backgroundColor: colors.borderLight },
							]}
						>
							<Text
								style={{
									color: colors.textSecondaryLight,
									fontSize: FontSize.xs,
								}}
							>
								Oculto
							</Text>
						</View>
					)}
				</View>

				{/* BOTÓN DE MENÚ (Tres puntos) */}
				<TouchableOpacity
					style={styles.menuIconButton}
					onPress={() => onOpenMenu(group)}
				>
					<Ionicons
						name="ellipsis-vertical"
						size={18}
						color={colors.textSecondaryLight}
					/>
				</TouchableOpacity>
			</View>

			{/* CONTENEDOR DE PRODUCTOS SUGERIDOS */}
			<View
				style={
					isGrid
						? styles.gridProductsContainer
						: styles.listProductsContainer
				}
			>
				{group.items && group.items.length > 0 ? (
					isGrid ? (
						/* 1️⃣ Extraemos el ScrollView fuera del map */
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={
								styles.horizontalScrollContainer
							}
						>
							{group.items.map((item: any) => (
								<CrossSellGridItem
									key={item.id}
									item={item}
									colors={colors}
									onPress={() => onOpenMenu(item)}
									role={user?.role}
								/>
							))}
						</ScrollView>
					) : (
						/* 2️⃣ Mapeo limpio para cuando es una lista vertical */
						group.items.map((item: any) => (
							<CrossSellListItem
								key={item.id}
								item={item}
								colors={colors}
								onPress={() => onOpenMenu(item)}
								role={user?.role}
							/>
						))
					)
				) : (
					/* ESTADO VACÍO */
					<View
						style={[
							styles.emptyProductsContainer,
							{ borderBottomColor: colors.borderLight },
						]}
					>
						<Ionicons
							name="basket-outline"
							size={22}
							color={colors.textSecondaryLight}
							style={{ marginBottom: 4 }}
						/>
						<Text
							style={[
								styles.emptyProductsText,
								{ color: colors.textSecondaryLight },
							]}
						>
							No hay productos vinculados en este grupo
						</Text>
					</View>
				)}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	groupContainer: {
		marginBottom: Spacing.md,
	},
	groupHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: Spacing.sm,
		paddingHorizontal: Spacing.md,
		marginTop: Spacing.xs,
	},
	groupTitle: {
		fontSize: FontSize.xxl,
		fontWeight: FontWeight.bold,
	},
	menuIconButton: {
		padding: Spacing.xs,
	},
	disabledBadge: {
		paddingHorizontal: Spacing.xs,
		paddingVertical: 2,
		borderRadius: 4,
		marginLeft: Spacing.xs,
	},
	gridProductsContainer: {
		/* Eliminamos flexWrap y flexDirection para que el ScrollView horizontal funcione libre */
		paddingVertical: Spacing.xs,
	},
	listProductsContainer: {
		paddingHorizontal: Spacing.md,
	},
	emptyProductsContainer: {
		paddingVertical: 20,
		alignItems: "center",
		justifyContent: "center",
		width: "100%",
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	emptyProductsText: {
		fontSize: FontSize.sm,
		textAlign: "center",
	},
	horizontalScrollContainer: {
		paddingHorizontal: Spacing.md,
		gap: Spacing.md,
	},
});
