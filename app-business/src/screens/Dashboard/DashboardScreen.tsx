import React from "react";
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { Spacing } from "@coco/shared/config/theme";
import { useBusiness } from "@coco/shared/hooks";
import { useTheme } from "@coco/shared/hooks/useTheme";
import {
	DashboardHeader,
	StatusCard,
	QuickActionsCard,
	TopProductsCard,
	OrderVolumeCard,
	SummaryCards,
	SalesTotalCard,
	RatingsCard,
} from "@/screens/Dashboard/components";

export const DashboardScreen = () => {
	const { colors } = useTheme();
	const { onRefresh, loadings } = useBusiness();

	return (
		<View style={{ flex: 1, backgroundColor: colors.backgroundLight }}>
			<DashboardHeader />

			<ScrollView
				contentContainerStyle={styles.content}
				refreshControl={
					<RefreshControl
						refreshing={loadings.refresh}
						onRefresh={onRefresh}
						colors={[colors.businessBg]}
						tintColor={colors.businessBg}
					/>
				}
			>
				<StatusCard />
				<SummaryCards />
				<SalesTotalCard />
				<OrderVolumeCard />
				<TopProductsCard />
				<RatingsCard />
				<QuickActionsCard />
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	content: {
		padding: Spacing.lg,
	},
});
