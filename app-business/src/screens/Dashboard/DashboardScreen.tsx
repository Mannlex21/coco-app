import React from "react";
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { FontSize, Spacing } from "@coco/shared/config/theme";
import { useAppStore } from "@coco/shared/hooks/useAppStore";
import { useBusiness, useUser } from "@coco/shared/hooks/supabase";
import { useTheme } from "@coco/shared/hooks/useTheme";
import { DashboardHeader } from "./components/DashboardHeader";
import { StatusCard } from "./components/StatusCard";
import { StatsCard } from "./components/StatsCard";
import { QuickAccessCard } from "./components/QuickAccessCard";

export const DashboardScreen = () => {
	const { colors } = useTheme();
	const { user, activeBusiness } = useAppStore();

	const { userData, updateLastActiveBusiness } = useUser(user?.id);

	const { onRefresh, refreshing } = useBusiness();
	if (userData && !userData.lastActiveBusinessId && activeBusiness) {
		updateLastActiveBusiness();
	}
	return (
		<View style={{ flex: 1 }}>
			<DashboardHeader />

			<ScrollView
				contentContainerStyle={styles.content}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						colors={[colors.businessBg]}
						tintColor={colors.businessBg}
					/>
				}
			>
				<StatusCard />

				{/* 2. FILA DE ESTADÍSTICAS */}
				<StatsCard />

				{/* 3. ACCESOS RÁPIDOS */}
				<QuickAccessCard />
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	loadingText: {
		textAlign: "center",
		marginTop: Spacing.lg,
		fontSize: FontSize.sm,
	},
	content: { padding: Spacing.lg },
});
